# Job Submission Error - Fix Guide

## Issue
When submitting a job, you're seeing "Internal server error". This is likely due to one of these issues:

## Root Causes & Fixes

### 1. Workspace Directory Permissions (Most Common)

The backend tries to create directories at `/shared/hpc-portal/users/{userId}/jobs/{jobId}` but doesn't have permission.

**Fix on Backend Server:**
```bash
# SSH into backend EC2 (35.91.86.15)
ssh -i your-key.pem ec2-user@35.91.86.15

# Create the workspace root directory
sudo mkdir -p /shared/hpc-portal
sudo chown -R ec2-user:ec2-user /shared/hpc-portal
sudo chmod -R 755 /shared/hpc-portal

# Verify it exists and has correct permissions
ls -la /shared/
ls -la /shared/hpc-portal
```

### 2. Slurm Not Installed/Configured

The backend tries to call Slurm commands (`sbatch`) which may not be available.

**Check if Slurm is installed:**
```bash
which sbatch squeue scancel
# If not found, install Slurm or use local mode
```

**Option A: Install Slurm (Production)**
```bash
# For Amazon Linux 2023
sudo dnf install -y slurm slurm-slurmd slurm-slurmctld
sudo systemctl enable slurmctld slurmd
sudo systemctl start slurmctld slurmd
```

**Option B: Use Mock Mode for Testing (Recommended for Development)**

Update backend to use mock Slurm for testing:

```bash
# On backend server
cd /home/ec2-user/HPC-Project

# Edit backend/.env
nano backend/.env
```

Add this line:
```
SLURM_MODE=mock
```

Then restart backend:
```bash
docker compose -f docker-compose-backend.yml restart backend
```

### 3. Check Backend Logs for Exact Error

```bash
# View backend logs to see the exact error
docker compose -f docker-compose-backend.yml logs backend | tail -50

# Look for errors related to:
# - ENOENT (directory doesn't exist)
# - EACCES (permission denied)
# - "sbatch: command not found"
```

### 4. Backend Container Volume Mounts

The backend container needs to mount the workspace directory.

**Check docker-compose-backend.yml:**
```yaml
services:
  backend:
    volumes:
      # Make sure this line exists:
      - /shared/hpc-portal:/shared/hpc-portal
```

If missing, add it and rebuild:
```bash
docker compose -f docker-compose-backend.yml down
docker compose -f docker-compose-backend.yml up -d
```

## Testing Job Submission

### Test 1: Check Workspace Creation
```bash
# On backend server
ls -la /shared/hpc-portal/
# Should exist and be writable by ec2-user
```

### Test 2: Submit a Simple Test Job

Go to your frontend (http://34.209.242.183) and submit a minimal job:
- Job Name: "Test Job"
- Environment Type: RAW (No Environment Setup)
- Nodes: 1
- CPUs/Task: 1
- Memory: 4 GB
- Walltime: 5 minutes
- Command: `echo "Hello World"`

### Test 3: Check Backend Response

Open browser DevTools (F12) → Network tab → try submitting → check the response:

**If you see 500 error:**
```bash
# Check backend logs immediately
docker compose -f docker-compose-backend.yml logs backend --tail=20
```

## Common Error Messages & Solutions

### Error: "ENOENT: no such file or directory, mkdir '/shared/hpc-portal'"
**Solution:**
```bash
sudo mkdir -p /shared/hpc-portal
sudo chown -R ec2-user:ec2-user /shared/hpc-portal
docker compose -f docker-compose-backend.yml restart backend
```

### Error: "EACCES: permission denied, mkdir"
**Solution:**
```bash
sudo chown -R ec2-user:ec2-user /shared/hpc-portal
sudo chmod -R 755 /shared/hpc-portal
```

### Error: "sbatch: command not found"
**Solution:** Use mock mode (see Option B above) OR install Slurm

### Error: "spawn sbatch ENOENT"
**Solution:** Slurm binaries not mounted. Add to docker-compose volumes:
```yaml
volumes:
  - /usr/bin/sbatch:/usr/bin/sbatch:ro
  - /usr/bin/squeue:/usr/bin/squeue:ro
```

## Quick Fix Script

Run this script on your backend server:

```bash
#!/bin/bash
# Quick fix for job submission errors

echo "Creating workspace directory..."
sudo mkdir -p /shared/hpc-portal
sudo chown -R ec2-user:ec2-user /shared/hpc-portal
sudo chmod -R 755 /shared/hpc-portal

echo "Checking Slurm installation..."
if ! command -v sbatch &> /dev/null; then
    echo "Warning: Slurm not installed. Setting mock mode..."
    cd /home/ec2-user/HPC-Project

    # Add SLURM_MODE=mock to .env if not present
    if ! grep -q "SLURM_MODE" backend/.env; then
        echo "SLURM_MODE=mock" >> backend/.env
    fi
fi

echo "Restarting backend..."
cd /home/ec2-user/HPC-Project
docker compose -f docker-compose-backend.yml restart backend

echo "Waiting for backend to start..."
sleep 10

echo "Checking backend health..."
docker compose -f docker-compose-backend.yml logs backend | tail -20

echo ""
echo "==================================="
echo "Fix complete! Try submitting a job now."
echo "If still failing, check logs with:"
echo "  docker compose -f docker-compose-backend.yml logs backend"
echo "==================================="
```

Save as `fix_job_submission.sh`, make executable, and run:
```bash
chmod +x fix_job_submission.sh
./fix_job_submission.sh
```

## Verification

After applying fixes:

1. **Check workspace directory:**
   ```bash
   ls -la /shared/hpc-portal/
   ```
   Should show `drwxr-xr-x ec2-user ec2-user`

2. **Check backend health:**
   ```bash
   curl http://localhost:3000/api/health
   ```
   Should return `{"status":"ok"...}`

3. **Submit test job** from frontend

4. **Check if job was created:**
   ```bash
   ls -la /shared/hpc-portal/users/
   # Should see user directories and job directories
   ```

## Still Having Issues?

If job submission still fails after all fixes:

1. **Get the exact error:**
   ```bash
   docker compose -f docker-compose-backend.yml logs backend -f
   # Keep this running, then submit a job from frontend
   # Watch for the error message
   ```

2. **Check database:**
   ```bash
   docker compose -f docker-compose-backend.yml exec backend npx prisma studio
   # Open http://localhost:5555
   # Check if Job records are being created
   ```

3. **Test backend API directly:**
   ```bash
   curl -X POST http://35.91.86.15:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"your@email.com","password":"yourpassword"}'

   # Get the accessToken from response, then:

   curl -X POST http://35.91.86.15:3000/api/jobs \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -d '{
       "jobName": "Test",
       "environmentType": "RAW",
       "environmentConfig": {},
       "queue": "compute-std",
       "walltimeSeconds": 300,
       "command": "echo Hello"
     }'
   ```

## Summary

The most common fix is:
1. Create `/shared/hpc-portal` with correct permissions
2. Set `SLURM_MODE=mock` in backend/.env for testing
3. Restart backend container

This should resolve 90% of job submission errors.

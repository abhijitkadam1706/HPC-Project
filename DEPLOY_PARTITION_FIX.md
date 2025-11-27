# Deploy Partition Fix

## Root Cause Found! ✅

The job submission was failing because the frontend was sending **invalid partition names** to Slurm.

**Error:** `sbatch: error: invalid partition specified: compute-std`

**Your actual partitions are:**
- `CPU`
- `GPU`
- `Memory-Optimized`

**What was wrong:**
Frontend was using placeholder partition names (`compute-std`, `compute-gpu`, `memory-high`, `debug`) that don't exist on your cluster.

## Fix Applied

Updated `frontend/src/pages/NewJobPage.tsx`:
- Default partition: `CPU` (was `compute-std`)
- Dropdown options now match your actual partitions

## Deploy Instructions

### 1. Deploy Frontend (on 34.209.242.183)

SSH to your frontend server:

```bash
ssh -i your-key.pem ec2-user@34.209.242.183
cd /home/ec2-user/HPC-Project

# Pull latest changes
git fetch origin
git checkout claude/fix-frontend-backend-errors-0176JgihjikcTc1Sunh7ENMP
git pull origin claude/fix-frontend-backend-errors-0176JgihjikcTc1Sunh7ENMP

# Rebuild frontend with new partition names
cd frontend
npm run build

# Restart frontend server (if using pm2)
pm2 restart frontend
# OR if using serve
pm2 restart all
```

### 2. Test Job Submission

1. Open http://34.209.242.183 in your browser
2. Login to your account
3. Click "Jobs" → "Submit Job"
4. Fill in job details:
   - Job Name: `test-job`
   - Command: `echo "Hello from Slurm!"`
   - Select partition: **CPU** (default)
5. Click "Submit"

**Expected result:** Job should submit successfully! ✅

### 3. Verify on Backend

On backend server (35.91.86.15):

```bash
# Watch backend logs
docker compose -f docker-compose-backend.yml logs -f backend

# You should see job submission success (no "invalid partition" error)
```

### 4. Verify on Slurm Cluster

On Slurm login node (34.210.218.163):

```bash
# Check job queue
squeue

# You should see your test job!
```

## Available Partitions

When submitting jobs, users can now choose from:

| Partition | Description |
|-----------|-------------|
| **CPU** (default) | Standard CPU Nodes |
| **GPU** | GPU Nodes |
| **Memory-Optimized** | High Memory Nodes |

## What This Fixes

✅ Job submission now works - no more "invalid partition" errors
✅ Partition dropdown shows actual partition names from your cluster
✅ Default partition is set to `CPU` which exists on your cluster

## Testing Checklist

- [ ] Frontend rebuilt and restarted
- [ ] Job submission works without errors
- [ ] Can select different partitions (CPU, GPU, Memory-Optimized)
- [ ] Jobs appear in `squeue` on Slurm cluster
- [ ] Backend logs show successful job submission

---

**Branch:** `claude/fix-frontend-backend-errors-0176JgihjikcTc1Sunh7ENMP`
**Commit:** `1a869e6` - fix: Update Slurm partition names to match actual cluster

# Backend Deployment Fix - CORS and Connectivity

## Issue
Frontend at `http://34.209.242.183` was unable to connect to backend API, resulting in "Registration failed" error.

## Root Causes
1. **CORS Configuration**: Backend was only allowing `http://localhost:5173` by default
2. **Network Binding**: Backend was listening on `localhost` instead of `0.0.0.0`, preventing external connections

## Fixes Applied
1. Updated `backend/src/main.ts`:
   - Changed `app.listen(port)` to `app.listen(port, '0.0.0.0')` to accept external connections
   - Enhanced CORS to support multiple frontend URLs (comma-separated)
   - Added flexible CORS origin validation

2. Created `.env.example` with proper configuration template

## Deployment Steps on Backend EC2 (35.91.86.15)

### Step 1: SSH into Backend Server
```bash
ssh -i your-key.pem ec2-user@35.91.86.15
cd /home/ec2-user/HPC-Project
```

### Step 2: Pull Latest Changes
```bash
# Make sure you're on the correct branch
git fetch origin
git checkout claude/fix-frontend-backend-errors-0176JgihjikcTc1Sunh7ENMP
git pull origin claude/fix-frontend-backend-errors-0176JgihjikcTc1Sunh7ENMP
```

### Step 3: Create .env File in Backend Directory
```bash
cd backend
cat > .env << 'EOF'
# Backend Environment Configuration
NODE_ENV=production
PORT=3000

# Frontend URL for CORS - IMPORTANT: Update this with your frontend IP
FRONTEND_URL=http://34.209.242.183,http://localhost:5173

# Database Configuration
DATABASE_URL=postgresql://hpcportal:hpcportal123@postgres:5432/hpcportal?schema=public

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# JWT Configuration (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Slurm Configuration
SLURM_MODE=local
WORKSPACE_ROOT=/shared/hpc-portal

# PostgreSQL Configuration
POSTGRES_USER=hpcportal
POSTGRES_PASSWORD=hpcportal123
POSTGRES_DB=hpcportal
EOF
```

### Step 4: Rebuild and Restart Backend
```bash
# Go back to project root
cd /home/ec2-user/HPC-Project

# Stop current containers
docker-compose -f docker-compose-backend.yml down

# Rebuild backend with new changes
docker-compose -f docker-compose-backend.yml build --no-cache backend

# Start services
docker-compose -f docker-compose-backend.yml up -d

# Check logs
docker logs -f hpc-portal-backend
```

### Step 5: Verify Backend is Running
```bash
# Check if backend is listening on all interfaces
curl http://localhost:3000/api/health

# Check if CORS is working (from frontend server or your local machine)
curl -H "Origin: http://34.209.242.183" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://35.91.86.15:3000/api/auth/register -v
```

### Step 6: Test Registration from Frontend
1. Open your browser to `http://34.209.242.183`
2. Navigate to the registration page
3. Fill in the registration form
4. Submit and verify it works

## Verification Checklist
- [ ] Backend logs show "HPC Portal Backend running on http://0.0.0.0:3000"
- [ ] Backend responds to health check: `curl http://35.91.86.15:3000/api/health`
- [ ] CORS headers are present in OPTIONS preflight responses
- [ ] Frontend can successfully register new users
- [ ] Frontend can successfully log in

## Troubleshooting

### If registration still fails:

1. **Check AWS Security Groups**:
   ```bash
   # Make sure backend EC2 security group allows:
   # - Inbound TCP port 3000 from frontend EC2 IP (34.209.242.183)
   # - Or from 0.0.0.0/0 for testing
   ```

2. **Check Backend Logs**:
   ```bash
   docker logs hpc-portal-backend
   ```

3. **Check Frontend Network Tab**:
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try to register
   - Look for the failed request to see exact error

4. **Test Direct API Call**:
   ```bash
   # From frontend server or your local machine
   curl -X POST http://35.91.86.15:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -H "Origin: http://34.209.242.183" \
     -d '{"email":"test@example.com","password":"Test123!@#","name":"Test User"}' \
     -v
   ```

5. **Verify FRONTEND_URL Environment Variable**:
   ```bash
   docker exec hpc-portal-backend env | grep FRONTEND_URL
   # Should show: FRONTEND_URL=http://34.209.242.183,http://localhost:5173
   ```

## Additional Notes

### Multiple Frontend URLs
The backend now supports multiple frontend URLs separated by commas:
```
FRONTEND_URL=http://34.209.242.183,http://localhost:5173,https://your-domain.com
```

### Using Wildcard (NOT RECOMMENDED FOR PRODUCTION)
For development/testing only, you can use:
```
FRONTEND_URL=*
```

### Health Check
The backend includes a health check endpoint at `/api/health` that returns:
```json
{
  "status": "ok",
  "timestamp": "2024-11-27T...",
  "uptime": 12345,
  "environment": "production"
}
```

## Summary of Changes
- **File Modified**: `backend/src/main.ts`
- **File Created**: `backend/.env.example`
- **File Created (manually)**: `backend/.env`
- **Docker Rebuild**: Required
- **Environment Variables**: FRONTEND_URL must be set correctly

## Success Criteria
✅ Backend listens on 0.0.0.0:3000 (visible in logs)
✅ CORS allows frontend origin (http://34.209.242.183)
✅ Frontend successfully registers new users
✅ Frontend successfully logs in existing users
✅ No CORS errors in browser console

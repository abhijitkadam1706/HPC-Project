# 🚀 HPC Portal - Complete Deployment Guide

This guide provides **automated, error-free deployment** of the HPC Portal using the split architecture:
- **Backend** on Slurm login node (direct Slurm + EFS access)
- **Frontend** on separate EC2 instance (connects to backend via HTTP)

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Backend Deployment (Login Node)](#backend-deployment-login-node)
4. [Frontend Deployment (Portal EC2)](#frontend-deployment-portal-ec2)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Testing & Verification](#testing--verification)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

```
┌──────────────────┐         ┌─────────────────────┐
│  Portal EC2      │         │ Slurm Login Node    │
│  (Frontend)      │   HTTP  │ (Backend)           │
│                  │◄───────►│                     │
│  ┌────────────┐  │         │  ┌────────────────┐ │
│  │  React App │  │         │  │   NestJS API   │ │
│  │  (Nginx)   │  │         │  │   PostgreSQL   │ │
│  └────────────┘  │         │  │      Redis     │ │
└──────────────────┘         │  └────┬───────────┘ │
                             │       │             │
    34.217.178.106           │  ┌────▼────────┐    │
    Port 80                  │  │   Slurm     │    │
                             │  │  (Local)    │    │
                             │  └─────────────┘    │
                             │       │             │
                             │  ┌────▼────────┐    │
                             │  │ EFS /shared │    │
                             │  └─────────────┘    │
                             └─────────────────────┘

                             52.38.42.122
                             Port 3000
```

### Why This Architecture?

✅ **No SSH complexity** - Backend runs directly on login node
✅ **No VPC/network issues** - Simple HTTP communication
✅ **Direct filesystem access** - No EFS mounting issues
✅ **Better performance** - No SSH overhead for Slurm commands

---

## 📦 Prerequisites

### For Backend (Login Node)
- Amazon Linux 2 EC2 instance
- Slurm login node with working `/shared` EFS mount
- Docker and Docker Compose installed
- Access to Slurm commands (`sbatch`, `squeue`, etc.)

### For Frontend (Portal EC2)
- Ubuntu 22.04 EC2 instance
- Docker and Docker Compose installed
- Public IP address

### Network Requirements
- Login node security group allows port 3000 from portal EC2 IP
- Portal EC2 security group allows ports 80/443 from internet

---

## 🔧 Backend Deployment (Login Node)

### Step 1: Clone Repository

```bash
# SSH to your login node
ssh -i your-key.pem ec2-user@<LOGIN_NODE_IP>

# Clone the repository
cd ~
git clone https://github.com/abhijitkadam1706/HPC-Project.git
cd HPC-Project
```

### Step 2: Configure Environment

```bash
# Generate JWT secrets
openssl rand -base64 32  # Copy this for JWT_SECRET
openssl rand -base64 32  # Copy this for JWT_REFRESH_SECRET

# Create .env file
cat > .env << 'EOF'
# Database Configuration
POSTGRES_USER=hpcportal
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD_HERE
POSTGRES_DB=hpcportal

# JWT Secrets (paste the values you generated above)
JWT_SECRET=PASTE_FIRST_SECRET_HERE
JWT_REFRESH_SECRET=PASTE_SECOND_SECRET_HERE

# Frontend URL (your portal EC2 public IP)
FRONTEND_URL=http://YOUR_PORTAL_EC2_IP

# Slurm Configuration
SLURM_MODE=local

# Workspace Configuration
WORKSPACE_ROOT=/shared/hpc-portal
EOF

# Edit the .env file with your actual values
nano .env
```

**Important:** Replace the following placeholders:
- `YOUR_SECURE_PASSWORD_HERE` - A strong database password
- `PASTE_FIRST_SECRET_HERE` - The first JWT secret you generated
- `PASTE_SECOND_SECRET_HERE` - The second JWT secret you generated
- `YOUR_PORTAL_EC2_IP` - Your portal EC2 public IP (e.g., 34.217.178.106)

### Step 3: Run Automated Deployment Script

```bash
# Make script executable (if not already)
chmod +x deploy-backend.sh

# Run the deployment script
./deploy-backend.sh
```

**What the script does:**
1. ✓ Checks if Docker and Docker Compose are installed
2. ✓ Verifies .env file configuration
3. ✓ Prepares `/shared/hpc-portal` workspace directory
4. ✓ Stops any existing containers
5. ✓ Builds Docker images with OpenSSL support
6. ✓ Starts PostgreSQL, Redis, and Backend services
7. ✓ Waits for services to become healthy
8. ✓ Tests Slurm command accessibility
9. ✓ Displays deployment status and next steps

**Expected Output:**
```
[SUCCESS] =========================================
[SUCCESS] Backend Deployment Complete!
[SUCCESS] =========================================

[INFO] API URL: http://52.38.42.122:3000

[INFO] Next Steps:
[INFO]   1. Update your AWS Security Group to allow port 3000 from your portal EC2
[INFO]   2. Test the API: curl http://localhost:3000/api/health
[INFO]   3. Deploy the frontend on your portal EC2 instance
```

### Step 4: Verify Backend Deployment

```bash
# Check service status
docker-compose -f docker-compose-backend.yml ps

# Test health endpoint
curl http://localhost:3000/api/health
# Expected: {"status":"ok"}

# Test Slurm access
docker exec hpc-portal-backend sinfo

# View logs
docker-compose -f docker-compose-backend.yml logs backend | tail -50
```

---

## 🎨 Frontend Deployment (Portal EC2)

### Step 1: Prepare Portal EC2 Instance

```bash
# SSH to your portal EC2
ssh -i your-key.pem ubuntu@<PORTAL_EC2_IP>

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes
exit
ssh -i your-key.pem ubuntu@<PORTAL_EC2_IP>

# Verify installations
docker --version
docker-compose --version
```

### Step 2: Clone Repository

```bash
cd ~
git clone https://github.com/abhijitkadam1706/HPC-Project.git
cd HPC-Project
```

### Step 3: Configure Environment

```bash
# Create frontend configuration
cat > .env.frontend << 'EOF'
# Backend API URL (your login node public IP and port)
VITE_API_URL=http://YOUR_LOGIN_NODE_IP:3000/api
EOF

# Edit with your actual login node IP
nano .env.frontend
```

**Important:** Replace `YOUR_LOGIN_NODE_IP` with your login node's public IP (e.g., 52.38.42.122)

### Step 4: Run Automated Deployment Script

```bash
# Make script executable (if not already)
chmod +x deploy-frontend.sh

# Run the deployment script
./deploy-frontend.sh
```

**What the script does:**
1. ✓ Checks if Docker and Docker Compose are installed
2. ✓ Verifies .env.frontend file configuration
3. ✓ Stops any existing containers
4. ✓ Builds React application with API URL
5. ✓ Starts Nginx frontend service
6. ✓ Waits for service to become healthy
7. ✓ Tests backend connectivity
8. ✓ Displays portal URL and next steps

**Expected Output:**
```
[SUCCESS] =========================================
[SUCCESS] Frontend Deployment Complete!
[SUCCESS] =========================================

[INFO] Portal URL: http://34.217.178.106

[INFO] Next Steps:
[INFO]   1. Open your browser and navigate to: http://34.217.178.106
[INFO]   2. Register a new user account
[INFO]   3. Submit a test job to verify Slurm integration
```

### Step 5: Verify Frontend Deployment

```bash
# Check service status
docker-compose -f docker-compose-frontend.yml ps

# Test frontend
curl http://localhost/ | grep -i "HPC Portal"

# View logs
docker-compose -f docker-compose-frontend.yml logs frontend | tail -30
```

---

## 🔒 Post-Deployment Configuration

### 1. Configure AWS Security Groups

**Login Node Security Group:**
```
Inbound Rules:
  - Type: SSH (22) from Your IP
  - Type: Custom TCP (3000) from Portal EC2 IP (34.217.178.106/32)
  - Type: SSH (22) from Portal EC2 IP (for admin access)
```

**Portal EC2 Security Group:**
```
Inbound Rules:
  - Type: SSH (22) from Your IP
  - Type: HTTP (80) from 0.0.0.0/0
  - Type: HTTPS (443) from 0.0.0.0/0
```

**Apply security group changes:**
1. Go to AWS Console → EC2 → Instances
2. Select login node → Security tab → Click security group
3. Edit inbound rules → Add rule for port 3000
4. Repeat for portal EC2 (ports 80/443)

### 2. Test Backend Connectivity from Portal EC2

```bash
# From portal EC2, test backend
curl http://<LOGIN_NODE_IP>:3000/api/health

# If this fails, check:
# 1. Backend is running: docker-compose -f docker-compose-backend.yml ps
# 2. Security group allows port 3000
# 3. Login node public IP is correct
```

---

## ✅ Testing & Verification

### 1. Access the Portal

Open your browser and navigate to:
```
http://<PORTAL_EC2_IP>
```

You should see the HPC Portal landing page with:
- Navigation menu
- "Get Started" button
- Feature highlights

### 2. Register a User Account

1. Click **"Get Started"** or **"Register"**
2. Fill in the registration form:
   - **Name:** Test User
   - **Email:** test@example.com
   - **Organization:** Test Organization
   - **Password:** SecurePassword123!
3. Click **"Create Account"**
4. You'll be automatically logged in and redirected to the dashboard

### 3. Submit a Test Job

1. In the dashboard, click **"New Job"** (in sidebar)
2. Fill in the job form:

```
Job Name: Test Slurm Integration
Description: Verify portal can submit jobs to Slurm

Environment Type: RAW

Queue/Partition: compute-u

Resources:
  - Nodes: 1
  - Tasks: 1
  - CPUs per Task: 1
  - Memory: 2 GB
  - GPUs: 0
  - Walltime: 300 seconds

Command:
#!/bin/bash
echo "=== HPC Portal Test Job ==="
echo "Job ID: $SLURM_JOB_ID"
echo "Hostname: $(hostname)"
echo "Date: $(date)"
echo "User: $(whoami)"
echo "Working Directory: $(pwd)"
sinfo
squeue
sleep 10
echo "=== Job Completed Successfully ==="

Input Location: WORKSPACE
Output Location: WORKSPACE
```

3. Click **"Submit Job"**
4. Job should appear in the dashboard with status **SUBMITTED**
5. Wait 60 seconds for background polling to update status to **QUEUED → RUNNING → COMPLETED**

### 4. Verify Job Execution on Slurm

On the login node:

```bash
# Check Slurm queue
squeue

# Check job history
sacct --format=JobID,JobName,State,Start,End -a

# Find job output files
find /shared/hpc-portal -name "slurm-*.out" -type f

# View latest job output
ls -lt /shared/hpc-portal/users/*/jobs/*/slurm-*.out | head -1 | xargs cat
```

You should see the output of your test job!

### 5. Check Job Logs in Portal

1. In the portal, click on your job in the dashboard
2. Click **"Details"**
3. Navigate to **"Logs"** tab
4. You should see the stdout from your job

---

## 🔧 Troubleshooting

### Backend Issues

#### Problem: Backend won't start

```bash
# Check logs
docker-compose -f docker-compose-backend.yml logs backend | tail -100

# Common issues:
# 1. Database connection failed
docker exec hpc-portal-db pg_isready -U hpcportal

# 2. Prisma migration failed
docker exec hpc-portal-backend npx prisma migrate status

# 3. OpenSSL/Prisma compatibility issue
docker exec hpc-portal-backend ldd /app/node_modules/.prisma/client/*.node

# Solution: Rebuild with --no-cache
docker-compose -f docker-compose-backend.yml down
docker-compose -f docker-compose-backend.yml build --no-cache
docker-compose -f docker-compose-backend.yml up -d
```

#### Problem: Slurm commands not accessible

```bash
# Test Slurm access from backend
docker exec hpc-portal-backend which sbatch
docker exec hpc-portal-backend sinfo

# If commands not found, check volume mounts in docker-compose-backend.yml
docker-compose -f docker-compose-backend.yml down
# Edit docker-compose-backend.yml to verify Slurm binary mounts
nano docker-compose-backend.yml
docker-compose -f docker-compose-backend.yml up -d
```

#### Problem: Workspace permission errors

```bash
# Check workspace directory
ls -la /shared/hpc-portal/

# Fix permissions
sudo chown -R ec2-user:ec2-user /shared/hpc-portal
sudo chmod 755 /shared/hpc-portal

# Restart backend
docker-compose -f docker-compose-backend.yml restart backend
```

### Frontend Issues

#### Problem: Frontend shows "Cannot connect to backend"

```bash
# From portal EC2, test backend directly
curl http://<LOGIN_NODE_IP>:3000/api/health

# If this fails:
# 1. Check security group allows port 3000 from portal EC2 IP
# 2. Check backend is running on login node
ssh ec2-user@<LOGIN_NODE_IP> "docker-compose -f docker-compose-backend.yml ps"

# 3. Verify .env.frontend has correct backend URL
cat .env.frontend
```

#### Problem: Frontend won't build

```bash
# Check logs
docker-compose -f docker-compose-frontend.yml logs frontend

# Common issue: Missing VITE_API_URL during build
# Solution: Set environment variable before building
export $(cat .env.frontend | xargs)
docker-compose -f docker-compose-frontend.yml build --no-cache
docker-compose -f docker-compose-frontend.yml up -d
```

### Job Submission Issues

#### Problem: Jobs stuck in SUBMITTED status

```bash
# Check background polling service
docker-compose -f docker-compose-backend.yml logs backend | grep "Polling"

# Should see messages every 60 seconds like:
# Polling job statuses...
# Found X active jobs to poll

# If not, restart backend
docker-compose -f docker-compose-backend.yml restart backend
```

#### Problem: Job output files not visible

```bash
# Check if files exist on filesystem
ssh ec2-user@<LOGIN_NODE_IP> "find /shared/hpc-portal -name 'slurm-*.out'"

# Check workspace root configuration
docker exec hpc-portal-backend env | grep WORKSPACE_ROOT

# Verify job logs in database
docker exec hpc-portal-db psql -U hpcportal -d hpcportal -c "SELECT id, \"jobName\", status FROM \"Job\" ORDER BY \"submissionTime\" DESC LIMIT 5;"
```

---

## 📊 Useful Commands

### Backend (Login Node)

```bash
# View all services status
docker-compose -f docker-compose-backend.yml ps

# View backend logs
docker-compose -f docker-compose-backend.yml logs -f backend

# View database logs
docker-compose -f docker-compose-backend.yml logs -f postgres

# Restart backend only
docker-compose -f docker-compose-backend.yml restart backend

# Stop all services
docker-compose -f docker-compose-backend.yml down

# View resource usage
docker stats

# Access backend shell
docker exec -it hpc-portal-backend /bin/sh

# Access database shell
docker exec -it hpc-portal-db psql -U hpcportal -d hpcportal

# Run Prisma migrations manually
docker exec hpc-portal-backend npx prisma migrate deploy

# View Prisma studio (database GUI)
docker exec -it hpc-portal-backend npx prisma studio
# Access at: http://<LOGIN_NODE_IP>:5555
```

### Frontend (Portal EC2)

```bash
# View frontend status
docker-compose -f docker-compose-frontend.yml ps

# View frontend logs
docker-compose -f docker-compose-frontend.yml logs -f frontend

# Restart frontend
docker-compose -f docker-compose-frontend.yml restart

# Stop frontend
docker-compose -f docker-compose-frontend.yml down

# Rebuild with new API URL
export $(cat .env.frontend | xargs)
docker-compose -f docker-compose-frontend.yml build --no-cache
docker-compose -f docker-compose-frontend.yml up -d

# Access Nginx shell
docker exec -it hpc-portal-frontend /bin/sh
```

---

## 🎯 Production Recommendations

### 1. Enable HTTPS with SSL/TLS

```bash
# Install Certbot on portal EC2
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

### 2. Setup Database Backups

```bash
# Create backup script on login node
cat > /home/ec2-user/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/ec2-user/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker exec hpc-portal-db pg_dump -U hpcportal hpcportal | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$TIMESTAMP.sql.gz"
EOF

chmod +x /home/ec2-user/backup-db.sh

# Schedule daily backups at 2 AM
crontab -e
# Add line: 0 2 * * * /home/ec2-user/backup-db.sh
```

### 3. Setup Monitoring

```bash
# Install CloudWatch agent (optional)
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U amazon-cloudwatch-agent.rpm

# Configure log collection
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

### 4. Configure Log Rotation

```bash
# Create logrotate config on login node
sudo tee /etc/logrotate.d/hpc-portal << 'EOF'
/home/ec2-user/HPC-Project/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 ec2-user ec2-user
}
EOF
```

---

## 🔄 Updating the Application

### Update Backend

```bash
# SSH to login node
cd ~/HPC-Project

# Pull latest code
git pull

# Rebuild and restart
docker-compose -f docker-compose-backend.yml down
docker-compose -f docker-compose-backend.yml build --no-cache
docker-compose -f docker-compose-backend.yml up -d

# Check logs
docker-compose -f docker-compose-backend.yml logs -f backend
```

### Update Frontend

```bash
# SSH to portal EC2
cd ~/HPC-Project

# Pull latest code
git pull

# Rebuild and restart
export $(cat .env.frontend | xargs)
docker-compose -f docker-compose-frontend.yml down
docker-compose -f docker-compose-frontend.yml build --no-cache
docker-compose -f docker-compose-frontend.yml up -d

# Check logs
docker-compose -f docker-compose-frontend.yml logs -f frontend
```

---

## 📞 Support

### Logs to Collect for Issues

When reporting issues, provide:

```bash
# Backend logs
docker-compose -f docker-compose-backend.yml logs backend > backend-logs.txt

# Frontend logs
docker-compose -f docker-compose-frontend.yml logs frontend > frontend-logs.txt

# Service status
docker-compose -f docker-compose-backend.yml ps > backend-status.txt
docker-compose -f docker-compose-frontend.yml ps > frontend-status.txt

# Environment (sanitized)
cat .env | grep -v "PASSWORD\|SECRET" > env-config.txt
cat .env.frontend > frontend-config.txt
```

---

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ Backend API responds at `http://<LOGIN_NODE_IP>:3000/api/health`
- ✅ Frontend loads at `http://<PORTAL_EC2_IP>`
- ✅ User registration works
- ✅ User can log in successfully
- ✅ Test job can be submitted
- ✅ Job status updates automatically (SUBMITTED → QUEUED → RUNNING → COMPLETED)
- ✅ Job output files are visible
- ✅ Slurm commands work from backend (`docker exec hpc-portal-backend sinfo`)

---

**Congratulations! Your HPC Portal is now deployed and ready for production use! 🎊**

For questions or issues, please check the troubleshooting section or review the deployment logs.

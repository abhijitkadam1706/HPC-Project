#!/bin/bash
# Fix Docker Volume Mount to Use EFS Instead of Local Directory
# Run this on backend server (35.91.86.15)

set -e

echo "=========================================="
echo "Fixing Docker Volume Mount for EFS"
echo "=========================================="
echo ""

# Step 1: Stop all containers
echo "Step 1: Stopping all backend containers..."
cd /home/ec2-user/HPC-Project
docker compose -f docker-compose-backend.yml down
echo "✓ Containers stopped"
echo ""

# Step 2: Verify EFS is mounted
echo "Step 2: Verifying EFS mount..."
if mount | grep -q "/shared type nfs4"; then
    echo "✓ EFS is mounted at /shared"
    mount | grep "/shared"
else
    echo "✗ ERROR: EFS is not mounted at /shared"
    echo "Please mount EFS first with:"
    echo "  sudo mount -t efs -o tls fs-0bc21e78d06a8a8b4:/ /shared"
    exit 1
fi
echo ""

# Step 3: Check if old local directory exists
echo "Step 3: Checking for old local /shared/hpc-portal directory..."
if [ -d "/shared/hpc-portal" ]; then
    echo "✓ /shared/hpc-portal already exists on EFS"
else
    echo "Creating /shared/hpc-portal on EFS..."
    sudo mkdir -p /shared/hpc-portal
    echo "✓ Directory created"
fi
echo ""

# Step 4: Set correct permissions
echo "Step 4: Setting permissions on /shared/hpc-portal..."
sudo chown -R ec2-user:ec2-user /shared/hpc-portal
sudo chmod -R 755 /shared/hpc-portal
echo "✓ Permissions set"
echo ""

# Step 5: Verify directory is on EFS (not local)
echo "Step 5: Verifying /shared/hpc-portal is on EFS..."
df -h /shared/hpc-portal
echo ""

# Step 6: Start containers with fresh volume mounts
echo "Step 6: Starting backend containers..."
docker compose -f docker-compose-backend.yml up -d
echo "✓ Containers started"
echo ""

# Step 7: Wait for backend to be ready
echo "Step 7: Waiting for backend to be ready..."
sleep 15
echo ""

# Step 8: Check backend logs
echo "Step 8: Checking backend logs..."
docker compose -f docker-compose-backend.yml logs backend | tail -30
echo ""

# Step 9: Verify backend can access the EFS directory
echo "Step 9: Verifying backend container can access EFS..."
docker compose -f docker-compose-backend.yml exec -T backend ls -la /shared/hpc-portal/ || true
echo ""

echo "=========================================="
echo "Fix Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Try submitting a test job from frontend"
echo "2. Check if job script files are created on EFS:"
echo "   find /shared/hpc-portal/users/ -name '*.sh' -ls"
echo ""
echo "3. On Slurm cluster (34.210.218.163), verify you can see the same files:"
echo "   ssh ec2-user@34.210.218.163 'find /shared/hpc-portal/users/ -name \"*.sh\" -ls'"
echo ""
echo "If job submission still fails, check:"
echo "   docker compose -f docker-compose-backend.yml logs backend | tail -50"
echo ""

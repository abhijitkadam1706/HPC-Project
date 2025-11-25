# HPC Portal Deployment Guide

This guide will help you deploy the HPC Portal on your infrastructure. The portal provides a web-based GUI for submitting and managing Slurm jobs on AWS ParallelCluster or any Slurm-based HPC cluster.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Deployment Options](#deployment-options)
4. [Quick Start](#quick-start)
5. [Configuration](#configuration)
6. [Database Setup](#database-setup)
7. [Slurm Integration](#slurm-integration)
8. [Security Considerations](#security-considerations)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- **Docker** (v20.10+) and **Docker Compose** (v2.0+) installed
- **Git** installed
- Access to a Slurm cluster (AWS ParallelCluster, AWS PCS, or on-premises)
- Shared filesystem accessible by the portal and compute nodes (e.g., `/fsx`, `/shared`)
- Minimum 4GB RAM and 20GB disk space for the portal services

## Architecture Overview

The HPC Portal consists of four main components:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│    Slurm    │
│   (React)   │     │  (NestJS)   │     │  Cluster    │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                    ┌─────┴─────┐
                    │           │
              ┌─────▼────┐ ┌───▼────┐
              │PostgreSQL│ │ Redis  │
              └──────────┘ └────────┘
```

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: NestJS + Prisma + PostgreSQL
- **Database**: PostgreSQL for application data
- **Cache/Queue**: Redis for background job polling
- **Scheduler**: Slurm integration (local or SSH)

## Deployment Options

### Option 1: Backend on Login Node (Recommended)

Deploy the portal directly on the Slurm login node for direct CLI access.

**Pros**: No SSH configuration needed, direct Slurm command execution
**Cons**: Requires Docker on login node

### Option 2: Backend on Separate EC2 Instance

Deploy the portal on a separate instance and connect to Slurm via SSH.

**Pros**: Isolates portal from cluster, easier to manage
**Cons**: Requires SSH key configuration and network access

## Quick Start

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/hpc-portal.git
cd hpc-portal
```

### Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit the configuration
nano .env
```

**Required changes:**
- Set strong passwords for `JWT_SECRET` and `JWT_REFRESH_SECRET`
- Set `POSTGRES_PASSWORD` to a strong password
- Configure `SLURM_MODE` (local or ssh)
- Set `WORKSPACE_ROOT` to your shared filesystem path

### Step 3: Build and Start Services

```bash
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f
```

### Step 4: Access the Portal

Open your browser and navigate to:
- **Frontend**: http://your-server-address/
- **Backend API**: http://your-server-address:3000/api
- **API Documentation**: http://your-server-address:3000/api/docs

### Step 5: Create Admin User

```bash
# Execute inside the backend container
docker exec -it hpc-portal-backend sh

# Run seed script (you'll need to create this)
npm run seed
```

## Configuration

### Environment Variables

#### Backend Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `JWT_SECRET` | JWT access token secret | - | Yes |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | - | Yes |
| `SLURM_MODE` | Slurm integration mode (local/ssh) | local | Yes |
| `WORKSPACE_ROOT` | Shared filesystem path | /shared/hpc-portal | Yes |

#### Slurm SSH Configuration (if SLURM_MODE=ssh)

| Variable | Description | Example |
|----------|-------------|---------|
| `SLURM_SSH_HOST` | Login node hostname | login.cluster.example.com |
| `SLURM_SSH_PORT` | SSH port | 22 |
| `SLURM_SSH_USER` | SSH username | hpc-admin |
| `SLURM_SSH_KEY_PATH` | Path to SSH private key | /app/ssh_keys/id_rsa |

#### Frontend Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | http://localhost:3000/api |

### Workspace Directory Structure

The portal stores job scripts and outputs in the shared filesystem:

```
/shared/hpc-portal/
├── users/
│   ├── <user-id>/
│   │   ├── jobs/
│   │   │   ├── <job-id>/
│   │   │   │   ├── job.sh          # Slurm script
│   │   │   │   ├── slurm-<id>.out # stdout
│   │   │   │   ├── slurm-<id>.err # stderr
│   │   │   │   └── outputs/        # Job outputs
```

Ensure this directory exists and has appropriate permissions:

```bash
mkdir -p /shared/hpc-portal/users
chmod 755 /shared/hpc-portal
```

## Database Setup

### Initial Migration

The backend automatically runs migrations on startup. To manually run migrations:

```bash
docker exec -it hpc-portal-backend npx prisma migrate deploy
```

### Database Backup

```bash
# Backup
docker exec hpc-portal-db pg_dump -U hpcportal hpcportal > backup.sql

# Restore
docker exec -i hpc-portal-db psql -U hpcportal hpcportal < backup.sql
```

## Slurm Integration

### Local Mode (Backend on Login Node)

1. Deploy the portal on the Slurm login node
2. Set `SLURM_MODE=local` in `.env`
3. Ensure the Docker container has access to Slurm commands

**Docker Compose modification for local mode:**

```yaml
backend:
  # ... other config ...
  volumes:
    - /usr/bin/sbatch:/usr/bin/sbatch:ro
    - /usr/bin/squeue:/usr/bin/squeue:ro
    - /usr/bin/scancel:/usr/bin/scancel:ro
    - /usr/bin/sacct:/usr/bin/sacct:ro
```

### SSH Mode (Remote Connection)

1. Generate SSH key pair:
   ```bash
   ssh-keygen -t rsa -b 4096 -f ./ssh_keys/id_rsa -N ""
   ```

2. Copy public key to login node:
   ```bash
   ssh-copy-id -i ./ssh_keys/id_rsa.pub user@login-node
   ```

3. Configure `.env`:
   ```bash
   SLURM_MODE=ssh
   SLURM_SSH_HOST=login-node.example.com
   SLURM_SSH_USER=hpc-admin
   SLURM_SSH_KEY_PATH=/app/ssh_keys/id_rsa
   ```

4. Mount SSH keys in Docker Compose:
   ```yaml
   backend:
     volumes:
       - ./ssh_keys:/app/ssh_keys:ro
   ```

### Testing Slurm Integration

```bash
# Inside backend container
docker exec -it hpc-portal-backend sh

# Test Slurm commands
squeue
sinfo
```

## Security Considerations

### Production Deployment Checklist

- [ ] Change all default passwords in `.env`
- [ ] Use strong, random JWT secrets (32+ characters)
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure firewall rules (only expose ports 80/443)
- [ ] Use SSH key authentication (disable password auth)
- [ ] Set appropriate file permissions on shared filesystem
- [ ] Enable database SSL connections
- [ ] Implement regular backups
- [ ] Configure log rotation
- [ ] Set up monitoring and alerting

### HTTPS Configuration

Use a reverse proxy (nginx, Caddy, Traefik) with Let's Encrypt:

```bash
# Example with Caddy
caddy reverse-proxy --from portal.example.com --to localhost:80
```

### SSH Key Security

```bash
# Set restrictive permissions
chmod 600 ./ssh_keys/id_rsa
chmod 644 ./ssh_keys/id_rsa.pub

# Use SSH key with passphrase for extra security
```

## Troubleshooting

### Backend won't start

**Check logs:**
```bash
docker compose logs backend
```

**Common issues:**
- Database connection failed: Verify `DATABASE_URL` in `.env`
- Prisma migration failed: Run `docker exec -it hpc-portal-backend npx prisma migrate deploy`
- Port already in use: Change ports in `docker-compose.yml`

### Frontend shows connection error

**Check:**
- Backend is running: `docker compose ps`
- `VITE_API_URL` matches backend address
- CORS settings in backend allow frontend origin

### Slurm commands not working

**For local mode:**
- Verify Slurm binaries are mounted in container
- Check permissions: `docker exec -it hpc-portal-backend which sbatch`

**For SSH mode:**
- Test SSH connection: `docker exec -it hpc-portal-backend ssh user@login-node`
- Verify SSH key permissions: `ls -la /app/ssh_keys/`
- Check SSH config in `.env`

### Jobs stuck in SUBMITTED status

- Check job polling service is running (check backend logs)
- Verify Slurm scheduler is accessible
- Check `externalSchedulerId` is set in database

### Workspace permission errors

```bash
# Fix permissions
sudo chown -R 1000:1000 /shared/hpc-portal
sudo chmod -R 755 /shared/hpc-portal
```

## Monitoring and Maintenance

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 backend
```

### Health Checks

```bash
# Backend health
curl http://localhost:3000/api/health

# Database
docker exec hpc-portal-db pg_isready -U hpcportal
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart backend only
docker compose restart backend
```

### Update Deployment

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose up -d --build
```

## Support

For issues, please contact your system administrator or open an issue in the repository.

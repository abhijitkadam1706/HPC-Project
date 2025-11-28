# SSH Key Setup for Slurm Connection

This document describes how to set up SSH authentication for connecting the backend to the Slurm cluster.

## Quick Setup (Backend Server)

```bash
# Navigate to project directory
cd /home/ec2-user/HPC-Project

# Create ssh_keys directory
mkdir -p ssh_keys

# Copy your existing SSH private key
cp ~/.ssh/hpc_login_key ssh_keys/id_rsa
chmod 600 ssh_keys/id_rsa

# Verify the key works
ssh -i ssh_keys/id_rsa ec2-user@34.212.88.53 "echo SSH test successful"
```

## Environment Configuration

Update your `.env` file on the backend server:

```bash
# Slurm Configuration - SSH MODE
SLURM_MODE=ssh
SLURM_SSH_HOST=34.212.88.53
SLURM_SSH_PORT=22
SLURM_SSH_USER=ec2-user
SLURM_SSH_KEY_PATH=/app/ssh_keys/id_rsa
```

**Important**: The `SLURM_SSH_KEY_PATH` must be `/app/ssh_keys/id_rsa` (inside the Docker container), not the host path.

## How It Works

1. The `./ssh_keys` directory on the host is mounted into the Docker container at `/app/ssh_keys`
2. The backend reads the SSH key from `/app/ssh_keys/id_rsa` inside the container
3. The key is used to authenticate SSH connections to the Slurm cluster

## Troubleshooting

### "All configured authentication methods failed"

This error means the SSH key is not being found or is not valid:

1. Verify the key exists: `ls -la ssh_keys/id_rsa`
2. Check permissions: `chmod 600 ssh_keys/id_rsa`
3. Test the key manually: `ssh -i ssh_keys/id_rsa ec2-user@SLURM_HOST`
4. Check backend logs: `docker compose logs backend --tail=50`

### SSH Key Not Found

If you see "SSH key file not found" in logs:

1. Ensure `ssh_keys` directory exists in project root
2. Ensure `id_rsa` file exists in `ssh_keys/` directory
3. Restart backend: `docker compose restart backend`

## Security Notes

- **Never commit SSH private keys to git**
- The `ssh_keys/` directory is in `.gitignore`
- Keep permissions on private key set to `600`
- Use different keys for different environments (dev/staging/prod)

## Alternative: LOCAL Mode

If the backend runs on the same server as Slurm, use LOCAL mode instead:

```bash
# In .env file
SLURM_MODE=local
# Remove or comment out SLURM_SSH_* variables
```

In LOCAL mode, Slurm commands run directly without SSH.

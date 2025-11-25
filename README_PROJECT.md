# HPC Portal - Web-Based HPC Job Management System

A modern, web-based portal for submitting, monitoring, and managing high-performance computing (HPC) jobs on Slurm-based clusters, including AWS ParallelCluster and AWS PCS.

## 🚀 Features

### User-Friendly Job Submission
- **No CLI Required**: Submit complex HPC jobs through intuitive web forms
- **Generic Workload Support**: ML training, simulations, data processing, analytics, and more
- **Environment Management**: Support for modules, conda, containers, and raw environments
- **Resource Configuration**: Easy selection of nodes, CPUs, memory, GPUs, and queues
- **Template System**: Save and reuse job configurations

### Real-Time Monitoring
- **Live Job Status**: Automatic updates for job lifecycle (queued → running → completed)
- **Log Streaming**: View stdout, stderr, and scheduler logs in real-time
- **Job Events**: Detailed timeline of job state changes
- **Resource Usage**: Track CPU hours, GPU hours, and walltime

### File Management
- **Workspace Browser**: Upload, organize, and download files via web interface
- **Job I/O Management**: Link inputs and capture outputs automatically
- **Output Preview**: View results directly in the browser

### Administration
- **User Management**: Role-based access control (USER, ADMIN)
- **Usage Tracking**: Monitor resource consumption per user/job
- **Queue Management**: View available partitions and resources

## 📋 Prerequisites

- Docker 20.10+ and Docker Compose v2.0+
- Access to a Slurm cluster (AWS ParallelCluster, AWS PCS, or on-premises)
- Shared filesystem accessible by portal and compute nodes (e.g., `/fsx`, `/shared`)
- Minimum 4GB RAM and 20GB disk space

## 🏃 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/hpc-portal.git
cd hpc-portal

# Configure environment
cp .env.example .env
nano .env  # Edit configuration

# Start services
docker compose up -d --build

# Access the portal
open http://localhost
```

**Default Ports:**
- Frontend: http://localhost:80
- Backend API: http://localhost:3000/api
- API Docs: http://localhost:3000/api/docs

## 🔧 Configuration

### Environment Variables

Key configuration in `.env`:

```bash
# Database
POSTGRES_PASSWORD=your-secure-password

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Slurm Integration
SLURM_MODE=local  # or 'ssh'
WORKSPACE_ROOT=/shared/hpc-portal

# For SSH mode:
SLURM_SSH_HOST=login-node.example.com
SLURM_SSH_USER=hpc-admin
SLURM_SSH_KEY_PATH=/app/ssh_keys/id_rsa
```

### Deployment Modes

**Local Mode (Recommended)**: Deploy on Slurm login node for direct CLI access

**SSH Mode**: Deploy on separate instance and connect to Slurm via SSH

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed configuration options.

## 🏗️ Architecture

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

### Tech Stack

**Backend:**
- NestJS (TypeScript)
- PostgreSQL + Prisma ORM
- JWT Authentication
- BullMQ (Redis) for background jobs
- Slurm integration (CLI/SSH)

**Frontend:**
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS
- React Query for data fetching
- React Router for navigation

**Infrastructure:**
- Docker + Docker Compose
- Nginx (frontend)

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment instructions
- [Project Structure](./PROJECT_STRUCTURE.md) - Codebase architecture
- [API Documentation](http://localhost:3000/api/docs) - OpenAPI/Swagger docs (when running)

## 🔐 Security

- JWT-based authentication with refresh tokens
- Bcrypt password hashing
- Input validation and sanitization
- SQL injection prevention via Prisma ORM
- CORS protection
- Role-based access control

**Production Checklist:**
- [ ] Change default JWT secrets
- [ ] Use strong database passwords
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure firewall rules
- [ ] Use SSH key authentication
- [ ] Enable database backups
- [ ] Set up monitoring

## 🛠️ Development

### Backend Development

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Database Management

```bash
# Run migrations
docker exec -it hpc-portal-backend npx prisma migrate deploy

# View database
docker exec -it hpc-portal-backend npx prisma studio

# Backup database
docker exec hpc-portal-db pg_dump -U hpcportal hpcportal > backup.sql
```

## 🐛 Troubleshooting

### Backend won't start
```bash
docker compose logs backend
# Check DATABASE_URL and JWT_SECRET in .env
```

### Slurm commands not working
```bash
# For local mode:
docker exec -it hpc-portal-backend which sbatch

# For SSH mode:
docker exec -it hpc-portal-backend ssh user@login-node
```

### Jobs stuck in SUBMITTED
- Check job polling service in backend logs
- Verify Slurm scheduler is accessible
- Check externalSchedulerId in database

See [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting) for more solutions.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Altair Access, NICE EnginFrame, and Rescale
- Built for the HPC community
- Designed for ease of use by domain scientists and researchers

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Contact your system administrator
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section

---

**Made with ❤️ for the HPC community**

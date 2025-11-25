#!/bin/bash

################################################################################
# HPC Portal - Automated Backend Deployment Script (for Login Node)
# This script deploys the backend on the Slurm login node
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running on login node (look for Slurm binaries)
check_environment() {
    print_info "Checking environment..."

    if ! command -v sbatch &> /dev/null; then
        print_error "sbatch command not found. Are you on the Slurm login node?"
        exit 1
    fi

    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed!"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed!"
        exit 1
    fi

    print_success "Environment checks passed"
}

# Check if .env file exists
check_env_file() {
    print_info "Checking for .env file..."

    if [ ! -f ".env" ]; then
        print_error ".env file not found!"
        print_info "Creating .env template..."

        cat > .env << 'EOF'
# Database Configuration
POSTGRES_USER=hpcportal
POSTGRES_PASSWORD=CHANGE_THIS_PASSWORD
POSTGRES_DB=hpcportal

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=CHANGE_THIS_SECRET
JWT_REFRESH_SECRET=CHANGE_THIS_REFRESH_SECRET

# Frontend URL (your portal EC2 public IP)
FRONTEND_URL=http://YOUR_PORTAL_EC2_IP

# Slurm Configuration (local mode for login node)
SLURM_MODE=local

# Workspace Configuration
WORKSPACE_ROOT=/shared/hpc-portal
EOF

        print_warning ".env template created. Please edit it with your configuration:"
        print_info "  1. Set secure POSTGRES_PASSWORD"
        print_info "  2. Generate JWT_SECRET and JWT_REFRESH_SECRET (openssl rand -base64 32)"
        print_info "  3. Set FRONTEND_URL to your portal EC2 public IP"
        print_info ""
        print_info "Run this script again after updating .env"
        exit 1
    fi

    # Check for placeholder values
    if grep -q "CHANGE_THIS" .env || grep -q "YOUR_PORTAL_EC2_IP" .env; then
        print_error ".env file contains placeholder values. Please update it!"
        exit 1
    fi

    print_success ".env file found and configured"
}

# Prepare workspace directory
prepare_workspace() {
    print_info "Preparing workspace directory..."

    WORKSPACE_ROOT=$(grep WORKSPACE_ROOT .env | cut -d '=' -f2)

    if [ -z "$WORKSPACE_ROOT" ]; then
        WORKSPACE_ROOT="/shared/hpc-portal"
    fi

    if [ ! -d "$WORKSPACE_ROOT" ]; then
        print_info "Creating workspace directory: $WORKSPACE_ROOT"
        sudo mkdir -p "$WORKSPACE_ROOT/users"
    fi

    # Set permissions
    print_info "Setting workspace permissions..."
    sudo chown -R $(whoami):$(whoami) "$WORKSPACE_ROOT"
    sudo chmod 755 "$WORKSPACE_ROOT"

    # Test write access
    if echo "test" > "$WORKSPACE_ROOT/test.txt" 2>/dev/null; then
        rm "$WORKSPACE_ROOT/test.txt"
        print_success "Workspace directory ready and writable"
    else
        print_error "Cannot write to workspace directory: $WORKSPACE_ROOT"
        exit 1
    fi
}

# Stop existing containers
stop_existing() {
    print_info "Stopping existing containers..."

    if [ "$(docker ps -q -f name=hpc-portal)" ]; then
        docker-compose -f docker-compose-backend.yml down
        print_success "Existing containers stopped"
    else
        print_info "No existing containers found"
    fi
}

# Build Docker images
build_images() {
    print_info "Building Docker images (this may take 5-10 minutes)..."

    if docker-compose -f docker-compose-backend.yml build --no-cache; then
        print_success "Docker images built successfully"
    else
        print_error "Failed to build Docker images"
        exit 1
    fi
}

# Start services
start_services() {
    print_info "Starting services..."

    if docker-compose -f docker-compose-backend.yml up -d; then
        print_success "Services started"
    else
        print_error "Failed to start services"
        exit 1
    fi
}

# Wait for services to be healthy
wait_for_health() {
    print_info "Waiting for services to become healthy..."

    local max_attempts=60
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if docker-compose -f docker-compose-backend.yml ps | grep -q "Up"; then
            sleep 2

            # Check backend health
            if curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
                print_success "All services are healthy!"
                return 0
            fi
        fi

        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done

    echo ""
    print_error "Services failed to become healthy"
    print_info "Checking logs..."
    docker-compose -f docker-compose-backend.yml logs backend | tail -50
    exit 1
}

# Display status
show_status() {
    print_info "Service Status:"
    docker-compose -f docker-compose-backend.yml ps

    echo ""
    print_info "Testing endpoints..."

    # Test health endpoint
    if curl -sf http://localhost:3000/api/health > /dev/null; then
        print_success "✓ Backend API is responding"
    else
        print_warning "✗ Backend API is not responding"
    fi

    # Test database
    if docker exec hpc-portal-db pg_isready -U hpcportal > /dev/null 2>&1; then
        print_success "✓ Database is ready"
    else
        print_warning "✗ Database is not ready"
    fi

    # Test Slurm access
    if docker exec hpc-portal-backend which sbatch > /dev/null 2>&1; then
        print_success "✓ Slurm commands are accessible"
    else
        print_warning "✗ Slurm commands are not accessible"
    fi
}

# Show next steps
show_next_steps() {
    echo ""
    print_success "========================================="
    print_success "Backend Deployment Complete!"
    print_success "========================================="
    echo ""
    print_info "API URL: http://$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}'):3000"
    echo ""
    print_info "Next Steps:"
    print_info "  1. Update your AWS Security Group to allow port 3000 from your portal EC2"
    print_info "  2. Test the API: curl http://localhost:3000/api/health"
    print_info "  3. Deploy the frontend on your portal EC2 instance"
    echo ""
    print_info "Useful Commands:"
    print_info "  View logs:    docker-compose -f docker-compose-backend.yml logs -f backend"
    print_info "  Restart:      docker-compose -f docker-compose-backend.yml restart"
    print_info "  Stop:         docker-compose -f docker-compose-backend.yml down"
    print_info "  View status:  docker-compose -f docker-compose-backend.yml ps"
    echo ""
}

# Main execution
main() {
    print_info "Starting HPC Portal Backend Deployment..."
    echo ""

    check_environment
    check_env_file
    prepare_workspace
    stop_existing
    build_images
    start_services
    wait_for_health
    show_status
    show_next_steps
}

# Run main function
main

#!/bin/bash

################################################################################
# HPC Portal - Automated Frontend Deployment Script (for Portal EC2)
# This script deploys the frontend on a separate EC2 instance
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

# Check environment
check_environment() {
    print_info "Checking environment..."

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

# Check if .env.frontend file exists
check_env_file() {
    print_info "Checking for .env.frontend file..."

    if [ ! -f ".env.frontend" ]; then
        print_error ".env.frontend file not found!"
        print_info "Creating .env.frontend template..."

        cat > .env.frontend << 'EOF'
# Frontend Configuration
# Backend API URL (your login node public IP and port)
VITE_API_URL=http://YOUR_LOGIN_NODE_IP:3000/api
EOF

        print_warning ".env.frontend template created. Please edit it with your configuration:"
        print_info "  1. Set VITE_API_URL to your login node public IP (http://X.X.X.X:3000/api)"
        print_info ""
        print_info "Run this script again after updating .env.frontend"
        exit 1
    fi

    # Check for placeholder values
    if grep -q "YOUR_LOGIN_NODE_IP" .env.frontend; then
        print_error ".env.frontend file contains placeholder values. Please update it!"
        exit 1
    fi

    print_success ".env.frontend file found and configured"
}

# Stop existing containers
stop_existing() {
    print_info "Stopping existing containers..."

    if [ "$(docker ps -q -f name=hpc-portal-frontend)" ]; then
        docker-compose -f docker-compose-frontend.yml down
        print_success "Existing containers stopped"
    else
        print_info "No existing containers found"
    fi
}

# Build Docker images
build_images() {
    print_info "Building Docker images (this may take 3-5 minutes)..."

    # Load environment variables
    export $(cat .env.frontend | xargs)

    if docker-compose -f docker-compose-frontend.yml build --no-cache; then
        print_success "Docker images built successfully"
    else
        print_error "Failed to build Docker images"
        exit 1
    fi
}

# Start services
start_services() {
    print_info "Starting services..."

    # Load environment variables
    export $(cat .env.frontend | xargs)

    if docker-compose -f docker-compose-frontend.yml up -d; then
        print_success "Services started"
    else
        print_error "Failed to start services"
        exit 1
    fi
}

# Wait for services to be healthy
wait_for_health() {
    print_info "Waiting for services to become healthy..."

    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if docker-compose -f docker-compose-frontend.yml ps | grep -q "Up"; then
            sleep 2

            # Check frontend health
            if curl -sf http://localhost/ > /dev/null 2>&1; then
                print_success "Frontend is healthy!"
                return 0
            fi
        fi

        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done

    echo ""
    print_error "Frontend failed to become healthy"
    print_info "Checking logs..."
    docker-compose -f docker-compose-frontend.yml logs frontend | tail -50
    exit 1
}

# Test backend connectivity
test_backend() {
    print_info "Testing backend connectivity..."

    local backend_url=$(grep VITE_API_URL .env.frontend | cut -d '=' -f2 | sed 's|/api$||')

    if curl -sf "${backend_url}/api/health" > /dev/null 2>&1; then
        print_success "✓ Backend is accessible"
    else
        print_warning "✗ Backend is not accessible from this instance"
        print_warning "  Make sure:"
        print_warning "  1. Backend is running on the login node"
        print_warning "  2. Security group allows port 3000 from this EC2 instance"
        print_warning "  3. Backend URL is correct in .env.frontend"
    fi
}

# Display status
show_status() {
    print_info "Service Status:"
    docker-compose -f docker-compose-frontend.yml ps

    echo ""
    print_info "Testing endpoints..."

    # Test frontend
    if curl -sf http://localhost/ > /dev/null; then
        print_success "✓ Frontend is responding"
    else
        print_warning "✗ Frontend is not responding"
    fi
}

# Show next steps
show_next_steps() {
    local public_ip=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

    echo ""
    print_success "========================================="
    print_success "Frontend Deployment Complete!"
    print_success "========================================="
    echo ""
    print_info "Portal URL: http://$public_ip"
    echo ""
    print_info "Next Steps:"
    print_info "  1. Open your browser and navigate to: http://$public_ip"
    print_info "  2. Register a new user account"
    print_info "  3. Submit a test job to verify Slurm integration"
    echo ""
    print_info "Useful Commands:"
    print_info "  View logs:    docker-compose -f docker-compose-frontend.yml logs -f frontend"
    print_info "  Restart:      docker-compose -f docker-compose-frontend.yml restart"
    print_info "  Stop:         docker-compose -f docker-compose-frontend.yml down"
    print_info "  View status:  docker-compose -f docker-compose-frontend.yml ps"
    echo ""
}

# Main execution
main() {
    print_info "Starting HPC Portal Frontend Deployment..."
    echo ""

    check_environment
    check_env_file
    stop_existing
    build_images
    start_services
    wait_for_health
    test_backend
    show_status
    show_next_steps
}

# Run main function
main

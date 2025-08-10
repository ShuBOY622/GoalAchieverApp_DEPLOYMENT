#!/bin/bash

# Goal App EC2 Deployment Script
# This script automates the deployment process on EC2

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

print_status "Starting Goal App deployment on EC2..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env.ec2 file exists
if [ ! -f ".env.ec2" ]; then
    print_warning ".env.ec2 file not found. Creating from example..."
    if [ -f ".env.ec2.example" ]; then
        cp .env.ec2.example .env.ec2
        print_warning "Please edit .env.ec2 file with your configuration before continuing."
        print_warning "Press Enter to continue after editing .env.ec2..."
        read
    else
        print_error ".env.ec2.example file not found. Please create .env.ec2 manually."
        exit 1
    fi
fi

# Load environment variables
export $(cat .env.ec2 | grep -v '^#' | xargs)

# Validate required environment variables
if [ -z "$REACT_APP_API_URL" ]; then
    print_error "REACT_APP_API_URL is not set in .env.ec2"
    exit 1
fi

if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
    print_error "MYSQL_ROOT_PASSWORD is not set in .env.ec2"
    exit 1
fi

print_status "Environment variables loaded successfully"

# Stop existing containers if running
print_status "Stopping existing containers..."
docker-compose down --remove-orphans || true

# Clean up old images (optional)
read -p "Do you want to clean up old Docker images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Cleaning up old Docker images..."
    docker system prune -f
fi

# Build images
print_status "Building Docker images..."
docker-compose -f docker-compose.yml -f docker-compose.ec2.yml build --no-cache

# Start services
print_status "Starting services..."
docker-compose -f docker-compose.yml -f docker-compose.ec2.yml up -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service health
print_status "Checking service health..."

services=("mysql" "kafka" "user-service" "goal-service" "points-service" "notification-service" "challenge-service" "api-gateway" "frontend")

for service in "${services[@]}"; do
    print_status "Checking $service..."
    if docker-compose ps | grep -q "$service.*Up"; then
        print_success "$service is running"
    else
        print_error "$service is not running properly"
        docker-compose logs --tail=20 $service
    fi
done

# Display running containers
print_status "Currently running containers:"
docker-compose ps

# Display useful information
print_success "Deployment completed!"
echo
print_status "Access your application at:"
echo "  Frontend: http://$(curl -s http://checkip.amazonaws.com):3000"
echo "  API Gateway: http://$(curl -s http://checkip.amazonaws.com):8080"
echo "  Health Check: http://$(curl -s http://checkip.amazonaws.com):8080/actuator/health"
echo
print_status "Useful commands:"
echo "  View logs: docker-compose logs -f [service-name]"
echo "  Stop services: docker-compose down"
echo "  Restart services: docker-compose restart [service-name]"
echo "  View running containers: docker-compose ps"
echo
print_warning "Make sure your EC2 security group allows traffic on ports 3000 and 8080"
print_warning "Consider setting up Nginx reverse proxy for production use"

# Optional: Setup log monitoring
read -p "Do you want to set up log monitoring? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Setting up log monitoring..."
    # Create log monitoring script
    cat > monitor-logs.sh << 'EOF'
#!/bin/bash
echo "Goal App Log Monitor"
echo "==================="
echo "Press Ctrl+C to exit"
echo
docker-compose logs -f --tail=100
EOF
    chmod +x monitor-logs.sh
    print_success "Log monitoring script created: ./monitor-logs.sh"
fi

print_success "Goal App deployment script completed successfully!"
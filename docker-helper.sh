#!/bin/bash

# GoalApp Docker Helper Script
# This script provides convenient commands for managing the GoalApp Docker deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Check if Docker and Docker Compose are installed
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed"
}

# Start all services
start_all() {
    print_header "Starting All Services"
    docker-compose up --build -d
    print_status "All services started. Check status with: ./docker-helper.sh status"
}

# Start production services
start_prod() {
    print_header "Starting Production Services"
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
    print_status "Production services started"
}

# Start development infrastructure only
start_dev() {
    print_header "Starting Development Infrastructure"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    print_status "Development infrastructure started (MySQL, Kafka, Zookeeper)"
}

# Stop all services
stop_all() {
    print_header "Stopping All Services"
    docker-compose down
    print_status "All services stopped"
}

# Show service status
show_status() {
    print_header "Service Status"
    docker-compose ps
}

# Show logs
show_logs() {
    if [ -z "$1" ]; then
        print_header "Showing All Logs"
        docker-compose logs -f
    else
        print_header "Showing Logs for $1"
        docker-compose logs -f "$1"
    fi
}

# Health check
health_check() {
    print_header "Health Check"
    
    # Define services with their ports
    declare -A services=(
        ["user-service"]="8081"
        ["goal-service"]="8082"
        ["points-service"]="8083"
        ["notification-service"]="8084"
        ["challenge-service"]="8085"
        ["api-gateway"]="8080"
    )
    
    for service in "${!services[@]}"; do
        port=${services[$service]}
        if docker-compose ps | grep -q "$service.*Up"; then
            if docker-compose exec -T "$service" curl -f http://localhost:$port/actuator/health &> /dev/null; then
                print_status "$service: Healthy (port $port)"
            else
                print_warning "$service: Unhealthy (port $port)"
            fi
        else
            print_error "$service: Not running"
        fi
    done
}

# Clean up
cleanup() {
    print_header "Cleaning Up"
    print_warning "This will remove all containers, networks, and volumes. Data will be lost!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v --rmi all
        docker system prune -f
        print_status "Cleanup completed"
    else
        print_status "Cleanup cancelled"
    fi
}

# Backup database
backup_db() {
    print_header "Backing Up Database"
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_file="goalapp_backup_$timestamp.sql"
    
    if docker-compose ps | grep -q "mysql.*Up"; then
        docker-compose exec -T mysql mysqldump -u root -proot --all-databases > "$backup_file"
        print_status "Database backed up to $backup_file"
    else
        print_error "MySQL service is not running"
        exit 1
    fi
}

# Restore database
restore_db() {
    if [ -z "$1" ]; then
        print_error "Please provide backup file: ./docker-helper.sh restore <backup_file>"
        exit 1
    fi
    
    if [ ! -f "$1" ]; then
        print_error "Backup file $1 not found"
        exit 1
    fi
    
    print_header "Restoring Database from $1"
    print_warning "This will overwrite existing data!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if docker-compose ps | grep -q "mysql.*Up"; then
            docker-compose exec -T mysql mysql -u root -proot < "$1"
            print_status "Database restored from $1"
        else
            print_error "MySQL service is not running"
            exit 1
        fi
    else
        print_status "Restore cancelled"
    fi
}

# Scale services
scale_service() {
    if [ -z "$1" ] || [ -z "$2" ]; then
        print_error "Usage: ./docker-helper.sh scale <service> <replicas>"
        exit 1
    fi
    
    print_header "Scaling $1 to $2 replicas"
    docker-compose up --scale "$1=$2" -d
    print_status "Service $1 scaled to $2 replicas"
}

# Show help
show_help() {
    echo "GoalApp Docker Helper Script"
    echo ""
    echo "Usage: ./docker-helper.sh <command> [options]"
    echo ""
    echo "Commands:"
    echo "  start           Start all services"
    echo "  start-prod      Start with production configuration"
    echo "  start-dev       Start development infrastructure only"
    echo "  stop            Stop all services"
    echo "  status          Show service status"
    echo "  logs [service]  Show logs (all services or specific service)"
    echo "  health          Check service health"
    echo "  backup          Backup database"
    echo "  restore <file>  Restore database from backup"
    echo "  scale <svc> <n> Scale service to n replicas"
    echo "  cleanup         Remove all containers, networks, and volumes"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./docker-helper.sh start"
    echo "  ./docker-helper.sh logs user-service"
    echo "  ./docker-helper.sh scale user-service 3"
    echo "  ./docker-helper.sh backup"
}

# Main script logic
main() {
    check_prerequisites
    
    case "$1" in
        "start")
            start_all
            ;;
        "start-prod")
            start_prod
            ;;
        "start-dev")
            start_dev
            ;;
        "stop")
            stop_all
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$2"
            ;;
        "health")
            health_check
            ;;
        "backup")
            backup_db
            ;;
        "restore")
            restore_db "$2"
            ;;
        "scale")
            scale_service "$2" "$3"
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"--help"|"-h"|"")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
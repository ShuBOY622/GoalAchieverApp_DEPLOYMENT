#!/bin/bash

# Script to update frontend configuration for EC2 deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Get EC2 public IP
print_status "Detecting EC2 public IP..."
EC2_PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)

if [ -z "$EC2_PUBLIC_IP" ]; then
    print_error "Could not detect EC2 public IP. Please enter it manually:"
    read -p "Enter your EC2 public IP: " EC2_PUBLIC_IP
fi

print_success "EC2 Public IP: $EC2_PUBLIC_IP"

# Ask user for preferred configuration
echo
print_status "Choose your frontend configuration:"
echo "1. Use EC2 public IP (http://$EC2_PUBLIC_IP:8080)"
echo "2. Use custom domain (https://your-domain.com)"
echo "3. Use localhost (for testing)"

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        API_URL="http://$EC2_PUBLIC_IP:8080"
        ;;
    2)
        read -p "Enter your domain name (e.g., your-domain.com): " DOMAIN
        read -p "Use HTTPS? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            API_URL="https://$DOMAIN"
        else
            API_URL="http://$DOMAIN"
        fi
        ;;
    3)
        API_URL="http://localhost:8080"
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

print_status "Selected API URL: $API_URL"

# Update .env.ec2 file
if [ -f ".env.ec2" ]; then
    print_status "Updating .env.ec2 file..."
    sed -i.bak "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=$API_URL|" .env.ec2
    print_success ".env.ec2 updated successfully"
else
    print_status "Creating .env.ec2 file..."
    cat > .env.ec2 << EOF
# EC2 Production Environment Variables
MYSQL_ROOT_PASSWORD=your_very_secure_root_password_here
MYSQL_USER=goalapp_user
MYSQL_PASSWORD=your_secure_database_password_here
REACT_APP_API_URL=$API_URL
JAVA_OPTS=-Xmx256m -Xms128m -XX:+UseG1GC -XX:MaxGCPauseMillis=200
KAFKA_HEAP_OPTS=-Xmx512m -Xms512m
SPRING_PROFILES_ACTIVE=docker
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_ORG_GOALAPP=DEBUG
EOF
    print_success ".env.ec2 created successfully"
    print_warning "Please update the database passwords in .env.ec2"
fi

# Check if frontend source needs updating
FRONTEND_CONFIG_FILE="goal-app-frontend/src/config/api.ts"
FRONTEND_ENV_FILE="goal-app-frontend/.env"

if [ -f "$FRONTEND_CONFIG_FILE" ]; then
    print_status "Found frontend API config file. Updating..."
    # Backup original
    cp "$FRONTEND_CONFIG_FILE" "$FRONTEND_CONFIG_FILE.bak"
    
    # Update API URL in config file
    sed -i "s|baseURL:.*|baseURL: process.env.REACT_APP_API_URL || '$API_URL',|" "$FRONTEND_CONFIG_FILE"
    print_success "Frontend config file updated"
fi

if [ -f "$FRONTEND_ENV_FILE" ]; then
    print_status "Found frontend .env file. Updating..."
    # Backup original
    cp "$FRONTEND_ENV_FILE" "$FRONTEND_ENV_FILE.bak"
    
    # Update or add REACT_APP_API_URL
    if grep -q "REACT_APP_API_URL" "$FRONTEND_ENV_FILE"; then
        sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=$API_URL|" "$FRONTEND_ENV_FILE"
    else
        echo "REACT_APP_API_URL=$API_URL" >> "$FRONTEND_ENV_FILE"
    fi
    print_success "Frontend .env file updated"
else
    print_status "Creating frontend .env file..."
    echo "REACT_APP_API_URL=$API_URL" > "$FRONTEND_ENV_FILE"
    print_success "Frontend .env file created"
fi

# Update Nginx configuration if it exists
if [ -f "nginx.conf" ]; then
    print_status "Updating Nginx configuration..."
    cp nginx.conf nginx.conf.bak
    
    if [ "$choice" = "2" ]; then
        sed -i "s|server_name .*|server_name $DOMAIN www.$DOMAIN;|" nginx.conf
        print_success "Nginx configuration updated with domain: $DOMAIN"
    else
        sed -i "s|server_name .*|server_name $EC2_PUBLIC_IP;|" nginx.conf
        print_success "Nginx configuration updated with IP: $EC2_PUBLIC_IP"
    fi
fi

print_success "Configuration update completed!"
echo
print_status "Next steps:"
echo "1. Review the updated .env.ec2 file and set secure passwords"
echo "2. Run the deployment script: ./deploy-ec2.sh"
echo "3. If using a domain, set up DNS records to point to $EC2_PUBLIC_IP"
echo "4. Consider setting up SSL certificate with Let's Encrypt"
echo
print_warning "Make sure your EC2 security group allows traffic on the required ports"
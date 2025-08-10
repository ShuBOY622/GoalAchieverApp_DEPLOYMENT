# Goal App EC2 Deployment Guide

## Overview
This guide will help you deploy your Goal App (microservices architecture with React frontend) to an AWS EC2 instance using Docker and Docker Compose.

## Prerequisites
- AWS Account with EC2 access
- Domain name (optional but recommended)
- Basic knowledge of AWS EC2 and SSH

## Step 1: Launch EC2 Instance

### 1.1 Instance Configuration
- **AMI**: Ubuntu Server 22.04 LTS (Free Tier Eligible)
- **Instance Type**: 
  - Minimum: t3.medium (2 vCPU, 4 GB RAM) - for testing
  - Recommended: t3.large (2 vCPU, 8 GB RAM) - for production
  - Optimal: t3.xlarge (4 vCPU, 16 GB RAM) - for high performance
- **Storage**: 30 GB GP3 SSD (minimum)
- **Key Pair**: Create or use existing key pair for SSH access

### 1.2 Security Group Configuration
Create a security group with the following inbound rules:

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | Your IP | SSH access |
| HTTP | TCP | 80 | 0.0.0.0/0 | Web traffic |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Secure web traffic |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 | Frontend (temporary) |
| Custom TCP | TCP | 8080 | 0.0.0.0/0 | API Gateway |
| Custom TCP | TCP | 8081-8085 | 0.0.0.0/0 | Microservices (optional) |

## Step 2: Connect to EC2 Instance

```bash
# Replace with your key file and instance IP
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

## Step 3: Install Required Software

### 3.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 3.2 Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker ubuntu

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Logout and login again for group changes to take effect
exit
```

### 3.3 Install Docker Compose
```bash
# After reconnecting to EC2
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 3.4 Install Git and Other Tools
```bash
sudo apt install -y git htop curl wget unzip
```

## Step 4: Deploy Your Application

### 4.1 Clone Your Repository
```bash
# If using Git repository
git clone <your-repository-url>
cd GoalApp_backup

# OR upload your project files using SCP
# scp -i "your-key.pem" -r /path/to/GoalApp_backup ubuntu@your-ec2-ip:~/
```

### 4.2 Create Production Environment File
```bash
# Create environment file for production
nano .env.prod
```

Add the following content to `.env.prod`:
```env
# Database Configuration
MYSQL_ROOT_PASSWORD=your_secure_root_password
MYSQL_DATABASE=goalapp_user
MYSQL_USER=goalapp_user
MYSQL_PASSWORD=your_secure_db_password

# Application Configuration
SPRING_PROFILES_ACTIVE=docker
SERVER_PORT_GATEWAY=8080
SERVER_PORT_USER=8081
SERVER_PORT_GOAL=8082
SERVER_PORT_POINTS=8083
SERVER_PORT_NOTIFICATION=8084
SERVER_PORT_CHALLENGE=8085

# Frontend Configuration
REACT_APP_API_URL=http://your-ec2-public-ip:8080

# Kafka Configuration
KAFKA_HEAP_OPTS=-Xmx512m -Xms512m

# Java Configuration
JAVA_OPTS=-Xmx256m -Xms128m -XX:+UseG1GC -XX:MaxGCPauseMillis=200
```

## Step 5: Modify Configuration Files

### 5.1 Update Docker Compose for Production
Create a production-specific docker-compose file:

```bash
nano docker-compose.ec2.yml
```

### 5.2 Update Frontend Configuration
You'll need to update the frontend API URL to point to your EC2 instance's public IP or domain.

## Step 6: Build and Deploy

### 6.1 Build Images
```bash
# Build all services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
```

### 6.2 Start Services
```bash
# Start all services in production mode
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 6.3 Verify Deployment
```bash
# Check running containers
docker ps

# Check logs
docker-compose logs -f

# Check specific service logs
docker-compose logs -f api-gateway
docker-compose logs -f frontend
```

## Step 7: Set Up Reverse Proxy (Optional but Recommended)

### 7.1 Install Nginx
```bash
sudo apt install -y nginx
```

### 7.2 Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/goalapp
```

Add Nginx configuration for reverse proxy and SSL termination.

## Step 8: Set Up SSL Certificate (Optional)

### 8.1 Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 8.2 Obtain SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com
```

## Step 9: Set Up Monitoring and Logging

### 9.1 Set Up Log Rotation
```bash
# Configure Docker log rotation
sudo nano /etc/docker/daemon.json
```

### 9.2 Set Up System Monitoring
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs
```

## Step 10: Create Backup and Recovery Scripts

### 10.1 Database Backup Script
```bash
nano backup-db.sh
```

### 10.2 Application Backup Script
```bash
nano backup-app.sh
```

## Step 11: Set Up Auto-Start on Boot

### 11.1 Create Systemd Service
```bash
sudo nano /etc/systemd/system/goalapp.service
```

### 11.2 Enable Service
```bash
sudo systemctl enable goalapp.service
sudo systemctl start goalapp.service
```

## Troubleshooting

### Common Issues and Solutions

1. **Out of Memory Errors**
   - Increase EC2 instance size
   - Optimize Java heap settings
   - Add swap space

2. **Port Conflicts**
   - Check if ports are already in use: `sudo netstat -tulpn`
   - Modify port mappings in docker-compose

3. **Database Connection Issues**
   - Verify MySQL container is running
   - Check database credentials
   - Ensure proper network connectivity

4. **Frontend API Connection Issues**
   - Update REACT_APP_API_URL with correct EC2 IP
   - Check security group rules
   - Verify API Gateway is accessible

### Useful Commands

```bash
# View system resources
htop
df -h
free -h

# Docker management
docker system prune -a  # Clean up unused resources
docker-compose down     # Stop all services
docker-compose up -d    # Start all services

# View logs
docker-compose logs -f [service-name]
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Security Best Practices

1. **Firewall Configuration**
   - Use AWS Security Groups effectively
   - Consider using UFW for additional protection

2. **Regular Updates**
   - Keep system packages updated
   - Update Docker images regularly

3. **Secrets Management**
   - Use environment variables for sensitive data
   - Consider AWS Secrets Manager for production

4. **Backup Strategy**
   - Regular database backups
   - Application code backups
   - Configuration backups

## Performance Optimization

1. **Resource Monitoring**
   - Monitor CPU, memory, and disk usage
   - Set up CloudWatch monitoring

2. **Database Optimization**
   - Configure MySQL for production workloads
   - Implement connection pooling

3. **Caching Strategy**
   - Implement Redis for caching (optional)
   - Configure Nginx caching

## Cost Optimization

1. **Instance Right-Sizing**
   - Start with smaller instances and scale up as needed
   - Use AWS Cost Explorer to monitor costs

2. **Storage Optimization**
   - Use GP3 instead of GP2 for better performance/cost ratio
   - Implement log rotation to manage disk space

3. **Reserved Instances**
   - Consider Reserved Instances for long-term deployments

## Next Steps

After successful deployment:

1. Set up monitoring and alerting
2. Implement CI/CD pipeline
3. Configure automated backups
4. Set up staging environment
5. Implement proper logging and monitoring
6. Consider using AWS Application Load Balancer
7. Implement auto-scaling if needed

## Support and Maintenance

- Regular health checks
- Monitor application logs
- Keep dependencies updated
- Plan for disaster recovery
- Document any custom configurations
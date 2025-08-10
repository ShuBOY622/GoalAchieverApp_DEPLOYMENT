# Goal App - Microservices Application

A comprehensive goal-setting and tracking application built with Spring Boot microservices architecture and React frontend.

## 🏗️ Architecture

- **Frontend**: React with TypeScript
- **Backend**: Spring Boot Microservices
  - User Service (Port 8081)
  - Goal Service (Port 8082)
  - Points Service (Port 8083)
  - Notification Service (Port 8084)
  - Challenge Service (Port 8085)
  - API Gateway (Port 8080)
- **Database**: MySQL 8.0
- **Message Broker**: Apache Kafka
- **Containerization**: Docker & Docker Compose

## 🚀 Quick Start

### Local Development
```bash
# Clone the repository
git clone <your-repo-url>
cd GoalApp_backup

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# API Gateway: http://localhost:8080
```

### Production Deployment on EC2
```bash
# 1. Configure environment
./update-frontend-config.sh

# 2. Set up environment variables
cp .env.ec2.example .env.ec2
nano .env.ec2  # Update with your values

# 3. Deploy
./deploy-ec2.sh
```

## 📋 Prerequisites

### Local Development
- Docker & Docker Compose
- Java 17+ (for local development)
- Node.js 18+ (for local development)
- Maven 3.6+ (for local development)

### EC2 Deployment
- AWS EC2 instance (t3.medium or larger)
- Ubuntu 22.04 LTS
- Docker & Docker Compose
- Git

## 🔧 Configuration

### Environment Variables
Create `.env.ec2` from the example file and configure:

```bash
cp .env.ec2.example .env.ec2
```

Key variables to update:
- `REACT_APP_API_URL`: Your EC2 public IP or domain
- `MYSQL_ROOT_PASSWORD`: Secure MySQL root password
- `MYSQL_PASSWORD`: Secure MySQL user password

### Security Group (EC2)
Ensure your EC2 security group allows:
- Port 22 (SSH)
- Port 80 (HTTP)
- Port 443 (HTTPS)
- Port 3000 (Frontend)
- Port 8080 (API Gateway)

## 📁 Project Structure

```
GoalApp_backup/
├── goal-app-backend/          # Spring Boot microservices
│   ├── api-gateway/           # API Gateway service
│   ├── user-service/          # User management
│   ├── goal-service/          # Goal management
│   ├── points-service/        # Points system
│   ├── notification-service/  # Notifications
│   ├── challenge-service/     # Challenges
│   ├── common/               # Shared utilities
│   └── Dockerfile            # Backend Dockerfile
├── goal-app-frontend/         # React frontend
│   └── Dockerfile            # Frontend Dockerfile
├── docker-compose.yml         # Main compose file
├── docker-compose.prod.yml    # Production overrides
├── docker-compose.ec2.yml     # EC2 specific config
├── init-db.sql              # Database initialization
├── nginx.conf               # Nginx configuration
├── deploy-ec2.sh            # Deployment script
└── update-frontend-config.sh # Config helper script
```

## 🐳 Docker Commands

### Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up -d --build
```

### Production (EC2)
```bash
# Start with production config
docker-compose -f docker-compose.yml -f docker-compose.ec2.yml up -d

# View specific service logs
docker-compose logs -f api-gateway

# Check service health
docker-compose ps
```

## 🔍 Monitoring

### Health Checks
- API Gateway: `http://your-server:8080/actuator/health`
- Individual services: `http://your-server:808X/actuator/health`

### Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f user-service

# System logs (EC2)
sudo journalctl -u goalapp.service -f
```

## 🛠️ Development

### Adding New Features
1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes to relevant microservice
3. Update tests
4. Test locally with Docker Compose
5. Create pull request

### Database Changes
1. Update `init-db.sql` for schema changes
2. Add migration scripts if needed
3. Test with fresh database: `docker-compose down -v && docker-compose up -d`

## 🚀 Deployment

### Automated Deployment (Recommended)
```bash
./deploy-ec2.sh
```

### Manual Deployment
```bash
# 1. Update configuration
./update-frontend-config.sh

# 2. Build and deploy
docker-compose -f docker-compose.yml -f docker-compose.ec2.yml up -d --build

# 3. Verify deployment
docker-compose ps
```

### CI/CD Pipeline
For automated deployments, consider setting up:
- GitHub Actions
- AWS CodePipeline
- Jenkins

## 🔒 Security

### Best Practices
- Use strong passwords in `.env.ec2`
- Enable firewall (UFW) on EC2
- Use HTTPS in production
- Regular security updates
- Monitor access logs

### SSL Certificate (Production)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com
```

## 📊 Performance

### Resource Requirements
- **Minimum**: t3.medium (2 vCPU, 4GB RAM)
- **Recommended**: t3.large (2 vCPU, 8GB RAM)
- **Optimal**: t3.xlarge (4 vCPU, 16GB RAM)

### Optimization
- Java heap tuning in `.env.ec2`
- Database connection pooling
- Nginx caching
- CDN for static assets

## 🐛 Troubleshooting

### Common Issues

1. **Out of Memory**
   ```bash
   # Check memory usage
   free -h
   # Adjust Java heap in .env.ec2
   JAVA_OPTS=-Xmx256m -Xms128m
   ```

2. **Port Conflicts**
   ```bash
   # Check port usage
   sudo netstat -tulpn | grep :8080
   ```

3. **Database Connection**
   ```bash
   # Check MySQL logs
   docker-compose logs mysql
   ```

4. **Frontend API Issues**
   - Verify `REACT_APP_API_URL` in `.env.ec2`
   - Check security group rules
   - Test API endpoint: `curl http://your-server:8080/actuator/health`

### Useful Commands
```bash
# System resources
htop
df -h
free -h

# Docker cleanup
docker system prune -a

# Service restart
docker-compose restart api-gateway

# Database access
docker-compose exec mysql mysql -u root -p
```

## 📚 Documentation

- [Complete Deployment Guide](EC2_DEPLOYMENT_GUIDE.md)
- [Required Changes](CHANGES_REQUIRED.md)
- [API Documentation](goal-app-backend/README.md)
- [Frontend Documentation](goal-app-frontend/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs -f`
2. Review troubleshooting section
3. Check system resources
4. Verify configuration files

## 🔄 Updates

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Database Migrations
```bash
# Backup database first
docker-compose exec mysql mysqldump -u root -p goalapp_user > backup.sql

# Apply migrations
# (Add your migration process here)
```

---

**Note**: Always test changes in a development environment before deploying to production.
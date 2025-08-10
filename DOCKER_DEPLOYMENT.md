# GoalApp Docker Deployment Guide

This guide provides instructions for deploying the GoalApp microservices architecture using Docker and Docker Compose.

## Architecture Overview

The application consists of:
- **Frontend**: React application (TypeScript)
- **API Gateway**: Spring Cloud Gateway (Port 8080)
- **Microservices**:
  - User Service (Port 8081)
  - Goal Service (Port 8082)
  - Points Service (Port 8083)
  - Notification Service (Port 8084)
  - Challenge Service (Port 8085)
- **Infrastructure**:
  - MySQL Database (Port 3306)
  - Apache Kafka (Port 9092)
  - Zookeeper (Port 2181)

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM available for containers
- Ports 3000, 8080-8085, 3306, 9092, 2181 available

## Quick Start

### 1. Full Application Deployment

```bash
# Clone and navigate to project directory
cd /path/to/GoalApp_backup

# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

### 2. Production Deployment

```bash
# Use production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

### 3. Development Setup (Infrastructure Only)

```bash
# Start only infrastructure services (MySQL, Kafka, Zookeeper)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## Service URLs

After deployment, services will be available at:

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **User Service**: http://localhost:8081
- **Goal Service**: http://localhost:8082
- **Points Service**: http://localhost:8083
- **Notification Service**: http://localhost:8084
- **Challenge Service**: http://localhost:8085

## Health Checks

All services include health checks. Monitor service health:

```bash
# Check all services status
docker-compose ps

# Check specific service logs
docker-compose logs -f user-service

# Check health of a specific service
docker-compose exec user-service curl http://localhost:8081/actuator/health
```

## Database Access

MySQL databases are automatically created:
- `goalapp_user`
- `goalapp_goal`
- `goalapp_points`
- `goalapp_notifications`
- `goalapp_challenges`

Connect to MySQL:
```bash
# Using docker exec
docker-compose exec mysql mysql -u D3_87069_Shubham -proot

# Using external client
mysql -h localhost -P 3306 -u D3_87069_Shubham -proot
```

## Kafka Management

Access Kafka for debugging:

```bash
# List topics
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Create a topic
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --create --topic test-topic --partitions 3 --replication-factor 1

# Consume messages
docker-compose exec kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic your-topic --from-beginning
```

## Scaling Services

Scale specific services:

```bash
# Scale user service to 3 instances
docker-compose up --scale user-service=3 -d

# Scale multiple services
docker-compose up --scale user-service=2 --scale goal-service=2 -d
```

## Monitoring and Logs

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f user-service

# Last 100 lines
docker-compose logs --tail=100 user-service
```

### Resource Usage
```bash
# Container resource usage
docker stats

# Specific containers
docker stats goalapp-user-service goalapp-mysql
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :8080
   
   # Stop conflicting services
   sudo systemctl stop apache2  # if using port 80
   ```

2. **Memory Issues**
   ```bash
   # Check available memory
   free -h
   
   # Increase Docker memory limit in Docker Desktop
   # Or use production config with resource limits
   ```

3. **Database Connection Issues**
   ```bash
   # Check MySQL logs
   docker-compose logs mysql
   
   # Restart MySQL service
   docker-compose restart mysql
   ```

4. **Kafka Connection Issues**
   ```bash
   # Check Kafka logs
   docker-compose logs kafka
   
   # Verify Kafka is ready
   docker-compose exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092
   ```

### Service Dependencies

Services start in this order:
1. Zookeeper
2. Kafka (depends on Zookeeper)
3. MySQL
4. Microservices (depend on MySQL and Kafka)
5. API Gateway (depends on all microservices)
6. Frontend (depends on API Gateway)

## Cleanup

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ This will delete all data)
docker-compose down -v

# Remove images as well
docker-compose down --rmi all -v
```

### Clean Up Docker
```bash
# Remove unused containers, networks, images
docker system prune -a

# Remove specific volumes
docker volume rm goalapp-mysql-data goalapp-kafka-data
```

## Environment Variables

Key environment variables that can be customized:

### Database
- `MYSQL_ROOT_PASSWORD`: MySQL root password (default: root)
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password

### Kafka
- `KAFKA_BOOTSTRAP_SERVERS`: Kafka bootstrap servers
- `KAFKA_AUTO_CREATE_TOPICS_ENABLE`: Auto-create topics (default: true)

### Application
- `SPRING_PROFILES_ACTIVE`: Spring profile (default: docker)
- `JAVA_OPTS`: JVM options for Spring Boot services

## Performance Tuning

### Production Optimizations

1. **Use production compose file** with resource limits
2. **Enable JVM optimizations** (already configured in prod)
3. **Configure MySQL** for production workloads
4. **Set up log rotation** (configured in prod)

### Resource Allocation

Recommended minimum resources:
- **Total RAM**: 4GB
- **CPU**: 2 cores
- **Disk**: 10GB free space

## Security Considerations

1. **Change default passwords** in production
2. **Use environment files** for sensitive data
3. **Enable SSL/TLS** for external access
4. **Configure firewall rules** appropriately
5. **Regular security updates** for base images

## Backup and Recovery

### Database Backup
```bash
# Backup all databases
docker-compose exec mysql mysqldump -u root -proot --all-databases > backup.sql

# Restore from backup
docker-compose exec -T mysql mysql -u root -proot < backup.sql
```

### Volume Backup
```bash
# Backup volumes
docker run --rm -v goalapp-mysql-data:/data -v $(pwd):/backup alpine tar czf /backup/mysql-backup.tar.gz -C /data .
```

## Support

For issues and questions:
1. Check the logs using `docker-compose logs`
2. Verify service health using health check endpoints
3. Ensure all prerequisites are met
4. Check port availability and resource usage
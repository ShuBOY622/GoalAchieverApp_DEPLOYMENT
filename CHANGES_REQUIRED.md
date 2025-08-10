# Required Changes for EC2 Deployment

## Summary of Changes Made

I've created several files to help you deploy your Goal App to EC2. Here's what you need to do:

## 1. Files Created

- `EC2_DEPLOYMENT_GUIDE.md` - Complete step-by-step deployment guide
- `docker-compose.ec2.yml` - EC2-specific Docker Compose configuration
- `.env.ec2.example` - Environment variables template for EC2
- `nginx.conf` - Nginx reverse proxy configuration
- `deploy-ec2.sh` - Automated deployment script
- `update-frontend-config.sh` - Script to update frontend API URLs
- `goalapp.service` - Systemd service file for auto-start
- `CHANGES_REQUIRED.md` - This file

## 2. Key Changes Required

### A. Environment Configuration
1. **Copy and configure environment file:**
   ```bash
   cp .env.ec2.example .env.ec2
   ```

2. **Update `.env.ec2` with your values:**
   - Replace `YOUR_EC2_PUBLIC_IP` with your actual EC2 public IP
   - Set secure passwords for `MYSQL_ROOT_PASSWORD` and `MYSQL_PASSWORD`
   - Adjust memory settings based on your EC2 instance size

### B. Frontend API URL
The frontend needs to know where to find your API. You have two options:

**Option 1: Use the update script (Recommended)**
```bash
./update-frontend-config.sh
```

**Option 2: Manual update**
- Update `REACT_APP_API_URL` in `.env.ec2` to point to your EC2 instance
- Example: `REACT_APP_API_URL=http://YOUR_EC2_PUBLIC_IP:8080`

### C. Database Configuration
Your current setup uses username `D3_87069_Shubham`. For EC2 deployment, I've changed this to:
- Username: `goalapp_user` (configurable via `MYSQL_USER`)
- Password: Set via `MYSQL_PASSWORD` environment variable

### D. Security Group Configuration
Ensure your EC2 security group allows:
- Port 22 (SSH)
- Port 80 (HTTP)
- Port 443 (HTTPS) - if using SSL
- Port 3000 (Frontend)
- Port 8080 (API Gateway)
- Ports 8081-8085 (Microservices) - optional, for direct access

## 3. Deployment Process

### Quick Deployment (Recommended)
```bash
# 1. Configure frontend API URL
./update-frontend-config.sh

# 2. Edit .env.ec2 with your passwords and settings
nano .env.ec2

# 3. Deploy
./deploy-ec2.sh
```

### Manual Deployment
```bash
# 1. Load environment variables
export $(cat .env.ec2 | grep -v '^#' | xargs)

# 2. Build and start services
docker-compose -f docker-compose.yml -f docker-compose.ec2.yml up -d

# 3. Check status
docker-compose ps
```

## 4. Post-Deployment Steps

### A. Set Up Nginx Reverse Proxy (Optional but Recommended)
```bash
# Install Nginx
sudo apt install -y nginx

# Copy configuration
sudo cp nginx.conf /etc/nginx/sites-available/goalapp
sudo ln -s /etc/nginx/sites-available/goalapp /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
```

### B. Set Up Auto-Start Service
```bash
# Copy service file
sudo cp goalapp.service /etc/systemd/system/

# Enable and start service
sudo systemctl enable goalapp.service
sudo systemctl start goalapp.service
```

### C. Set Up SSL Certificate (If using domain)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com
```

## 5. Verification

After deployment, verify your application:

1. **Frontend**: `http://YOUR_EC2_IP:3000`
2. **API Gateway**: `http://YOUR_EC2_IP:8080`
3. **Health Check**: `http://YOUR_EC2_IP:8080/actuator/health`

## 6. Troubleshooting

### Common Issues:

1. **Out of Memory**: Increase EC2 instance size or adjust Java heap settings
2. **Port Conflicts**: Check if ports are in use with `sudo netstat -tulpn`
3. **Database Connection**: Verify MySQL container is running and credentials are correct
4. **Frontend API Calls**: Ensure `REACT_APP_API_URL` points to correct endpoint

### Useful Commands:
```bash
# View logs
docker-compose logs -f [service-name]

# Check container status
docker-compose ps

# Restart specific service
docker-compose restart [service-name]

# Stop all services
docker-compose down

# Clean up resources
docker system prune -a
```

## 7. Production Considerations

1. **Security**: Use strong passwords, enable firewall, keep system updated
2. **Monitoring**: Set up CloudWatch or other monitoring solutions
3. **Backups**: Implement regular database and application backups
4. **SSL**: Use HTTPS in production with proper SSL certificates
5. **Domain**: Use a proper domain name instead of IP address
6. **Load Balancing**: Consider AWS Application Load Balancer for high availability
7. **Auto Scaling**: Set up auto-scaling groups for production workloads

## 8. Cost Optimization

1. **Instance Size**: Start with t3.medium and scale up as needed
2. **Reserved Instances**: Use Reserved Instances for long-term deployments
3. **Storage**: Use GP3 instead of GP2 for better cost/performance
4. **Monitoring**: Use AWS Cost Explorer to track expenses

## Need Help?

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables: `cat .env.ec2`
3. Check system resources: `htop`, `df -h`, `free -h`
4. Review the complete deployment guide: `EC2_DEPLOYMENT_GUIDE.md`
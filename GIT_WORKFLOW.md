# Git Workflow for Goal App Deployment

This guide explains how to safely push your Goal App to Git and deploy it on EC2.

## 🔒 What's Protected by .gitignore

The `.gitignore` file ensures these sensitive/unnecessary files are NOT committed:

### ✅ Protected (Not Committed)
- `.env.ec2` - Your actual environment configuration with passwords
- `.env`, `.env.local`, `.env.prod` - All environment files with secrets
- `node_modules/` - Node.js dependencies
- `target/` - Java build artifacts
- `*.log` - Log files
- `.DS_Store` - macOS system files
- Database files and volumes
- SSL certificates and keys
- AWS credentials

### ✅ Included (Safe to Commit)
- `.env.ec2.example` - Template without sensitive data
- `docker-compose.yml` - Docker configuration
- `Dockerfile` - Container definitions
- `*.md` - Documentation files
- `*.sh` - Deployment scripts
- `nginx.conf` - Web server configuration
- Source code files
- `init-db.sql` - Database schema (no sensitive data)

## 🚀 Step-by-Step Git Workflow

### 1. Initialize Git Repository (if not already done)
```bash
# Navigate to your project directory
cd /Users/shuboy62/Documents/SpringProjects/GoalApp_backup

# Initialize git (if not already a repo)
git init

# Add all files (gitignore will protect sensitive ones)
git add .

# Make initial commit
git commit -m "Initial commit: Goal App with EC2 deployment configuration"
```

### 2. Create Remote Repository
Create a new repository on GitHub, GitLab, or your preferred Git hosting service.

### 3. Connect to Remote Repository
```bash
# Add remote origin (replace with your repository URL)
git remote add origin https://github.com/yourusername/goalapp.git

# Or if using SSH
git remote add origin git@github.com:yourusername/goalapp.git

# Push to remote
git push -u origin main
```

### 4. Verify What's Being Committed
Before pushing, always check what files are being committed:

```bash
# Check status
git status

# See what files are tracked
git ls-files

# Verify sensitive files are ignored
git status --ignored
```

## 🖥️ EC2 Deployment Process

### 1. Connect to Your EC2 Instance
```bash
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

### 2. Install Prerequisites on EC2
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Git
sudo apt install -y git

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for Docker group changes
exit
```

### 3. Clone Repository on EC2
```bash
# After reconnecting to EC2
git clone https://github.com/yourusername/goalapp.git
cd goalapp
```

### 4. Configure Environment on EC2
```bash
# Copy example environment file
cp .env.ec2.example .env.ec2

# Edit with your EC2-specific configuration
nano .env.ec2
```

Update `.env.ec2` with:
```env
# Replace with your EC2 public IP
REACT_APP_API_URL=http://YOUR_EC2_PUBLIC_IP:8080

# Set secure passwords
MYSQL_ROOT_PASSWORD=your_very_secure_root_password
MYSQL_PASSWORD=your_secure_database_password

# Other configurations...
```

### 5. Deploy Application
```bash
# Make scripts executable
chmod +x *.sh

# Run deployment script
./deploy-ec2.sh
```

## 🔄 Update Workflow

When you make changes to your application:

### 1. Local Development
```bash
# Make your changes
# Test locally
docker-compose up -d

# Commit changes
git add .
git commit -m "Description of changes"
git push origin main
```

### 2. Update on EC2
```bash
# SSH to EC2
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip

# Navigate to project directory
cd goalapp

# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose -f docker-compose.yml -f docker-compose.ec2.yml down
docker-compose -f docker-compose.yml -f docker-compose.ec2.yml up -d --build
```

## 🛡️ Security Best Practices

### 1. Never Commit Sensitive Data
- Always check `git status` before committing
- Use `git diff --cached` to review changes before commit
- Keep `.env.ec2` file only on EC2 server

### 2. Use Environment Variables
```bash
# Good: Using environment variables
MYSQL_PASSWORD=${MYSQL_PASSWORD}

# Bad: Hardcoded passwords
MYSQL_PASSWORD=mypassword123
```

### 3. Separate Environments
- Use different `.env` files for different environments
- Keep production secrets separate from development

## 🔍 Verification Commands

### Check What's Ignored
```bash
# See ignored files
git status --ignored

# Check if sensitive files are protected
git check-ignore .env.ec2
# Should return: .env.ec2 (meaning it's ignored)
```

### Verify Repository Contents
```bash
# List all tracked files
git ls-tree -r --name-only HEAD

# Check for sensitive data
git log --all --full-history -- .env.ec2
# Should show no results if properly ignored
```

## 🚨 Emergency: If You Accidentally Commit Secrets

If you accidentally commit sensitive data:

### 1. Remove from Latest Commit
```bash
# If you just committed and haven't pushed
git reset --soft HEAD~1
git reset HEAD .env.ec2
git commit -m "Your commit message"
```

### 2. Remove from History (if already pushed)
```bash
# Remove file from all history (DANGEROUS - rewrites history)
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env.ec2' --prune-empty --tag-name-filter cat -- --all

# Force push (only if you're sure)
git push origin --force --all
```

### 3. Change All Exposed Secrets
- Change all passwords that were exposed
- Rotate API keys
- Update database credentials

## 📋 Pre-Deployment Checklist

Before deploying to EC2:

- [ ] `.gitignore` file is in place
- [ ] No sensitive data in repository (`git status --ignored`)
- [ ] `.env.ec2.example` is updated with correct template
- [ ] All scripts are executable (`chmod +x *.sh`)
- [ ] Documentation is up to date
- [ ] Local testing completed
- [ ] EC2 security group configured
- [ ] Domain/DNS configured (if applicable)

## 🔧 Troubleshooting Git Issues

### Large Files
If you have large files:
```bash
# Check repository size
du -sh .git

# Use Git LFS for large files
git lfs track "*.jar"
git add .gitattributes
```

### Permission Issues
```bash
# Fix script permissions
find . -name "*.sh" -exec chmod +x {} \;
```

### Merge Conflicts
```bash
# Pull latest changes
git pull origin main

# Resolve conflicts manually, then:
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

This workflow ensures your sensitive data stays secure while making deployment straightforward and repeatable.
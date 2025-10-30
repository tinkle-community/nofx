# 🐳 Docker One-Click Deployment Guide

This guide will help you quickly deploy the NOFX AI Trading Competition System using Docker.

## 📋 Prerequisites

Before you begin, ensure your system has:

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher

### Installing Docker

#### macOS / Windows
Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

#### Linux (Ubuntu/Debian)

> #### Docker Compose Version Notes
>
> **New User Recommendation:**
> - **Use Docker Desktop**: Automatically includes latest Docker Compose, no separate installation needed
> - Simple installation, one-click setup, provides GUI management
> - Supports macOS, Windows, and some Linux distributions
>
> **Upgrading User Note:**
> - **Deprecating standalone docker-compose**: No longer recommended to download the independent Docker Compose binary
> - **Use built-in version**: Docker 20.10+ includes `docker compose` command (with space)
> - If still using old `docker-compose`, please upgrade to new syntax

*Recommended: Use Docker Desktop (if available) or Docker CE with built-in Compose*

```bash
# Install Docker (includes compose)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation (new command)
docker --version
docker compose --version  # Docker 24+ includes this, no separate installation needed
```

## 🚀 Quick Start (3 Steps)

### Step 1: Prepare Configuration File

```bash
# Copy configuration template
cp config.json.example config.json

# Edit configuration file with your API keys
nano config.json  # or use any other editor
```

**Required fields:**
```json
{
  "traders": [
    {
      "id": "my_trader",
      "name": "My AI Trader",
      "ai_model": "deepseek",
      "binance_api_key": "YOUR_BINANCE_API_KEY",       // ← Your Binance API Key
      "binance_secret_key": "YOUR_BINANCE_SECRET_KEY", // ← Your Binance Secret Key
      "deepseek_key": "YOUR_DEEPSEEK_API_KEY",         // ← Your DeepSeek API Key
      "initial_balance": 1000.0,
      "scan_interval_minutes": 3
    }
  ],
  "use_default_coins": true,
  "api_server_port": 8080
}
```

### Step 2: One-Click Start

```bash
# Build and start all services (first run)
docker compose up -d --build

# Subsequent starts (without rebuilding)
docker compose up -d
```

**Startup options:**
- `--build`: Build Docker images (use on first run or after code updates)
- `-d`: Run in detached mode (background)

### Step 3: Access the System

Once deployed, open your browser and visit:

- **Web Interface**: http://localhost:3000
- **API Health Check**: http://localhost:8080/health

## 📊 Service Management

### View Running Status
```bash
# View all container status
docker compose ps

# View service health status
docker compose ps --format json | jq
```

### View Logs
```bash
# View all service logs
docker compose logs -f

# View backend logs only
docker compose logs -f backend

# View frontend logs only
docker compose logs -f frontend

# View last 100 lines
docker compose logs --tail=100
```

### Stop Services
```bash
# Stop all services (keep data)
docker compose stop

# Stop and remove containers (keep data)
docker compose down

# Stop and remove containers and volumes (clear all data)
docker compose down -v
```

### Restart Services
```bash
# Restart all services
docker compose restart

# Restart backend only
docker compose restart backend

# Restart frontend only
docker compose restart frontend
```

### Update Services
```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose up -d --build
```

## 🔧 Advanced Configuration

### Change Ports

Edit `docker-compose.yml` to modify port mappings:

```yaml
services:
  backend:
    ports:
      - "8080:8080"  # Change to "your_port:8080"

  frontend:
    ports:
      - "3000:80"    # Change to "your_port:80"
```

### Resource Limits

Add resource limits in `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Environment Variables

Create `.env` file to manage environment variables:

```bash
# .env
TZ=Asia/Shanghai
BACKEND_PORT=8080
FRONTEND_PORT=3000
```

Then use in `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "${BACKEND_PORT}:8080"
```

## 📁 Data Persistence

The system automatically persists data to local directories:

- `./decision_logs/`: AI decision logs
- `./coin_pool_cache/`: Coin pool cache
- `./config.json`: Configuration file (mounted)

**Data locations:**
```bash
# View data directories
ls -la decision_logs/
ls -la coin_pool_cache/

# Backup data
tar -czf backup_$(date +%Y%m%d).tar.gz decision_logs/ coin_pool_cache/ config.json

# Restore data
tar -xzf backup_20241029.tar.gz
```

## 🐛 Troubleshooting

### Container Won't Start

```bash
# View detailed error messages
docker compose logs backend
docker compose logs frontend

# Check container status
docker compose ps -a

# Rebuild (clear cache)
docker compose build --no-cache
```

### Port Already in Use

```bash
# Find process using the port
lsof -i :8080  # backend port
lsof -i :3000  # frontend port

# Kill the process
kill -9 <PID>
```

### Configuration File Not Found

```bash
# Ensure config.json exists
ls -la config.json

# If not exists, copy template
cp config.json.example config.json
```

### Health Check Failing

```bash
# Check health status
docker inspect nofx-backend | jq '.[0].State.Health'
docker inspect nofx-frontend | jq '.[0].State.Health'

# Manually test health endpoints
curl http://localhost:8080/health
curl http://localhost:3000/health
```

### Frontend Can't Connect to Backend

```bash
# Check network connectivity
docker compose exec frontend ping backend

# Check if backend service is running
docker compose exec frontend wget -O- http://backend:8080/health
```

### Clean Docker Resources

```bash
# Clean unused images
docker image prune -a

# Clean unused volumes
docker volume prune

# Clean all unused resources (use with caution)
docker system prune -a --volumes
```

## 🔐 Security Recommendations

1. **Don't commit config.json to Git**
   ```bash
   # Ensure config.json is in .gitignore
   echo "config.json" >> .gitignore
   ```

2. **Use environment variables for sensitive data**
   ```yaml
   # docker-compose.yml
   services:
     backend:
       environment:
         - BINANCE_API_KEY=${BINANCE_API_KEY}
         - BINANCE_SECRET_KEY=${BINANCE_SECRET_KEY}
   ```

3. **Restrict API access**
   ```yaml
   # Only allow local access
   services:
     backend:
       ports:
         - "127.0.0.1:8080:8080"
   ```

4. **Regularly update images**
   ```bash
   docker compose pull
   docker compose up -d
   ```

## 🌐 Production Deployment

### Using Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/nofx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Configure HTTPS (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Using Docker Swarm (Cluster Deployment)

```bash
# Initialize Swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml nofx

# View service status
docker stack services nofx

# Scale services
docker service scale nofx_backend=3
```

## 📈 Monitoring & Logging

### Log Management

```bash
# Configure log rotation (already configured in docker-compose.yml)
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"

# View log statistics
docker compose logs --timestamps | wc -l
```

### Monitoring Tool Integration

Integrate Prometheus + Grafana for monitoring:

```yaml
# docker-compose.yml (add monitoring services)
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
```

## 🆘 Get Help

- **GitHub Issues**: [Submit an issue](https://github.com/yourusername/open-nofx/issues)
- **Documentation**: Check [README.md](README.md)
- **Community**: Join our Discord/Telegram group

## 📝 Command Cheat Sheet

```bash
# Start
docker compose up -d --build       # Build and start
docker compose up -d               # Start (without rebuilding)

# Stop
docker compose stop                # Stop services
docker compose down                # Stop and remove containers
docker compose down -v             # Stop and remove containers and data

# View
docker compose ps                  # View status
docker compose logs -f             # View logs
docker compose top                 # View processes

# Restart
docker compose restart             # Restart all services
docker compose restart backend     # Restart backend

# Update
git pull && docker compose up -d --build

# Clean
docker compose down -v             # Clear all data
docker system prune -a             # Clean Docker resources
```

---

🎉 Congratulations! You've successfully deployed the NOFX AI Trading Competition System!

If you encounter any issues, please check the [Troubleshooting](#-troubleshooting) section or submit an issue.

# NoFX Trading Bot - PM2 Deployment Guide

Complete guide for local development and production deployment using PM2.

## 🚀 Quick Start

### 1. Install PM2

```bash
npm install -g pm2
```

### 2. One-Command Launch

```bash
./pm2.sh start
```

That's it! Frontend and backend will start automatically.

---

## 📋 All Commands

### Service Management

```bash
# Start services
./pm2.sh start

# Stop services
./pm2.sh stop

# Restart services
./pm2.sh restart

# View status
./pm2.sh status

# Delete services
./pm2.sh delete
```

### Log Viewing

```bash
# View all logs (live)
./pm2.sh logs

# Backend logs only
./pm2.sh logs backend

# Frontend logs only
./pm2.sh logs frontend
```

### Build & Compile

```bash
# Compile backend
./pm2.sh build

# Recompile backend and restart
./pm2.sh rebuild
```

### Monitoring

```bash
# Open PM2 monitoring dashboard (real-time CPU/Memory)
./pm2.sh monitor
```

---

## 📊 Access URLs

After successful startup:

- **Frontend Web Interface**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/api/health

---

## 🔧 Configuration Files

### pm2.config.js

PM2 configuration file, defines frontend and backend startup parameters:

```javascript
const path = require('path');

module.exports = {
  apps: [
    {
      name: 'nofx-backend',
      script: './nofx',           // Go binary
      cwd: __dirname,             // Dynamically get current directory
      autorestart: true,
      max_memory_restart: '500M'
    },
    {
      name: 'nofx-frontend',
      script: 'npm',
      args: 'run dev',            // Vite dev server
      cwd: path.join(__dirname, 'web'), // Dynamically join path
      autorestart: true,
      max_memory_restart: '300M'
    }
  ]
};
```

**After modifying configuration, restart is required:**
```bash
./pm2.sh restart
```

---

## 📝 Log File Locations

- **Backend Logs**: `./logs/backend-error.log` and `./logs/backend-out.log`
- **Frontend Logs**: `./web/logs/frontend-error.log` and `./web/logs/frontend-out.log`

---

## 🔄 Startup on Boot

Set PM2 to start on boot:

```bash
# 1. Start services
./pm2.sh start

# 2. Save current process list
pm2 save

# 3. Generate startup script
pm2 startup

# 4. Follow the instructions to execute command (requires sudo)
```

**Disable startup on boot:**
```bash
pm2 unstartup
```

---

## 🛠️ Common Operations

### Restart After Code Changes

**Backend changes:**
```bash
./pm2.sh rebuild  # Auto compile and restart
```

**Frontend changes:**
```bash
./pm2.sh restart  # Vite will auto hot-reload, no restart needed
```

### View Real-time Resource Usage

```bash
./pm2.sh monitor
```

### View Detailed Information

```bash
pm2 info nofx-backend   # Backend details
pm2 info nofx-frontend  # Frontend details
```

### Clear Logs

```bash
pm2 flush
```

---

## 🐛 Troubleshooting

### Service Startup Failed

```bash
# 1. View detailed errors
./pm2.sh logs

# 2. Check port usage
lsof -i :8080  # Backend port
lsof -i :3000  # Frontend port

# 3. Manual compile test
go build -o nofx
./nofx
```

### Backend Won't Start

```bash
# ~~Check if config.json exists~~
# ~~ls -l config.json~~

# Check if database file exists
ls -l trading.db

# Check permissions
chmod +x nofx

# Run manually to see errors
./nofx
```

### Frontend Not Accessible

```bash
# Check node_modules
cd web && npm install

# Manual start test
npm run dev
```

---

## 🎯 Production Environment Recommendations

### 1. Use Production Mode

Modify `pm2.config.js`:

```javascript
{
  name: 'nofx-frontend',
  script: 'npm',
  args: 'run preview',  // Change to preview (requires npm run build first)
  env: {
    NODE_ENV: 'production'
  }
}
```

### 2. Increase Instances (Load Balancing)

```javascript
{
  name: 'nofx-backend',
  script: './nofx',
  instances: 2,  // Start 2 instances
  exec_mode: 'cluster'
}
```

### 3. Auto Restart Strategy

```javascript
{
  autorestart: true,
  max_restarts: 10,
  min_uptime: '10s',
  max_memory_restart: '500M'
}
```

---

## 📦 Comparison with Docker Deployment

| Feature | PM2 Deployment | Docker Deployment |
|---------|---------------|-------------------|
| Startup Speed | ⚡ Fast | 🐌 Slower |
| Resource Usage | 💚 Low | 🟡 Medium |
| Isolation | 🟡 Medium | 💚 High |
| Use Case | Dev/Single-machine | Production/Cluster |
| Configuration Complexity | 💚 Simple | 🟡 Medium |

**Recommendations:**
- **Development Environment**: Use `./pm2.sh`
- **Production Environment**: Use `./start.sh` (Docker)

---

## 🆘 Getting Help

```bash
./pm2.sh help
```

Or check PM2 official documentation: https://pm2.keymetrics.io/

---

## 📄 License

MIT

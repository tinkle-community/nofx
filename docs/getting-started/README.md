# 🚀 Getting Started with NOFX

**Language:** [English](README.md) | [中文](README.zh-CN.md)

This section contains all the documentation you need to get NOFX up and running.

## 📋 Deployment Options

Choose the method that best fits your needs:

### 🐳 Docker Deployment (Recommended)

**Best for:** Beginners, quick setup, production deployments

- **English:** [docker-deploy.en.md](docker-deploy.en.md)
- **中文:** [docker-deploy.zh-CN.md](docker-deploy.zh-CN.md)

**Pros:**
- ✅ One-command setup
- ✅ All dependencies included
- ✅ Easy to update and manage
- ✅ Isolated environment

**Quick Start:**
```bash
cp config.example.jsonc config.json
./start.sh start --build
```

---

### 🔧 PM2 Deployment

**Best for:** Advanced users, development, custom setups

- **English:** [pm2-deploy.en.md](pm2-deploy.en.md)
- **中文:** [pm2-deploy.md](pm2-deploy.md)

**Pros:**
- ✅ Direct process control
- ✅ Better for development
- ✅ Lower resource usage
- ✅ More flexible

**Quick Start:**
```bash
go build -o nofx
cd web && npm install && npm run build
pm2 start ecosystem.config.js
```

---

## 🤖 AI Configuration

### Custom AI Providers

- **English:** [custom-api.en.md](custom-api.en.md)
- **中文:** [custom-api.md](custom-api.md)

Use custom AI models or third-party OpenAI-compatible APIs:
- Custom DeepSeek endpoints
- Self-hosted models
- Other LLM providers

---

## 🔑 Prerequisites

Before starting, ensure you have:

### For Docker Method:
- ✅ Docker 20.10+
- ✅ Docker Compose V2

### For Manual Method:
- ✅ Go 1.21+
- ✅ Node.js 18+
- ✅ TA-Lib library
- ✅ PM2 (optional)

---

## 📚 Next Steps

After deployment:

1. **Configure AI Models** → Web interface at http://localhost:3000
2. **Set Up Exchange** → Add Binance/Hyperliquid credentials
3. **Create Traders** → Combine AI models with exchanges
4. **Start Trading** → Monitor performance in dashboard

---

## ⚠️ Important Notes

**Before Trading:**
- ⚠️ Test on testnet first
- ⚠️ Start with small amounts
- ⚠️ Understand the risks
- ⚠️ Read [Security Policy](../../SECURITY.md)

**API Keys:**
- 🔑 Never commit API keys to git
- 🔑 Use environment variables
- 🔑 Restrict IP access
- 🔑 Enable 2FA on exchanges

---

## 🆘 Troubleshooting

**Common Issues:**

1. **Docker build fails** → Check Docker version, update to 20.10+
2. **TA-Lib not found** → `brew install ta-lib` (macOS) or `apt-get install libta-lib0-dev` (Ubuntu)
3. **Port 8080 in use** → Change `API_PORT` in .env file
4. **Frontend won't connect** → Check backend is running on port 8080

**Need more help?**
- 📖 [FAQ](../guides/faq.zh-CN.md)
- 💬 [Telegram Community](https://t.me/nofx_dev_community)
- 🐛 [GitHub Issues](https://github.com/tinkle-community/nofx/issues)

---

[← Back to Documentation Home](../README.md)

# Bug修复报告：config.db 数据库初始化失败

## 问题发现时间
**2025年11月2日 00:14 (UTC+8)**

## 问题描述

### 错误现象
Docker容器 `nofx-trading` 启动后不断重启，后端服务无法正常运行。

### 错误日志
```
2025/11/02 00:14:18 ❌ 初始化数据库失败: 创建表失败: 执行SQL失败 [CREATE TABLE IF NOT EXISTS ai_models (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    enabled BOOLEAN DEFAULT 0,
    api_key TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)]: unable to open database file: is a directory
```

### 根本原因

在Docker Compose首次启动时，如果本地没有 `config.db` 文件，docker-compose.yml 中的卷挂载配置：

```yaml
volumes:
  - ./config.db:/app/config.db
```

会**自动创建一个同名目录**而不是文件！这导致SQLite无法正常打开数据库文件。

## 解决方案

### 临时修复步骤（手动）

1. 停止所有Docker容器
```bash
docker-compose down
```

2. 删除错误创建的 `config.db` 目录
```bash
rm -rf config.db
```

3. 创建空的 `config.db` 文件
```bash
touch config.db
```

4. 重新启动容器
```bash
docker-compose up -d
```

### 长期解决方案（建议）

#### 方案1：修改 docker-compose.yml（推荐）

在启动容器前，使用 `entrypoint` 或 `command` 确保文件存在：

```yaml
services:
  nofx:
    # ... 其他配置
    entrypoint: ["/bin/sh", "-c"]
    command:
      - |
        if [ ! -f /app/config.db ]; then
          touch /app/config.db
        fi
        ./nofx
```

#### 方案2：添加初始化脚本

创建 `docker/init-db.sh`：

```bash
#!/bin/sh
if [ ! -f /app/config.db ]; then
    echo "Creating config.db file..."
    touch /app/config.db
fi

exec "$@"
```

修改 Dockerfile：
```dockerfile
COPY docker/init-db.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/init-db.sh
ENTRYPOINT ["init-db.sh"]
CMD ["./nofx"]
```

#### 方案3：文档说明

在 `DOCKER_DEPLOY.md` 中添加预启动步骤：

```markdown
## 启动前准备

在首次运行 docker-compose 之前，请执行：

\`\`\`bash
touch config.db
\`\`\`

这将创建空的数据库文件，防止 Docker 自动创建同名目录。
```

## 修复验证

### 修复后的日志
```
2025/11/02 00:22:06 📋 初始化配置数据库: config.db
2025/11/02 00:22:06 ✓ 配置数据库初始化成功
2025/11/02 00:22:06 🌐 API服务器启动在 http://localhost:8080
```

### 容器状态
```bash
$ docker-compose ps
NAME            STATUS
nofx-trading    Up (healthy)
nofx-frontend   Up (healthy)
```

## 影响范围

### 受影响的版本
- dev 分支（2025-11-01之后的版本）
- 所有使用新数据库架构的版本

### 受影响的用户
- 首次通过 Docker Compose 部署的用户
- 删除过 `config.db` 后重新启动的用户

### 不受影响的场景
- 使用 PM2 直接运行的部署
- 已经成功启动过一次的 Docker 部署（config.db 文件已存在）

## 相关文件

- `docker-compose.yml` - 卷挂载配置
- `config/database.go` - 数据库初始化逻辑
- `main.go` - 应用启动入口

## 建议改进

1. ✅ **立即**: 在文档中添加预启动步骤说明
2. ⚠️ **短期**: 修改 Dockerfile 添加自动初始化脚本
3. 💡 **长期**: 考虑使用 Docker 命名卷（named volume）代替绑定挂载

## 测试清单

- [x] Docker Compose 首次启动
- [x] 删除 config.db 后重新启动
- [x] 数据库表自动创建
- [x] API 服务正常响应
- [x] Web 界面可访问

## 提交信息

```
fix: Docker启动时config.db被创建为目录导致数据库初始化失败

问题描述：
- Docker Compose 首次启动时，卷挂载会将不存在的 config.db 创建为目录
- 导致 SQLite 无法打开数据库文件，容器不断重启
- 错误信息："unable to open database file: is a directory"

解决方案：
- 手动删除 config.db 目录并创建空文件
- 建议在文档中添加预启动步骤说明

发现时间：2025-11-02 00:14 (UTC+8)
修复时间：2025-11-02 00:22 (UTC+8)

影响范围：所有使用 Docker Compose 首次部署的用户
```

## 备注

此问题是 Docker Compose 的已知行为：当绑定挂载的源文件不存在时，会自动创建同名**目录**。

参考：https://docs.docker.com/storage/bind-mounts/#differences-between--v-and---mount-behavior

#!/bin/bash

<<<<<<< HEAD
# NOFX AI Trading System - Docker Quick Start Script
# 使用方法: ./start.sh [command]

set -e

# 颜色定义
=======
# ═══════════════════════════════════════════════════════════════
# NOFX AI Trading System - Docker Quick Start Script
# Usage: ./start.sh [command]
# ═══════════════════════════════════════════════════════════════

set -e

# ------------------------------------------------------------------------
# Color Definitions
# ------------------------------------------------------------------------
>>>>>>> upstream/main
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

<<<<<<< HEAD
# 打印带颜色的消息
=======
# ------------------------------------------------------------------------
# Utility Functions: Colored Output
# ------------------------------------------------------------------------
>>>>>>> upstream/main
print_info() {
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

<<<<<<< HEAD
# 检查 Docker 是否安装
=======
# ------------------------------------------------------------------------
# Detection: Docker Compose Command (Backward Compatible)
# ------------------------------------------------------------------------
detect_compose_cmd() {
    if command -v docker compose &> /dev/null; then
        COMPOSE_CMD="docker compose"
    elif command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        print_error "Docker Compose 未安装！请先安装 Docker Compose"
        exit 1
    fi
    print_info "使用 Docker Compose 命令: $COMPOSE_CMD"
}

# ------------------------------------------------------------------------
# Validation: Docker Installation
# ------------------------------------------------------------------------
>>>>>>> upstream/main
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装！请先安装 Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi

<<<<<<< HEAD
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose 未安装！请先安装 Docker Compose"
        exit 1
    fi

    print_success "Docker 和 Docker Compose 已安装"
}

# 检查配置文件
=======
    detect_compose_cmd
    print_success "Docker 和 Docker Compose 已安装"
}

# ------------------------------------------------------------------------
# Validation: Environment File (.env)
# ------------------------------------------------------------------------
check_env() {
    if [ ! -f ".env" ]; then
        print_warning ".env 不存在，从模板复制..."
        cp .env.example .env
        print_info "请编辑 .env 填入你的环境变量配置"
        print_info "运行: nano .env 或使用其他编辑器"
        exit 1
    fi
    print_success "环境变量文件存在"
}

# ------------------------------------------------------------------------
# Validation: Configuration File (config.json)
# ------------------------------------------------------------------------
>>>>>>> upstream/main
check_config() {
    if [ ! -f "config.json" ]; then
        print_warning "config.json 不存在，从模板复制..."
        cp config.json.example config.json
        print_info "请编辑 config.json 填入你的 API 密钥"
        print_info "运行: nano config.json 或使用其他编辑器"
        exit 1
    fi
    print_success "配置文件存在"
}

<<<<<<< HEAD
# 启动服务
start() {
    print_info "正在启动 NOFX AI Trading System..."

    if [ "$1" == "--build" ]; then
        print_info "重新构建镜像..."
        docker-compose up -d --build
    else
        docker-compose up -d
=======
# ------------------------------------------------------------------------
# Build: Frontend (Node.js Based)
# ------------------------------------------------------------------------
# build_frontend() {
#     print_info "检查前端构建环境..."

#     if ! command -v node &> /dev/null; then
#         print_error "Node.js 未安装！请先安装 Node.js"
#         exit 1
#     fi

#     if ! command -v npm &> /dev/null; then
#         print_error "npm 未安装！请先安装 npm"
#         exit 1
#     fi

#     print_info "正在构建前端..."
#     cd web

#     print_info "安装 Node.js 依赖..."
#     npm install

#     print_info "构建前端应用..."
#     npm run build

#     cd ..
#     print_success "前端构建完成"
# }

# ------------------------------------------------------------------------
# Service Management: Start
# ------------------------------------------------------------------------
start() {
    print_info "正在启动 NOFX AI Trading System..."

    # Auto-build frontend if missing or forced
    # if [ ! -d "web/dist" ] || [ "$1" == "--build" ]; then
    #     build_frontend
    # fi

    # Rebuild images if flag set
    if [ "$1" == "--build" ]; then
        print_info "重新构建镜像..."
        $COMPOSE_CMD up -d --build
    else
        print_info "启动容器..."
        $COMPOSE_CMD up -d
>>>>>>> upstream/main
    fi

    print_success "服务已启动！"
    print_info "Web 界面: http://localhost:3000"
    print_info "API 端点: http://localhost:8080"
    print_info ""
    print_info "查看日志: ./start.sh logs"
    print_info "停止服务: ./start.sh stop"
}

<<<<<<< HEAD
# 停止服务
stop() {
    print_info "正在停止服务..."
    docker-compose stop
    print_success "服务已停止"
}

# 重启服务
restart() {
    print_info "正在重启服务..."
    docker-compose restart
    print_success "服务已重启"
}

# 查看日志
logs() {
    if [ -z "$2" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$2"
    fi
}

# 查看状态
status() {
    print_info "服务状态:"
    docker-compose ps
=======
# ------------------------------------------------------------------------
# Service Management: Stop
# ------------------------------------------------------------------------
stop() {
    print_info "正在停止服务..."
    $COMPOSE_CMD stop
    print_success "服务已停止"
}

# ------------------------------------------------------------------------
# Service Management: Restart
# ------------------------------------------------------------------------
restart() {
    print_info "正在重启服务..."
    $COMPOSE_CMD restart
    print_success "服务已重启"
}

# ------------------------------------------------------------------------
# Monitoring: Logs
# ------------------------------------------------------------------------
logs() {
    if [ -z "$2" ]; then
        $COMPOSE_CMD logs -f
    else
        $COMPOSE_CMD logs -f "$2"
    fi
}

# ------------------------------------------------------------------------
# Monitoring: Status
# ------------------------------------------------------------------------
status() {
    print_info "服务状态:"
    $COMPOSE_CMD ps
>>>>>>> upstream/main
    echo ""
    print_info "健康检查:"
    curl -s http://localhost:8080/health | jq '.' || echo "后端未响应"
}

<<<<<<< HEAD
# 清理
=======
# ------------------------------------------------------------------------
# Maintenance: Clean (Destructive)
# ------------------------------------------------------------------------
>>>>>>> upstream/main
clean() {
    print_warning "这将删除所有容器和数据！"
    read -p "确认删除？(yes/no): " confirm
    if [ "$confirm" == "yes" ]; then
        print_info "正在清理..."
<<<<<<< HEAD
        docker-compose down -v
=======
        $COMPOSE_CMD down -v
>>>>>>> upstream/main
        print_success "清理完成"
    else
        print_info "已取消"
    fi
}

<<<<<<< HEAD
# 更新
update() {
    print_info "正在更新..."
    git pull
    docker-compose up -d --build
    print_success "更新完成"
}

# 显示帮助
=======
# ------------------------------------------------------------------------
# Maintenance: Update
# ------------------------------------------------------------------------
update() {
    print_info "正在更新..."
    git pull
    $COMPOSE_CMD up -d --build
    print_success "更新完成"
}

# ------------------------------------------------------------------------
# Help: Usage Information
# ------------------------------------------------------------------------
>>>>>>> upstream/main
show_help() {
    echo "NOFX AI Trading System - Docker 管理脚本"
    echo ""
    echo "用法: ./start.sh [command] [options]"
    echo ""
    echo "命令:"
    echo "  start [--build]    启动服务（可选：重新构建）"
    echo "  stop               停止服务"
    echo "  restart            重启服务"
    echo "  logs [service]     查看日志（可选：指定服务名 backend/frontend）"
    echo "  status             查看服务状态"
    echo "  clean              清理所有容器和数据"
    echo "  update             更新代码并重启"
    echo "  help               显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  ./start.sh start --build    # 构建并启动"
    echo "  ./start.sh logs backend     # 查看后端日志"
    echo "  ./start.sh status           # 查看状态"
}

<<<<<<< HEAD
# 主函数
=======
# ------------------------------------------------------------------------
# Main: Command Dispatcher
# ------------------------------------------------------------------------
>>>>>>> upstream/main
main() {
    check_docker

    case "${1:-start}" in
        start)
<<<<<<< HEAD
=======
            check_env
>>>>>>> upstream/main
            check_config
            start "$2"
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        logs)
            logs "$@"
            ;;
        status)
            status
            ;;
        clean)
            clean
            ;;
        update)
            update
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

<<<<<<< HEAD
# 运行主函数
main "$@"
=======
# Execute Main
main "$@"
>>>>>>> upstream/main

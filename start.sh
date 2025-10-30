#!/bin/bash

# NOFX AI Trading System - Docker Quick Start Script
# 使用方法: ./start.sh [command]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
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

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装！请先安装 Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose 未安装！请先安装 Docker Compose"
        exit 1
    fi

    print_success "Docker 和 Docker Compose 已安装"
}

# 检查配置文件
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

# 启动服务
start() {
    print_info "正在启动 NOFX AI Trading System..."

    if [ "$1" == "--build" ]; then
        print_info "重新构建镜像..."
        docker-compose up -d --build
    else
        docker-compose up -d
    fi

    print_success "服务已启动！"
    print_info "Web 界面: http://localhost:3000"
    print_info "API 端点: http://localhost:8080"
    print_info ""
    print_info "查看日志: ./start.sh logs"
    print_info "停止服务: ./start.sh stop"
}

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
    echo ""
    print_info "健康检查:"
    curl -s http://localhost:8080/health | jq '.' || echo "后端未响应"
}

# 清理
clean() {
    print_warning "这将删除所有容器和数据！"
    read -p "确认删除？(yes/no): " confirm
    if [ "$confirm" == "yes" ]; then
        print_info "正在清理..."
        docker-compose down -v
        print_success "清理完成"
    else
        print_info "已取消"
    fi
}

# 更新
update() {
    print_info "正在更新..."
    git pull
    docker-compose up -d --build
    print_success "更新完成"
}

# 显示帮助
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

# 主函数
main() {
    check_docker

    case "${1:-start}" in
        start)
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

# 运行主函数
main "$@"

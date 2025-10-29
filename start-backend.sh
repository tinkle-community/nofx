#!/bin/bash

# NOFX AI Trading System - 后端启动脚本
# 使用方法: ./start-backend.sh

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

# 检查Go环境
check_go() {
    if ! command -v go &> /dev/null; then
        print_error "Go 未安装！请先安装 Go: https://golang.org/dl/"
        exit 1
    fi
    print_success "Go 环境检查通过: $(go version)"
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

# 构建后端
build_backend() {
    print_info "正在构建后端服务..."
    
    # 下载依赖
    print_info "下载 Go 依赖..."
    go mod tidy
    
    # 构建
    print_info "编译后端服务..."
    go build -o nofx .
    
    if [ -f "nofx" ]; then
        print_success "后端服务构建成功"
    else
        print_error "后端服务构建失败"
        exit 1
    fi
}

# 启动后端
start_backend() {
    print_info "正在启动后端服务..."
    
    # 检查是否已经在运行
    if pgrep -f "^./nofx" > /dev/null; then
        print_warning "后端服务已在运行，PID: $(pgrep -f "^./nofx")"
        print_info "如需重启，请先运行: ./stop-backend.sh"
        return
    fi
    
    # 启动服务
    ./nofx &
    BACKEND_PID=$!
    
    # 等待启动
    print_info "等待服务启动..."
    sleep 3
    
    # 检查是否启动成功
    if curl -s http://localhost:8080/api/status > /dev/null 2>&1; then
        print_success "后端服务启动成功！"
        print_info "PID: $BACKEND_PID"
        print_info "API 端点: http://localhost:8080"
        print_info "状态检查: curl http://localhost:8080/api/status"
        echo $BACKEND_PID > .backend.pid
    else
        print_error "后端服务启动失败"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
}

# 停止后端
stop_backend() {
    print_info "正在停止后端服务..."
    
    if [ -f ".backend.pid" ]; then
        BACKEND_PID=$(cat .backend.pid)
        if kill $BACKEND_PID 2>/dev/null; then
            print_success "后端服务已停止 (PID: $BACKEND_PID)"
        else
            print_warning "无法停止进程 $BACKEND_PID，可能已经停止"
        fi
        rm -f .backend.pid
    else
        # 尝试通过进程名停止
        if pgrep -f "^./nofx" > /dev/null; then
            pkill -f "./nofx"
            print_success "后端服务已停止"
        else
            print_warning "后端服务未运行"
        fi
    fi
}

# 查看状态
status() {
    print_info "后端服务状态:"
    
    if [ -f ".backend.pid" ]; then
        BACKEND_PID=$(cat .backend.pid)
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            print_success "后端服务正在运行 (PID: $BACKEND_PID)"
        else
            print_warning "PID 文件存在但进程未运行"
            rm -f .backend.pid
        fi
    else
        if pgrep -f "^./nofx" > /dev/null; then
            print_success "后端服务正在运行 (PID: $(pgrep -f "^./nofx"))"
        else
            print_warning "后端服务未运行"
        fi
    fi
    
    # 健康检查
    print_info "健康检查:"
    if curl -s http://localhost:8080/api/status > /dev/null 2>&1; then
        print_success "API 响应正常"
        curl -s http://localhost:8080/api/status | jq '.' 2>/dev/null || curl -s http://localhost:8080/api/status
    else
        print_error "API 无响应"
    fi
}

# 显示帮助
show_help() {
    echo "NOFX AI Trading System - 后端管理脚本"
    echo ""
    echo "用法: ./start-backend.sh [command]"
    echo ""
    echo "命令:"
    echo "  start     启动后端服务"
    echo "  stop      停止后端服务"
    echo "  restart   重启后端服务"
    echo "  build     构建后端服务"
    echo "  status    查看服务状态"
    echo "  help      显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  ./start-backend.sh start    # 启动后端"
    echo "  ./start-backend.sh status   # 查看状态"
    echo "  ./start-backend.sh stop     # 停止后端"
}

# 主函数
main() {
    case "${1:-start}" in
        start)
            check_go
            check_config
            build_backend
            start_backend
            ;;
        stop)
            stop_backend
            ;;
        restart)
            stop_backend
            sleep 2
            check_go
            check_config
            build_backend
            start_backend
            ;;
        build)
            check_go
            build_backend
            ;;
        status)
            status
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
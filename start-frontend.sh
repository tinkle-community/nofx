#!/bin/bash

# NOFX AI Trading System - 前端启动脚本
# 使用方法: ./start-frontend.sh

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

# 检查Node.js环境
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装！请先安装 Node.js: https://nodejs.org/"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm 未安装！请先安装 npm"
        exit 1
    fi
    
    print_success "Node.js 环境检查通过: $(node --version)"
    print_success "npm 版本: $(npm --version)"
}

# 检查前端目录
check_frontend_dir() {
    if [ ! -d "web" ]; then
        print_error "前端目录 'web' 不存在！"
        exit 1
    fi
    
    if [ ! -f "web/package.json" ]; then
        print_error "package.json 不存在！"
        exit 1
    fi
    
    print_success "前端目录检查通过"
}

# 安装依赖
install_deps() {
    print_info "检查前端依赖..."
    
    if [ ! -d "web/node_modules" ]; then
        print_info "安装前端依赖..."
        cd web
        npm install
        cd ..
        print_success "依赖安装完成"
    else
        print_success "依赖已存在"
    fi
}

# 构建前端
build_frontend() {
    print_info "构建前端应用..."
    
    cd web
    
    # TypeScript 编译检查
    print_info "检查 TypeScript 编译..."
    if npx tsc --noEmit; then
        print_success "TypeScript 编译检查通过"
    else
        print_warning "TypeScript 编译有警告，但继续构建..."
    fi
    
    # 构建
    print_info "构建生产版本..."
    npm run build
    
    if [ -d "dist" ]; then
        print_success "前端构建成功"
    else
        print_error "前端构建失败"
        exit 1
    fi
    
    cd ..
}

# 启动开发服务器
start_dev() {
    print_info "启动前端开发服务器..."
    
    cd web
    
    # 检查是否已经在运行
    if pgrep -f "npm run dev" > /dev/null || pgrep -f "vite" > /dev/null; then
        print_warning "前端服务已在运行"
        print_info "如需重启，请先运行: ./stop-frontend.sh"
        return
    fi
    
    # 启动开发服务器
    npm run dev &
    FRONTEND_PID=$!
    
    # 等待启动
    print_info "等待服务启动..."
    sleep 5
    
    # 检查是否启动成功
    if curl -s http://localhost:3000 > /dev/null 2>&1 || curl -s http://localhost:5173 > /dev/null 2>&1; then
        print_success "前端服务启动成功！"
        print_info "PID: $FRONTEND_PID"
        
        # 检测端口
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            print_info "Web 界面: http://localhost:3000"
        elif curl -s http://localhost:5173 > /dev/null 2>&1; then
            print_info "Web 界面: http://localhost:5173"
        fi
        
        echo $FRONTEND_PID > .frontend.pid
    else
        print_error "前端服务启动失败"
        kill $FRONTEND_PID 2>/dev/null || true
        exit 1
    fi
    
    cd ..
}

# 启动生产服务器
start_prod() {
    print_info "启动前端生产服务器..."
    
    cd web
    
    # 检查是否已经构建
    if [ ! -d "dist" ]; then
        print_info "未找到构建文件，正在构建..."
        build_frontend
    fi
    
    # 启动预览服务器
    npm run preview &
    FRONTEND_PID=$!
    
    # 等待启动
    print_info "等待服务启动..."
    sleep 3
    
    # 检查是否启动成功
    if curl -s http://localhost:4173 > /dev/null 2>&1; then
        print_success "前端生产服务启动成功！"
        print_info "PID: $FRONTEND_PID"
        print_info "Web 界面: http://localhost:4173"
        echo $FRONTEND_PID > .frontend.pid
    else
        print_error "前端生产服务启动失败"
        kill $FRONTEND_PID 2>/dev/null || true
        exit 1
    fi
    
    cd ..
}

# 停止前端
stop_frontend() {
    print_info "正在停止前端服务..."
    
    if [ -f ".frontend.pid" ]; then
        FRONTEND_PID=$(cat .frontend.pid)
        if kill $FRONTEND_PID 2>/dev/null; then
            print_success "前端服务已停止 (PID: $FRONTEND_PID)"
        else
            print_warning "无法停止进程 $FRONTEND_PID，可能已经停止"
        fi
        rm -f .frontend.pid
    else
        # 尝试通过进程名停止
        if pgrep -f "npm run dev" > /dev/null || pgrep -f "vite" > /dev/null; then
            pkill -f "npm run dev" 2>/dev/null || true
            pkill -f "vite" 2>/dev/null || true
            print_success "前端服务已停止"
        else
            print_warning "前端服务未运行"
        fi
    fi
}

# 查看状态
status() {
    print_info "前端服务状态:"
    
    if [ -f ".frontend.pid" ]; then
        FRONTEND_PID=$(cat .frontend.pid)
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            print_success "前端服务正在运行 (PID: $FRONTEND_PID)"
        else
            print_warning "PID 文件存在但进程未运行"
            rm -f .frontend.pid
        fi
    else
        if pgrep -f "npm run dev" > /dev/null || pgrep -f "vite" > /dev/null; then
            print_success "前端服务正在运行 (PID: $(pgrep -f "npm run dev" || pgrep -f "vite"))"
        else
            print_warning "前端服务未运行"
        fi
    fi
    
    # 健康检查
    print_info "健康检查:"
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "开发服务器响应正常 (http://localhost:3000)"
    elif curl -s http://localhost:5173 > /dev/null 2>&1; then
        print_success "开发服务器响应正常 (http://localhost:5173)"
    elif curl -s http://localhost:4173 > /dev/null 2>&1; then
        print_success "生产服务器响应正常 (http://localhost:4173)"
    else
        print_error "前端服务无响应"
    fi
}

# 清理
clean() {
    print_info "清理前端构建文件..."
    cd web
    rm -rf dist node_modules package-lock.json
    cd ..
    rm -f .frontend.pid
    print_success "清理完成"
}

# 显示帮助
show_help() {
    echo "NOFX AI Trading System - 前端管理脚本"
    echo ""
    echo "用法: ./start-frontend.sh [command]"
    echo ""
    echo "命令:"
    echo "  dev       启动开发服务器"
    echo "  prod      启动生产服务器"
    echo "  build     构建前端应用"
    echo "  stop      停止前端服务"
    echo "  restart   重启前端服务"
    echo "  status    查看服务状态"
    echo "  clean     清理构建文件"
    echo "  help      显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  ./start-frontend.sh dev      # 启动开发服务器"
    echo "  ./start-frontend.sh prod     # 启动生产服务器"
    echo "  ./start-frontend.sh status   # 查看状态"
    echo "  ./start-frontend.sh stop     # 停止服务"
}

# 主函数
main() {
    case "${1:-dev}" in
        dev)
            check_node
            check_frontend_dir
            install_deps
            start_dev
            ;;
        prod)
            check_node
            check_frontend_dir
            install_deps
            build_frontend
            start_prod
            ;;
        build)
            check_node
            check_frontend_dir
            install_deps
            build_frontend
            ;;
        stop)
            stop_frontend
            ;;
        restart)
            stop_frontend
            sleep 2
            check_node
            check_frontend_dir
            install_deps
            start_dev
            ;;
        status)
            status
            ;;
        clean)
            clean
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
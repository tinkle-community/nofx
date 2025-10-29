#!/bin/bash

# NOFX AI Trading System - 停止前端服务脚本

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_info "正在停止前端服务..."

# 通过PID文件停止
if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if kill $FRONTEND_PID 2>/dev/null; then
        print_success "前端服务已停止 (PID: $FRONTEND_PID)"
    else
        print_warning "无法停止进程 $FRONTEND_PID，可能已经停止"
    fi
    rm -f .frontend.pid
else
    # 通过进程名停止
    if pgrep -f "npm run dev" > /dev/null || pgrep -f "vite" > /dev/null; then
        pkill -f "npm run dev" 2>/dev/null || true
        pkill -f "vite" 2>/dev/null || true
        print_success "前端服务已停止"
    else
        print_warning "前端服务未运行"
    fi
fi

#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # 无颜色

# 项目基础目录
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="${BASE_DIR}"
BACKEND_DIR="${BASE_DIR}/server"
LOG_DIR="${BASE_DIR}/logs"

# 创建日志目录
mkdir -p $LOG_DIR

# 确保脚本可以被终止
trap 'kill $(jobs -p) 2>/dev/null' EXIT

# 输出标题
echo -e "${CYAN}"
echo -e "┌─────────────────────────────────────────────────┐"
echo -e "│                                                 │"
echo -e "│   ${YELLOW}★ 星语心笺 (SoulNote) 一键启动脚本 ★${CYAN}          │"
echo -e "│                                                 │"
echo -e "└─────────────────────────────────────────────────┘${NC}"
echo

# 检查环境
check_environment() {
    echo -e "${BLUE}[系统] ${NC}检查环境配置..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}[错误] ${NC}未检测到Node.js，请安装Node.js后重试${NC}"
        exit 1
    else
        NODE_VERSION=$(node -v)
        echo -e "${GREEN}[√] ${NC}Node.js 已安装: $NODE_VERSION"
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}[错误] ${NC}未检测到npm，请安装npm后重试${NC}"
        exit 1
    else
        NPM_VERSION=$(npm -v)
        echo -e "${GREEN}[√] ${NC}npm 已安装: $NPM_VERSION"
    fi
    
    # 检查前端项目
    if [ ! -f "${FRONTEND_DIR}/package.json" ]; then
        echo -e "${RED}[错误] ${NC}未找到前端项目的package.json文件${NC}"
        exit 1
    else
        echo -e "${GREEN}[√] ${NC}前端项目检查通过"
    fi
    
    # 检查后端项目
    if [ ! -f "${BACKEND_DIR}/index.js" ]; then
        echo -e "${RED}[错误] ${NC}未找到后端项目的入口文件${NC}"
        exit 1
    else
        echo -e "${GREEN}[√] ${NC}后端项目检查通过"
    fi
    
    # 检查.env文件
    if [ ! -f "${BACKEND_DIR}/.env" ]; then
        echo -e "${YELLOW}[警告] ${NC}未找到后端.env文件，将根据.env.example创建"
        if [ -f "${BACKEND_DIR}/.env.example" ]; then
            cp "${BACKEND_DIR}/.env.example" "${BACKEND_DIR}/.env"
            echo -e "${GREEN}[√] ${NC}已根据.env.example创建.env文件"
        else
            echo -e "${RED}[错误] ${NC}未找到.env.example文件，无法创建.env"
            exit 1
        fi
    else
        echo -e "${GREEN}[√] ${NC}后端环境配置文件检查通过"
    fi
    
    echo -e "${GREEN}[系统] ${NC}环境检查通过！"
    echo
}

# 安装依赖
install_dependencies() {
    echo -e "${BLUE}[系统] ${NC}检查并安装项目依赖..."
    
    # 前端依赖安装
    echo -e "${PURPLE}[前端] ${NC}安装前端依赖..."
    cd $FRONTEND_DIR
    npm install --silent || {
        echo -e "${RED}[错误] ${NC}前端依赖安装失败${NC}"
        exit 1
    }
    echo -e "${GREEN}[前端] ${NC}依赖安装完成"
    
    # 后端依赖安装
    echo -e "${PURPLE}[后端] ${NC}安装后端依赖..."
    cd $BACKEND_DIR
    npm install --silent || {
        echo -e "${RED}[错误] ${NC}后端依赖安装失败${NC}"
        exit 1
    }
    echo -e "${GREEN}[后端] ${NC}依赖安装完成"
    
    echo -e "${GREEN}[系统] ${NC}所有依赖安装完成！"
    echo
}

# 启动后端服务
start_backend() {
    echo -e "${BLUE}[系统] ${NC}启动后端服务..."
    cd $BACKEND_DIR
    
    # 检查是否安装了nodemon
    if npm list -g nodemon &> /dev/null || npm list nodemon &> /dev/null; then
        echo -e "${PURPLE}[后端] ${NC}使用nodemon启动(开发模式)"
        nohup npx nodemon index.js > "${LOG_DIR}/backend.log" 2>&1 &
    else
        echo -e "${PURPLE}[后端] ${NC}使用node启动(生产模式)"
        nohup node index.js > "${LOG_DIR}/backend.log" 2>&1 &
    fi
    
    BACKEND_PID=$!
    
    # 等待后端启动
    sleep 2
    if ps -p $BACKEND_PID > /dev/null; then
        echo -e "${GREEN}[后端] ${NC}服务启动成功 (PID: $BACKEND_PID)"
    else
        echo -e "${RED}[错误] ${NC}后端服务启动失败，请查看日志: ${LOG_DIR}/backend.log${NC}"
        exit 1
    fi
    
    # 获取后端服务端口
    BACKEND_PORT=$(grep -E "^PORT=" "${BACKEND_DIR}/.env" | cut -d= -f2)
    BACKEND_PORT=${BACKEND_PORT:-4000}  # 默认端口4000
    
    echo -e "${GREEN}[后端] ${NC}API服务地址: http://localhost:${BACKEND_PORT}"
    echo
}

# 启动前端服务
start_frontend() {
    echo -e "${BLUE}[系统] ${NC}启动前端服务..."
    cd $FRONTEND_DIR
    
    # 检查package.json中的dev脚本
    if grep -q "\"dev\":" package.json; then
        echo -e "${PURPLE}[前端] ${NC}使用npm run dev启动"
        nohup npm run dev > "${LOG_DIR}/frontend.log" 2>&1 &
    else
        echo -e "${RED}[错误] ${NC}前端缺少dev脚本${NC}"
        echo -e "${YELLOW}[尝试] ${NC}使用vite直接启动..."
        if command -v npx &> /dev/null; then
            nohup npx vite > "${LOG_DIR}/frontend.log" 2>&1 &
        else
            echo -e "${RED}[错误] ${NC}无法启动前端服务${NC}"
            exit 1
        fi
    fi
    
    FRONTEND_PID=$!
    
    # 等待前端启动
    sleep 5
    if ps -p $FRONTEND_PID > /dev/null; then
        echo -e "${GREEN}[前端] ${NC}服务启动成功 (PID: $FRONTEND_PID)"
    else
        echo -e "${RED}[错误] ${NC}前端服务启动失败，请查看日志: ${LOG_DIR}/frontend.log${NC}"
        exit 1
    fi
    
    # 获取前端服务端口 (从vite.config.js或默认)
    FRONTEND_PORT=5173  # Vite默认端口
    if [ -f "${FRONTEND_DIR}/vite.config.js" ]; then
        CONFIG_PORT=$(grep -E "port.*:" "${FRONTEND_DIR}/vite.config.js" | grep -oE "[0-9]+" | head -1)
        if [ ! -z "$CONFIG_PORT" ]; then
            FRONTEND_PORT=$CONFIG_PORT
        fi
    fi
    
    echo -e "${GREEN}[前端] ${NC}Web应用地址: http://localhost:${FRONTEND_PORT}"
    echo
}

# 显示服务状态和日志
show_status() {
    echo -e "${BLUE}[系统] ${NC}所有服务已启动！"
    echo -e "${PURPLE}=======================================${NC}"
    echo -e "${YELLOW}前端日志: ${LOG_DIR}/frontend.log${NC}"
    echo -e "${YELLOW}后端日志: ${LOG_DIR}/backend.log${NC}"
    echo -e "${PURPLE}=======================================${NC}"
    echo -e "${CYAN}提示: 按 Ctrl+C 停止所有服务${NC}"
    echo
    
    # 监控日志的最后几行(可选)
    tail -f "${LOG_DIR}/frontend.log" "${LOG_DIR}/backend.log"
}

# 主函数
main() {
    check_environment
    install_dependencies
    start_backend
    start_frontend
    show_status
}

# 执行主函数
main

#!/bin/bash

# 服务器自动更新脚本 - 从GitHub拉取最新代码并重启服务

# 日志颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # 无颜色

# 检查是否使用强制更新标志
FORCE_UPDATE=0
if [ "$1" == "--force" ] || [ "$1" == "-f" ]; then
    FORCE_UPDATE=1
    log_warn "已启用强制更新模式!"
fi

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 工作目录 - 修改为您的项目根目录
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_DIR="${PROJECT_DIR}"
BACKUP_DIR="${PROJECT_DIR}/backups"
DATE_SUFFIX=$(date +"%Y%m%d_%H%M%S")

# 创建备份目录
mkdir -p ${BACKUP_DIR}

# 记录开始时间
log_info "=== 开始更新 SoulNote 服务器 ($(date)) ==="
log_info "工作目录: ${PROJECT_DIR}"

# 步骤1: 创建备份
log_info "创建当前代码备份..."
BACKUP_FILE="${BACKUP_DIR}/backup_${DATE_SUFFIX}.tar.gz"
tar -czf ${BACKUP_FILE} --exclude="node_modules" --exclude=".git" --exclude="backups" -C ${PROJECT_DIR} .
if [ $? -eq 0 ]; then
    log_info "备份成功: ${BACKUP_FILE}"
else
    log_error "备份失败，终止更新!"
    exit 1
fi

# 步骤2: 拉取最新代码
cd ${PROJECT_DIR}
log_info "检查Git状态..."
if [ -d ".git" ]; then
    # 检查是否有未提交更改
    if [ -n "$(git status --porcelain)" ]; then
        log_warn "存在本地未提交的更改。创建补丁文件..."
        git diff > "${BACKUP_DIR}/local_changes_${DATE_SUFFIX}.patch"
        log_info "本地更改已保存到补丁文件: local_changes_${DATE_SUFFIX}.patch"
        
        # 临时储存更改
        git stash
        STASHED=1
    fi

    # 获取当前分支
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    log_info "当前分支: ${CURRENT_BRANCH}"

    # 拉取最新代码
    log_info "从GitHub拉取最新代码..."
    
    # 设置合并策略为merge
    git config pull.rebase false
    
    # 根据是否强制更新选择不同的拉取策略
    if [ ${FORCE_UPDATE} -eq 1 ]; then
        log_warn "使用强制更新模式拉取代码..."
        git fetch origin ${CURRENT_BRANCH}
        git reset --hard origin/${CURRENT_BRANCH}
        PULL_RESULT=$?
    else
        git pull origin ${CURRENT_BRANCH}
        PULL_RESULT=$?
        
        # 如果普通拉取失败，提示用户使用强制更新
        if [ ${PULL_RESULT} -ne 0 ]; then
            log_error "拉取代码失败。如需强制更新（丢弃本地更改），请使用: ./update.sh --force"
        fi
    fi
    
    if [ ${PULL_RESULT} -ne 0 ]; then
        log_error "拉取代码失败，尝试恢复..."
        if [ "${STASHED}" == "1" ]; then
            git stash pop
        fi
        exit 1
    fi
    
    # 恢复储存的更改
    if [ "${STASHED}" == "1" ]; then
        log_info "恢复本地更改..."
        git stash pop
        if [ $? -ne 0 ]; then
            log_warn "恢复本地更改时发生冲突，请手动解决。补丁文件: local_changes_${DATE_SUFFIX}.patch"
        fi
    fi
else
    log_error "当前目录不是Git仓库!"
    exit 1
fi

# 步骤3: 安装/更新依赖
log_info "检查依赖更新..."
if [ -f "${SERVER_DIR}/package.json" ]; then
    cd ${SERVER_DIR}
    log_info "安装/更新服务器依赖..."
    npm install --production
    if [ $? -ne 0 ]; then
        log_error "依赖安装失败!"
        exit 1
    fi
else
    log_warn "找不到package.json文件，跳过依赖安装"
fi

# 步骤4: 重启服务器
log_info "重启服务器进程..."

# 检查是否使用PM2
if command -v pm2 &> /dev/null; then
    # 使用PM2重启服务
    cd ${SERVER_DIR}
    PM2_NAME=$(grep "name" package.json | head -1 | awk -F: '{ print $2 }' | sed 's/[", ]//g')
    
    if [ -z "${PM2_NAME}" ]; then
        PM2_NAME="soulnote-server"
    fi
    
    if pm2 list | grep -q ${PM2_NAME}; then
        log_info "使用PM2重启服务: ${PM2_NAME}..."
        pm2 restart ${PM2_NAME}
    else
        log_info "使用PM2启动服务: ${PM2_NAME}..."
        pm2 start index.js --name ${PM2_NAME}
    fi
else
    # 如果没有PM2，尝试使用其他方法重启
    log_warn "未检测到PM2，尝试其他方式重启..."
    
    # 检查是否有运行中的Node进程
    PID=$(ps aux | grep "node.*index.js" | grep -v grep | awk '{print $2}')
    
    if [ -n "${PID}" ]; then
        log_info "停止现有Node进程 (PID: ${PID})..."
        kill ${PID}
        sleep 2
    fi
    
    # 启动新进程
    cd ${SERVER_DIR}
    log_info "启动服务器..."
    nohup node index.js > server.log 2>&1 &
fi

# 完成更新
log_info "=== 更新完成 ($(date)) ==="
log_info "请检查服务器是否正常运行!"

# 退出前显示服务状态
if command -v pm2 &> /dev/null; then
    pm2 list | grep ${PM2_NAME}
else
    ps aux | grep "node.*index.js" | grep -v grep
fi

exit 0
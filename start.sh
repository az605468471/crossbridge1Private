#!/bin/bash
# CrossBridge 启动脚本

echo "🚀 Starting CrossBridge..."

# 安装依赖
npm install

# 初始化数据库
node -e "require('./db.js');"

# 启动服务
node index.js
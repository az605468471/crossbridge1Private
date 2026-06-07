#!/bin/bash

# CrossBridge 上传到 GitHub 脚本

echo "🚀 准备上传 CrossBridge 到 GitHub..."

# 检查 Git 是否安装
if ! command -v git &> /dev/null; then
    echo "❌ Git 未安装，请先安装 Git"
    exit 1
fi

# 进入项目目录
cd /app/workspace/crossbridge

# 初始化 Git 仓库
echo "📁 初始化 Git 仓库..."
git init

# 添加所有文件
echo "📦 添加文件..."
git add .

# 提交
echo "💾 提交代码..."
git commit -m "Initial commit: CrossBridge 跨链桥接平台"

# 提示用户输入 GitHub 仓库地址
echo ""
echo "📋 请按照以下步骤操作："
echo ""
echo "1. 访问 https://github.com/new"
echo "2. 创建仓库：crossbridge"
echo "3. 选择 Public 或 Private"
echo "4. 点击 Create repository"
echo "5. 复制仓库地址（如 https://github.com/YOUR_USERNAME/crossbridge.git）"
echo ""
read -p "请输入 GitHub 仓库地址: " GITHUB_URL

# 添加远程仓库
echo "🔗 添加远程仓库..."
git remote add origin $GITHUB_URL

# 推送代码
echo "⬆️ 推送代码..."
git push -u origin main

echo ""
echo "✅ 代码已上传到 GitHub！"
echo ""
echo "📋 下一步："
echo "1. 访问 https://vercel.com"
echo "2. 登录 GitHub 账号"
echo "3. 点击 New Project"
echo "4. 选择 crossbridge 仓库"
echo "5. 点击 Deploy"
echo ""
echo "🎉 部署完成！"

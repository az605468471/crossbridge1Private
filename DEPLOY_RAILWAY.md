# CrossBridge Railway 部署指南

## 部署步骤

### 1️⃣ 准备工作

1. 注册 Railway 账号：https://railway.app
2. 连接 GitHub 账号
3. 上传代码到 GitHub

### 2️⃣ 上传代码到 GitHub

```bash
# 初始化 Git 仓库
cd /app/workspace/crossbridge
git init
git add .
git commit -m "Initial commit"

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/crossbridge.git
git push -u origin main
```

### 3️⃣ 部署到 Railway

1. 登录 Railway
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择 crossbridge 仓库
5. 点击 "Deploy Now"

### 4️⃣ 配置环境变量

在 Railway 项目设置中添加环境变量：

```
NODE_ENV=production
PORT=5000
```

### 5️⃣ 配置域名（可选）

1. 在 Railway 项目设置中点击 "Settings"
2. 点击 "Domains"
3. 添加自定义域名或使用 Railway 提供的域名

### 6️⃣ 验证部署

访问 Railway 提供的 URL，测试以下功能：

- ✅ 首页加载
- ✅ 合约状态检查
- ✅ 铸造测试代币
- ✅ 桥接代币

## 文件结构

```
crossbridge/
├── index.js          # 主服务器
├── db.js             # 数据库初始化
├── package.json      # 依赖配置
├── railway.json      # Railway 部署配置
├── start.sh          # 启动脚本
├── public/           # 前端文件
│   └── index.html    # 前端页面
├── contracts/        # 智能合约
│   └── CrossBridge.sol
└── deployed-contracts.json  # 合约地址
```

## 注意事项

1. **数据库**：Railway 提供 PostgreSQL，需要修改 `db.js` 使用 PostgreSQL
2. **环境变量**：确保所有敏感信息都通过环境变量配置
3. **HTTPS**：Railway 自动提供 HTTPS
4. **监控**：Railway 提供日志和监控

## 故障排除

### 问题：部署失败
- 检查 `package.json` 是否正确
- 确保所有依赖都已安装

### 问题：数据库连接失败
- 检查环境变量是否正确配置
- 确保数据库服务已启动

### 问题：页面无法访问
- 检查端口配置
- 确保服务已启动

---

**状态**: 准备部署
**负责人**: MasterD
**日期**: 2026-06-07

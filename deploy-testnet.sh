#!/bin/bash
# CrossBridge 部署脚本（使用环境变量接收私钥）

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ 请设置环境变量 PRIVATE_KEY"
    echo "示例："
    echo "export PRIVATE_KEY=0x你的私钥"
    echo "然后重新运行此脚本"
    exit 1
fi

echo "🚀 开始部署 CrossBridge 合约..."
echo "网络: BSC 测试网"
echo "部署账户: $(node -e "const {Wallet}=require('ethers'); console.log(new Wallet(process.env.PRIVATE_KEY).address)")"

cd /app/workspace/crossbridge

# 将私钥写入临时 hardhat 配置
cat > hardhat.config.deploy.cjs << EOF
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true
    }
  },
  networks: {
    bsctest: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: ["$PRIVATE_KEY"]
    }
  }
};
EOF

# 运行部署
npx hardhat run scripts/deploy.cjs --config hardhat.config.deploy.cjs --network bsctest

# 清理临时配置
rm -f hardhat.config.deploy.cjs

echo "✅ 部署完成！"

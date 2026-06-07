# CrossBridge 智能合约部署指南

## 合约架构

| 合约 | 功能 |
|------|------|
| CrossBridgeToken (CBUSD) | ERC-20 测试代币，可铸造，用于桥接测试 |
| CrossBridge | 跨链桥主合约（锁定/释放模型） |
| CrossBridgePool | AMM 流动性池（即时兑换） |
| CrossBridgeRelayer | 验证者/中继者网络（M-of-N 多签验证） |

## 部署步骤

### 1. 配置私钥
```bash
# 编辑 hardhat.config.cjs，将 TEST_KEY 替换为你的私钥
# 也可以用环境变量：
export PRIVATE_KEY="0x你的私钥"
```

### 2. 获取测试 BNB
- BSC Testnet Faucet: https://testnet.bnbchain.org/faucet-smart
- 需要约 0.1 tBNB 即可部署所有合约

### 3. 部署
```bash
# BSC 测试网
npx hardhat run scripts/deploy.cjs --network bsctest

# BSC 主网
npx hardhat run scripts/deploy.cjs --network bsc

# Ethereum
npx hardhat run scripts/deploy.cjs --network ethereum
```

### 4. 验证合约（可选）
```bash
npx hardhat verify --network bsctest <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## 合约交互示例

### 铸造测试代币
```js
const token = await ethers.getContractAt("CrossBridgeToken", "<TOKEN_ADDR>");
await token.mint("<YOUR_ADDR>", ethers.parseUnits("1000", 18));
```

### 跨链桥接
```js
// 先授权
await token.approve("<BRIDGE_ADDR>", ethers.parseUnits("100", 18));
// 发起桥接
const bridge = await ethers.getContractAt("CrossBridge", "<BRIDGE_ADDR>");
await bridge.bridge(
  "<TOKEN_ADDR>",
  ethers.parseUnits("100", 18),  // amount
  56,                             // 目标链 ID (BSC=56)
  ethers.zeroPadValue("<RECIPIENT>", 32) // 目标地址
);
```

### 添加流动性到池子
```js
// 创建池子
const pool = await ethers.getContractAt("CrossBridgePool", "<POOL_ADDR>");
await pool.createPool("<TOKEN_A>", "<TOKEN_B>", 30); // 0.3% fee

// 添加流动性
await tokenA.approve("<POOL_ADDR>", ethers.parseUnits("1000", 18));
await tokenB.approve("<POOL_ADDR>", ethers.parseUnits("1000", 18));
await pool.addLiquidity(1, ethers.parseUnits("1000", 18), ethers.parseUnits("1000", 18));
```

## 支持的网络

| 网络 | Chain ID | RPC |
|------|----------|-----|
| BSC Mainnet | 56 | bsc-dataseed1.binance.org |
| BSC Testnet | 97 | data-seed-prebsc-1-s1.binance.org |
| Ethereum | 1 | eth-mainnet.public.blastapi.io |
| Polygon | 137 | polygon-rpc.com |
| Arbitrum | 42161 | arb1.arbitrum.io/rpc |

## Gas 估算

| 操作 | 预估 Gas |
|------|---------|
| 部署 Token | ~1.5M |
| 部署 Bridge | ~3M |
| 部署 Pool | ~4M |
| 部署 Relayer | ~2.5M |
| 总计 | ~11M (~0.05 BNB @ 5 gwei) |

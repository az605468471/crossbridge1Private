const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 合约配置
const provider = new ethers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
const wallet = new ethers.Wallet("0x8176cc0e3b521d71eb58fd4f09c21f45d4ada0fed3ad3f8a02e7193fb617f0fe", provider);

const TOKEN_ADDR = "0xd6Fbe570490C44e343B4e9F8a9ba7265aC1cfb01";
const ABI = ["function mint(address to, uint256 amount) external"];
const contract = new ethers.Contract(TOKEN_ADDR, ABI, wallet);

// 铸币 API
app.post("/api/mint", async (req, res) => {
  try {
    const { to, amount } = req.body;
    
    if (!ethers.isAddress(to)) {
      return res.status(400).json({ error: "无效地址" });
    }
    
    const wei = ethers.parseEther(amount.toString());
    
    console.log(`铸币: ${to} → ${amount} CBUSD`);
    
    const tx = await contract.mint(to, wei);
    await tx.wait();
    
    console.log(`✅ 成功: ${tx.hash}`);
    
    res.json({
      success: true,
      hash: tx.hash,
      amount: amount,
      to: to
    });
  } catch (e) {
    console.error("❌ 失败:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// 健康检查
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 启动
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`✅ 铸币 API 运行中: http://localhost:${PORT}`);
  console.log(`   POST /api/mint  — 铸币`);
  console.log(`   GET /api/health — 健康检查`);
});

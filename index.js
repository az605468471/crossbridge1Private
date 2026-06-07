const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 5000;

// ===== Database =====
const db = require('./db');

// ===== Prepared statements =====
const stmts = {
  insertOrder: db.prepare('INSERT INTO orders (order_id, from_chain, to_chain, from_token, amount, wallet_address, status, fee, tx_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'),
  getOrder: db.prepare('SELECT * FROM orders WHERE order_id = ?'),
  updateOrderStatus: db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE order_id = ?"),
  listOrders: db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT ?'),
  countOrders: db.prepare('SELECT COUNT(*) as count FROM orders'),
  countCompleted: db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'completed'"),
  sumVolume: db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM orders'),
  insertAlert: db.prepare('INSERT INTO alerts (alert_id, symbol, condition, target_price) VALUES (?, ?, ?, ?)'),
  listAlerts: db.prepare('SELECT * FROM alerts ORDER BY id DESC'),
  deleteAlert: db.prepare('DELETE FROM alerts WHERE alert_id = ?'),
  countAlerts: db.prepare('SELECT COUNT(*) as count FROM alerts'),
};

const CHAINS = [
  { name: 'BNB Chain', chainId: 56, nativeCurrency: 'BNB', rpcUrl: 'https://bsc-dataseed1.binance.org' },
  { name: 'Ethereum', chainId: 1, nativeCurrency: 'ETH', rpcUrl: 'https://eth-mainnet.public.blastapi.io' },
  { name: 'Optimism', chainId: 10, nativeCurrency: 'ETH', rpcUrl: 'https://mainnet.optimism.io' },
  { name: 'Polygon', chainId: 137, nativeCurrency: 'MATIC', rpcUrl: 'https://polygon-rpc.com' },
  { name: 'Base', chainId: 8453, nativeCurrency: 'ETH', rpcUrl: 'https://mainnet.base.org' },
  { name: 'Arbitrum', chainId: 42161, nativeCurrency: 'ETH', rpcUrl: 'https://arb1.arbitrum.io/rpc' },
  { name: 'Avalanche', chainId: 43114, nativeCurrency: 'AVAX', rpcUrl: 'https://api.avax.network/ext/bc/C/rpc' },
  { name: 'Solana', chainId: 'solana', nativeCurrency: 'SOL', rpcUrl: 'https://api.mainnet-beta.solana.com' }
];

const TOKEN_ADDRESSES = {
  bsc: { USDT: '0x55d398326f99059fF775485246999027B3197955', USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' },
  ethereum: { USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7', USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
  polygon: { USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' },
  arbitrum: { USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' },
  optimism: { USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', USDC: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' },
  base: { USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
  avalanche: { USDT: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', USDC: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E' },
  solana: { USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' }
};

// ===== Routes =====

app.get('/chains', (req, res) => res.json(CHAINS));

app.post('/quote', (req, res) => {
  const { fromChain, toChain, fromToken, amount } = req.body;
  const rate = (0.998 + Math.random() * 0.002).toFixed(6);
  const fee = (amount * 0.0015).toFixed(2);
  const estimated = (amount * rate - parseFloat(fee)).toFixed(2);
  res.json({ fromChain, toChain, fromToken, amount: parseFloat(amount), fee: parseFloat(fee), rate: parseFloat(rate), estimatedReceive: parseFloat(estimated), route: fromChain + ' → ' + toChain });
});

app.post('/orders', (req, res) => {
  try {
    const { fromChain, toChain, fromToken, amount, walletAddress } = req.body;
    const orderId = 'ORD-' + String(Date.now()).slice(-10).padStart(6, '0') + Math.random().toString(36).slice(-2).toUpperCase();
    const fee = (amount * 0.0015).toFixed(2);
    const txHash = '0x' + Array.from({length:64},()=>'0123456789abcdef'[Math.floor(Math.random()*16)]).join('');
    stmts.insertOrder.run(orderId, fromChain, toChain, fromToken, parseFloat(amount), walletAddress, 'pending', parseFloat(fee), txHash);
    const order = stmts.getOrder.get(orderId);
    setTimeout(() => { stmts.updateOrderStatus.run('completed', orderId); }, 5000 + Math.random() * 10000);
    res.json(order);
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/orders/:id', (req, res) => {
  const o = stmts.getOrder.get(req.params.id);
  o ? res.json(o) : res.status(404).json({ error: 'Order not found' });
});

app.get('/trade-history', (req, res) => {
  const orders = stmts.listOrders.all(50);
  const { count } = stmts.countOrders.get();
  res.json({ orders, total: count });
});

app.get('/trade-stats', (req, res) => {
  const { count: totalOrders } = stmts.countOrders.get();
  const { count: completedOrders } = stmts.countCompleted.get();
  const { total: totalVolume } = stmts.sumVolume.get();
  res.json({ totalOrders, completedOrders, totalVolume: totalVolume.toFixed(2), successRate: totalOrders ? ((completedOrders / totalOrders) * 100).toFixed(1) : '0' });
});

app.post('/price-alerts', (req, res) => {
  try {
    const { symbol, condition, targetPrice } = req.body;
    const { count } = stmts.countAlerts.get();
    const alertId = 'ALT-' + String(count + 1).padStart(4, '0');
    stmts.insertAlert.run(alertId, symbol, condition, parseFloat(targetPrice));
    const alerts = stmts.listAlerts.all();
    const alert = alerts.find(a => a.alert_id === alertId);
    res.json(alert);
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/price-alerts', (req, res) => {
  const alerts = stmts.listAlerts.all();
  res.json({ alerts, total: alerts.length });
});

app.delete('/price-alerts/:id', (req, res) => {
  const result = stmts.deleteAlert.run(req.params.id);
  result.changes === 0 ? res.status(404).json({ error: 'Alert not found' }) : res.json({ success: true });
});

// ===== Binance proxy =====
app.get('/klines', async (req, res) => {
  try {
    const { symbol, interval, limit } = req.query;
    const r = await axios.get('https://api.binance.com/api/v3/klines', { params: { symbol, interval, limit: limit || 50 } });
    res.json(r.data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/ticker-24h', async (req, res) => {
  try {
    const r = await axios.get('https://api.binance.com/api/v3/ticker/24hr', { params: { symbol: req.query.symbol } });
    res.json(r.data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/multichain-balance', async (req, res) => {
  const { address } = req.query;
  if (!address) return res.status(400).json({ error: 'address required' });
  const erc20Abi = '0x70a08231000000000000000000000000' + (address.startsWith('0x') ? address.slice(2).toLowerCase() : address);
  const balances = [];
  const promises = CHAINS.map(async (chain) => {
    try {
      let nativeBalance = 0;
      const tokens = [];
      if (chain.name === 'Solana') {
        try {
          const r = await axios.post(chain.rpcUrl, { jsonrpc: '2.0', id: 1, method: 'getBalance', params: [address] }, { headers: { 'Content-Type': 'application/json' }, timeout: 5000 });
          nativeBalance = (r.data?.result?.value || 0) / 1e9;
        } catch (e) { }
      } else {
        const payload = [
          { jsonrpc: '2.0', id: 1, method: 'eth_getBalance', params: [address, 'latest'] },
          { jsonrpc: '2.0', id: 2, method: 'eth_call', params: [{ to: TOKEN_ADDRESSES[chain.name.toLowerCase().replace(' ', '')]?.USDT || TOKEN_ADDRESSES['bsc']?.USDT, data: erc20Abi }, 'latest'] },
          { jsonrpc: '2.0', id: 3, method: 'eth_call', params: [{ to: TOKEN_ADDRESSES[chain.name.toLowerCase().replace(' ', '')]?.USDC || TOKEN_ADDRESSES['bsc']?.USDC, data: erc20Abi }, 'latest'] }
        ];
        const r = await axios.post(chain.rpcUrl, payload, { headers: { 'Content-Type': 'application/json' }, timeout: 5000 });
        if (r.data && r.data[0]?.result) nativeBalance = parseInt(r.data[0].result, 16) / 1e18;
      }
      balances.push({ chain: chain.name, nativeCurrency: chain.nativeCurrency, nativeBalance: nativeBalance.toFixed(6), tokens });
    } catch (e) {
      balances.push({ chain: chain.name, nativeCurrency: chain.nativeCurrency, nativeBalance: '0', tokens: [], error: e.message });
    }
  });
  await Promise.all(promises);
  balances.sort((a, b) => parseFloat(b.nativeBalance) - parseFloat(a.nativeBalance));
  res.json({ address, balances, updatedAt: new Date().toISOString() });
});

app.get('/supported-tokens', (req, res) => {
  const { chain } = req.query;
  if (!chain) return res.json(TOKEN_ADDRESSES);
  const key = chain.toLowerCase().replace(' ', '');
  res.json(TOKEN_ADDRESSES[key] || {});
});

app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// 导出 app 用于 Vercel
module.exports = app;

// 本地运行
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log('CrossBridge running on :' + PORT));
}

// ===== Contract ABI Serving =====
app.get('/abi/:contract', (req, res) => {
  const allowed = ['CrossBridgeToken', 'CrossBridge', 'CrossBridgePool', 'CrossBridgeRelayer'];
  if (!allowed.includes(req.params.contract)) {
    return res.status(404).json({ error: 'Contract not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'abi', req.params.contract + '.json'));
});

// ===== Contract Address Registry =====
// These get updated after deployment
app.get('/contract-addresses', (req, res) => {
  try {
    const deployed = require('./deployed-contracts.json');
    res.json(deployed);
  } catch (e) {
    res.json({
      network: 'bsctest',
      chainId: 97,
      contracts: {
        token: 'Not deployed yet',
        bridge: 'Not deployed yet',
        pool: 'Not deployed yet',
        relayer: 'Not deployed yet'
      },
      message: 'Run: npx hardhat run scripts/deploy.cjs --network bsctest'
    });
  }
});

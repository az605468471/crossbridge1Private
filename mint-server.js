const { ethers } = require("ethers");
const fs = require('fs');
const http = require('http');

const PRIVATE_KEY = "0x8176cc0e3b521d71eb58fd4f09c21f45d4ada0fed3ad3f8a02e7193fb617f0fe";
const TOKEN_ADDR = "0xd6Fbe570490C44e343B4e9F8a9ba7265aC1cfb01";
const ABI = ["function mint(address to, uint256 amount) external", "function owner() view returns (address)"];
const RPC = "https://bsc-dataseed1.binance.org";

async function mint(to, amount) {
    const provider = new ethers.JsonRpcProvider(RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(TOKEN_ADDR, ABI, wallet);
    
    const owner = await contract.owner();
    console.log("Owner:", owner);
    console.log("Your address:", wallet.address);
    
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
        return { success: false, error: "Not owner" };
    }
    
    const value = ethers.parseUnits(amount.toString(), "ether");
    const tx = await contract.mint(to, value, { 
        gasPrice: ethers.parseUnits("5", "gwei"),
        gasLimit: 100000 
    });
    const receipt = await tx.wait();
    return { success: true, hash: receipt.hash };
}

// HTTP API
const server = http.createServer(async (req, res) => {
    if (req.url === '/api/mint' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { to, amount } = JSON.parse(body);
                const result = await mint(to, amount);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: e.message }));
            }
        });
    }
});

server.listen(5001, () => {
    console.log("Mint API running on port 5001");
    console.log("Use: POST http://localhost:5001/api/mint");
});

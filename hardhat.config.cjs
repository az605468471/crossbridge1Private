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
    bsc: {
      url: "https://bsc-dataseed1.binance.org",
      chainId: 56,
      accounts: ["0x2a2cba34925e838b190b03a37896db29942a8adf1156f0d1350c8d5d4ea4ae6b"]
    },
    bsctest: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: ["0x2a2cba34925e838b190b03a37896db29942a8adf1156f0d1350c8d5d4ea4ae6b"]
    },
    ethereum: {
      url: "https://eth-mainnet.public.blastapi.io",
      chainId: 1,
      accounts: ["0x2a2cba34925e838b190b03a37896db29942a8adf1156f0d1350c8d5d4ea4ae6b"]
    },
    polygon: {
      url: "https://polygon-rpc.com",
      chainId: 137,
      accounts: ["0x2a2cba34925e838b190b03a37896db29942a8adf1156f0d1350c8d5d4ea4ae6b"]
    },
    arbitrum: {
      url: "https://arb1.arbitrum.io/rpc",
      chainId: 42161,
      accounts: ["0x2a2cba34925e838b190b03a37896db29942a8adf1156f0d1350c8d5d4ea4ae6b"]
    },
  }
};

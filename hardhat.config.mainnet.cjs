require("@nomicfoundation/hardhat-toolbox");

const PRIVATE_KEY = process.env.PRIVATE_KEY;

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
      url: "https://bsc-dataseed1.binance.org/",
      chainId: 56,
      accounts: [PRIVATE_KEY]
    }
  }
};

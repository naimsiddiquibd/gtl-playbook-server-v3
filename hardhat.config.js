require("@nomiclabs/hardhat-waffle");
const fs = require("fs");
const privateKey = "59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

// Go to https://www.alchemyapi.io/, sign up and create a new app on Ethereum
// mainnet or a testnet, and replace the value below with its HTTP URL.
const alchemyApiKey = "uK5coLYCk_2MdQ43VXJobCUJ0JjtuXSL";

// Replace this private key with your account private key.
// If you don't know it, go to https://metamask.io and create or import an
// account, then find the "Export private key" option in the account details.
const accounts = [privateKey];

module.exports = {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      // Standard config
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: accounts,
      gasPrice: 8000000000, // 8 gwei
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    SBTToken: {
      default: 1,
    },
  },
};

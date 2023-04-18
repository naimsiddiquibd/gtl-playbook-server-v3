// scripts/viewTokens.js

const { ethers } = require("hardhat");

async function main() {
  const SBTToken = await ethers.getContractFactory("SBTToken");
  const sbtToken = await SBTToken.deployed();
  const address = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // Replace with the address you want to check

  const balance = await sbtToken.balanceOf(address);
  console.log(`Address ${address} owns ${balance.toString()} tokens:`);

  for (let i = 0; i < balance; i++) {
    const tokenId = await sbtToken.tokenOfOwnerByIndex(address, i);
    const tokenURI = await sbtToken.tokenURI(tokenId);
    console.log(`Token ID: ${tokenId.toString()}, Token URI: ${tokenURI}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

async function main() {
  const SBTToken = await ethers.getContractFactory("SBTToken");
  const sbtToken = await SBTToken.deploy();

  await sbtToken.deployed();

  console.log("SBTToken deployed to:", sbtToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

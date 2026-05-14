const hre = require("hardhat");

async function main() {
  const DocumentNotary = await hre.ethers.getContractFactory("DocumentNotary");
  const contract = await DocumentNotary.deploy();
  await contract.waitForDeployment();

  console.log("DocumentNotary deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

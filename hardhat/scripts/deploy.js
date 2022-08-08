const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { CRYPTO_DEVS_NFT_CONTRACT_ADDRESS } = require("../constants/index");

const main = async () => {
  const cryptoDevTokenContract = await ethers.getContractFactory(
    "CryptoDevToken"
  );
  const deployedCryptoDevTokenContract = await cryptoDevTokenContract.deploy(
    CRYPTO_DEVS_NFT_CONTRACT_ADDRESS
  );
  await deployedCryptoDevTokenContract.deployed();

  console.log(
    "CryptoDevToken Contract Address : ",
    deployedCryptoDevTokenContract.address
  );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// Contract Address : 0xb07D8b9C7Cd22C6571bc65C76BB2F5EA5D598A29

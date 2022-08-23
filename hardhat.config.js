require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.7",
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/AMWVgwdoEe1snSnHpJEDFf3R8ECxP3H5",
      }
    }
  }
};

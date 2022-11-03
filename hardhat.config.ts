import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";

import dotenv from "dotenv"
dotenv.config()
const { ALCHEMY_KEY, DEPLOYER_KEY } = process.env

// import "hardhat-ethernal"


const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.7',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  namedAccounts: {
    deployer: 0,
    owner: 1
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_KEY}`,
        blockNumber: 15666666
      }
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_KEY}`,
      accounts: [`${DEPLOYER_KEY}`]
    },
    remote: {
      url: "http://47.88.101.227/rpc",
      accounts: [`${DEPLOYER_KEY}`]
    }

  },
  paths: {
    // sources: './contracts/CurveHandle',    // special dir
    sources: './contracts/DeterministicDeploy',    // special dir
    artifacts: "./build/artifacts",
    cache: "./build/cache",
  },
  typechain: {
    outDir: "./build/typechain/",
    target: "ethers-v5",
  },
};

export default config;

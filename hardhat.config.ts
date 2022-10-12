import 'hardhat-deploy'
import 'hardhat-deploy-ethers'

import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'

import "hardhat-gas-reporter"

// import "hardhat-ethernal"

import {HardhatUserConfig} from 'hardhat/types'

import dotenv from "dotenv"
dotenv.config()
const { DEPLOYER_KEY } = process.env

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.7',
  },
  namedAccounts: {
    deployer: 0,
    owner: 1
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/AMWVgwdoEe1snSnHpJEDFf3R8ECxP3H5",
        blockNumber: 14561234
      }
    },
    goerli: {
      url: "https://eth-goerli.alchemyapi.io/v2/AMWVgwdoEe1snSnHpJEDFf3R8ECxP3H5",
      accounts: [`${DEPLOYER_KEY}`]
    }
  },
  paths: {
    // sources: './contracts/CurveHandle',    // special dir
    sources: './contracts/MIMLevSwapper',    // special dir
    artifacts: "./build/artifacts",
    cache: "./build/cache",
  },
  typechain: {
    outDir: "./build/typechain/",
    target: "ethers-v5",
  },
};

export default config;

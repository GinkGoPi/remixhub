import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { ethers } from "hardhat"


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    // await deploy("MIMLevSwapper", {
    await deploy("MIM3CrvLevSwapper", {
        from: deployer,
        log: true,
        gasLimit: 2e7,
        skipIfAlreadyDeployed: true
    })

}

export default func
func.tags = ["MIM3CrvLevSwapper"]

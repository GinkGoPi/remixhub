import { ethers } from "hardhat"
import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy, execute } = deployments
    const { deployer } = await getNamedAccounts()

    await deploy("RewardDistribute", {
        from: deployer,
        log: true,
        skipIfAlreadyDeployed: true
    })

    await execute(
        "RewardDistribute",
        { from: deployer, log: true },
        "addRewards"
    )

}

export default func
func.tags = ["RewardDistribute"]

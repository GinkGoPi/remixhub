import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre
    const { deploy, execute, getOrNull, get } = deployments
    const { deployer } = await getNamedAccounts()
    
    await deploy("MockStake", {
        from: deployer,
        log: true,
        skipIfAlreadyDeployed: true
    })
    
    await deploy("PushStake", {
        from: deployer,
        args: [1],
        log: true,
        skipIfAlreadyDeployed: true
    })
}
  
export default func
func.tags = ["MockStake", "PushStake"]
  
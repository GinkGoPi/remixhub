import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    await deploy("LUSD3CrvOracle", {
        contract: "LUSD3CrvOracle",
        from: deployer,
        log: true,
        skipIfAlreadyDeployed: true
      })
}

export default func
func.tags = ["LUSD3CrvOracle"]

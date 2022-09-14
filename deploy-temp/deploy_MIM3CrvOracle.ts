import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    await deploy("MIM3CrvOracle", {
        contract: "MIM3CrvOracle",
        from: deployer,
        log: true,
        skipIfAlreadyDeployed: true
      })
}

export default func
func.tags = ["MIM3CrvOracle"]

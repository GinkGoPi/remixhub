import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    await deploy("Frax3CrvOracle", {
        contract: "Frax3CrvOracle",
        from: deployer,
        log: true,
        skipIfAlreadyDeployed: true
      })
}

export default func
func.tags = ["Frax3CrvOracle"]

import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { ethers } from "hardhat"


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    console.log("===> deployed Vault", (await deployments.get("Vault")).address)

    await deploy("Cvx3crvTrove", {
        contract: "Cvx3crvTrove",
        from: deployer,
        args: [
            (await deployments.get("Vault")).address,
            (await deployments.get("USDAMock")).address,
            (await deployments.get("Cvx3crvMock")).address,
            (await deployments.get("Oracle")).address,
        ],
        log: true,
        skipIfAlreadyDeployed: true
    })


}

export default func
func.tags = ["Cvx3crvTrove"]
func.dependencies = ["Oracle", "USDAMock", "Cvx3crvMock", "Vault"]

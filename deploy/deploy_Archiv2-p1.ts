import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { ethers } from "hardhat"


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    await deploy("Oracle", {
        contract: "Oracle",
        from: deployer,
        log: true,
        skipIfAlreadyDeployed: true
    })

    await deploy("USDAMock", {
        contract: "USDAMock",
        from: deployer,
        args: [ethers.utils.parseEther('100000000')],
        log: true,
        skipIfAlreadyDeployed: true
    })

    await deploy("Cvx3crvMock", {
        contract: "Cvx3crvMock",
        from: deployer,
        args: [ethers.utils.parseEther('100000000')],
        log: true,
        skipIfAlreadyDeployed: true
    })

    await deploy("Vault", {
        contract: "Vault",
        from: deployer,
        log: true,
        skipIfAlreadyDeployed: true
    })

}

export default func
func.tags = ["Oracle", "USDAMock", "Cvx3crvMock", "Vault"]

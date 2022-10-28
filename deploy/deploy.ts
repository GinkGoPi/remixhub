import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { ethers } from "hardhat"


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy, execute } = deployments
    const { deployer } = await getNamedAccounts()

    let USDA3Pool;
    
    if (!USDA3Pool) {
        console.log("Do not has USDA3pool, exit")
        return
    }

    await deploy("USDA", {
        contract: "USDA",
        from: deployer,
        args: [ethers.utils.parseEther('100000000')],
        log: true,
        skipIfAlreadyDeployed: true
    })


}

export default func

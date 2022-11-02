import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { ethers } from "hardhat"


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy, deterministic } = deployments
    // const { execute, deterministic } = deployments
    const { deployer, owner } = await getNamedAccounts()

    await deploy("DTMToken", {
        contract: "DTMToken",
        from: deployer,
        // args: [],
        log: true,
        skipIfAlreadyDeployed: true,
        // deterministicDeployment: true
        deterministicDeployment: ""
    })

    // const { deploy } = await deterministic("DTMToken", {
    //     from: deployer,
    //     log: true,
    //     args: [],
    //     proxy: deployer,
    //     skipIfAlreadyDeployed: true
    // })

    // await deploy()

    console.log("deployer", deployer)
    let instance = (await ethers.getContractAt(
        "DTMToken", 
        (await deployments.get("DTMToken")).address
    ))

    console.log('contract owner', await instance.owner())

}

export default func
func.tags=["DTMToken"]
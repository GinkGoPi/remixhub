import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { ethers } from "hardhat"


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    await deploy("ErrorCvxCrvLev", {
        from: deployer,
        args: [
            [
                '0x5f98805a4e8be255a32880fdec7f6728c6568ba0',  // lusd
                '0x853d955acef822db058eb8505911ed77f175b99e',  // usdc
                '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',  // 3crv
                '0xd632f22692fac7611d2aa1c0d552930d43caed3b',  // cvxFrax3Crv
            ],
            [
                '0xd632f22692fac7611d2aa1c0d552930d43caed3b',  // frax3pool
                '0xed279fdd11ca84beef15af5d39bb4d4bee23f0ca',  // lusd3pool
            ]
        ],
        log: true,
        gasLimit: 2e7,
        skipIfAlreadyDeployed: true
    })

}

export default func
func.tags = ["ErrorCvxCrvLev"]

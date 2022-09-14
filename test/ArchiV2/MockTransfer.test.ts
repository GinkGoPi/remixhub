import { expect } from "chai"
import {ethers, deployments, getNamedAccounts} from 'hardhat'


describe("contract", () => {
    let deployer: any, owner: any, bob : any
    let USDAMock: any
    let collateralToken: any
    let vaultContract: any

    const setupTest = deployments.createFixture(
        async ({ deployments, ethers }) => {
            // await deployments.fixture(["USDAMock", "Vault"]) 

            const signers = await ethers.getSigners();
            [ deployer, owner, bob ] = signers

            USDAMock = (await ethers.getContractAt(
                "USDAMock", 
                (await deployments.get("USDAMock")).address
            ))

            collateralToken = (await ethers.getContractAt(
                "Cvx3crvMock", 
                (await deployments.get("Cvx3crvMock")).address
            ))

            vaultContract = (await ethers.getContractAt(
                "Vault", 
                (await deployments.get("Vault")).address
            ))
            
            console.log("vault address", vaultContract.address)
            console.log("usda address", USDAMock.address)
            console.log("==> init", await USDAMock.balanceOf(USDAMock.address))

            await USDAMock.faucet(deployer.address, ethers.utils.parseEther('1000'))
            await USDAMock.faucet(vaultContract.address, ethers.utils.parseEther('10000000'))
            
            await collateralToken.faucet(deployer.address, ethers.utils.parseEther('1000'))

            await collateralToken.approve(vaultContract.address, ethers.utils.parseEther('100000'))
            await collateralToken.faucet(vaultContract.address, ethers.utils.parseEther('10000000'))

            await vaultContract.addShare(USDAMock.address, ethers.utils.parseEther('10000000'))
            await vaultContract.addAmount(USDAMock.address, ethers.utils.parseEther('10000000'))
        }
    )

    beforeEach(async () => {
        await setupTest()
    })

    describe("get functions", () => {
        it("get", async () => {
            console.log("deployer usda balance", await USDAMock.balanceOf(deployer.address))
            console.log("deployer coll balance", await collateralToken.balanceOf(deployer.address))
            
            let balance = await USDAMock.balanceOf(vaultContract.address)
            console.log("balance", balance)

            console.log("totalShare", await vaultContract.totalShare(USDAMock.address))
            console.log("totalBalance", await vaultContract.totalBalance(USDAMock.address))
        })

    })
})
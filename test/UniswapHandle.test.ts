import { expect } from "chai"
import {ethers, deployments, getNamedAccounts} from 'hardhat'

import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";


describe("contract", () => {
    let deployer: any, owner: any, bob : any
    let contract: any

    const setupTest = deployments.createFixture(
        async ({ deployments, ethers }) => {
            await deployments.fixture(['UniswapExamples']) 

            const signers = await ethers.getSigners();
            [ deployer, owner, bob ] = signers

            contract = (await ethers.getContractAt(
                "UniswapExamples", 
                (await deployments.get("UniswapExamples")).address
            ))
        }
    )

    async function mockBalance() {
        // impersonate
        const address = "0x06601571AA9D3E8f5f7CDd5b993192618964bAB5";
        await impersonateAccount(address);
        const impersonatedSigner = await ethers.getSigner(address);

        console.log(impersonatedSigner.address);

        const token = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
        const abi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}]
        const wETHToken = new ethers.Contract(token, abi, impersonatedSigner);

        console.log("this balance", await wETHToken.balanceOf(contract.address));

        await wETHToken.transfer(contract.address, ethers.utils.parseEther("1"));
        
        console.log("after this balance", await wETHToken.balanceOf(contract.address));
    }

    beforeEach(async () => {
        await setupTest()
    })

    describe("get functions", () => {
        it("get", async () => {
            let balance = await contract.getBalanceOfwETH()
            console.log("wETH init balance", balance)
    
            balance = await contract.getBalanceOfSpell()
            console.log("spell init balance", balance)
        })

        // it("getAmountsOutFromWETH", async () => {
        //     let amount = await contract.getAmountsOutFromWETH(ethers.utils.parseEther('1'))
        //     console.log('swap 1 weth to token', amount)
        // })
    })

    // describe("swap v2 wETH to token", () => {
    //     it("swap", async () => {
    //         await mockBalance()
    //         console.log("wETH balance", await contract.getBalanceOfwETH())
    //         console.log("spell balance", await contract.getBalanceOfSpell())

    //         await contract.swapViaWETH()
    //         console.log("after wETH balance", await contract.getBalanceOfwETH())
    //         console.log("after spell balance", await contract.getBalanceOfSpell())
    //     })
    // })

    describe("swap v3 wETH to token", () => {
        it("swap", async () => {
            await mockBalance()
            console.log("wETH balance", await contract.getBalanceOfwETH())
            console.log("spell balance", await contract.getBalanceOfSpell())

            await contract.swapExactInputSingle()
            console.log("after wETH balance", await contract.getBalanceOfwETH())
            console.log("after spell balance", await contract.getBalanceOfSpell())
        })
    })
})
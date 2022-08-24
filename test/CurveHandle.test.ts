import { expect } from "chai"
import {ethers, deployments, getNamedAccounts} from 'hardhat'

import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";

// import { CurveHandle } from '../build/typechain'


describe("contract", () => {
    let deployer: any, owner: any, bob : any
    let contract: any

    const setupTest = deployments.createFixture(
        async ({ deployments, ethers }) => {
            await deployments.fixture() 

            const signers = await ethers.getSigners();
            [ deployer, owner, bob ] = signers

            contract = (await ethers.getContractAt(
                "CurveHandle", 
                (await deployments.get("CurveHandle")).address
            ))
        }
    )

    async function mockBalance() {
        // impersonate
        const address = "0xc5ed2333f8a2C351fCA35E5EBAdb2A82F5d254C3";
        await impersonateAccount(address);
        const impersonatedSigner = await ethers.getSigner(address);

        console.log(impersonatedSigner.address);

        const token = "0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3";
        const abi = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_owner","type":"address"},{"indexed":true,"internalType":"address","name":"_spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":true,"internalType":"address","name":"_to","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastMint","outputs":[{"internalType":"uint128","name":"time","type":"uint128"},{"internalType":"uint128","name":"amount","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"clone","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"contract IBentoBoxV1","name":"bentoBox","type":"address"}],"name":"mintToBentoBox","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pendingOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner_","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"},{"internalType":"bool","name":"direct","type":"bool"},{"internalType":"bool","name":"renounce","type":"bool"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}];
        const mimToken = new ethers.Contract(token, abi, impersonatedSigner);

        let balance = await mimToken.balanceOf(impersonatedSigner.address);
        console.log("banker balance", balance);
        console.log("owner balance", await mimToken.balanceOf(owner.address));

        await mimToken.transfer(owner.address, ethers.utils.parseEther("1000"));
        await mimToken.transfer(contract.address, ethers.utils.parseEther("1000"));
        
        console.log("after banker balance", await mimToken.balanceOf(impersonatedSigner.address));
        console.log("after owner balance", await mimToken.balanceOf(owner.address));
    }

    beforeEach(async () => {
        await setupTest()
    })

    describe("get functions", () => {
        it("get", async () => {
            let balance = await contract.getBalanceOfUSDT()
            console.log("USDT init balance", balance)
    
            balance = await contract.getBalanceOfUSDA()
            console.log("USDA init balance", balance)
    
            let price = await contract.getPrice();
            console.log("virtual price", price)

            let minDy = await contract.getMindy(0, 3, ethers.utils.parseEther('1000'))
            console.log("get under dy", minDy)
        })

        it("get part 2", async () => {
            let balance = await contract.getBalanceOfwBTC()
            console.log("wBTC init balance", balance)

            balance = await contract.getBalanceOfwETH()
            console.log("wETH init balance", balance)
        })
    })

    describe("perform", () => {
        it("swap To USDT", async () => {
            await mockBalance()
            console.log("before sourceAsset", await contract.getBalanceOfUSDA())
            console.log("before USDT", await contract.getBalanceOfUSDT())

            await contract.swapToUSDT()
            console.log("exchange sourceAsset", await contract.getBalanceOfUSDA())
            console.log("exchange USDT", await contract.getBalanceOfUSDT())
        })

        it("swap To WBTC", async () => {
            await mockBalance()
            console.log("before sourceAsset", await contract.getBalanceOfUSDA())
            console.log("before USDT", await contract.getBalanceOfUSDT())

            await contract.swapToUSDT()
            console.log("exchange sourceAsset", await contract.getBalanceOfUSDA())
            console.log("exchange USDT", await contract.getBalanceOfUSDT())

            await contract.swapTowBTC()
            console.log("exchange wBTC", await contract.getBalanceOfwBTC())
            console.log("remain USDT", await contract.getBalanceOfUSDT())
        })

        it("swap To wETH", async () => {
            await mockBalance()
            console.log("before sourceAsset", await contract.getBalanceOfUSDA())
            console.log("before USDT", await contract.getBalanceOfUSDT())

            await contract.swapToUSDT()
            console.log("exchange sourceAsset", await contract.getBalanceOfUSDA())
            console.log("exchange USDT", await contract.getBalanceOfUSDT())

            console.log("before wETH balance", await contract.getBalanceOfwETH())
            await contract.swapTowETH(false)
            console.log("exchange wETH", await contract.getBalanceOfwETH())
            console.log("remain USDT", await contract.getBalanceOfUSDT())
        })

        it("swap To ETH", async () => {
            await mockBalance()
            console.log("before sourceAsset", await contract.getBalanceOfUSDA())
            console.log("before USDT", await contract.getBalanceOfUSDT())

            await contract.swapToUSDT()
            console.log("exchange sourceAsset", await contract.getBalanceOfUSDA())
            console.log("exchange USDT", await contract.getBalanceOfUSDT())

            console.log("before wETH balance", await contract.getBalanceOfwETH())
            console.log("before account balance", await ethers.provider.getBalance(contract.address))
            
            // await contract.swapTowETH(true)
            await contract.swapTowETH(true, { gasLimit: 2e7 })
            console.log("after account balance", await ethers.provider.getBalance(contract.address))

            console.log("has wETH", await contract.getBalanceOfwETH())
            console.log("remain USDT", await contract.getBalanceOfUSDT())
        })
    })
})
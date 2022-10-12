import {ethers, deployments, getNamedAccounts} from 'hardhat'

import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";


describe("contract", () => {
    let deployer: any, owner: any, bob : any
    let levContract: any

    const setupTest = deployments.createFixture(
        async ({ deployments, ethers }) => {
            await deployments.fixture(["MIMLevSwapper"]) 

            const signers = await ethers.getSigners();
            [ deployer, owner, bob ] = signers

            levContract = (await ethers.getContractAt(
                "MIMLevSwapper", 
                (await deployments.get("MIMLevSwapper")).address
            ))

            console.log('==> lev contract address', levContract.address)
        }
    )

    async function mockBalance() {
        // mock lusd
        // impersonate
        const address = "0x66017d22b0f8556afdd19fc67041899eb65a21bb";
        await impersonateAccount(address);
        const impersonatedSigner = await ethers.getSigner(address);

        console.log(impersonatedSigner.address);

        const [signer] = await ethers.getSigners();

        const tokenAddr = "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0";
        const ERC20Abi = [
            "function balanceOf(address _owner) external view returns (uint256)",
            "function approve(address _spender, uint256 _amount)",
            "function transfer(address _to, uint256 _value)",
            "function transferFrom(address _from, address _to, uint256 _value)"
        ]

        
        const iface = new ethers.utils.Interface(ERC20Abi);
        const jsonAbi = iface.format(ethers.utils.FormatTypes.json);

        const lusdToken = new ethers.Contract(tokenAddr, jsonAbi, impersonatedSigner);
        

        let amount = ethers.utils.parseEther("1000")

        await lusdToken.transfer(levContract.address, amount);

        let balance = await lusdToken.balanceOf(levContract.address)
        console.log("==> lusd this balance", ethers.utils.formatEther(balance));

        // approve collateral
        const mim3lp3crv = '0x5a6A4D54456819380173272A5E8E9B9904BdF41B'
        const collToken = new ethers.Contract(mim3lp3crv, jsonAbi, signer);

        let collAmount = ethers.utils.parseEther("1000")
        await collToken.approve(levContract.address, collAmount);
        console.log('==> mock approved')
    }

    async function balanceLog() {
        const [signer] = await ethers.getSigners();

        const ERC20Abi = [
            "function balanceOf(address _owner) external view returns (uint256)"
        ]

        let iface = new ethers.utils.Interface(ERC20Abi);
        let jsonAbi = iface.format(ethers.utils.FormatTypes.json);

        let cvxMIM3P3CRV = '0xabB54222c2b77158CC975a2b715a3d703c256F05'
        const cvxLpToken = new ethers.Contract(cvxMIM3P3CRV, jsonAbi, signer);
        let collBalance = await cvxLpToken.balanceOf(levContract.address)
        console.log("-> cvx-lpToken balance", collBalance)

        const RewardAbi = [
            "function balanceOf(address _owner) external view returns (uint256)",
            "function rewards(address _owner) external view returns (uint256)",
            "function earned(address account) external view returns (uint256)"
        ]
        
        iface = new ethers.utils.Interface(RewardAbi);
        jsonAbi = iface.format(ethers.utils.FormatTypes.json);

        let baseRewardAddr = '0xFd5AbF66b003881b88567EB9Ed9c651F14Dc4771'
        const baseReward = new ethers.Contract(baseRewardAddr, jsonAbi, signer);

        let depositAmount = await baseReward.balanceOf(levContract.address)
        console.log("-> deposit lpToken amount", depositAmount)

        let rewardAmount = await baseReward.rewards(levContract.address)
        console.log("-> reward amount", rewardAmount)

        let earnedAmount = await baseReward.earned(levContract.address)
        console.log("-> earned amount", earnedAmount)

    }

    beforeEach(async () => {
        await setupTest()
    })

    describe("op", () => {
        it("deposit", async () => {
            await mockBalance()

            console.log("=== Before deposit ===")
            await balanceLog()

            let amount = ethers.utils.parseEther('10')
            let leverageNum = 2
            await levContract.deposit(amount, leverageNum)

            console.log("=== After deposit ===")
            await balanceLog()
        })

    })
})
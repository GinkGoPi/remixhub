import {ethers, deployments, getNamedAccounts} from 'hardhat'

import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";


describe("contract", () => {
    let deployer: any, owner: any, bob : any
    let swapperContract: any
    let mainContract: any

    const setupTest = deployments.createFixture(
        async ({ deployments, ethers }) => {
            await deployments.fixture() 

            const signers = await ethers.getSigners();
            [ deployer, owner, bob ] = signers

            swapperContract = (await ethers.getContractAt(
                "MIMLevSwapper", 
                (await deployments.get("MIMLevSwapper")).address
            ))

            mainContract = (await ethers.getContractAt(
                "MainToCallSwapper", 
                (await deployments.get("MainToCallSwapper")).address
            ))

            console.log('==> swapperContract address', swapperContract.address)
            console.log("==> main contract", mainContract.address)
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

        await lusdToken.transfer(mainContract.address, amount);

        let balance = await lusdToken.balanceOf(mainContract.address)
        console.log("==> lusd this balance", ethers.utils.formatEther(balance));

        // approve collateral
        const mim3lp3crv = '0x5a6A4D54456819380173272A5E8E9B9904BdF41B'
        const collToken = new ethers.Contract(mim3lp3crv, jsonAbi, signer);

        let collAmount = ethers.utils.parseEther("1000")
        await collToken.approve(swapperContract.address, collAmount);
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
        let collBalance = await cvxLpToken.balanceOf(swapperContract.address)
        console.log("-> cvx-lpToken swapper balance", collBalance)

        let collMain = await cvxLpToken.balanceOf(mainContract.address)
        console.log("-> cvx-lpToken main balance", collMain)

        const RewardAbi = [
            "function balanceOf(address _owner) external view returns (uint256)",
            "function rewards(address _owner) external view returns (uint256)",
            "function earned(address account) external view returns (uint256)"
        ]
        
        iface = new ethers.utils.Interface(RewardAbi);
        jsonAbi = iface.format(ethers.utils.FormatTypes.json);

        let baseRewardAddr = '0xFd5AbF66b003881b88567EB9Ed9c651F14Dc4771'
        const baseReward = new ethers.Contract(baseRewardAddr, jsonAbi, signer);

        let depositAmount = await baseReward.balanceOf(swapperContract.address)
        console.log("-> swap baseWard lpToken amount", depositAmount)
        depositAmount = await baseReward.balanceOf(mainContract.address)
        console.log("-> main baseWard lpToken amount", depositAmount)
        depositAmount = await baseReward.balanceOf(signer.address)
        console.log("-> signer baseWard lpToken amount", depositAmount)

        let rewardAmount = await baseReward.rewards(swapperContract.address)
        console.log("-> swap reward amount", rewardAmount)
        let earnedAmount = await baseReward.earned(swapperContract.address)
        console.log("-> swap earned amount", earnedAmount)

        rewardAmount = await baseReward.rewards(mainContract.address)
        console.log("-> main reward amount", rewardAmount)
        earnedAmount = await baseReward.earned(mainContract.address)
        console.log("-> main earned amount", earnedAmount)
        rewardAmount = await baseReward.rewards(signer.address)
        console.log("-> signer reward amount", rewardAmount)
        earnedAmount = await baseReward.earned(signer.address)
        console.log("-> signer earned amount", earnedAmount)

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
            // await swapperContract.deposit(amount, leverageNum)
            
            const swapStaticTx = await swapperContract.populateTransaction.deposit(
                amount,
                leverageNum,
                {
                    gasLimit: 10000000,
                }
            );
            const swapCallByte = swapStaticTx.data.substr(0, 138);

            console.log("TX", swapCallByte);

            const getCallEncode2 = ethers.utils.defaultAbiCoder.encode(
                ["address", "bytes"],
                [swapperContract.address, swapCallByte]
            );
            
            console.log("cookData", getCallEncode2);

            try {
                const estimateGas = await mainContract.estimateGas.cook(
                0,
                getCallEncode2,
                {
                    value: 0,
                }
                );

                const gasLimit = estimateGas.toString();

                console.log("gasLimit for cook:", gasLimit);

                const result = await mainContract.cook(
                0,
                getCallEncode2,
                {
                    value: 0,
                    gasLimit,
                }
                );

                console.log(result);
            } catch (e) {
                console.log("ERR:", e);
            }

            console.log("=== After deposit ===")
            await balanceLog()
        })

    })
})
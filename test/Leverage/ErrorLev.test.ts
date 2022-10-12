import {ethers, deployments, getNamedAccounts} from 'hardhat'

import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";


describe("contract", () => {
    let deployer: any, owner: any, bob : any
    let levContract: any

    const setupTest = deployments.createFixture(
        async ({ deployments, ethers }) => {
            await deployments.fixture(["ErrorCvxCrvLev"]) 

            const signers = await ethers.getSigners();
            [ deployer, owner, bob ] = signers

            levContract = (await ethers.getContractAt(
                "ErrorCvxCrvLev", 
                (await deployments.get("ErrorCvxCrvLev")).address
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
    }

    beforeEach(async () => {
        await setupTest()
    })

    describe("op", () => {
        it("deposit", async () => {
            await mockBalance()

            let amount = ethers.utils.parseEther('10')
            let leverageNum = 2
            await levContract.deposit(amount, leverageNum)

        })

    })
})
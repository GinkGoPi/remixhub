import { ethers, deployments } from "hardhat"
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";


async function main() {
    const [signer] = await ethers.getSigners()
    console.log("-> signer address", signer.address)

    let USDAToken = (await ethers.getContractAt(
        // "USDA", 
        "MockERC20",
        (await deployments.get("USDA")).address
    ))
    console.log("USDA address", USDAToken.address)

    let amount = ethers.utils.parseEther('200000')
    let usdaBalance = await USDAToken.balanceOf(signer.address)
    if (usdaBalance == 0) {
        await USDAToken.mint(signer.address, amount)
        // await USDAToken.faucet(signer.address, amount)
    }

    const usda3Pool = "0xc8FBb1CCdF2f94Ba01c8B75E0A4FA4c5E1eD6791"
    // const usda3Pool = "0x5a6A4D54456819380173272A5E8E9B9904BdF41B"
    const abi = [
        "function add_liquidity(uint256[2] memory _amounts, uint256 _min_mint_amount) external returns (uint256)",
        "function calc_token_amount(uint256[2] memory _amounts, bool _deposit) external view returns (uint256)",
        "function balanceOf(address _owner) external view returns (uint256)",
        "function get_balances() external view returns (uint256[2] memory)",
        "function symbol() external view returns (string memory)"
    ]

    
    let iface = new ethers.utils.Interface(abi)
    let jsonAbi = iface.format(ethers.utils.FormatTypes.json)

    const metaPool = new ethers.Contract(usda3Pool, jsonAbi, signer)
    const symbol = await metaPool.symbol()
    console.log("usda-3pool symbol", symbol)

    // Deposit Contracts
    const basePoolZap = '0xA79828DF1850E8a3A3064576f380D90aECDD3359'
    let poolZapAbi = [
        "function add_liquidity(address _pool, uint256[4] _deposit_amounts, uint256 _min_mint_amount) external returns (uint256)"
    ]

    iface = new ethers.utils.Interface(poolZapAbi)
    jsonAbi = iface.format(ethers.utils.FormatTypes.json)
    const depositPool = new ethers.Contract(basePoolZap, jsonAbi, signer)

    let erc20Abi = [
        "function approve(address _spender, uint256 _amount)",
        "function balanceOf(address _owner) external view returns (uint256)",
        "function transfer(address _to, uint256 _value)",
        "function transferFrom(address _from, address _to, uint256 _value)"
    ]
    // const erc20Addr = "0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3"
    // const erc20Addr = "0xC66AB83418C20A65C3f8e83B3d11c8C3a6097b6F"
    // iface = new ethers.utils.Interface(erc20Abi)
    // jsonAbi = iface.format(ethers.utils.FormatTypes.json)
    // const ERC20Token = new ethers.Contract(erc20Addr, jsonAbi, signer)
    // await ERC20Token.approve(depositPool.address, amount)

    const dai = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    iface = new ethers.utils.Interface(erc20Abi)
    jsonAbi = iface.format(ethers.utils.FormatTypes.json)
    let daiToken = new ethers.Contract(dai, jsonAbi, signer)
    console.log("--> approve")
    await daiToken.approve(depositPool.address, 0)
    await daiToken.approve(depositPool.address, amount)

    await USDAToken.approve(depositPool.address, amount)

    // usdaBalance = await USDAToken.balanceOf(signer.address)
    let daiBalance = await daiToken.balanceOf(signer.address)
    console.log("--> balance", usdaBalance, daiBalance)
    
    if (daiBalance == 0) {
        let impAddress = '0xF977814e90dA44bFA03b6295A0616a897441aceC'
        await impersonateAccount(impAddress);
        const impersonatedSigner = await ethers.getSigner(impAddress);
        daiToken = new ethers.Contract(dai, jsonAbi, impersonatedSigner)
        let balance = await daiToken.balanceOf(impersonatedSigner.address)
        console.log("imperson dai balance", balance);
        await daiToken.transfer(signer.address, amount)
    }
    console.log("--> add liquidity with Dai", amount)
    await depositPool.add_liquidity(metaPool.address, [amount,amount,0,0], 0, { gasLimit: 1e7 })
    console.log("init add liquidity", await metaPool.balanceOf(signer.address))

    /*
    await USDAToken.approve(metaPool.address, amount)
    console.log("approved")
    let balances: string[2] = await metaPool.get_balances()
    console.log(balances)
    // add_liquidity
    // const expected = await metaPool.calc_token_amount([amount,0], true)
    // console.log("init calc_token_amount", expected)
    // await metaPool.add_liquidity([amount,expected], 0, { gasLimit: 1e7 })
    let lpAmount = await metaPool.balanceOf(signer.address)
    console.log("get USDA-3LP3CRV-f", lpAmount)
    */
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});

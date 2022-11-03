import { ethers, deployments } from 'hardhat'
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";


interface Params {
    token: string;
    from: string;
    to: string;
    amount: Number
}

const parseArguments = (args: Array<string>): Params => {
    if (args.length != 4) throw new Error("Not enough arguments")

    return {
        token: args[0],
        from: args[1],
        to: args[2],
        amount: Number(args[3]),
    }
}

const faucet = async (tokenAddr, from, to, amount ) => {
    // const [signer] = await ethers.getSigners();
    // console.log('--> signer', signer.address)

    // *************
    // ** params ** 
    // MIM3Crv
    // const tokenAddr = "0x5a6A4D54456819380173272A5E8E9B9904BdF41B";
    // const impersonate = "0xe896e539e557BC751860a7763C8dD589aF1698Ce"


    // let to = ""
    // let amount = ethers.utils.parseEther("100")

    if (!from) {
        console.log('[ ERROR ] impersonate must be an address')
        return 
    }

    if (!to) {
        console.log('[ ERROR ] to must be an address')
        return 
    }

    await impersonateAccount(from);
    const impersonatedSigner = await ethers.getSigner(from);

    const erc20Abi = [
        "function balanceOf(address _owner) external view returns (uint256)",
        "function approve(address _spender, uint256 _amount)",
        "function transfer(address _to, uint256 _value)",
        "function transferFrom(address _from, address _to, uint256 _value)",
    ]

    const iface = new ethers.utils.Interface(erc20Abi);
    const jsonAbi = iface.format(ethers.utils.FormatTypes.json);

    const token = new ethers.Contract(tokenAddr, jsonAbi, impersonatedSigner);
    
    let total = await token.balanceOf(from)
    let bal = await token.balanceOf(to)

    if (bal > amount) {
        console.log("[ INFO ] has balance", bal);
        return
    }

    if (total < amount) {
        console.log("[ ERROR ] impersonate's balance not enough")
        return 
    }

    await token.transfer(to, amount, { gasLimit: 1e7 });

    console.log("[ INFO ] after recharge the balance", await token.balanceOf(to));

}   


try {
    const { token, from, to, amount } = parseArguments(process.argv)
    await faucet(token, from, to, amount)
} catch (error: unknown) {
    console.log(error)
}


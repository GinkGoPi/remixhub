import { ethers, deployments } from 'hardhat'
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";


async function main() {
    const [signer] = await ethers.getSigners();
    console.log('--> signer', signer.address)

    // *************
    // ** params ** 
    // MIM3Crv
    const tokenAddr = "0x5a6A4D54456819380173272A5E8E9B9904BdF41B";
    const impersonate = "0xe896e539e557BC751860a7763C8dD589aF1698Ce"


    let to = "0x616b5575060F5F220d43a6CBB115eC7608aaE292"
    let amount = ethers.utils.parseEther("10")


    if (!impersonate) {
        console.log('[ ERROR ] impersonate must be an address')
        return
    }

    await impersonateAccount(impersonate);
    const impersonatedSigner = await ethers.getSigner(impersonate);

    if (to == "") {
        to = signer.address
    }

    const erc20Abi = [
        "function balanceOf(address _owner) external view returns (uint256)",
        "function approve(address _spender, uint256 _amount)",
        "function transfer(address _to, uint256 _value)",
        "function transferFrom(address _from, address _to, uint256 _value)",
    ]

    const iface = new ethers.utils.Interface(erc20Abi);
    const jsonAbi = iface.format(ethers.utils.FormatTypes.json);
    
    // const token = new ethers.Contract(tokenAddr, jsonAbi, signer);
    const token = new ethers.Contract(tokenAddr, jsonAbi, impersonatedSigner);
    
    let total = await token.balanceOf(impersonate)
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

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});


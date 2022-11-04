import { ethers, deployments } from 'hardhat'
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { sign } from 'crypto';


async function main() {
    const [signer, bob] = await ethers.getSigners();
    console.log('--> signer', signer.address)

    // *************
    // ** params ** 
    // MIM3Crv
    const tokenAddr = "0x5a6A4D54456819380173272A5E8E9B9904BdF41B"
    const impersonate = "0xe896e539e557BC751860a7763C8dD589aF1698Ce"

    let amount = ethers.utils.parseEther("100")

    if (!impersonate) {
        console.log('[ ERROR ] impersonate must be an address')
        return
    }

    await impersonateAccount(impersonate);
    const impersonatedSigner = await ethers.getSigner(impersonate);

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

    await token.transfer(signer.address, amount);
    await token.transfer(bob.address, amount);

    console.log("[ INFO ] after alice balance", await token.balanceOf(signer.address));
    console.log("[ INFO ] after bob the balance", await token.balanceOf(bob.address));

}   

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});


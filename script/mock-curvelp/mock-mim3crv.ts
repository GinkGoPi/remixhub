import { ethers } from 'hardhat'

import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";


async function main() {
    // impersonate
    const address = "0x19d623106aa9da781958b360aaf971dcb7c2dc6d";
    await impersonateAccount(address);
    const impersonatedSigner = await ethers.getSigner(address);

    console.log(impersonatedSigner.address);

    const [signer] = await ethers.getSigners();

    const tokenAddr = "0x5a6A4D54456819380173272A5E8E9B9904BdF41B";
    const humanReadableAbi = [
        "function balanceOf(address _owner) external view returns (uint256)",
        "function approve(address _spender, uint256 _amount)",
        "function transfer(address _to, uint256 _value)",
        "function transferFrom(address _from, address _to, uint256 _value)"
    ]

    
    const iface = new ethers.utils.Interface(humanReadableAbi);
    const jsonAbi = iface.format(ethers.utils.FormatTypes.json);

    const token = new ethers.Contract(tokenAddr, jsonAbi, impersonatedSigner);

    let amount = ethers.utils.parseEther("1000")
    await token.transfer(signer.address, amount);

    // await token.approve(impersonatedSigner.address, amount)
    // await token.transferFrom(impersonatedSigner.address, signer.address, amount, {gasLimit: 2e7});
    
    console.log("after this balance", await token.balanceOf(signer.address));
}   

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});


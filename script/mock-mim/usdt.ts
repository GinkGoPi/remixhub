import { ethers, deployments } from 'hardhat'

import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";


async function main() {
    // impersonate
    const address = "0x69166e49d2fd23e4cbea767d7191be423a7733a5";
    await impersonateAccount(address);
    const impersonatedSigner = await ethers.getSigner(address);

    console.log(impersonatedSigner.address);

    const [signer] = await ethers.getSigners();

    const tokenAddr = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    const humanReadableAbi = [
        "function balanceOf(address _owner) external view returns (uint256)",
        "function approve(address _spender, uint256 _amount)",
        "function transfer(address _to, uint256 _value)",
        "function transferFrom(address _from, address _to, uint256 _value)"
    ]

    
    const iface = new ethers.utils.Interface(humanReadableAbi);
    const jsonAbi = iface.format(ethers.utils.FormatTypes.json);

    const token = new ethers.Contract(tokenAddr, jsonAbi, impersonatedSigner);
    
    let balance = await token.balanceOf(impersonatedSigner.address)
    console.log("this balance", balance);

    let amount = 1000000000

    await token.transfer(signer.address, amount, { gasLimit: 1e7 });

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


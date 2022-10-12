import { ethers, deployments } from 'hardhat'

import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";


async function main() {
    // impersonate
    const address = "0x66017d22b0f8556afdd19fc67041899eb65a21bb";
    await impersonateAccount(address);
    const impersonatedSigner = await ethers.getSigner(address);

    console.log(impersonatedSigner.address);

    const [signer] = await ethers.getSigners();

    const tokenAddr = "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0";
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
    console.log("this balance", ethers.utils.formatEther(balance));

    let amount = ethers.utils.parseEther("1000")

    let levContract = (await ethers.getContractAt(
        "MIMLevSwapper", 
        (await deployments.get("MIMLevSwapper")).address
    ))
    await token.transfer(levContract.address, amount);

    // await token.approve(impersonatedSigner.address, amount)
    // await token.transferFrom(impersonatedSigner.address, signer.address, amount, {gasLimit: 2e7});
    
    console.log("after this balance", await token.balanceOf(levContract.address));
}   

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});


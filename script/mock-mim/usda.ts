import { ethers, deployments } from 'hardhat'


async function main() {
    const [signer] = await ethers.getSigners();

    const tokenAddr = "0xC66AB83418C20A65C3f8e83B3d11c8C3a6097b6F";
    const humanReadableAbi = [
        "function balanceOf(address _owner) external view returns (uint256)",
        "function approve(address _spender, uint256 _amount)",
        "function transfer(address _to, uint256 _value)",
        "function transferFrom(address _from, address _to, uint256 _value)",

        "function faucet(address _to, uint256 _amount) external"
    ]

    
    const iface = new ethers.utils.Interface(humanReadableAbi);
    const jsonAbi = iface.format(ethers.utils.FormatTypes.json);

    const token = new ethers.Contract(tokenAddr, jsonAbi, signer);
    
    let balance = await token.balanceOf(signer.address)
    console.log("this balance", ethers.utils.formatEther(balance));

    let amount = ethers.utils.parseEther("10000")

    let levContract = (await ethers.getContractAt(
        "MIM3CrvLevSwapper", 
        (await deployments.get("MIM3CrvLevSwapper")).address
    ))

    await token.faucet(levContract.address, amount);

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


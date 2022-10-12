import { ethers, deployments } from 'hardhat'


async function main() {
    const [signer] = await ethers.getSigners();

    const tokenAddr = "0x5a6A4D54456819380173272A5E8E9B9904BdF41B";
    const ERC20Abi = [
        "function balanceOf(address _owner) external view returns (uint256)",
        "function approve(address _spender, uint256 _amount)",
        "function transfer(address _to, uint256 _value)",
        "function transferFrom(address _from, address _to, uint256 _value)"
    ]

    
    const iface = new ethers.utils.Interface(ERC20Abi);
    const jsonAbi = iface.format(ethers.utils.FormatTypes.json);

    const token = new ethers.Contract(tokenAddr, jsonAbi, signer);

    let levContract = (await ethers.getContractAt(
        "MIMLevSwapper", 
        (await deployments.get("MIMLevSwapper")).address
    ))
    await token.approve(levContract.address, ethers.constants.MaxUint256);

    // transfer mim to contract
    // let mimAddr = "0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3"
    // const token2 = new ethers.Contract(mimAddr, jsonAbi, signer)
    // amount = ethers.utils.parseEther('200')
    // await token2.transfer(spender, amount);

}   

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});


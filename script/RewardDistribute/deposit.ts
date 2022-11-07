import { ethers, deployments } from 'hardhat'


async function approve() {
    const [signer, bob] = await ethers.getSigners();

    let spender = (await deployments.get("RewardDistribute")).address

    const tokenAddr = "0x5a6A4D54456819380173272A5E8E9B9904BdF41B";
    const ERC20Abi = [
        "function balanceOf(address _owner) external view returns (uint256)",
        "function approve(address _spender, uint256 _amount)",
        "function transfer(address _to, uint256 _value)",
        "function transferFrom(address _from, address _to, uint256 _value)"
    ]

    const iface = new ethers.utils.Interface(ERC20Abi);
    const jsonAbi = iface.format(ethers.utils.FormatTypes.json);

    let token = new ethers.Contract(tokenAddr, jsonAbi, signer);

    await token.approve(spender, ethers.constants.MaxUint256);

    token = new ethers.Contract(tokenAddr, jsonAbi, bob);
    await token.approve(spender, ethers.constants.MaxUint256);

    console.log('approved')
}  

async function main() {
    const [signer, bob] = await ethers.getSigners();

    const contract = (await ethers.getContractAt(
        "RewardDistribute", 
        (await deployments.get("RewardDistribute")).address
    ))

    console.log("RewardDistribute address", contract.address)

    await approve();

    let amount = ethers.utils.parseEther('100')
    await contract.connect(signer).depositAndStake(amount)

    await contract.connect(signer).getUserBalance()

    amount = ethers.utils.parseEther('5000')
    await contract.connect(bob).depositAndStake(amount)

    await contract.connect(bob).getUserBalance()

}   

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});


import { ethers, deployments } from 'hardhat'

async function main() {

    const [signer] = await ethers.getSigners();

    const ARCAddress = "0x60B173f06a51F9008509fc9C0824D77Fb7Fb0b43"
    const ERC20Abi = [
        "function balanceOf(address _owner) external view returns (uint256)",
        "function approve(address _spender, uint256 _amount)",
        "function transfer(address _to, uint256 _value)",
        "function transferFrom(address _from, address _to, uint256 _value)",
    ]

    
    let iface = new ethers.utils.Interface(ERC20Abi);
    let jsonAbi = iface.format(ethers.utils.FormatTypes.json);

    const token = new ethers.Contract(ARCAddress, jsonAbi, signer);

    const rewardAddr = "0x3B7bDF725edEF08a95E60754e60837322559a967";
    const rewardAbi = [
        "function queueNewRewards(uint256 _rewards) external"
    ]
    iface = new ethers.utils.Interface(rewardAbi);
    jsonAbi = iface.format(ethers.utils.FormatTypes.json);

    const rewardInstance = new ethers.Contract(rewardAddr, jsonAbi, signer);

    let amount = ethers.utils.parseEther('100')

    await token.transfer(rewardInstance.address, amount, { gasLimit: 1e7 });
    
    await rewardInstance.queueNewRewards(amount)
    
}   

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});


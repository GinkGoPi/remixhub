import { ethers, deployments } from "hardhat"

async function main() {
    const [signer] = await ethers.getSigners()

    const usda3Pool = "0xA77d09743F77052950C4eb4e6547E9665299BecD"
    const abi = [
        "function symbol() external view returns (string memory)",
        "function balanceOf(address _owner) external view returns (uint256)",
        "function get_balances() external view returns (uint256[2] memory)",
        "function get_virtual_price() external view returns (uint256)"
    ]

    
    let iface = new ethers.utils.Interface(abi)
    let jsonAbi = iface.format(ethers.utils.FormatTypes.json)

    const metaPool = new ethers.Contract(usda3Pool, jsonAbi, signer)
    
    // states
    console.log("usda3pool symbol", await metaPool.symbol())
    console.log("usda3pool balances", await metaPool.get_balances())
    console.log("usda3pool balance of signer", await metaPool.balanceOf(signer.address))

    // convex reward
    const RewardAbi = [
        "function balanceOf(address _owner) external view returns (uint256)",
        "function rewards(address _owner) external view returns (uint256)",
        "function earned(address account) external view returns (uint256)"
    ]
    
    iface = new ethers.utils.Interface(RewardAbi);
    jsonAbi = iface.format(ethers.utils.FormatTypes.json);

    let baseRewardAddr = '0xFd5AbF66b003881b88567EB9Ed9c651F14Dc4771'
    const baseReward = new ethers.Contract(baseRewardAddr, jsonAbi, signer);

    let levContract = (await ethers.getContractAt(
        "MIM3CrvLevSwapper", 
        (await deployments.get("MIM3CrvLevSwapper")).address
    ))

    let depositAmount = await baseReward.balanceOf(levContract.address)
    console.log("-> deposit lpToken amount", depositAmount)

    let rewardAmount = await baseReward.rewards(levContract.address)
    console.log("-> reward amount", rewardAmount)

    let earnedAmount = await baseReward.earned(levContract.address)
    console.log("-> earned amount", earnedAmount)
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});
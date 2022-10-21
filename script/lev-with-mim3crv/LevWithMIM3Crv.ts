import {ethers, deployments } from 'hardhat'

// Mock Leverage use USDA
async function main() {
    const [signer] = await ethers.getSigners()

    let levAddr = '0x3fdc08D815cc4ED3B7F69Ee246716f2C8bCD6b07'
    let abi = [
        "function deposit(uint256 _amount, uint256 _leverage) external returns (uint margin, uint coll, uint debt)"
    ]
    let iface = new ethers.utils.Interface(abi)
    let jsonAbi = iface.format(ethers.utils.FormatTypes.json)
    const levContract = new ethers.Contract(levAddr, jsonAbi, signer)

    let amount = ethers.utils.parseEther('100')
    let leverageNum = 2
    
    await levContract.deposit(amount, leverageNum)

    // convex base reward
    const RewardAbi = [
        "function balanceOf(address _owner) external view returns (uint256)",
        "function rewards(address _owner) external view returns (uint256)",
        "function earned(address account) external view returns (uint256)"
    ]
    
    iface = new ethers.utils.Interface(RewardAbi);
    jsonAbi = iface.format(ethers.utils.FormatTypes.json);

    let baseRewardAddr = '0xFd5AbF66b003881b88567EB9Ed9c651F14Dc4771'
    const baseReward = new ethers.Contract(baseRewardAddr, jsonAbi, signer);

    let depositAmount = await baseReward.balanceOf(levContract.address)
    console.log("-> deposit lpToken amount", depositAmount)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});

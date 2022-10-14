import { ethers, deployments } from 'hardhat'

let swapContract = (await ethers.getContractAt(
    "MIMLevSwapper", 
    (await deployments.get("MIMLevSwapper")).address
))

console.log('==> swapContract address', swapContract.address)


async function balanceLog() {
    const [signer] = await ethers.getSigners();

    const ERC20Abi = [
        "function balanceOf(address _owner) external view returns (uint256)"
    ]

    let iface = new ethers.utils.Interface(ERC20Abi);
    let jsonAbi = iface.format(ethers.utils.FormatTypes.json);

    let cvxMIM3P3CRV = '0xabB54222c2b77158CC975a2b715a3d703c256F05'
    const cvxLpToken = new ethers.Contract(cvxMIM3P3CRV, jsonAbi, signer);

    let collBalance = await cvxLpToken.balanceOf(swapContract.address)
    console.log("-> cvx-lpToken balance", collBalance)

    const RewardAbi = [
        "function balanceOf(address _owner) external view returns (uint256)",
        "function rewards(address _owner) external view returns (uint256)",
        "function earned(address account) external view returns (uint256)"
    ]
    
    iface = new ethers.utils.Interface(RewardAbi);
    jsonAbi = iface.format(ethers.utils.FormatTypes.json);

    let baseRewardAddr = '0xFd5AbF66b003881b88567EB9Ed9c651F14Dc4771'
    const baseReward = new ethers.Contract(baseRewardAddr, jsonAbi, signer);

    let depositAmount = await baseReward.balanceOf(swapContract.address)
    console.log("-> deposit lpToken amount", depositAmount)

    let rewardAmount = await baseReward.rewards(swapContract.address)
    console.log("-> reward amount", rewardAmount)

    let earnedAmount = await baseReward.earned(swapContract.address)
    console.log("-> earned amount", earnedAmount)

}

async function main() {
    console.log("=== before ===")
    await balanceLog()

    const [signer, bob] = await ethers.getSigners();

    // const swapperAddr = "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0";
    // const swapperAbi = [
    //     "function deposit(uint256 _amount, uint256 _leverage) external returns (uint margin, uint coll, uint debt)"
    // ]

    // const iface = new ethers.utils.Interface(swapperAbi);
    // const jsonAbi = iface.format(ethers.utils.FormatTypes.json);

    // const swapContract = new ethers.Contract(swapperAddr, jsonAbi, signer);

    const contractInstance = await ethers.getContractAt(
        "MainToCallSwapper", 
        (await deployments.get("MainToCallSwapper")).address
    )

    let inAmount = ethers.utils.parseEther('10')
    const swapStaticTx = await swapContract.populateTransaction.deposit(
        inAmount,
        2,
        {
          gasLimit: 10000000,
        }
    );
    const swapCallByte = swapStaticTx.data.substr(0, 138);

    console.log("TX", swapCallByte);

    //30
    const getCallEncode2 = ethers.utils.defaultAbiCoder.encode(
        ["address", "bytes"],
        [bob.address, swapCallByte]
    );
    
    console.log("cookData", getCallEncode2);

    try {
        const estimateGas = await this.pool.contractInstance.estimateGas.cook(
          0,
          getCallEncode2,
          {
            value: 0,
          }
        );

        const gasLimit = this.gasLimitConst + +estimateGas.toString();

        console.log("gasLimit for cook:", gasLimit);

        const result = await contractInstance.cook(
          0,
          getCallEncode2,
          {
            value: 0,
            gasLimit,
          }
        );

        console.log(result);
    } catch (e) {
        console.log("ERR:", e);
    }

    console.log("=== after ===")
    await balanceLog()

}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});

import { ethers, deployments } from 'hardhat'


async function main() {
    const [signer, bob, chris] = await ethers.getSigners();

    const contract = (await ethers.getContractAt(
        "RewardDistribute", 
        (await deployments.get("RewardDistribute")).address
    ))

    let res = await contract.rewardLength()
    console.log("==> rewards length", res)
    
    await contract.getBalance()

    // console.log("=== signer ===")
    await contract.connect(signer).getUserBalance()

    await contract.connect(bob).getUserBalance()

}   

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});


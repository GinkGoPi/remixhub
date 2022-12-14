import { ethers, deployments } from 'hardhat'


async function main() {
    const [signer, bob, chris] = await ethers.getSigners();

    const contract = (await ethers.getContractAt(
        "RewardDistribute", 
        (await deployments.get("RewardDistribute")).address
    ))

    // let amount = ethers.utils.parseEther('100')
    // await contract.connect(signer).convexUnstake(amount, true, chris.address)

    // await contract.connect(signer).getUserBalance()

    let amountL = ethers.utils.parseEther('5000')
    await contract.connect(bob).convexUnstake(amountL, true, chris.address)

    await contract.connect(bob).getUserBalance()

}   

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});


import { ethers, deployments } from "hardhat"

async function main() {
    const [signer] = await ethers.getSigners();

    let USDAToken = (await ethers.getContractAt(
        // "USDA", 
        "MockERC20",
        (await deployments.get("USDA")).address
    ))
    console.log("USDA address", USDAToken.address)

    const curveFactory = "0x0959158b6040d32d04c301a72cbfd6b39e21c9ae";
    const abi = [
        "function deploy_metapool(address _base_pool, string _name, string _symbol, address _coin, uint256 _A, uint256 _fee) external returns (address)"
    ]

    
    const iface = new ethers.utils.Interface(abi);
    const jsonAbi = iface.format(ethers.utils.FormatTypes.json);

    const factory = new ethers.Contract(curveFactory, jsonAbi, signer);

    const tx = await factory.deploy_metapool(
        '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
        "USD Archimedes",
        "USDA",
        USDAToken.address,
        70,
        4000000
    )

    // error way
    // console.log("deployed usda-3pool address:", await tx.return_value)

    let receipt = await tx.wait()
    // const event = receipt.events.find(events => event.event === 'Transfer');
    // const [owner, spender, value] = event.args;
    const event = receipt.events.find(element => element.logIndex == 3)
    console.log('deployed usda-3pool', event)
    
    // console.log("deployed usda-3pool address", receipt.events)
    // // filter by 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
    // // 0xA77d09743F77052950C4eb4e6547E9665299BecD
    
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});

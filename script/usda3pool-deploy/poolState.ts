import { ethers, deployments } from "hardhat"


const usda3Pool = '0x1e5Acb4f117960A0b0993c3BDF8C6b6eFD933896'

async function main() {
    const [signer] = await ethers.getSigners()

    // const usda3Pool = "0xc8FBb1CCdF2f94Ba01c8B75E0A4FA4c5E1eD6791"

    const abi = [
        "function symbol() external view returns (string memory)",
        "function totalSupply() external view returns (uint256)",
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

    let total = await metaPool.totalSupply()
    console.log("totalSupply", total)

    if (total > 0) {
        console.log("usda3pool virtualPrice", await metaPool.get_virtual_price())

        console.log("usda3pool balance of signer", await metaPool.balanceOf(signer.address))

    }
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});
import { ethers, deployments } from "hardhat"

async function main() {
    const [signer] = await ethers.getSigners()

    let zeroAddress = ethers.constants.AddressZero

    const addr = "0x4E1AaADFCD17Ab8839e3f096E8F8E42330432762"
    const abi = [{"inputs":[],"name":"ARCOracle","outputs":[{"internalType":"contract IOracle","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"BTCOracle","outputs":[{"internalType":"contract IChainlinkOracle","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[3]","name":"_stakesAddr","type":"address[3]"},{"internalType":"address[2]","name":"_rewardsAddr","type":"address[2]"},{"internalType":"address[10]","name":"_trovesAddr","type":"address[10]"},{"internalType":"address","name":"_account","type":"address"}],"name":"getUserAllInfos","outputs":[{"components":[{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"stakedValues","type":"uint256"},{"internalType":"uint256","name":"unlockTime","type":"uint256"},{"internalType":"string","name":"tokenSymbol","type":"string"},{"internalType":"address","name":"tokenAddr","type":"address"}],"internalType":"struct AggUserDataForFrontend.StakeInfo[3]","name":"staking","type":"tuple[3]"},{"internalType":"uint256","name":"totalStakedValue","type":"uint256"},{"components":[{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"string","name":"tokenSymbol","type":"string"},{"internalType":"address","name":"tokenAddr","type":"address"}],"internalType":"struct AggUserDataForFrontend.EarnInfo[2]","name":"earning","type":"tuple[2]"},{"internalType":"uint256","name":"totalRewardsValue","type":"uint256"},{"components":[{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"collValue","type":"uint256"},{"internalType":"uint256","name":"debtValue","type":"uint256"},{"internalType":"uint256","name":"APY","type":"uint256"},{"internalType":"string","name":"tokenSymbol","type":"string"},{"internalType":"address","name":"tokenAddr","type":"address"},{"internalType":"uint256","name":"sysLiquidaRatio","type":"uint256"}],"internalType":"struct AggUserDataForFrontend.BorrowInfo[10]","name":"borrowing","type":"tuple[10]"},{"internalType":"uint256","name":"totalDebtValue","type":"uint256"},{"internalType":"uint256","name":"totalCollsValue","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_priceAddr","type":"address"}],"name":"setARCOracle","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_aggregator","type":"address"}],"name":"setBTCOracle","outputs":[],"stateMutability":"nonpayable","type":"function"}]

    const contract = new ethers.Contract(addr, abi, signer)

    let result = await contract.getUserAllInfos(
        ["0x1fEC0a05365CFe67d4AdC0813a214A0D377e27B6", "0xB2bF03A8B47e40eF2727EeD71CdF8cFD0998d88B", "0x08c3bF52F748e7Ae81474D082961892a1E5fcd0A"],
        ["0x3B7bDF725edEF08a95E60754e60837322559a967", "0xF2744105e42a0B8CD3863866D6aFD5301A9C8A6D"],
        ["0x432BDF3f625B09d18eB5cb04950611b36882114E", zeroAddress, zeroAddress, zeroAddress, zeroAddress,
            zeroAddress, zeroAddress, zeroAddress, zeroAddress, zeroAddress
        ], 
        signer.address
    )

    
    console.log(result)

}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});


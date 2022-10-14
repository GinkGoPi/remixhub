import { ethers } from 'hardhat'

async function main() {
    const [signer] = await ethers.getSigners();
    const zeroAddress = ethers.constants.AddressZero

    const contractAddr = "0xcdfb769544Bf8621D257509B464D6522a015894e";
    const abi = [{"inputs":[{"internalType":"address[2]","name":"_stakesAddr","type":"address[2]"},{"internalType":"address[2]","name":"_rewardsAddr","type":"address[2]"},{"internalType":"address[10]","name":"_trovesAddr","type":"address[10]"},{"internalType":"address","name":"_account","type":"address"}],"name":"getUserAllInfos","outputs":[{"components":[{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"stakedValues","type":"uint256"},{"internalType":"uint256","name":"unlockTime","type":"uint256"},{"internalType":"string","name":"tokenSymbol","type":"string"},{"internalType":"address","name":"tokenAddr","type":"address"}],"internalType":"struct AggUserDataForFrontend.StakeInfo[2]","name":"staking","type":"tuple[2]"},{"internalType":"uint256","name":"totalStakedValue","type":"uint256"},{"components":[{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"string","name":"tokenSymbol","type":"string"},{"internalType":"address","name":"tokenAddr","type":"address"}],"internalType":"struct AggUserDataForFrontend.EarnInfo[2]","name":"earning","type":"tuple[2]"},{"internalType":"uint256","name":"totalRewardsValue","type":"uint256"},{"components":[{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"collValue","type":"uint256"},{"internalType":"uint256","name":"debtValue","type":"uint256"},{"internalType":"uint256","name":"APY","type":"uint256"},{"internalType":"string","name":"tokenSymbol","type":"string"},{"internalType":"address","name":"tokenAddr","type":"address"},{"internalType":"uint256","name":"sysLiquidaRatio","type":"uint256"}],"internalType":"struct AggUserDataForFrontend.BorrowInfo[10]","name":"borrowing","type":"tuple[10]"},{"internalType":"uint256","name":"totalDebtValue","type":"uint256"},{"internalType":"uint256","name":"totalCollsValue","type":"uint256"}],"stateMutability":"view","type":"function"}]

    const contract = new ethers.Contract(contractAddr, abi, signer);

    let userAccount = '0xaDeCCC383AEE91D3C7B06B3Fd0E5cEBebb054c53'
    let troveAddress = '0xf387ed5a43B7ef7B47609309C6992582acc146A0'

    let result = await contract.getUserAllInfos(
        [troveAddress, zeroAddress],
        [zeroAddress, troveAddress],
        [troveAddress, zeroAddress, zeroAddress, zeroAddress, zeroAddress,
         zeroAddress, zeroAddress, zeroAddress, zeroAddress, zeroAddress
        ], 
        userAccount
    );
    console.log("=== all info data ===")
    console.log(result)
}   

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});


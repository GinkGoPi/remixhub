import { ethers } from 'hardhat'


async function main() {
    const [signer] = await ethers.getSigners();

    const tokenAddr = "0xaA73F5D685B626eFC370B2c57472E6086759a1B0";
    const ERC20Abi = [
        "function balanceOf(address _owner) external view returns (uint256)",
        "function approve(address _spender, uint256 _amount)",
        "function transfer(address _to, uint256 _value)",
        "function transferFrom(address _from, address _to, uint256 _value)"
    ]

    
    let iface = new ethers.utils.Interface(ERC20Abi);
    let jsonAbi = iface.format(ethers.utils.FormatTypes.json);

    const token = new ethers.Contract(tokenAddr, jsonAbi, signer);

    let amount = ethers.utils.parseEther("1000")
    let spender = '0x43ed45e565D2B73cAc152B591A2B784fA693857e';
    // await token.approve(spender, amount);

    console.log("after this balance", await token.balanceOf(signer.address));

    // contract
    const contractAddr = "0xf387ed5a43B7ef7B47609309C6992582acc146A0";
    // const Abi = [
    //     "function multiBorrow(address to, uint _inAmount, uint _outAmount) external  returns (uint part, uint share)",
    // ]
    
    // iface = new ethers.utils.Interface(Abi);
    // jsonAbi = iface.format(ethers.utils.FormatTypes.json);
    // const contractInstance = new ethers.Contract(contractAddr, jsonAbi, signer);

    
    const abi = [{"inputs":[{"internalType":"contract IVaultV1","name":"vault_","type":"address"},{"internalType":"contract IERC20","name":"usdaToken_","type":"address"},{"internalType":"contract IERC20","name":"collateralToken_","type":"address"},{"internalType":"contract IOracle","name":"oracle_","type":"address"},{"internalType":"contract ISortedTroves","name":"sortedTroves_","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"accruedAmount","type":"uint256"}],"name":"LogAccrue","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"share","type":"uint256"}],"name":"LogAddCollateral","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"part","type":"uint256"}],"name":"LogBorrow","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"part","type":"uint256"}],"name":"LogRepay","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"share","type":"uint256"}],"name":"LogWithdrawCollateral","type":"event"},{"inputs":[],"name":"APR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"BETA","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"BONUS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"BOOTSTRAP_PERIOD","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"BORROW_OPENING_FEE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DECIMAL_PRECISION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"LIQUIDATION_FEE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"LIQUIDATION_RATIO","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MCR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MINUTE_DECAY_FACTOR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MaxVCR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"REDEMPTION_FEE_FLOOR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SECONDS_IN_ONE_MINUTE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"accrue","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"accrueInfo","outputs":[{"internalType":"uint64","name":"lastAccrued","type":"uint64"},{"internalType":"uint256","name":"feesEarned","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"baseRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"collateral","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"exchangeRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeTo","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getBorrowSaturation","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"getCurrentCR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"getNominalICR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"getPositionHealth","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"}],"name":"getUserStaticInterest","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getVCR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isNormalMode","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"isSolvent","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastFeeOperationTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"users","type":"address[]"},{"internalType":"uint256[]","name":"maxBorrowParts","type":"uint256[]"},{"internalType":"address","name":"to","type":"address"}],"name":"liquidate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"_inAmount","type":"uint256"},{"internalType":"uint256","name":"_outAmount","type":"uint256"}],"name":"multiBorrow","outputs":[{"internalType":"uint256","name":"part","type":"uint256"},{"internalType":"uint256","name":"share","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"oracle","outputs":[{"internalType":"contract IOracle","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_USDAamount","type":"uint256"}],"name":"redeemCollateral","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"_part","type":"uint256"},{"internalType":"uint256","name":"_outAmount","type":"uint256"}],"name":"repay","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newFeeTo","type":"address"}],"name":"setFeeTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"sortedTroves","outputs":[{"internalType":"contract ISortedTroves","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"systemDeploymentTime","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalBorrow","outputs":[{"internalType":"uint256","name":"elastic","type":"uint256"},{"internalType":"uint256","name":"base","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalCollateralShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"updateExchangeRate","outputs":[{"internalType":"bool","name":"updated","type":"bool"},{"internalType":"uint256","name":"rate","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"usdaToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userBorrowPart","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userBorrowPrincipal","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userCollateralShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"vault","outputs":[{"internalType":"contract IVaultV1","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"share","type":"uint256"}],"name":"withdrawCollateral","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawFees","outputs":[],"stateMutability":"nonpayable","type":"function"}]

    const contractInstance = new ethers.Contract(contractAddr, abi, signer);


    try {
        const estimateGas = await contractInstance.estimateGas.multiBorrow(
            signer.address,
            ethers.utils.parseEther('100'),
            ethers.utils.parseEther('50'),
            {
                value: 0,
            }
        );

        const gasLimit = estimateGas.toString();

        console.log("gasLimit for multiBorrow:", gasLimit);

    } catch (e) {
        console.log("gasLimit error:", e);
    }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});


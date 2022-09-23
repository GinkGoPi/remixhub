const { ethers } = require('hardhat')
const { impersonateAccount } = require("@nomicfoundation/hardhat-network-helpers")

const {
    cEthAbi,
    cErcAbi,
    erc20Abi,
    comptrollerAbi,
    priceFeedAbi
} = require('./contracts.json');
const { exit } = require('process');

let assetName = 'DAI'


const main = async () => {
    
    const [signer] = await ethers.getSigners();

    console.log("signer address", signer.address)

    // DAI
    const underlyingAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    const underlying = new ethers.Contract(underlyingAddress, erc20Abi, signer)

    let myDAIBalance = await underlying.callStatic.balanceOf(signer.address)
    console.log('my DAI balance', myDAIBalance)

    if (myDAIBalance == 0) {
        const address = "0x5D38B4e4783E34e2301A2a36c39a03c45798C4dD";
    
        await impersonateAccount(address);
        const impersonatedSigner = await ethers.getSigner(address);

        console.log(impersonatedSigner.address);
        await underlying.connect(impersonatedSigner).functions.transfer(signer.address, ethers.utils.parseEther('1000'))
        
        myDAIBalance = await underlying.callStatic.balanceOf(signer.address)
        console.log('my DAI balance', myDAIBalance)
    }

    const cEthAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5';
    const cEth = new ethers.Contract(cEthAddress, cEthAbi, signer);
    
    const comptrollerAddress = '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b';
    const comptroller = new ethers.Contract(comptrollerAddress, comptrollerAbi, signer);

    const priceFeedAddress = '0x6d2299c48a8dd07a872fdd0f8233924872ad1071';
    const priceFeed = new ethers.Contract(priceFeedAddress, priceFeedAbi, signer);

    const cTokenAddress = '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643'; // cDai
    const cToken = new ethers.Contract(cTokenAddress, cErcAbi, signer);

    let underlyingAsCollateral = ethers.utils.parseEther('15');

    console.log(`\nApproving ${assetName} to be transferred from your wallet to the c${assetName} contract...\n`);
    const approve = await underlying.approve(cTokenAddress, underlyingAsCollateral);
    await approve.wait(1);

    console.log(`Supplying ${assetName} to the protocol as collateral (you will get c${assetName} in return)...\n`);
    let mint = await cToken.mint(underlyingAsCollateral);
    const mintResult = await mint.wait(1);

    let myCTokenBalance = await cToken.callStatic.balanceOf(signer.address)
    console.log(`c${assetName} balance`, myCTokenBalance)
    // exit(0)
    
    console.log('\nEntering market (via Comptroller contract) for ETH (as collateral)...');
    let markets = [cTokenAddress]; // This is the cToken contract(s) for your collateral
    let enterMarkets = await comptroller.enterMarkets(markets);
    await enterMarkets.wait(1);

    console.log('Calculating your liquid assets in the protocol...');
    let {1:liquidity} = await comptroller.callStatic.getAccountLiquidity(signer.address);
    liquidity = (+liquidity / 1e18).toString();

    console.log(`Fetching the protocol's ${assetName} collateral factor...`);
    let {1:collateralFactor} = await comptroller.callStatic.markets(cTokenAddress);
    collateralFactor = (collateralFactor / 1e18) * 100; // Convert to percent

    console.log(`Fetching ${assetName} price from the price feed...`);
    let underlyingPriceInUsd = await priceFeed.callStatic.price(assetName);
    underlyingPriceInUsd = underlyingPriceInUsd / 1e6; 

    console.log('Fetching borrow rate per block for ETH borrowing...');
    let borrowRate = await cEth.callStatic.borrowRatePerBlock();
    borrowRate = borrowRate / 1e18;

    console.log(`\nYou have ${liquidity} of LIQUID assets (worth of USD) pooled in the protocol.`);
    console.log(`You can borrow up to ${collateralFactor}% of your TOTAL assets supplied to the protocol as ETH.`);
    console.log(`1 ${assetName} == ${underlyingPriceInUsd.toFixed(6)} USD`);
    console.log(`You can borrow up to ${liquidity} USD worth of assets from the protocol.`);
    console.log(`NEVER borrow near the maximum amount because your account will be instantly liquidated.`);
    console.log(`\nYour borrowed amount INCREASES (${borrowRate} * borrowed amount) ETH per block.\nThis is based on the current borrow rate.`);

    // Let's try to borrow 0.002 ETH (or another amount far below the borrow limit)
    const ethToBorrow = 0.002;
    console.log(`\nNow attempting to borrow ${ethToBorrow} ETH...`);
    const borrow = await cEth.borrow(ethers.utils.parseEther(ethToBorrow.toString()));
    const borrowResult = await borrow.wait(1);

    console.log('\nFetching your ETH borrow balance from cETH contract...');
    let balance = await cEth.callStatic.borrowBalanceCurrent(signer.address);
    balance = balance / 1e18; // because DAI is a 1e18 scaled token.
    console.log(`Borrow balance is ${balance} ETH`);

    console.log(`\nThis part is when you do something with those borrowed assets!\n`);

    console.log(`Now repaying the borrow...`);

    const ethToRepay = ethToBorrow;
    const repayBorrow = await cEth.repayBorrow({
        value: ethers.utils.parseEther(ethToRepay.toString())
    });
    const repayBorrowResult = await repayBorrow.wait(1);

    // balance = await cEth.callStatic.borrowBalanceCurrent(signer.address);
    balance = await cEth.callStatic.balanceOf(signer.address);
    console.log(`after repay balance is ${ethers.utils.formatEther(balance)} ETH`);
}


main().catch(console.error)

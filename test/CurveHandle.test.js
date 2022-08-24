const { expect } = require("chai");
const { ethers } = require("hardhat");
const { helpers, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");


const abi = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_owner","type":"address"},{"indexed":true,"internalType":"address","name":"_spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":true,"internalType":"address","name":"_to","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastMint","outputs":[{"internalType":"uint128","name":"time","type":"uint128"},{"internalType":"uint128","name":"amount","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"clone","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"contract IBentoBoxV1","name":"bentoBox","type":"address"}],"name":"mintToBentoBox","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pendingOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner_","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"},{"internalType":"bool","name":"direct","type":"bool"},{"internalType":"bool","name":"renounce","type":"bool"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}];

describe("Curve handle", () => {
    let owner, alice, bob
    let deployed

    async function deployToken() {
        [owner, bob] = await ethers.getSigners();
        console.log(owner.address);

        // deploy
        Deployed = await ethers.getContractFactory("CurveHandle")
        deployed = await Deployed.deploy()
        console.log("deployed", deployed.address)

        // impersonate
        const address = "0xc5ed2333f8a2C351fCA35E5EBAdb2A82F5d254C3";
        await helpers.impersonateAccount(address);
        const impersonatedSigner = await ethers.getSigner(address);

        console.log(impersonatedSigner.address);

        const token = "0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3";
        const mimToken = new ethers.Contract(token, abi, impersonatedSigner);

        balance = await mimToken.balanceOf(impersonatedSigner.address);
        console.log("banker balance", balance);
        console.log("owner balance", await mimToken.balanceOf(owner.address));

        await mimToken.transfer(owner.address, ethers.utils.parseEther("1000"));
        await mimToken.transfer(deployed.address, ethers.utils.parseEther("1000"));
        
        console.log("after banker balance", await mimToken.balanceOf(impersonatedSigner.address));
        console.log("after owner balance", await mimToken.balanceOf(owner.address));
    }

    deployToken()

    it("get", async () => {
        balance = await deployed.getBalanceOfUSDT()
        console.log(balance)

        balance = await deployed.getBalanceOfUSDA()
        console.log(balance)

        price = await deployed.getPrice();
        console.log(price)
    })

    it("exchange", async () => {
        await deployed.perform()
        console.log("exchange sourceAsset", await deployed.getBalanceOfUSDA())
        console.log("exchange USDT", await deployed.getBalanceOfUSDT())
    })
})


// async function main() {
//     const [owner, bob] = await ethers.getSigners();
//     console.log(owner.address);

//     // deploy
//     const Deployed = await ethers.getContractFactory("CurveHandle")
//     const deployed = await Deployed.deploy()
//     console.log("deployed", deployed.address)

//     balance = await deployed.getBalanceOfUSDT()
//     console.log(balance)

//     price = await deployed.getPrice();
//     console.log(price)

//     // impersonate
//     const address = "0xc5ed2333f8a2C351fCA35E5EBAdb2A82F5d254C3";
//     await helpers.impersonateAccount(address);
//     const impersonatedSigner = await ethers.getSigner(address);

//     console.log(impersonatedSigner.address);

//     const token = "0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3";
//     const mimToken = new ethers.Contract(token, abi, impersonatedSigner);

//     balance = await mimToken.balanceOf(impersonatedSigner.address);
//     console.log("banker balance", balance);
//     console.log("owner balance", await mimToken.balanceOf(owner.address));

//     await mimToken.transfer(owner.address, ethers.utils.parseEther("1000"));
//     await mimToken.transfer(deployed.address, ethers.utils.parseEther("1000"));
    
//     console.log("after banker balance", await mimToken.balanceOf(impersonatedSigner.address));
//     console.log("after owner balance", await mimToken.balanceOf(owner.address));

//     // approve
//     // await mimToken.approve(, ethers.utils.parseEther("300"));
//     await deployed.perform()
//     console.log("exchange sourceAsset", await deployed.getBalanceOfUSDA())
//     console.log("exchange USDT", await deployed.getBalanceOfUSDT())
// }

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
// });

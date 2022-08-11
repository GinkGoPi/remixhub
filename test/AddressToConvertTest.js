const { ethers } = require("hardhat");

describe("MemoryArray", function () {

    before(async function() {
        blockN = await ethers.provider.getBlockNumber();
        console.log("fork mainnet block height:", blockN.toString());

        signer = await ethers.getSigner();
        console.log("signer address", signer.address);

        AddressToConvert = await ethers.getContractFactory("AddressToConvert");
        contract = await AddressToConvert.deploy();
        console.log("contract deploy:", contract.address);
    });

    it("to uint", async function () {
        res = await contract.toUint(signer.address);
        console.log(res);
    });

    it("to string", async function () {
        res = await contract.toString(signer.address);
        console.log(res);
        console.log(typeof(res));
    });

    it("to bytes", async function () {
        res = await contract.toBytes(signer.address);
        console.log(res);
        console.log(typeof(res));
    });

    it("concat addr and uint", async function () {
        res = await contract.concatAddrUint(signer.address, 0);
        console.log(res);
        console.log(typeof(res));
    });

    it("parse addr and uint", async function () {
        res = await contract.parseAddrUint(signer.address, 0);
        console.log(res);
        console.log(typeof(res));
    });
});
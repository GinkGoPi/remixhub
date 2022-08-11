const { ethers } = require("hardhat");

describe("MemoryArray", function () {

    before(async function() {
        blockN = await ethers.provider.getBlockNumber();
        console.log("fork mainnet block height:", blockN.toString());

        signer = await ethers.getSigner();
        console.log("signer address", signer.address);

        sol = await ethers.getContractFactory("MemoryArray");
        contract = await sol.deploy();
        console.log("contract deploy:", contract.address);
    });

    it("push&get", async function() {
        await contract.pushIn(20);
        await contract.addToDynaArray(20);
        let index = 0;
        dynArrayGet = await contract.getDynaArrayByIndex(index);
        console.log("dyn array get", dynArrayGet);

        fixArrayGet = await contract.getFixArrayByIndex(index);
        console.log("fix array get", fixArrayGet);
    });

    it("struct store&get", async function () {
        let arrs = [1,2,3];
        await contract.storeInStruct(arrs);

        storeArr = await contract.getStoreStructArr();
        console.log("get store array", storeArr);
    });

    it("memory array", async function () {
        let memArr = await contract.memoryArray(3);
        console.log("memory array", memArr);
    });

    it("memoryStructArray", async function () {
        res = await contract.memoryStructArray(3);
        console.log("memory Struct Array", res);
    });

});


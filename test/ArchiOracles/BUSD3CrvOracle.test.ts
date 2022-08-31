import { expect } from "chai"
import { ethers, deployments } from "hardhat"
import BigNumber from "bignumber.js"

// chai.use(solidity)
// const { expect } = chai

describe("Oracle", () => {

    it("get", async function() {
        await deployments.fixture("BUSD3CrvOracle")

        const oracle = await ethers.getContractAt("BUSD3CrvOracle", (await deployments.get("BUSD3CrvOracle")).address)
        let isSuccess: boolean
        let price: BigNumber
        ({0: isSuccess, 1: price} = await oracle.get())
        expect(isSuccess).to.equal(true)
        console.log("Oracle get price", price.toString())
    })
    
})

import { expect } from "chai"
import { ethers, deployments } from "hardhat"
import BigNumber from "bignumber.js"

// chai.use(solidity)
// const { expect } = chai

describe("Oracle", () => {

    it("get", async function() {
        await deployments.fixture("LUSD3CrvOracle")

        const oracle = await ethers.getContractAt("LUSD3CrvOracle", (await deployments.get("LUSD3CrvOracle")).address)
        let isSuccess: boolean
        let price: BigNumber
        ({0: isSuccess, 1: price} = await oracle.get())
        expect(isSuccess).to.equal(true)
        console.log("Oracle get price", price.toString())
    })
    
})

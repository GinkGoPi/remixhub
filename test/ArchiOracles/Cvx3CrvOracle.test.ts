import { expect } from "chai"
import { ethers, deployments } from "hardhat"
import BigNumber from "bignumber.js"

// chai.use(solidity)
// const { expect } = chai

describe("Oracle", () => {

    it("get", async function() {
        await deployments.fixture("Cvx3CrvOracle")

        const oracle = await ethers.getContractAt("Cvx3CrvOracle", (await deployments.get("Cvx3CrvOracle")).address)
        let isSuccess: boolean
        let price: BigNumber
        ({0: isSuccess, 1: price} = await oracle.get())
        expect(isSuccess).to.equal(true)
        console.log("Oracle get price", price.toString())
    })
    
})

import { ethers } from 'hardhat'

async function main() {
    const [signer] = await ethers.getSigners();
    console.log('--> signer', signer.address)

    let value = ethers.utils.parseEther('100')

    let to = "0x616b5575060F5F220d43a6CBB115eC7608aaE292"  // Jason

    let bal = await ethers.provider.getBalance(to)

    if (bal.toBigInt() < 1) {
        await signer.sendTransaction({ to, value})

        console.log("[ INFO ] after send ether", await ethers.provider.getBalance(to))
    } else {
        console.log("[ INFO ] has ether", bal)
    }
}   

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});


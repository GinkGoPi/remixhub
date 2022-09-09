import { ethers, network } from 'hardhat'

async function main() {
    const trace = await network.provider.send("debug_traceTransaction", [
        "0xcb397fe1bcd44974f4a02530cb1b35b437f4244f0a6946e0b3ce967267fd1b1a",
    ]);


    console.log(trace)
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


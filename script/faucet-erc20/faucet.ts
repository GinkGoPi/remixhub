import { ethers } from 'hardhat'

import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";

import * as Commander from "commander";

import { DefaultConf } from './default'


// export default function main(
//     argv: string[],
//     stdout: NodeJS.WritableStream,
//     stderr: NodeJS.WritableStream,
//     exit: (code?: number) => never
// ){
//     let configurit = new Commander.Command();
//     setCommandOptions(program).parse(argv);
// }

let configurit = new Commander.Command();

configurit
    .option("-n, --name", "The ERC20-token name with upper", true)
    .parse(process.argv);


console.log(configurit.name)



// async function faucet() {

//     // impersonate
//     const address = "0x19d623106aa9da781958b360aaf971dcb7c2dc6d";
//     await impersonateAccount(address);
//     const impersonatedSigner = await ethers.getSigner(address);

//     console.log("impersonatedSigner:", impersonatedSigner.address);

//     const [signer] = await ethers.getSigners();

//     const tokenAddr = "0x5a6A4D54456819380173272A5E8E9B9904BdF41B";
//     const erc20Abi = [
//         "function balanceOf(address _owner) external view returns (uint256)",
//         "function approve(address _spender, uint256 _amount)",
//         "function transfer(address _to, uint256 _value)",
//         "function transferFrom(address _from, address _to, uint256 _value)"
//     ]

    
//     const iface = new ethers.utils.Interface(erc20Abi);
//     const abi = iface.format(ethers.utils.FormatTypes.json);

//     const token = new ethers.Contract(tokenAddr, abi, impersonatedSigner);

//     let amount = ethers.utils.parseEther("1000")
//     await token.transfer(signer.address, amount);
    
//     console.log("after this balance", await token.balanceOf(signer.address));
// }   




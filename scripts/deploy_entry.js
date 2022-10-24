// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const hre = require("hardhat");
require("dotenv").config({ path: ".env" });

async function main() {


    const NFTContract = await hre.ethers.getContractFactory("NFT");
    const ContractDeployed = await NFTContract.deploy(ethers.utils.parseEther('0.01'), 1, 1000, 50, 100, 1, "ipfs://bafkreidiopk3fpkkbwce5qaof5dfosit7k57jubwav5ttysjdc2ljcfkeq");

    await ContractDeployed.deployed();

    console.log(
        `Deployed at:  ${ContractDeployed.address}`
    );


    console.log(
        "Verifying contract... "

    );


    await sleep(20000);



    await hre.run("verify:verify", {
        address: ContractDeployed.address,
        constructorArguments: [ethers.utils.parseEther('0.01'), 1, 1000, 50, 100, 1, "ipfs://bafkreidiopk3fpkkbwce5qaof5dfosit7k57jubwav5ttysjdc2ljcfkeq"],
    });
}


function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
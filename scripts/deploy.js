const { ethers } = require("hardhat");
const hre = require("hardhat");
require("dotenv").config({ path: ".env" });

async function main() {


    //get contract factories
    const NFTPuzzleContract = await hre.ethers.getContractFactory("NFTPuzzle");
    const NFTLevel2Contract = await hre.ethers.getContractFactory("Level2Legendary");



    const PuzzleDeployed = await NFTPuzzleContract.deploy("ipfs://bafkreidiopk3fpkkbwce5qaof5dfosit7k57jubwav5ttysjdc2ljcfkeq", "0x6168499c0cffcacd319c818142124b7a15e857ab");
    await PuzzleDeployed.deployed();


    console.log(
        `Deployed Puzzle NFT at:  ${PuzzleDeployed.address}`


    );




    const PuzzleAddress = PuzzleDeployed.address;
    const Level2Deployed = await NFTLevel2Contract.deploy("1000", "1", "50", "ipfs://bafkreigjj73bspq5l7kgcsfgzlateiaj45jmbhl5ri4didhqicdnislx34", PuzzleAddress);
    await Level2Deployed.deployed();


    console.log(
        `Deployed Level 2 at:  ${Level2Deployed.address}`

    );



}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
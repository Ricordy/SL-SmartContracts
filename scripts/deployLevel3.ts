import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
    CoinTest,
    Factory,
    Factory__factory,
    Investment,
    Puzzle,
    Puzzle__factory,
    Level3,
    Level3__factory,
  } from "../typechain-types";


async function main() {
    let     PuzzleContract  :   Puzzle,
            Level3Contract  :   Level3,
            accounts        :   SignerWithAddress[],
            owner           :   SignerWithAddress;

    accounts = await ethers.getSigners();
    owner = accounts[0];
    const   PuzzleFactory = new Puzzle__factory(owner),
            Level3Factory = new Level3__factory(owner);
    

    PuzzleContract = await PuzzleFactory.deploy();
    await PuzzleContract.deployed();
    Level3Contract = await Level3Factory.deploy(PuzzleContract.address);
    await Level3Contract.deployed();

    console.log("Puzzle address: ", PuzzleContract.address)
    console.log("Level3 address: ", Level3Contract.address)


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
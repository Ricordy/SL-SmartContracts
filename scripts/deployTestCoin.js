const hre = require("hardhat");
require("dotenv").config({ path: ".env" });

async function main() {

    //contract factory
    const Contract = await hre.ethers.getContractFactory("CoinTest");

    console.log(
        `Deploying contract`
    );

    //deploy
    const deployed = await Contract.deploy();
    await deployed.deployed();


    console.log(
        `Deployed Puzzle NFT at:  ${deployed.address}`
    );


    console.log(
        "Verifying contract... "

    );


    await sleep(10000);



    await hre.run("verify:verify", {
        address: deployed.address,

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
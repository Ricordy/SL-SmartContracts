const hre = require("hardhat")
import { task } from "hardhat/config";

task("mint", "try to mint 10 tokens").addPositionalParam("address").setAction(async (args) => {
    console.log(args)
});
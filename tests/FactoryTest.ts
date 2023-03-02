import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { describe } from "mocha";
import {
  CoinTest,
  CoinTest__factory,
  Factory,
  Factory__factory,
  Puzzle,
  Puzzle__factory,
} from "../typechain-types";

const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const INVESTMENT_1_AMOUNT = 100000,
      CONTRACT_NUMBER_ID = 1;

describe("Factory Contract Tests", async () => {
  let paymentTokenContract: CoinTest,
    puzzleContract: Puzzle,
    factoryContract: Factory,
    accounts: SignerWithAddress[];

  async function DeployContracts() {
    accounts = await ethers.getSigners();
    const [owner, investor1] = accounts,
      investmentContractFactory = new Factory__factory(owner),
      paymentTokenFactory = new CoinTest__factory(owner),
      puzzleContractFactory = new Puzzle__factory(owner);

    factoryContract = await investmentContractFactory.deploy();
    await factoryContract.deployed();
    paymentTokenContract = await paymentTokenFactory.deploy();
    await paymentTokenContract.deployed();
    puzzleContract = await puzzleContractFactory.deploy(
      factoryContract.address,
      paymentTokenContract.address
    );
    await paymentTokenContract.deployed();

    await factoryContract.setEntryAddress(puzzleContract.address);

    puzzleContract = await puzzleContractFactory.deploy(
      factoryContract.address,
      paymentTokenContract.address
    );
    await puzzleContract.deployed();

    return { factoryContract, paymentTokenContract, investor1 };
  }
  describe("DeployNew function", async () => {
    it("caller must be the owner ", async () => {
      const { factoryContract, paymentTokenContract, investor1 } =
        await loadFixture(DeployContracts);
      await expect(
        factoryContract
          .connect(investor1)
          .deployNew(INVESTMENT_1_AMOUNT, paymentTokenContract.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("Should create a new Investment contract", async () => {
      const { factoryContract } =
        await loadFixture(DeployContracts);
      await expect(factoryContract.deployNew(INVESTMENT_1_AMOUNT, paymentTokenContract.address))
        .to
        .emit(factoryContract , "ContractCreated")
        .withArgs(CONTRACT_NUMBER_ID, anyValue)
    });
    it("Should keep all contracts stored in an array", async () => {
      const { factoryContract } =
        await loadFixture(DeployContracts);
      await factoryContract.deployNew(INVESTMENT_1_AMOUNT, paymentTokenContract.address)
      let lastDeployed = await factoryContract.getLastDeployedContract(),
          newContract  = await factoryContract.deployedContracts(0);
      expect(lastDeployed).to.equal(newContract)
      

    });

  });
});

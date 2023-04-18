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
  SLCore,
  SLCore__factory,
  SLLogics,
  SLLogics__factory,
} from "../typechain-types";

const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const INVESTMENT_1_AMOUNT = 100000,
      CONTRACT_NUMBER_ID = 1,
      ENTRY_BATCH_CAP = 1000,
      ENTRY_BATCH_PRICE = 100;

describe("Factory Contract Tests", async () => {
  let paymentTokenContract: CoinTest,
    puzzleContract: SLCore,
    logicsContract: SLLogics,
    factoryContract: Factory,
    accounts: SignerWithAddress[];

  async function DeployContracts() {
    accounts = await ethers.getSigners();
    const [owner, investor1] = accounts,
      investmentContractFactory = new Factory__factory(owner),
      paymentTokenFactory = new CoinTest__factory(owner),
      puzzleContractFactory = new SLCore__factory(owner),
      logicsContractFactory = new SLLogics__factory(owner);

    factoryContract = await investmentContractFactory.deploy();
    await factoryContract.deployed();
    paymentTokenContract = await paymentTokenFactory.deploy();
    await paymentTokenContract.deployed();
    logicsContract = await logicsContractFactory.deploy(
      factoryContract.address, 
      paymentTokenContract.address
    );
    await logicsContract.deployed();
    puzzleContract = await puzzleContractFactory.deploy(
      factoryContract.address,
      logicsContract.address
    );
    await puzzleContract.deployed();
  
    await factoryContract.setEntryAddress(puzzleContract.address);
    // Allow SLCore to make changes in SLLogics
    await logicsContract.setAllowedContracts(puzzleContract.address, true);
    // Create a new entry batch
    await puzzleContract.generateNewEntryBatch(ENTRY_BATCH_CAP, ENTRY_BATCH_PRICE);
    

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
          .deployNew(INVESTMENT_1_AMOUNT, paymentTokenContract.address, 1)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("Should create a new Investment contract", async () => {
      const { factoryContract } =
        await loadFixture(DeployContracts);
      await expect(factoryContract.deployNew(INVESTMENT_1_AMOUNT, paymentTokenContract.address, 1))
        .to
        .emit(factoryContract , "ContractCreated")
        .withArgs(CONTRACT_NUMBER_ID, anyValue)
    });
    it("Should keep all contracts stored in an array", async () => {
      const { factoryContract } =
        await loadFixture(DeployContracts);
      await factoryContract.deployNew(INVESTMENT_1_AMOUNT, paymentTokenContract.address, 1)
      let lastDeployed = await factoryContract.getLastDeployedContract(1),
          newContract  = await factoryContract.deployedContracts(1,0);
      expect(lastDeployed).to.equal(newContract)
      

    });

  });
});

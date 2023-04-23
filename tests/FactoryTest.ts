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
  Investment,
  Investment__factory,
  SLCore,
  SLCore__factory,
  SLLogics,
  SLLogics__factory,
} from "../typechain-types";

const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const INVESTMENT_1_AMOUNT = 100000,
      CONTRACT_NUMBER_ID = 1,
      ENTRY_BATCH_CAP = 1000,
      ENTRY_BATCH_PRICE = 100,
      INVESTED_LEVEL_1 = 3000,
      INVESTED_LEVEL_2 = 5000,
      INVESTED_LEVEL_3 = 7000,
      ENTRY_TOKEN_URI = "TOKEN_URI";

      function withDecimals(toConvert : number) {
        return toConvert * 10 ** 6;
      }

describe("Factory Contract Tests", async () => {
  let paymentTokenContract: CoinTest,
    puzzleContract: SLCore,
    logicsContract: SLLogics,
    factoryContract: Factory,
    accounts: SignerWithAddress[],
    owner: SignerWithAddress,
    investor1: SignerWithAddress,
    investmentContractLevel1: Investment,
    investmentContractLevel2: Investment,
    investmentContractLevel3: Investment;

  async function DeployContracts() {
    accounts = await ethers.getSigners();
    owner = accounts[0];
    investor1 = accounts[1];
      
    const investmentContractFactory = new Factory__factory(owner),
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
    await puzzleContract.generateNewEntryBatch(ENTRY_BATCH_CAP, ENTRY_BATCH_PRICE, ENTRY_TOKEN_URI);

    return { factoryContract, paymentTokenContract, investor1, puzzleContract, logicsContract };
  }

  async function UserInvestedInAllLevels() {
    const { factoryContract, paymentTokenContract, investor1, puzzleContract, logicsContract } = await loadFixture(DeployContracts);
    await paymentTokenContract.connect(investor1).mint(INVESTED_LEVEL_1+ INVESTED_LEVEL_2 + INVESTED_LEVEL_3 + ENTRY_BATCH_PRICE);

    // approve logics for spending entry price 
    await paymentTokenContract.connect(investor1).approve(logicsContract.address, ENTRY_BATCH_PRICE);
    await puzzleContract.connect(investor1).mintEntry();

    // Make user be in level 3 so he can invest in all contracts
    await puzzleContract.connect(investor1).mintTest(1);
    await puzzleContract.connect(investor1).mintTest(2);
    await puzzleContract.connect(investor1).claimLevel();
    await puzzleContract.connect(investor1).claimLevel();

    // Deploy all contracts
    await factoryContract.deployNew(100000, paymentTokenContract.address, 1);
    await factoryContract.deployNew(200000, paymentTokenContract.address, 2);
    await factoryContract.deployNew(300000, paymentTokenContract.address, 3);
    const investmentFactory = new Investment__factory(owner);
    let deployedInvestmentAddress = await factoryContract.getLastDeployedContract(1);
    investmentContractLevel1 = investmentFactory.attach(deployedInvestmentAddress);
    deployedInvestmentAddress = await factoryContract.getLastDeployedContract(2);
    investmentContractLevel2 = investmentFactory.attach(deployedInvestmentAddress);
    deployedInvestmentAddress = await factoryContract.getLastDeployedContract(3);
    investmentContractLevel3 = investmentFactory.attach(deployedInvestmentAddress);

    // Approve all contracts to spend investor1 tokens
    await paymentTokenContract.connect(investor1).approve(investmentContractLevel1.address, withDecimals(INVESTED_LEVEL_1));
    await paymentTokenContract.connect(investor1).approve(investmentContractLevel2.address, withDecimals(INVESTED_LEVEL_2));
    await paymentTokenContract.connect(investor1).approve(investmentContractLevel3.address, withDecimals(INVESTED_LEVEL_3));

    // Invest in all contracts
    await investmentContractLevel1.connect(investor1).invest(INVESTED_LEVEL_1);
    await investmentContractLevel2.connect(investor1).invest(INVESTED_LEVEL_2);
    await investmentContractLevel3.connect(investor1).invest(INVESTED_LEVEL_3);

    return { investmentContractLevel1, investmentContractLevel2, investmentContractLevel3, factoryContract };


    
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
        .withArgs(CONTRACT_NUMBER_ID, anyValue, 1)
    });
    it("Should be able to deploy contracts from multiple levels", async () => {
      const { factoryContract } =
        await loadFixture(DeployContracts);
        for(let i = 0; i < 3; i++){
          await expect(factoryContract.deployNew(INVESTMENT_1_AMOUNT, paymentTokenContract.address, i+1))
                .to
                .emit(factoryContract , "ContractCreated")
                .withArgs(CONTRACT_NUMBER_ID, anyValue, i+1)
        }
      
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
  describe("Data managment", async () => {
    it("Should be able to retrieve user investment in any level", async () => {
      const { factoryContract } =
        await loadFixture(UserInvestedInAllLevels);
      expect(await factoryContract.getAddressTotalInLevel(investor1.address, 1)).to.be.equal(withDecimals(INVESTED_LEVEL_1));
      expect(await factoryContract.getAddressTotalInLevel(investor1.address, 2)).to.be.equal(withDecimals(INVESTED_LEVEL_2));
      expect(await factoryContract.getAddressTotalInLevel(investor1.address, 3)).to.be.equal(withDecimals(INVESTED_LEVEL_3));
      
    });
    it("Should be able to retrieve user investment in all levels", async () => {
      const { factoryContract } =
      await loadFixture(UserInvestedInAllLevels);
    expect(await factoryContract.getAddressTotal(investor1.address)).to.be.equal(withDecimals(INVESTED_LEVEL_1+INVESTED_LEVEL_2+INVESTED_LEVEL_3));
    });

  });
});

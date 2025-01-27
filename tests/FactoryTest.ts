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
  SLCoreTest,
  SLCoreTest__factory,
  SLLogics,
  SLLogics__factory,
  SLPermissions,
  SLPermissions__factory,
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

function withDecimals(toConvert: number) {
  return toConvert * 10 ** 6;
}

describe("Factory Contract Tests", async () => {
  // Variables
  let puzzleContract: SLCoreTest,
    logicsContract: SLLogics,
    paymentTokenContract: CoinTest,
    paymentTokenContract2: CoinTest,
    factoryContract: Factory,
    permissionsContract: SLPermissions,
    investmentContractLevel1: Investment,
    investmentContractLevel2: Investment,
    investmentContractLevel3: Investment,
    totalAccounts: number,
    accounts: SignerWithAddress[],
    owner: SignerWithAddress,
    ceo: SignerWithAddress,
    cfo: SignerWithAddress,
    investor1: SignerWithAddress,
    investor2: SignerWithAddress,
    investor3: SignerWithAddress;

  async function deployContractFixture() {
    // Puzzle contract needs Factory and PaymentToken address to be deployed
    // Get all signers
    accounts = await ethers.getSigners();
    totalAccounts = accounts.length;

    // Assign used accounts from all signers
    [owner, investor1, investor2, investor3] = accounts;
    ceo = accounts[9];
    cfo = accounts[10];
    const paymentTokenContractFactory = new CoinTest__factory(owner);
    const permissionsContractFacotry = new SLPermissions__factory(owner);
    const puzzleContractFactory = new SLCoreTest__factory(owner);
    const logicsContractFactory = new SLLogics__factory(owner);
    const factoryContractFactory = new Factory__factory(owner);
    // Deploy PaymentToken (CoinTest) contract from the factory
    paymentTokenContract = await paymentTokenContractFactory.deploy();
    await paymentTokenContract.deployed();

    paymentTokenContract2 = await paymentTokenContractFactory.deploy();
    await paymentTokenContract2.deployed();

    // Deploy PaymentToken (CoinTest) contract from the factory
    permissionsContract = await permissionsContractFacotry.deploy(
      ceo.address,
      cfo.address
    );
    await paymentTokenContract.deployed();

    // Deploy Factory contract from the factory
    factoryContract = await factoryContractFactory.deploy(
      permissionsContract.address
    );
    await factoryContract.deployed();
    //Deploy SLLogics contract
    logicsContract = await logicsContractFactory.deploy(
      factoryContract.address,
      paymentTokenContract.address,
      permissionsContract.address
    );
    await logicsContract.deployed();
    // Deploy Puzzle contract from the factory passing Factory and logics deployed contract addresses
    puzzleContract = await puzzleContractFactory.deploy(
      logicsContract.address,
      permissionsContract.address
    );
    await puzzleContract.deployed();

    // Allow SLCore to make changes in SLLogics
    await permissionsContract
      .connect(ceo)
      .setAllowedContracts(puzzleContract.address, 1);
    // Create a new entry batch
    await puzzleContract
      .connect(ceo)
      .generateNewEntryBatch(
        ENTRY_BATCH_CAP,
        ENTRY_BATCH_PRICE,
        ENTRY_TOKEN_URI
      );

    return {
      owner,
      ceo,
      cfo,
      investor1,
      investor2,
      investor3,
      paymentTokenContract,
      permissionsContract,
      puzzleContract,
      factoryContract,
      logicsContract,
    };
  }
  async function UserInvestedInAllLevels() {
    const {
      factoryContract,
      paymentTokenContract,
      investor1,
      puzzleContract,
      logicsContract,
    } = await loadFixture(slCoreContractSet);
    await paymentTokenContract
      .connect(investor1)
      .mint(
        INVESTED_LEVEL_1 +
          INVESTED_LEVEL_2 +
          INVESTED_LEVEL_3 +
          ENTRY_BATCH_PRICE
      );

    // approve logics for spending entry price
    await paymentTokenContract
      .connect(investor1)
      .approve(logicsContract.address, withDecimals(ENTRY_BATCH_PRICE));
    await puzzleContract.connect(investor1).mintEntry();

    // Make user be in level 3 so he can invest in all contracts
    await puzzleContract.connect(investor1).mintTest(1);
    await puzzleContract.connect(investor1).mintTest(2);
    await puzzleContract.connect(investor1).claimLevel();
    await puzzleContract.connect(investor1).claimLevel();

    // Deploy all contracts
    await factoryContract
      .connect(ceo)
      .deployNew(
        100000,
        paymentTokenContract.address,
        paymentTokenContract2.address,
        1
      );
    await factoryContract
      .connect(ceo)
      .deployNew(
        200000,
        paymentTokenContract.address,
        paymentTokenContract2.address,
        2
      );
    await factoryContract
      .connect(ceo)
      .deployNew(
        300000,
        paymentTokenContract.address,
        paymentTokenContract2.address,
        3
      );
    const investmentFactory = new Investment__factory(owner);
    let deployedInvestmentAddress =
      await factoryContract.getLastDeployedContract(1);
    investmentContractLevel1 = investmentFactory.attach(
      deployedInvestmentAddress
    );
    deployedInvestmentAddress = await factoryContract.getLastDeployedContract(
      2
    );
    investmentContractLevel2 = investmentFactory.attach(
      deployedInvestmentAddress
    );
    deployedInvestmentAddress = await factoryContract.getLastDeployedContract(
      3
    );
    investmentContractLevel3 = investmentFactory.attach(
      deployedInvestmentAddress
    );

    // Approve all contracts to spend investor1 tokens
    await paymentTokenContract
      .connect(investor1)
      .approve(
        investmentContractLevel1.address,
        withDecimals(INVESTED_LEVEL_1)
      );
    await paymentTokenContract
      .connect(investor1)
      .approve(
        investmentContractLevel2.address,
        withDecimals(INVESTED_LEVEL_2)
      );
    await paymentTokenContract
      .connect(investor1)
      .approve(
        investmentContractLevel3.address,
        withDecimals(INVESTED_LEVEL_3)
      );

    // Invest in all contracts
    await investmentContractLevel1
      .connect(investor1)
      .invest(INVESTED_LEVEL_1, paymentTokenContract.address);
    await investmentContractLevel2
      .connect(investor1)
      .invest(INVESTED_LEVEL_2, paymentTokenContract.address);
    await investmentContractLevel3
      .connect(investor1)
      .invest(INVESTED_LEVEL_3, paymentTokenContract.address);

    return {
      investmentContractLevel1,
      investmentContractLevel2,
      investmentContractLevel3,
      factoryContract,
    };
  }
  async function slCoreContractSet() {
    const {
      owner,
      ceo,
      cfo,
      investor1,
      investor2,
      investor3,
      paymentTokenContract,
      puzzleContract,
      factoryContract,
      logicsContract,
    } = await loadFixture(deployContractFixture);
    // Set the Puzzle contract deployed as entry address on Factory contract
    await factoryContract.connect(ceo).setSLCoreAddress(puzzleContract.address);
    return {
      owner,
      ceo,
      cfo,
      investor1,
      investor2,
      investor3,
      paymentTokenContract,
      puzzleContract,
      factoryContract,
      logicsContract,
    };
  }
  async function pausedPlatform() {
    const { ceo, permissionsContract } = await loadFixture(
      deployContractFixture
    );
    await permissionsContract.connect(ceo).pausePlatform();

    return {
      ceo,
      permissionsContract,
    };
  }

  describe("Deploying contract", () => {
    it("Should deploy the contract", async () => {
      const { factoryContract } = await loadFixture(deployContractFixture);
      expect(factoryContract.address).to.not.equal(
        ethers.constants.AddressZero
      );
    });
    it("Should not be deployable if SLPErmissions is passeg as address(0)", async () => {
      const { owner } = await loadFixture(deployContractFixture);
      const factoryContractFactory = new Factory__factory(owner);
      await expect(
        factoryContractFactory.deploy(ethers.constants.AddressZero)
      ).to.be.revertedWithCustomError(factoryContractFactory, "InvalidAddress");
    });
  });
  describe("DeployNew function", async () => {
    it("SLCore address must be AddressZero when calling getLastDeployedContract before deploying a new contract", async () => {
      const { factoryContract } = await loadFixture(deployContractFixture);
      expect(await factoryContract.getLastDeployedContract(1)).to.be.equal(
        ethers.constants.AddressZero
      );
    });
    it("SLCore address must be defined", async () => {
      const { factoryContract, paymentTokenContract, ceo } = await loadFixture(
        deployContractFixture
      );
      await expect(
        factoryContract
          .connect(ceo)
          .deployNew(
            INVESTMENT_1_AMOUNT,
            paymentTokenContract.address,
            paymentTokenContract2.address,
            1
          )
      ).to.be.revertedWithCustomError(factoryContract, "InvalidAddress");
    });
    it("SLCore address must be set only by CEO", async () => {
      const { factoryContract, paymentTokenContract } = await loadFixture(
        deployContractFixture
      );
      await expect(
        factoryContract
          .connect(cfo)
          .setSLCoreAddress(paymentTokenContract.address)
      ).to.be.revertedWithCustomError(factoryContract, "NotCEO");
    });
    it("SLCore address should be changed by CEO", async () => {
      const { factoryContract, puzzleContract } = await loadFixture(
        deployContractFixture
      );
      await factoryContract
        .connect(ceo)
        .setSLCoreAddress(puzzleContract.address);
      expect(await factoryContract.slCoreAddress()).to.be.equal(
        puzzleContract.address
      );
    });
    it("setSLCoreAddress should fail when _slCoreAddress is address(0)", async () => {
      const { factoryContract } = await loadFixture(deployContractFixture);
      await expect(
        factoryContract
          .connect(ceo)
          .setSLCoreAddress(ethers.constants.AddressZero)
      ).to.be.revertedWithCustomError(factoryContract, "InvalidAddress");
    });
    it("Contract should not be globally stopped to call setSLCoreAddress", async () => {
      // Pause the platform
      await loadFixture(pausedPlatform);

      await expect(
        factoryContract.connect(ceo).setSLCoreAddress(puzzleContract.address)
      ).to.be.revertedWithCustomError(factoryContract, "PlatformPaused");
    });
    it("PaymentToken0 address must be different than address(0)", async () => {
      const { factoryContract } = await loadFixture(slCoreContractSet);
      await expect(
        factoryContract
          .connect(ceo)
          .deployNew(
            INVESTMENT_1_AMOUNT,
            ethers.constants.AddressZero,
            paymentTokenContract2.address,
            1
          )
      ).to.be.revertedWithCustomError(factoryContract, "InvalidAddress");
    });
    it("PaymentToken1 address must be different than address(0)", async () => {
      const { factoryContract } = await loadFixture(slCoreContractSet);
      await expect(
        factoryContract
          .connect(ceo)
          .deployNew(
            INVESTMENT_1_AMOUNT,
            paymentTokenContract2.address,
            ethers.constants.AddressZero,
            1
          )
      ).to.be.revertedWithCustomError(factoryContract, "InvalidAddress");
    });
    it("Level must be greater than 0", async () => {
      const { factoryContract, paymentTokenContract, ceo } = await loadFixture(
        slCoreContractSet
      );
      await expect(
        factoryContract
          .connect(ceo)
          .deployNew(
            INVESTMENT_1_AMOUNT,
            paymentTokenContract.address,
            paymentTokenContract2.address,
            0
          )
      ).to.be.revertedWithCustomError(factoryContract, "InvalidLevel");
    });
    it("Level must not be greater than 3", async () => {
      const { factoryContract, paymentTokenContract } = await loadFixture(
        slCoreContractSet
      );
      await expect(
        factoryContract
          .connect(ceo)
          .deployNew(
            INVESTMENT_1_AMOUNT,
            paymentTokenContract.address,
            paymentTokenContract2.address,
            4
          )
      ).to.be.revertedWithCustomError(factoryContract, "InvalidLevel");
    });
    it("caller must be the owner ", async () => {
      const { factoryContract, paymentTokenContract, investor1 } =
        await loadFixture(slCoreContractSet);
      await expect(
        factoryContract
          .connect(investor1)
          .deployNew(
            INVESTMENT_1_AMOUNT,
            paymentTokenContract.address,
            paymentTokenContract2.address,
            1
          )
      ).to.be.revertedWithCustomError(factoryContract, "NotCEO");
    });
    it("Should create a new Investment contract", async () => {
      const { factoryContract } = await loadFixture(slCoreContractSet);
      await expect(
        factoryContract
          .connect(ceo)
          .deployNew(
            INVESTMENT_1_AMOUNT,
            paymentTokenContract.address,
            paymentTokenContract2.address,
            1
          )
      )
        .to.emit(factoryContract, "ContractCreated")
        .withArgs(CONTRACT_NUMBER_ID, anyValue, 1);
    });
    it("Should be able to deploy contracts from multiple levels", async () => {
      const { factoryContract } = await loadFixture(slCoreContractSet);
      for (let i = 0; i < 3; i++) {
        await expect(
          factoryContract
            .connect(ceo)
            .deployNew(
              INVESTMENT_1_AMOUNT,
              paymentTokenContract.address,
              paymentTokenContract2.address,
              i + 1
            )
        )
          .to.emit(factoryContract, "ContractCreated")
          .withArgs(CONTRACT_NUMBER_ID, anyValue, i + 1);
      }
    });
    it("Should keep all contracts stored in an array", async () => {
      const { factoryContract } = await loadFixture(slCoreContractSet);
      await factoryContract
        .connect(ceo)
        .deployNew(
          INVESTMENT_1_AMOUNT,
          paymentTokenContract.address,
          paymentTokenContract2.address,
          1
        );
      let lastDeployed = await factoryContract.getLastDeployedContract(1),
        newContract = await factoryContract.deployedContracts(1, 0);
      expect(lastDeployed).to.equal(newContract);
    });
    it("Contract should not be globally stopped to call deployNew", async () => {
      // Pause the platform
      await loadFixture(pausedPlatform);

      await expect(
        factoryContract
          .connect(ceo)
          .deployNew(
            INVESTMENT_1_AMOUNT,
            paymentTokenContract.address,
            paymentTokenContract2.address,
            1
          )
      ).to.be.revertedWithCustomError(factoryContract, "PlatformPaused");
    });
  });
  describe("Data managment", async () => {
    it("Should be able to retrieve user investment in any level", async () => {
      const { factoryContract } = await loadFixture(UserInvestedInAllLevels);
      expect(
        await factoryContract.getAddressTotalInLevel(investor1.address, 1)
      ).to.be.equal(withDecimals(INVESTED_LEVEL_1));
      expect(
        await factoryContract.getAddressTotalInLevel(investor1.address, 2)
      ).to.be.equal(withDecimals(INVESTED_LEVEL_2));
      expect(
        await factoryContract.getAddressTotalInLevel(investor1.address, 3)
      ).to.be.equal(withDecimals(INVESTED_LEVEL_3));
    });
    it("Should be able to retrieve the total amount invested in the platform", async () => {
      const { factoryContract } = await loadFixture(UserInvestedInAllLevels);
      expect(await factoryContract.getTotalInvestedInPlatform()).to.be.equal(
        withDecimals(INVESTED_LEVEL_1 + INVESTED_LEVEL_2 + INVESTED_LEVEL_3)
      );
    });
    it("Should be able to retrieve user investment in all levels", async () => {
      const { factoryContract } = await loadFixture(UserInvestedInAllLevels);
      expect(
        await factoryContract.getAddressTotal(investor1.address)
      ).to.be.equal(
        withDecimals(INVESTED_LEVEL_1 + INVESTED_LEVEL_2 + INVESTED_LEVEL_3)
      );
    });
    it("Assure that the differed valued are set correctly", async () => {
      const {
        investmentContractLevel1,
        investmentContractLevel2,
        investmentContractLevel3,
      } = await loadFixture(UserInvestedInAllLevels);
      expect(await investmentContractLevel1.CONTRACT_LEVEL()).to.be.equal(1);
      expect(await investmentContractLevel2.CONTRACT_LEVEL()).to.be.equal(2);
      expect(await investmentContractLevel3.CONTRACT_LEVEL()).to.be.equal(3);
    });
  });
});

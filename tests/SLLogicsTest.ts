import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  CoinTest,
  Factory,
  Factory__factory,
  Investment,
  SLCore,
  SLCoreTest,
  SLCoreTest__factory,
  SLCore__factory,
  SLLogics,
  SLLogics__factory,
  SLPermissions,
  SLPermissions__factory,
} from "../typechain-types";
import { Investment__factory } from "../typechain-types/factories/contracts/Investment.sol/Investment__factory";
import { CoinTest__factory } from "../typechain-types/factories/contracts/CoinTest__factory";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const INVESTMENT_1_AMOUNT = 100_000,
  INVES_AMOUNT = 10_000,
  ENTRY_BATCH_CAP = 1_000,
  ENTRY_BATCH_PRICE = 100,
  ENTRY_TOKEN_URI = "TOKEN_URI";

function withDecimals(toConvert: number) {
  return toConvert * 10 ** 6;
}
describe("SLLogics", () => {
  // Variables
  let puzzleContract: SLCoreTest,
    logcisContract: SLLogics,
    paymentTokenContract: CoinTest,
    paymentTokenContract2: CoinTest,
    factoryContract: Factory,
    permissionsContract: SLPermissions,
    totalAccounts: number,
    accounts: SignerWithAddress[],
    owner: SignerWithAddress,
    ceo: SignerWithAddress,
    cfo: SignerWithAddress,
    investor1: SignerWithAddress,
    investor2: SignerWithAddress,
    investor3: SignerWithAddress,
    investmentContract: Investment,
    ownerBalanceBefore: BigNumber,
    baseUriFromContract: string;

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
    const investmentContractFactory = new Investment__factory(owner);
    // Deploy PaymentToken (CoinTest) contract from the factory
    paymentTokenContract = await paymentTokenContractFactory.deploy();
    await paymentTokenContract.deployed();

    // Deploy PaymentToken (CoinTest) contract from the factory
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
    logcisContract = await logicsContractFactory.deploy(
      factoryContract.address,
      paymentTokenContract.address,
      permissionsContract.address
    );
    await logcisContract.deployed();
    // Deploy Puzzle contract from the factory passing Factory and logics deployed contract addresses
    puzzleContract = await puzzleContractFactory.deploy(
      logcisContract.address,
      permissionsContract.address
    );
    await puzzleContract.deployed();
    // Set the Puzzle contract deployed as entry address on Factory contract
    await factoryContract.connect(ceo).setSLCoreAddress(puzzleContract.address);
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

    await paymentTokenContract.connect(investor1).mint(INVESTMENT_1_AMOUNT);
    await paymentTokenContract
      .connect(investor1)
      .approve(logcisContract.address, withDecimals(INVESTMENT_1_AMOUNT));
    await puzzleContract.connect(investor1).mintEntry();

    //Deploy investment contract through factory
    await factoryContract
      .connect(ceo)
      .deployNew(
        INVESTMENT_1_AMOUNT,
        paymentTokenContract.address,
        paymentTokenContract2.address,
        1
      );

    investmentContract = investmentContractFactory.attach(
      await factoryContract.getLastDeployedContract(1)
    );

    await paymentTokenContract
      .connect(investor1)
      .approve(investmentContract.address, withDecimals(INVESTMENT_1_AMOUNT));

    await investmentContract.connect(investor1).invest(INVES_AMOUNT, 0);

    console.log(
      "Investment : ",
      await investmentContract.balanceOf(investor1.address)
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
      logcisContract,
      logicsContractFactory,
    };
  }

  describe("Deployment ", async () => {
    it(" should not accept _factoryAddress as address(0)", async () => {
      const {
        logicsContractFactory,
        paymentTokenContract,
        permissionsContract,
        logcisContract,
      } = await loadFixture(deployContractFixture);
      await expect(
        logicsContractFactory.deploy(
          ethers.constants.AddressZero,
          paymentTokenContract.address,
          permissionsContract.address
        )
      ).to.revertedWithCustomError(logcisContract, "InvalidAddress");
    });
    it(" should not accept _paymentTokenAddress as address(0)", async () => {
      const {
        logicsContractFactory,
        factoryContract,
        permissionsContract,
        logcisContract,
      } = await loadFixture(deployContractFixture);
      await expect(
        logicsContractFactory.deploy(
          factoryContract.address,
          ethers.constants.AddressZero,
          permissionsContract.address
        )
      ).to.revertedWithCustomError(logcisContract, "InvalidAddress");
    });
    it(" should not accept _permissionsAddress as address(0)", async () => {
      const {
        logicsContractFactory,
        factoryContract,
        paymentTokenContract,
        logcisContract,
      } = await loadFixture(deployContractFixture);
      await expect(
        logicsContractFactory.deploy(
          factoryContract.address,
          paymentTokenContract.address,
          ethers.constants.AddressZero
        )
      ).to.revertedWithCustomError(logcisContract, "InvalidAddress");
    });
  });
  describe("Functions ", async () => {
    describe("userAllowedToClaimPiece && _userAllowedToClaimPiece ", async () => {
      it(" should return true if the user can", async () => {
        const { logcisContract } = await loadFixture(deployContractFixture);
        expect(
          await logcisContract.userAllowedToClaimPiece(
            investor1.address,
            1,
            1,
            0
          )
        ).be.true;
      });
      it(" user must be able to call this externally", async () => {
        const { logcisContract } = await loadFixture(deployContractFixture);
        await expect(
          logcisContract.userAllowedToClaimPiece(ceo.address, 1, 2, 1)
        ).to.revertedWithCustomError(logcisContract, "InvalidLevel");
      });
      it(" user cannot mint more than 999 pieces of each level ", async () => {
        const { logcisContract } = await loadFixture(deployContractFixture);
        await expect(
          logcisContract.userAllowedToClaimPiece(ceo.address, 1, 1, 999)
        ).to.revertedWithCustomError(logcisContract, "PiecesLimit");
      });
    });
    describe("getMinClaimAmount ", async () => {
      it(" level cannot be 0", async () => {
        const { logcisContract } = await loadFixture(deployContractFixture);
        await expect(
          logcisContract.getMinClaimAmount(0)
        ).to.revertedWithCustomError(logcisContract, "InvalidLevel");
      });
      it(" level cannot be greater than 3", async () => {
        const { logcisContract } = await loadFixture(deployContractFixture);
        await expect(
          logcisContract.getMinClaimAmount(4)
        ).to.revertedWithCustomError(logcisContract, "InvalidLevel");
      });
    });
  });
});

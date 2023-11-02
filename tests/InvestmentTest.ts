import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  CoinTest,
  Factory,
  Factory__factory,
  Investment,
  SLCore,
  SLCore__factory,
  SLLogics,
  SLLogics__factory,
  SLPermissions,
  SLPermissions__factory,
} from "../typechain-types";
import { Investment__factory } from "../typechain-types/factories/contracts/Investment__factory";
import { CoinTest__factory } from "../typechain-types/factories/contracts/CoinTest__factory";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const INVESTMENT_1_AMOUNT = 100000,
  INVESTMENT_1_MAX_ALLOWED_TO_INVEST = INVESTMENT_1_AMOUNT / 10,
  INVESTMENT_2_AMOUNT = 150000,
  STATUS_PAUSE = 0,
  STATUS_PROGRESS = 1,
  STATUS_PROCESS = 2,
  STATUS_WITHDRAW = 3,
  STATUS_REFUNDING = 4,
  INVESTOR1_INVESTMENT_AMOUNT = 100000,
  GENERAL_ACCOUNT_AMOUNT = 20000,
  GENERAL_INVEST_AMOUNT = 9500,
  GENERAL_INVEST_AMOUNT_TO_REFUND = 10000,
  LESS_THAN_EXPECTED_INV_AMOUNT = 99,
  MORE_THAN_EXPECTED_INV_AMOUNT = INVESTMENT_1_AMOUNT / 2,
  PAYMENT_TOKEN_AMOUNT = 200000,
  PROFIT_RATE = 15,
  REFILL_VALUE =
    INVESTMENT_1_AMOUNT + (INVESTMENT_1_AMOUNT / 100) * PROFIT_RATE,
  ENTRY_BATCH_CAP = 1000,
  ENTRY_BATCH_PRICE = 100,
  ENTRY_TOKEN_URI = "TOKEN_URI";

function withDecimals(toConvert: number) {
  return toConvert * 10 ** 6;
}
describe("Investment Contract Tests", async () => {
  // Variables
  let puzzleContract: SLCore,
    logcisContract: SLLogics,
    paymentTokenContract: CoinTest,
    paymentTokenContract2: CoinTest,
    factoryContract: Factory,
    investmentContract: Investment,
    investmentContract2: Investment,
    permissionsContract: SLPermissions,
    accounts: SignerWithAddress[],
    owner: SignerWithAddress,
    ceo: SignerWithAddress,
    cfo: SignerWithAddress,
    investor1: SignerWithAddress,
    investor2: SignerWithAddress,
    minimunInvestment: BigNumber,
    crucialInvestor: SignerWithAddress;

  async function deployContractFixture() {
    // Puzzle contract needs Factory and PaymentToken address to be deployed
    // Get all signers
    accounts = await ethers.getSigners();

    // Assign used accounts from all signers
    [owner, investor1, investor2] = accounts;
    ceo = accounts[9];
    cfo = accounts[10];
    const paymentTokenContractFactory = new CoinTest__factory(owner);
    const permissionsContractFacotry = new SLPermissions__factory(owner);
    const puzzleContractFactory = new SLCore__factory(owner);
    const logicsContractFactory = new SLLogics__factory(owner);
    const factoryContractFactory = new Factory__factory(owner);
    const investmentContractFactory = new Investment__factory(owner);
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

    //Deploy investment contract through factory
    investmentContract = await investmentContractFactory.deploy(
      INVESTMENT_1_AMOUNT,
      permissionsContract.address,
      puzzleContract.address,
      paymentTokenContract.address,
      paymentTokenContract2.address,
      1
    );
    investmentContract2 = await investmentContractFactory.deploy(
      INVESTMENT_1_AMOUNT,
      permissionsContract.address,
      puzzleContract.address,
      paymentTokenContract.address,
      paymentTokenContract2.address,
      1
    );
    minimunInvestment = await investmentContract.MINIMUM_INVESTMENT();

    return {
      owner,
      ceo,
      investor1,
      investor2,
      accounts,
      paymentTokenContract,
      permissionsContract,
      paymentTokenContract2,
      puzzleContract,
      logcisContract,
      factoryContract,
      investmentContractFactory,
      investmentContract,
      investmentContract2,
      minimunInvestment,
    };
  }
  async function ownerAndInvestorApprovedTokenToSpend() {
    const {
      owner,
      ceo,
      investor1,
      investmentContract,
      paymentTokenContract,
      paymentTokenContract2,
      permissionsContract,
      puzzleContract,
      logcisContract,
      minimunInvestment,
    } = await loadFixture(deployContractFixture);
    await paymentTokenContract.mint(INVESTOR1_INVESTMENT_AMOUNT);
    await paymentTokenContract2.mint(INVESTOR1_INVESTMENT_AMOUNT);
    await paymentTokenContract.approve(
      investmentContract.address,
      withDecimals(INVESTOR1_INVESTMENT_AMOUNT)
    );
    await paymentTokenContract2.approve(
      investmentContract.address,
      withDecimals(INVESTOR1_INVESTMENT_AMOUNT)
    );
    await paymentTokenContract.approve(
      logcisContract.address,
      withDecimals(INVESTOR1_INVESTMENT_AMOUNT)
    );
    await puzzleContract.mintEntry();
    await paymentTokenContract
      .connect(investor1)
      .mint(INVESTOR1_INVESTMENT_AMOUNT);
    await paymentTokenContract2
      .connect(investor1)
      .mint(INVESTOR1_INVESTMENT_AMOUNT);
    await paymentTokenContract
      .connect(investor1)
      .approve(
        investmentContract.address,
        withDecimals(INVESTOR1_INVESTMENT_AMOUNT)
      );
    await paymentTokenContract2
      .connect(investor1)
      .approve(
        investmentContract.address,
        withDecimals(INVESTOR1_INVESTMENT_AMOUNT)
      );
    await paymentTokenContract
      .connect(investor1)
      .approve(
        logcisContract.address,
        withDecimals(INVESTOR1_INVESTMENT_AMOUNT)
      );
    await puzzleContract.connect(investor1).mintEntry();

    return {
      owner,
      ceo,
      investor1,
      permissionsContract,
      investmentContract,
      paymentTokenContract,
      paymentTokenContract2,
      minimunInvestment,
    };
  }
  async function oneInvestCallLeftToFill() {
    const {
      investor1,
      accounts,
      investmentContract,
      logcisContract,
      paymentTokenContract,
      paymentTokenContract2,
      puzzleContract,
    } = await loadFixture(deployContractFixture);

    //MAke 9500 investments on 10 accounts (total of 95.000 invested)
    for (let i = 0; i <= 9; i++) {
      //Mint and Approve fake coin spending
      //Mint fake coin
      await paymentTokenContract
        .connect(accounts[i])
        .mint(GENERAL_ACCOUNT_AMOUNT);
      //Approve fake coin spending
      await paymentTokenContract
        .connect(accounts[i])
        .approve(logcisContract.address, withDecimals(GENERAL_ACCOUNT_AMOUNT));
      await paymentTokenContract
        .connect(accounts[i])
        .approve(
          investmentContract.address,
          withDecimals(GENERAL_ACCOUNT_AMOUNT)
        );
      //Buy NFT Entry for each user
      await puzzleContract.connect(accounts[i]).mintEntry();
      //Make 9500 investment
      await investmentContract
        .connect(accounts[i])
        .invest(GENERAL_INVEST_AMOUNT, 0);

      if (i < 5) {
        //Mint and Approve fake coin spending
        //Mint fake coin
        await paymentTokenContract
          .connect(accounts[i])
          .mint(GENERAL_ACCOUNT_AMOUNT);
        //Approve fake coin spending
        await paymentTokenContract
          .connect(accounts[i])
          .approve(
            investmentContract2.address,
            withDecimals(GENERAL_ACCOUNT_AMOUNT)
          );
        //Make 9500 investment
        await investmentContract2
          .connect(accounts[i])
          .invest(GENERAL_INVEST_AMOUNT, 0);
      } else {
        //Mint and Approve fake coin spending
        //Mint fake coin
        await paymentTokenContract2
          .connect(accounts[i])
          .mint(GENERAL_ACCOUNT_AMOUNT);
        //Approve fake coin spending
        await paymentTokenContract2
          .connect(accounts[i])
          .approve(
            investmentContract2.address,
            withDecimals(GENERAL_ACCOUNT_AMOUNT)
          );
        //Make 9500 investment
        await investmentContract2
          .connect(accounts[i])
          .invest(GENERAL_INVEST_AMOUNT, 1);
      }
    }

    crucialInvestor = accounts[11];

    return {
      investor1,
      investmentContract,
      paymentTokenContract,
      paymentTokenContract2,
      crucialInvestor,
      puzzleContract,
      logcisContract,
    };
  }
  async function ownerAndInvestor1AbleToMintFixture() {
    const { paymentTokenContract, puzzleContract, investmentContract } =
      await loadFixture(deployContractFixture);
    // Mint PaymentTokens to the owner
    await paymentTokenContract.mint(PAYMENT_TOKEN_AMOUNT);
    // Mint PaymentTokens to the investor1
    await paymentTokenContract.connect(investor1).mint(PAYMENT_TOKEN_AMOUNT);
    // Approve Puzzle contract to spend Owner's PaymentTokens
    await paymentTokenContract.approve(
      logcisContract.address,
      withDecimals(PAYMENT_TOKEN_AMOUNT)
    );
    // Approve Puzzle contract to spend Investor1's PaymentTokens
    await paymentTokenContract
      .connect(investor1)
      .approve(logcisContract.address, withDecimals(PAYMENT_TOKEN_AMOUNT));
    return { paymentTokenContract, puzzleContract, investmentContract };
  }
  async function investor1ReadyToClaimNFT() {
    const { paymentTokenContract, puzzleContract, factoryContract } =
      await loadFixture(deployContractFixture);

    // Mint PaymentTokens to investor
    await paymentTokenContract.connect(investor1).mint(PAYMENT_TOKEN_AMOUNT);

    await paymentTokenContract
      .connect(investor1)
      .approve(logcisContract.address, withDecimals(PAYMENT_TOKEN_AMOUNT));

    await puzzleContract.connect(investor1).mintEntry();

    await factoryContract
      .connect(ceo)
      .deployNew(
        INVESTMENT_1_AMOUNT,
        paymentTokenContract.address,
        paymentTokenContract2.address,
        1
      );

    const deployedInvestmentAddress =
      await factoryContract.getLastDeployedContract(1);

    const investmentFactory = new Investment__factory(owner);

    const investmentContract = await investmentFactory.attach(
      deployedInvestmentAddress
    );

    // Allow investment contract to spend
    await paymentTokenContract
      .connect(investor1)
      .approve(
        investmentContract.address,
        withDecimals(INVESTMENT_1_MAX_ALLOWED_TO_INVEST)
      );
    // Invest an amount on investment1
    await investmentContract
      .connect(investor1)
      .invest(INVESTMENT_1_MAX_ALLOWED_TO_INVEST, 0);

    return {
      owner,
      investor1,
      factoryContract,
      deployedInvestmentAddress,
      investmentContract,
      paymentTokenContract,
    };
  }
  async function readyToRefundFixture() {
    const {
      investor1,
      accounts,
      investmentContract,
      paymentTokenContract,
      puzzleContract,
      logcisContract,
    } = await loadFixture(deployContractFixture);

    // Make a 10000 investment on 5 accounts (total of 50.000 invested)
    for (let i = 0; i <= 4; i++) {
      //Mint and Approve fake coin spending
      //Mint fake coin
      await paymentTokenContract
        .connect(accounts[i])
        .mint(GENERAL_ACCOUNT_AMOUNT);
      //Approve fake coin spending
      await paymentTokenContract
        .connect(accounts[i])
        .approve(logcisContract.address, withDecimals(GENERAL_ACCOUNT_AMOUNT));
      await paymentTokenContract
        .connect(accounts[i])
        .approve(
          investmentContract.address,
          withDecimals(GENERAL_ACCOUNT_AMOUNT)
        );
      //Buy NFT Entry for each user
      await puzzleContract.connect(accounts[i]).mintEntry();
      // Make 1000 investment

      await investmentContract
        .connect(accounts[i])
        .invest(GENERAL_INVEST_AMOUNT_TO_REFUND, 0);
    }

    return {
      investor1,
      investmentContract,
      paymentTokenContract,
      puzzleContract,
    };
  }

  describe("When the contract is deployed", async function () {
    it("Should not be bale to deploy passing SLCore Address as address(0)", async () => {
      const {
        investmentContractFactory,
        permissionsContract,
        paymentTokenContract,
        paymentTokenContract2,
      } = await loadFixture(deployContractFixture);
      await expect(
        investmentContractFactory.deploy(
          INVESTMENT_1_AMOUNT,
          permissionsContract.address,
          ethers.constants.AddressZero,
          paymentTokenContract.address,
          paymentTokenContract2.address,
          1
        )
      ).to.be.revertedWithCustomError(factoryContract, "InvalidAddress");
    });
    it("Should ne able to deploy passing paymenttoken0 address as address(0)", async () => {
      const {
        investmentContractFactory,
        puzzleContract,
        permissionsContract,
        paymentTokenContract2,
      } = await loadFixture(deployContractFixture);
      await expect(
        investmentContractFactory.deploy(
          INVESTMENT_1_AMOUNT,
          permissionsContract.address,
          puzzleContract.address,
          ethers.constants.AddressZero,
          paymentTokenContract2.address,
          1
        )
      ).to.be.revertedWithCustomError(factoryContract, "InvalidAddress");
    });
    it("Should ne able to deploy passing paymenttoken1 address as address(0)", async () => {
      const {
        investmentContractFactory,
        puzzleContract,
        permissionsContract,
        paymentTokenContract2,
      } = await loadFixture(deployContractFixture);
      await expect(
        investmentContractFactory.deploy(
          INVESTMENT_1_AMOUNT,
          permissionsContract.address,
          puzzleContract.address,
          paymentTokenContract2.address,
          ethers.constants.AddressZero,
          1
        )
      ).to.be.revertedWithCustomError(factoryContract, "InvalidAddress");
    });
    it("Should set the total Investment", async () => {
      const { investmentContract } = await loadFixture(deployContractFixture);
      const totalInvestment = await investmentContract.TOTAL_INVESTMENT();
      expect(totalInvestment).to.be.equal(withDecimals(INVESTMENT_1_AMOUNT));
    });
    it("Should set the Entry NFT address", async () => {
      const { investmentContract, puzzleContract } = await loadFixture(
        deployContractFixture
      );
      const entryNFTContractAddress = await investmentContract.SLCORE_ADDRESS();
      expect(entryNFTContractAddress).to.be.equal(puzzleContract.address);
    });
    it("Should set the PaymentToken address", async () => {
      const { paymentTokenContract, investmentContract } = await loadFixture(
        deployContractFixture
      );
      // Get the PaymentToken address from the Puzzle contract
      const paymentTokenAddressFromContract =
        await investmentContract.PAYMENT_TOKEN_ADDRESS_0();
      expect(paymentTokenAddressFromContract).to.be.equal(
        paymentTokenContract.address
      );
    });
    it('Should set the status to "progress"', async () => {
      const { investmentContract } = await loadFixture(deployContractFixture);
      const contractStatus = await investmentContract.status();
      expect(contractStatus).to.be.equal(STATUS_PROGRESS);
    });
  });
  describe("STATUS: PROGRESS", async () => {
    it('Should set the status to "progress"', async () => {
      const { investmentContract } = await loadFixture(deployContractFixture);
      const contractStatus = await investmentContract.status();
      expect(contractStatus).to.be.equal(STATUS_PROGRESS);
    });
    it("Not CEO should not be able to change status", async () => {
      const { investmentContract, investor1 } = await loadFixture(
        deployContractFixture
      );
      await expect(
        investmentContract.connect(investor1).changeStatus(STATUS_PAUSE)
      ).to.be.revertedWithCustomError(investmentContract, "NotCEO");
    });
    describe("Invest function", async () => {
      it("Investor without entry nft, are not able to invest", async () => {
        const { investmentContract, investor1 } = await loadFixture(
          deployContractFixture
        );
        await expect(
          investmentContract
            .connect(investor1)
            .invest(LESS_THAN_EXPECTED_INV_AMOUNT, 0)
        ).to.be.revertedWithCustomError(
          investmentContract,
          "IncorrectUserLevel"
        );
      });
      it("Investor should pass the correct payment token to invest into", async () => {
        const { investmentContract, investor1 } = await loadFixture(
          ownerAndInvestorApprovedTokenToSpend
        );
        await expect(
          investmentContract.connect(investor1).invest(INVESTMENT_1_AMOUNT, 2)
        ).to.be.revertedWithCustomError(investmentContract, "InvalidPaymentId");
      });
      it("Investor should not be allowed to invest less than the minimum required", async () => {
        const { investmentContract, investor1 } = await loadFixture(
          ownerAndInvestorApprovedTokenToSpend
        );
        await expect(
          investmentContract
            .connect(investor1)
            .invest(LESS_THAN_EXPECTED_INV_AMOUNT, 0)
        ).to.be.revertedWithCustomError(
          investmentContract,
          "WrongfulInvestmentAmount"
        );
      });
      it("Investor should not be allowed to invest more than 10% of total investment", async () => {
        const { investmentContract, investor1 } = await loadFixture(
          ownerAndInvestorApprovedTokenToSpend
        );

        await expect(
          investmentContract
            .connect(investor1)
            .invest(MORE_THAN_EXPECTED_INV_AMOUNT, 0)
        ).to.be.revertedWithCustomError(
          investmentContract,
          "WrongfulInvestmentAmount"
        );
      });
      it('Status emit event "ContractFilled" and "UserInvested" when we reach the total investment', async () => {
        const { investmentContract } = await loadFixture(
          oneInvestCallLeftToFill
        );
        await paymentTokenContract
          .connect(crucialInvestor)
          .mint(GENERAL_ACCOUNT_AMOUNT);
        await paymentTokenContract
          .connect(crucialInvestor)
          .approve(
            logcisContract.address,
            withDecimals(GENERAL_ACCOUNT_AMOUNT)
          );
        await paymentTokenContract
          .connect(crucialInvestor)
          .approve(
            investmentContract.address,
            withDecimals(GENERAL_ACCOUNT_AMOUNT)
          );

        //Mint NFTEntry for crucialInvestor
        await puzzleContract.connect(crucialInvestor).mintEntry();

        let maxToInvest = await investmentContract.getMaxToInvest();

        maxToInvest = maxToInvest.div(10 ** 6);

        const newTimestamp = new Date().getTime();
        await time.setNextBlockTimestamp(newTimestamp);
        await expect(
          investmentContract.connect(crucialInvestor).invest(maxToInvest, 0)
        )
          .to.emit(investmentContract, "ContractFilled")
          .withArgs(newTimestamp)
          .and.emit(investmentContract, "UserInvest")
          .withArgs(
            crucialInvestor.address,
            maxToInvest,
            newTimestamp,
            paymentTokenContract.address
          );
      });
      it("Investor should be allowed to invest using cointest 0 (first stable)", async () => {
        const { investmentContract, investor1, minimunInvestment } =
          await loadFixture(ownerAndInvestorApprovedTokenToSpend);
        await expect(
          investmentContract.connect(investor1).invest(minimunInvestment, 0)
        )
          .to.emit(investmentContract, "UserInvest")
          .withArgs(
            investor1.address,
            minimunInvestment,
            anyValue,
            paymentTokenContract.address
          );
      });
      it("Investor should be allowed to invest using cointest 1 (second stable)", async () => {
        const { investmentContract, investor1, minimunInvestment } =
          await loadFixture(ownerAndInvestorApprovedTokenToSpend);
        await expect(
          investmentContract.connect(investor1).invest(minimunInvestment, 1)
        )
          .to.emit(investmentContract, "UserInvest")
          .withArgs(
            investor1.address,
            minimunInvestment,
            anyValue,
            paymentTokenContract2.address
          );
      });
      it("Should mint the exact same value of ERC20 tracker token as the amount investment", async () => {
        const { investmentContract, investor1 } = await loadFixture(
          ownerAndInvestorApprovedTokenToSpend
        );
        await investmentContract
          .connect(investor1)
          .invest(INVESTMENT_1_MAX_ALLOWED_TO_INVEST, 0);
        expect(await investmentContract.balanceOf(investor1.address)).to.equal(
          withDecimals(INVESTMENT_1_MAX_ALLOWED_TO_INVEST)
        );
      });
      it("Investor should not be allowed to surpass totalInvestment when investing", async () => {
        const {
          investmentContract,
          crucialInvestor,
          paymentTokenContract,
          puzzleContract,
        } = await loadFixture(oneInvestCallLeftToFill);
        //Min and approve crucialInvestor TestCoin
        await paymentTokenContract
          .connect(crucialInvestor)
          .mint(GENERAL_ACCOUNT_AMOUNT);
        await paymentTokenContract
          .connect(crucialInvestor)
          .approve(
            logcisContract.address,
            withDecimals(GENERAL_ACCOUNT_AMOUNT)
          );
        await paymentTokenContract
          .connect(crucialInvestor)
          .approve(
            investmentContract.address,
            withDecimals(GENERAL_ACCOUNT_AMOUNT)
          );

        //Mint NFTEntry for crucialInvestor
        await puzzleContract.connect(crucialInvestor).mintEntry();

        const contractBalance = await investmentContract.totalContractBalance();

        const maxAllowed = BigNumber.from(
          withDecimals(INVESTMENT_1_AMOUNT)
        ).div(10);
        const remainingToInvest = BigNumber.from(
          withDecimals(INVESTMENT_1_AMOUNT)
        ).sub(contractBalance);
        const maxToInvest = remainingToInvest.gt(maxAllowed)
          ? maxAllowed
          : remainingToInvest;
        //Test user tryign to invest 9500 when there is only 5000 left
        await expect(
          investmentContract
            .connect(crucialInvestor)
            .invest(GENERAL_INVEST_AMOUNT, 0)
        )
          .to.be.revertedWithCustomError(
            investmentContract,
            "WrongfulInvestmentAmount"
          )
          .withArgs(withDecimals(GENERAL_INVEST_AMOUNT), 100, maxToInvest);
      });
    });
    describe("Withdraw && WithdrawSL && Refill", async () => {
      it("Withdraw function shouldnt be able to be called", async () => {
        const { investmentContract, investor1 } = await loadFixture(
          ownerAndInvestorApprovedTokenToSpend
        );
        await expect(
          investmentContract.connect(investor1).withdraw()
        ).to.be.revertedWithCustomError(
          investmentContract,
          "InvalidContractStatus"
        );
      });
      it("WithdrawSL function shouldnt be able to be called", async () => {
        const { investmentContract, owner } = await loadFixture(
          ownerAndInvestorApprovedTokenToSpend
        );
        await expect(
          investmentContract.connect(owner).withdrawSL()
        ).to.be.revertedWithCustomError(
          investmentContract,
          "InvalidContractStatus"
        );
      });
      it("Refill function shouldnt be able to be called", async () => {
        const { investmentContract } = await loadFixture(
          ownerAndInvestorApprovedTokenToSpend
        );
        await expect(
          investmentContract.refill(REFILL_VALUE, PROFIT_RATE)
        ).to.be.revertedWithCustomError(
          investmentContract,
          "InvalidContractStatus"
        );
      });
    });
  });
  describe("STATUS: PROCESS", async () => {
    it('Should set the status to "process"', async () => {
      const { investmentContract } = await loadFixture(oneInvestCallLeftToFill);
      await investmentContract.connect(ceo).changeStatus(STATUS_PROCESS);
      expect(await investmentContract.status()).to.equal(STATUS_PROCESS);
    });
    describe("Function WithdrawSL", async () => {
      beforeEach("set state to process", async () => {
        const { investmentContract, investor1, paymentTokenContract } =
          await loadFixture(oneInvestCallLeftToFill);
        await investmentContract.connect(ceo).changeStatus(STATUS_PROCESS);
        return { investmentContract, investor1, paymentTokenContract };
      });
      it("Investors should not be able to call", async () => {
        await expect(
          investmentContract.connect(investor1).withdrawSL()
        ).to.be.revertedWithCustomError(investmentContract, "NotCFO");
      });
      it("Owner should be able to withdraw all funds and contract balance should be 0", async () => {
        await investmentContract.connect(cfo).withdrawSL();
        expect(
          await paymentTokenContract.balanceOf(investmentContract.address)
        ).to.equal(0);
      });
      it("Owner should be able to withdraw all funds and contract balance of stable coin 0 should be 0", async () => {
        await investmentContract.connect(cfo).withdrawSL();
        expect(
          await paymentTokenContract.balanceOf(investmentContract.address)
        ).to.equal(0);
      });
      it("Owner should be able to withdraw all funds and contract balance of stable coin 1 should be 0", async () => {
        await investmentContract.connect(cfo).withdrawSL();
        expect(
          await paymentTokenContract2.balanceOf(investmentContract.address)
        ).to.equal(0);
      });
      it("Owner's Payment Token balance should be increased by the balance in the contract", async () => {
        const ownerBalanceBeforeWithdraw = await paymentTokenContract.balanceOf(
          cfo.address
        );
        const contractBalance = await investmentContract.totalContractBalance();

        // Withdraw funds
        await investmentContract.connect(cfo).withdrawSL();
        const ownerBalanceAfterWithdraw = await paymentTokenContract.balanceOf(
          cfo.address
        );

        expect(ownerBalanceBeforeWithdraw).to.be.equal(
          ownerBalanceAfterWithdraw.sub(contractBalance)
        );
      });
      it("Owner's Payment Token 0 balance should be increased by its balance on the contract", async () => {
        const ownerBalanceBeforeWithdraw = await paymentTokenContract.balanceOf(
          cfo.address
        );

        const { paymentToken0Balance } =
          await investmentContract.totalContractBalanceForEachPaymentToken();

        // Withdraw funds
        await investmentContract.connect(cfo).withdrawSL();
        const ownerBalanceAfterWithdraw = await paymentTokenContract.balanceOf(
          cfo.address
        );

        expect(ownerBalanceBeforeWithdraw).to.be.equal(
          ownerBalanceAfterWithdraw.sub(paymentToken0Balance)
        );
      });
      it("Owner's Payment Token 1 balance should be increased by its balance on the contract", async () => {
        const ownerBalanceBeforeWithdrawStable2 =
          await paymentTokenContract2.balanceOf(cfo.address);

        const { paymentToken1Balance } =
          await investmentContract.totalContractBalanceForEachPaymentToken();

        // Withdraw funds
        await investmentContract.connect(cfo).withdrawSL();

        const ownerBalanceAfterWithdrawStable2 =
          await paymentTokenContract2.balanceOf(cfo.address);

        expect(ownerBalanceBeforeWithdrawStable2).to.be.equal(
          ownerBalanceAfterWithdrawStable2.sub(paymentToken1Balance)
        );
      });
      it("Should not be called when contract balance is less than 80%", async () => {
        await investmentContract.connect(cfo).withdrawSL();
        await expect(investmentContract.connect(cfo).withdrawSL()).to.be
          .reverted;
      });
    });
    describe("Function Refill", async () => {
      beforeEach("set state to process", async () => {
        const { investmentContract, investor1, paymentTokenContract } =
          await loadFixture(oneInvestCallLeftToFill);
        await paymentTokenContract.connect(cfo).mint(INVESTMENT_1_AMOUNT);
        await paymentTokenContract
          .connect(cfo)
          .approve(
            investmentContract.address,
            withDecimals(INVESTMENT_2_AMOUNT)
          );
        await investmentContract.connect(ceo).changeStatus(STATUS_PROCESS);
        return { investmentContract, investor1, paymentTokenContract };
      });
      it("Investors should not be able to call", async () => {
        await expect(
          investmentContract
            .connect(investor1)
            .refill(REFILL_VALUE, PROFIT_RATE)
        ).to.be.revertedWithCustomError(investmentContract, "NotCFO");
      });
      it("Cannot call function with wrong amount to refill (totalInvestment * profitRate) == amount(refilled) ", async () => {
        await investmentContract.connect(cfo).withdrawSL();
        await expect(
          investmentContract
            .connect(cfo)
            .refill(REFILL_VALUE - 100, PROFIT_RATE)
        ).to.be.revertedWithCustomError(
          investmentContract,
          "IncorrectRefillValue"
        );
      });
      it("Owner should be able to refill contract", async () => {
        await investmentContract.connect(cfo).withdrawSL();
        await expect(
          investmentContract.connect(cfo).refill(REFILL_VALUE, PROFIT_RATE)
        )
          .to.emit(investmentContract, "ContractRefilled")
          .withArgs(REFILL_VALUE, PROFIT_RATE, anyValue);
      });
      it("should set global variable returnProfit = ProfitRate", async () => {
        await investmentContract.connect(cfo).withdrawSL();
        await investmentContract.connect(cfo).refill(REFILL_VALUE, PROFIT_RATE);
        expect(await investmentContract.returnProfit()).to.equal(PROFIT_RATE);
      });
      it('Should change the contract status to "withdraw"', async () => {
        await investmentContract.connect(cfo).withdrawSL();
        await investmentContract.connect(cfo).refill(REFILL_VALUE, PROFIT_RATE);
        expect(await investmentContract.status()).to.equal(STATUS_WITHDRAW);
      });
    });
    describe("Withdraw && Invest", async () => {
      beforeEach("set state to process", async () => {
        const { investmentContract, investor1, paymentTokenContract } =
          await loadFixture(oneInvestCallLeftToFill);
        await paymentTokenContract.connect(cfo).mint(INVESTMENT_1_AMOUNT);
        await paymentTokenContract
          .connect(cfo)
          .approve(
            investmentContract.address,
            withDecimals(INVESTMENT_2_AMOUNT)
          );
        await investmentContract.connect(ceo).changeStatus(STATUS_PROCESS);
        return { investmentContract, investor1, paymentTokenContract };
      });
      it("Withdraw function should be able to be called", async () => {
        await expect(
          investmentContract.connect(investor1).withdraw()
        ).to.be.revertedWithCustomError(
          investmentContract,
          "InvalidContractStatus"
        );
      });
      it("Invest function shouldnt be able to be called", async () => {
        await expect(
          investmentContract.connect(investor1).invest(100, 0)
        ).to.be.revertedWithCustomError(
          investmentContract,
          "InvalidContractStatus"
        );
      });
    });
  });
  describe("STATUS: WITHDRAW", async () => {
    describe("Pre-Withdraw", async () => {
      it("Should be on status WITHDRAW", async () => {
        const { investmentContract } = await loadFixture(deployContractFixture);
        await investmentContract.connect(ceo).changeStatus(STATUS_WITHDRAW);
        const contractStatus = await investmentContract.status();
        expect(contractStatus).to.be.equal(STATUS_WITHDRAW);
      });
      it("Investor should have the Entry NFT", async () => {
        const { investmentContract } = await loadFixture(
          ownerAndInvestor1AbleToMintFixture
        );
        await investmentContract.connect(ceo).changeStatus(STATUS_WITHDRAW);
        await expect(
          investmentContract.connect(investor1).withdraw()
        ).to.be.revertedWithCustomError(
          investmentContract,
          "IncorrectUserLevel"
        );
      });
      it("Investor should have invested at least the minimum amount to be able to withdraw", async () => {
        const { factoryContract, deployedInvestmentAddress } =
          await loadFixture(investor1ReadyToClaimNFT);

        const amountInvested = await factoryContract
          .connect(investor1)
          .getAddressOnContract(deployedInvestmentAddress);

        expect(amountInvested).to.be.greaterThanOrEqual(minimunInvestment);
      });
    });
    describe("After Withdraw", async () => {
      let paymentTokenBalanceBeforeWithdraw: BigNumber,
        amountInvested: BigNumber;
      beforeEach("Make withdraw", async () => {
        const {
          investmentContract,
          crucialInvestor,
          paymentTokenContract,
          puzzleContract,
          logcisContract,
        } = await loadFixture(oneInvestCallLeftToFill);
        //Min and approve crucialInvestor TestCoin
        await paymentTokenContract
          .connect(crucialInvestor)
          .mint(GENERAL_ACCOUNT_AMOUNT);
        await paymentTokenContract
          .connect(crucialInvestor)
          .approve(
            logcisContract.address,
            withDecimals(GENERAL_ACCOUNT_AMOUNT)
          );
        await paymentTokenContract
          .connect(crucialInvestor)
          .approve(
            investmentContract.address,
            withDecimals(GENERAL_ACCOUNT_AMOUNT)
          );

        //Mint NFTEntry for crucialInvestor
        await puzzleContract.connect(crucialInvestor).mintEntry();

        const investmentContractBalance =
          await investmentContract.totalContractBalance();
        const totalInvestment = await investmentContract.TOTAL_INVESTMENT();

        amountInvested = totalInvestment
          .sub(investmentContractBalance)
          .div(10 ** 6);

        // Invest the remaining amount to fill the contract
        await investmentContract
          .connect(crucialInvestor)
          .invest(amountInvested.toNumber(), 0);

        // Change contract status to process
        await investmentContract.connect(ceo).changeStatus(STATUS_PROCESS);
        // Allow owner to withdraw the totalInvestment from the contract
        await paymentTokenContract
          .connect(cfo)
          .approve(investmentContract.address, totalInvestment);

        // Owner withdraw contract funds
        await investmentContract.connect(cfo).withdrawSL();

        // Allow Investment Contract to transfer the totalInvestment + profit
        await paymentTokenContract
          .connect(cfo)
          .approve(investmentContract.address, withDecimals(REFILL_VALUE));

        const ownerBalance = await paymentTokenContract.balanceOf(
          owner.address
        );

        // Add more funds to the owner account to be able to refill
        await paymentTokenContract
          .connect(cfo)
          .mint(
            ethers.BigNumber.from(REFILL_VALUE).sub(ownerBalance.div(10 ** 6))
          );

        // Owner refill the contract
        await investmentContract.connect(cfo).refill(REFILL_VALUE, PROFIT_RATE);

        // Change state to withdraw
        //await investmentContract.changeStatus(STATUS_WITHDRAW);

        paymentTokenBalanceBeforeWithdraw =
          await paymentTokenContract.balanceOf(crucialInvestor.address);
        await investmentContract.connect(crucialInvestor).withdraw();
      });
      it("Investor should receive payment tokens invested + profit", async () => {
        const paymentTokenAfterWithdraw = await paymentTokenContract.balanceOf(
          crucialInvestor.address
        );
        const investorProfit = amountInvested.mul(PROFIT_RATE).div(100);
        expect(paymentTokenAfterWithdraw).to.be.equal(
          paymentTokenBalanceBeforeWithdraw.add(
            amountInvested.mul(10 ** 6).add(investorProfit.mul(10 ** 6))
          )
        );
      });
      it("Investor should not be able to invest after withdraw", async () => {
        const minimunInvestment = await investmentContract.MINIMUM_INVESTMENT();

        await expect(
          investmentContract
            .connect(crucialInvestor)
            .invest(minimunInvestment, 0)
        ).to.be.revertedWithCustomError(
          investmentContract,
          "InvalidContractStatus"
        );
      });
      it("Investor should not be able to withdraw again", async () => {
        await expect(
          investmentContract.connect(crucialInvestor).withdraw()
        ).to.be.revertedWithCustomError(
          investmentContract,
          "CannotWithdrawTwice"
        );
      });
      it("Owner should not be able to withdraw again", async () => {
        await expect(
          investmentContract.withdrawSL()
        ).to.be.revertedWithCustomError(
          investmentContract,
          "InvalidContractStatus"
        );
      });
      it("Owner should not be able to refill again", async () => {
        await expect(
          investmentContract.refill(REFILL_VALUE, PROFIT_RATE)
        ).to.be.revertedWithCustomError(
          investmentContract,
          "InvalidContractStatus"
        );
      });
    });
  });
  describe("STATUS: REFUNDING", async () => {
    describe("Before refunding", async () => {
      it("Should be on status REFUNDING", async () => {
        const { investmentContract } = await loadFixture(readyToRefundFixture);
        await investmentContract.connect(ceo).changeStatus(STATUS_REFUNDING);
        const contractStatus = await investmentContract.status();

        expect(contractStatus).to.be.equal(STATUS_REFUNDING);
      });
    });
    describe("After refunding", async () => {
      beforeEach(async () => {
        const { investmentContract } = await loadFixture(readyToRefundFixture);

        // Change status to refunding
        await investmentContract.connect(ceo).changeStatus(STATUS_REFUNDING);
      });

      it("Investor should receive payment tokens invested", async () => {
        await expect(() =>
          investmentContract.connect(investor1).withdraw()
        ).to.changeTokenBalance(
          paymentTokenContract,
          investor1.address,
          withDecimals(GENERAL_INVEST_AMOUNT_TO_REFUND)
        );
      });
    });
  });
  describe("Platform globally stopped", async function () {
    //Write the testes for all functions of Investment.sol that have the modifier isNotGloballyStopped when the platform is stopped
    it("Should not be able to call invest function", async function () {
      const { investmentContract, permissionsContract, ceo } =
        await loadFixture(ownerAndInvestorApprovedTokenToSpend);
      await permissionsContract.connect(ceo).pausePlatform();
      await expect(
        investmentContract.connect(investor1).invest(100, 0)
      ).to.be.revertedWithCustomError(investmentContract, "PlatformPaused");
    });
    it("Should not be able to call withdraw function", async function () {
      const { investmentContract, permissionsContract, ceo } =
        await loadFixture(ownerAndInvestorApprovedTokenToSpend);
      await investmentContract.connect(ceo).changeStatus(STATUS_WITHDRAW);
      await permissionsContract.connect(ceo).pausePlatform();
      await expect(
        investmentContract.connect(investor1).withdraw()
      ).to.be.revertedWithCustomError(investmentContract, "PlatformPaused");
    });
    it("Should not be able to call withdrawSL function", async function () {
      const { investmentContract, permissionsContract, ceo } =
        await loadFixture(ownerAndInvestorApprovedTokenToSpend);
      await investmentContract.connect(ceo).changeStatus(STATUS_PROCESS);
      await permissionsContract.connect(ceo).pausePlatform();
      await expect(
        investmentContract.connect(cfo).withdrawSL()
      ).to.be.revertedWithCustomError(investmentContract, "PlatformPaused");
    });
    it("Should not be able to call refill function", async function () {
      const { investmentContract, permissionsContract, ceo } =
        await loadFixture(ownerAndInvestorApprovedTokenToSpend);
      await investmentContract.connect(ceo).changeStatus(STATUS_PROCESS);
      await permissionsContract.connect(ceo).pausePlatform();
      await expect(
        investmentContract.refill(REFILL_VALUE, PROFIT_RATE)
      ).to.be.revertedWithCustomError(investmentContract, "PlatformPaused");
    });
  });
  describe("Overriden functions", async function () {
    it("Should revert when calling trasnferFrom", async () => {
      const { investmentContract } = await loadFixture(deployContractFixture);

      await expect(
        investmentContract.transferFrom(
          owner.address,
          investor1.address,
          1000000
        )
      ).to.be.revertedWithCustomError(investmentContract, "NotAccessable");
    });
    it("Should revert when calling trasnfer", async () => {
      const { investmentContract } = await loadFixture(deployContractFixture);

      await expect(
        investmentContract.transfer(investor1.address, 1000000)
      ).to.be.revertedWithCustomError(investmentContract, "NotAccessable");
    });
  });
});

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  CoinTest,
  Factory,
  Factory__factory,
  Investment,
  Puzzle,
  Puzzle__factory,
} from "../typechain-types";
import { Investment__factory } from "../typechain-types/factories/contracts/Investment__factory";
import { CoinTest__factory } from "../typechain-types/factories/contracts/CoinTest__factory";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const INVESTMENT_1_AMOUNT = 100000,
  INVESTMENT_2_AMOUNT: Number = 150000,
  STATUS_PAUSE = 0,
  STATUS_PROGRESS = 1,
  STATUS_PROCESS = 2,
  STATUS_WITHDRAW = 3,
  STATUS_REFUNDING = 4,
  INVESTOR1_INVESTMENT_AMOUNT = 100000,
  GENERAL_ACCOUNT_AMOUNT = 20000,
  GENERAL_INVEST_AMOUNT = 9500,
  LESS_THAN_EXPECTED_INV_AMOUNT = 99,
  MORE_THAN_EXPECTED_INV_AMOUNT = INVESTMENT_1_AMOUNT / 2,
  EXPECTED_INV_AMOUNT1 = INVESTMENT_1_AMOUNT / 10 - 1,
  ENTRY_LEVEL_NFT_ID = 10,
  PAYMENT_TOKEN_AMOUNT = 200000,
  REFILL_VALUE = INVESTMENT_1_AMOUNT + (INVESTMENT_1_AMOUNT/100 * 15),
  PROFIT_RATE = 15;


describe("Investment Contract Tests", async () => {
  let investmentContract: Investment,
    paymentTokenContract: CoinTest,
    factoryContract: Factory,
    puzzleContract: Puzzle,
    accounts: SignerWithAddress[],
    owner: SignerWithAddress,
    investor1: SignerWithAddress,
    investor2: SignerWithAddress;

  async function deployContractFixture() {
    accounts = await ethers.getSigners();
    [owner, investor1, investor2] = accounts;
    const paymentTokenContractFactory = new CoinTest__factory(owner);
    const investmentContractFactory = new Investment__factory(owner);
    const factoryContractFactory = new Factory__factory(owner);
    const puzzleContractFactory = new Puzzle__factory(owner);

    // Deploy PaymentToken (CoinTest) contract from the factory
    paymentTokenContract = await paymentTokenContractFactory.deploy();
    await paymentTokenContract.deployed();

    // Deploy Factory contract from the factory
    factoryContract = await factoryContractFactory.deploy();
    await factoryContract.deployed();

    // Deploy Puzzle contract from the factory passing Factory and PaymentToken deployed contract addresses
    puzzleContract = await puzzleContractFactory.deploy(
      factoryContract.address,
      paymentTokenContract.address
    );
    await puzzleContract.deployed();

    // Set the Puzzle contract deployed as entry address on Factory contract
    await factoryContract.setEntryAddress(puzzleContract.address);

    investmentContract = await investmentContractFactory.deploy(
      INVESTMENT_1_AMOUNT,
      puzzleContract.address,
      paymentTokenContract.address
    );
    return {
      owner,
      investor1,
      investor2,
      accounts,
      paymentTokenContract,
      puzzleContract,
      factoryContract,
      investmentContract,
    };
  }

  async function ownerAndInvestorApprovedTokenToSpend() {
    const {
      owner,
      investor1,
      investmentContract,
      paymentTokenContract,
      puzzleContract,
    } = await loadFixture(deployContractFixture);
    await paymentTokenContract
      .mint(INVESTOR1_INVESTMENT_AMOUNT);
    await paymentTokenContract
      .approve(investmentContract.address, INVESTOR1_INVESTMENT_AMOUNT);
    await paymentTokenContract
      .approve(puzzleContract.address, INVESTOR1_INVESTMENT_AMOUNT);
    await puzzleContract.mintEntry();
    await paymentTokenContract
      .connect(investor1)
      .mint(INVESTOR1_INVESTMENT_AMOUNT);
    await paymentTokenContract
      .connect(investor1)
      .approve(investmentContract.address, INVESTOR1_INVESTMENT_AMOUNT);
    await paymentTokenContract
      .connect(investor1)
      .approve(puzzleContract.address, INVESTOR1_INVESTMENT_AMOUNT);
    await puzzleContract.connect(investor1).mintEntry();

    return {
      owner,
      investor1,
      investmentContract,
      paymentTokenContract,
    };
  }

  async function oneInvestCallLeftToFill() {
    const {
      investor1,
      accounts,
      investmentContract,
      paymentTokenContract,
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
        .approve(puzzleContract.address, GENERAL_ACCOUNT_AMOUNT);
      await paymentTokenContract
        .connect(accounts[i])
        .approve(investmentContract.address, GENERAL_ACCOUNT_AMOUNT);
      //Buy NFT Entry for each user
      await puzzleContract.connect(accounts[i]).mintEntry();
      //Make 9500 investment
      await investmentContract
        .connect(accounts[i])
        .invest(GENERAL_INVEST_AMOUNT);
    }

    const crucialInvestor = accounts[10];

    return {
      investor1,
      investmentContract,
      paymentTokenContract,
      crucialInvestor,
      puzzleContract,
    };
  }
  async function ownerAndInvestor1AbleToMintFixture() {
    const { paymentTokenContract, puzzleContract } = await loadFixture(
      deployContractFixture
    );
    // Mint PaymentTokens to the owner
    await paymentTokenContract.mint(PAYMENT_TOKEN_AMOUNT);
    // Mint PaymentTokens to the investor1
    await paymentTokenContract.connect(investor1).mint(PAYMENT_TOKEN_AMOUNT);
    // Approve Puzzle contract to spend Owner's PaymentTokens
    await paymentTokenContract.approve(
      puzzleContract.address,
      PAYMENT_TOKEN_AMOUNT
    );
    // Approve Puzzle contract to spend Investor1's PaymentTokens
    await paymentTokenContract
      .connect(investor1)
      .approve(puzzleContract.address, PAYMENT_TOKEN_AMOUNT);
    return { paymentTokenContract, puzzleContract };
  }

  async function investor1ReadyToClaimNFT() {
    const { paymentTokenContract, puzzleContract, factoryContract } =
      await loadFixture(deployContractFixture);

    // Mint PaymentTokens to investor
    await paymentTokenContract.connect(investor1).mint(PAYMENT_TOKEN_AMOUNT);

    await paymentTokenContract
      .connect(investor1)
      .approve(puzzleContract.address, PAYMENT_TOKEN_AMOUNT);

    await puzzleContract.connect(investor1).mintEntry();

    await factoryContract.deployNew(
      INVESTMENT_1_AMOUNT,
      paymentTokenContract.address
    );

    const deployedInvestmentAddress =
      await factoryContract.getLastDeployedContract();

    // const investmentFactory = new Investment__factory(owner);
    const investmentFactory = await ethers.getContractFactory("Investment");
    // (await investmentFactory).deploy();
    const investmentContract = await investmentFactory.attach(
      deployedInvestmentAddress
    );
    console.log("owner from fixture", await investmentContract.owner());

    // Allow investment contract to spend
    await paymentTokenContract
      .connect(investor1)
      .approve(investmentContract.address, EXPECTED_INV_AMOUNT1);
    // Invest an amount on investment1
    await investmentContract.connect(investor1).invest(EXPECTED_INV_AMOUNT1);

    return {
      owner,
      investor1,
      factoryContract,
      deployedInvestmentAddress,
      investmentContract,
      paymentTokenContract,
    };
  }

  describe("When the contract is deployed", async function () {
    it("Should set the right owner", async () => {
      const { owner, investmentContract } = await loadFixture(
        deployContractFixture
      );
      const contractOwner = await investmentContract.owner();
      await expect(contractOwner).to.be.equal(owner.address);
    });
    it("Should set the total Investment", async () => {
      const { investmentContract } = await loadFixture(deployContractFixture);
      const totalInvestment = await investmentContract.totalInvestment();
      expect(totalInvestment).to.be.equal(INVESTMENT_1_AMOUNT);
    });
    it("Should set the Entry NFT address", async () => {
      const { investmentContract, puzzleContract } = await loadFixture(
        deployContractFixture
      );
      const entryNFTContractAddress =
        await investmentContract.entryNFTAddress();
      expect(entryNFTContractAddress).to.be.equal(puzzleContract.address);
    });
    it("Should set the PaymentToken address", async () => {
      const { paymentTokenContract, investmentContract } = await loadFixture(
        deployContractFixture
      );
      // Get the PaymentToken address from the Puzzle contract
      const paymentTokenAddressFromContract =
        await investmentContract.paymentTokenAddress();
      expect(paymentTokenAddressFromContract).to.be.equal(
        paymentTokenContract.address
      );
    });
    it('Should set the status to "progress"', async () => {
      const { investmentContract } = await loadFixture(deployContractFixture);
      const contractStatus = await investmentContract.state();
      expect(contractStatus).to.be.equal(STATUS_PROGRESS);
    });
  });
  describe("STATUS: PROGRESS", async () => {
    it('Should set the status to "progress"', async () => {
      const { investmentContract } = await loadFixture(deployContractFixture);
      const contractStatus = await investmentContract.state();
      expect(contractStatus).to.be.equal(STATUS_PROGRESS);
    });
    describe("Invest function", async () => {
      it("Investor must have NFTEntry", async () => {
        const { investmentContract, investor1 } = await loadFixture(
          deployContractFixture
        );
        await expect(
          investmentContract
            .connect(investor1)
            .invest(LESS_THAN_EXPECTED_INV_AMOUNT)
        ).to.be.revertedWith("User does not have the Entry NFT");
      });
      it("Investor should not be allowed to invest less than the minimum required", async () => {
        const { investmentContract, investor1 } = await loadFixture(
          ownerAndInvestorApprovedTokenToSpend
        );
        await expect(
          investmentContract
            .connect(investor1)
            .invest(LESS_THAN_EXPECTED_INV_AMOUNT)
        ).to.be.revertedWith("Not enough amount to invest");
      });
      it("Investor should not be allowed to invest more than 10% of total investment", async () => {
        const { investmentContract, investor1 } = await loadFixture(
          ownerAndInvestorApprovedTokenToSpend
        );
        await expect(
          investmentContract
            .connect(investor1)
            .invest(MORE_THAN_EXPECTED_INV_AMOUNT)
        ).to.be.revertedWith("Amount exceed the total allowed");
      });
      it("Investor should be allowed to invest", async () => {
        const { investmentContract, investor1 } = await loadFixture(
          ownerAndInvestorApprovedTokenToSpend
        );
        await expect(
          investmentContract.connect(investor1).invest(EXPECTED_INV_AMOUNT1)
        )
          .to.emit(investmentContract, "UserInvest")
          .withArgs(investor1.address, EXPECTED_INV_AMOUNT1, anyValue);
      });
      it("Should mint the exact same value of ERC20 tracker token as the amount investment", async () => {
        const { investmentContract, investor1 } = await loadFixture(
          ownerAndInvestorApprovedTokenToSpend
        );
        await investmentContract
          .connect(investor1)
          .invest(EXPECTED_INV_AMOUNT1);
        expect(await investmentContract.balanceOf(investor1.address)).to.equal(
          EXPECTED_INV_AMOUNT1
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
          .approve(puzzleContract.address, GENERAL_ACCOUNT_AMOUNT);
        await paymentTokenContract
          .connect(crucialInvestor)
          .approve(investmentContract.address, GENERAL_ACCOUNT_AMOUNT);

        //Mint NFTEntry for crucialInvestor
        await puzzleContract.connect(crucialInvestor).mintEntry();
        //Test user tryign to invest 9500 when there is only 5000 left
        await expect(
          investmentContract
            .connect(crucialInvestor)
            .invest(GENERAL_INVEST_AMOUNT)
        ).to.be.revertedWith("Total reached");
      });
    });
    describe("Withdraw && WithdrawSL && Refill", async () => {
      it("Withdraw function shouldnt be able to be called", async () => {
        const { investmentContract, investor1 } = await loadFixture(ownerAndInvestorApprovedTokenToSpend);
        await expect(investmentContract.connect(investor1).withdraw()).to.be.revertedWith("Not on withdraw")
      });
      it("WithdrawSL function shouldnt be able to be called", async () => {
        const { investmentContract, owner } = await loadFixture(ownerAndInvestorApprovedTokenToSpend);
        await expect(investmentContract.connect(owner).withdrawSL()).to.be.revertedWith("Not on process")

      });
      it("Refill function shouldnt be able to be called", async () => {
        const { investmentContract } = await loadFixture(ownerAndInvestorApprovedTokenToSpend);
        await expect(investmentContract.refill(REFILL_VALUE, PROFIT_RATE)).to.be.revertedWith("Not on process")

      });
    }); 
  });
  describe("STATUS: PROCESS", async () => {
    it('Should set the status to "process"', async () => {
      const {investmentContract} = await loadFixture(oneInvestCallLeftToFill);
      await investmentContract.flipProcess();
      expect(await investmentContract.state()).to.equal(STATUS_PROCESS);
    });
    describe("Function WithdrawSL", async () => {
      beforeEach("set state to process", async () => {
        const {investmentContract, investor1, paymentTokenContract} = await loadFixture(oneInvestCallLeftToFill);
        await investmentContract.flipProcess();
        return {investmentContract, investor1, paymentTokenContract};
      });
      it("Investors should not be able to call",async () => {
        await expect(investmentContract.connect(investor1).withdrawSL()).to.be.revertedWith("Ownable: caller is not the owner");
      });
      it("Owner should be able to withdraw all funds and contract balance should be 0",async () => {
        await investmentContract.withdrawSL()
        expect(await investmentContract.totalContractBalanceStable(paymentTokenContract.address)).to.equal(0);
      });
      it("Should not be called when contract balance is less than 80%", async () => {
        await investmentContract.withdrawSL()
        await expect(investmentContract.withdrawSL()).to.be.revertedWith("Total not reached");
      });

    });
    describe("Function Refill", async () => {
      beforeEach("set state to process", async () => {
        const {investmentContract, investor1, paymentTokenContract} = await loadFixture(oneInvestCallLeftToFill);
        await paymentTokenContract.mint(INVESTMENT_1_AMOUNT);
        await paymentTokenContract.approve(investmentContract.address, INVESTMENT_2_AMOUNT);
        await investmentContract.flipProcess();
        return {investmentContract, investor1, paymentTokenContract};
      });
      it("Investors should not be able to call",async () => {
        await expect(investmentContract.connect(investor1).refill(REFILL_VALUE, PROFIT_RATE)).to.be.revertedWith("Ownable: caller is not the owner");
      });
      it("Cannot refill while contract still have funds!",async () => {
        await expect(investmentContract.refill(REFILL_VALUE, PROFIT_RATE)).to.be.revertedWith("Contract still have funds");
      });
      it("Cannot call function with wrong amount to refill (totalInvestment * profitRate) == amount(refilled) ",async () => {
        await investmentContract.withdrawSL()
        await expect(investmentContract.refill(REFILL_VALUE - 100, PROFIT_RATE)).to.be.revertedWith("Not correct value");
      });
      it("Owner should be able to refill contract",async () => {
        await investmentContract.withdrawSL()
        await expect(investmentContract.refill(REFILL_VALUE, PROFIT_RATE)).to.emit(investmentContract, "ContractRefilled").withArgs(REFILL_VALUE, PROFIT_RATE, anyValue);
      });
      it("should set global variable returnProfit = ProfitRate", async () => {
        //Talk to Cadu: beforeEach problem (cannot have a clean contract without withdrawing first)
        await investmentContract.withdrawSL()
        await investmentContract.refill(REFILL_VALUE, PROFIT_RATE)
        expect(await investmentContract.profitRate()).to.equal(PROFIT_RATE);
      });


    });
    describe("Withdraw && Invest", async () => {
      it("Withdraw function shouldnt be able to be called", async () => {
        await expect(investmentContract.connect(investor1).withdraw()).to.be.revertedWith("Not on withdraw")
      });
      it("Invest function shouldnt be able to be called", async () => {
        await expect(investmentContract.connect(investor1).invest(100)).to.be.revertedWith("Not on progress")
      });
    }); 


  });
  describe("STATUS: WITHDRAW", async () => {
    describe("Pre-Withdraw", async () => {
      beforeEach(async () => {
        const { investmentContract } = await loadFixture(deployContractFixture);
        await investmentContract.flipWithdraw();
      });
      it('Should set the status to "withdraw"', async () => {
        const contractStatus = await investmentContract.state();
        expect(contractStatus).to.be.equal(STATUS_WITHDRAW);
      });
      it("Investor should have the Entry NFT", async () => {
        const { puzzleContract } = await loadFixture(
          ownerAndInvestor1AbleToMintFixture
        );
        await puzzleContract.connect(investor1).mintEntry();
        const investor1HasEntryNFT = await puzzleContract.balanceOf(
          investor1.address,
          ENTRY_LEVEL_NFT_ID
        );
        expect(investor1HasEntryNFT).to.be.eq(1);
      });
      it("Investor should have invested at least the minimum amount to be able to withdraw", async () => {
        const { factoryContract, deployedInvestmentAddress } =
          await loadFixture(investor1ReadyToClaimNFT);
        const minimunInvestment = await investmentContract.MINIMUM_INVESTMENT();
        const amountInvested = await factoryContract
          .connect(investor1)
          .getAddressOnContract(deployedInvestmentAddress);

        expect(amountInvested).to.be.greaterThanOrEqual(minimunInvestment);
      });
    });
    describe("After Withdraw", async () => {
      // beforeEach(async () => {
      //   ({ investmentContract, paymentTokenContract } = await loadFixture(
      //     investor1ReadyToClaimNFT
      //   ));
      //   await investmentContract.flipWithdraw();
      // });
      it("Investor should burn all the ERC20 tokens", async () => {
        const { owner, investmentContract, paymentTokenContract } =
          await loadFixture(investor1ReadyToClaimNFT);
        console.log("owner", owner.address);
        console.log("from contract", await investmentContract.owner());
        // console.log(accounts.map((account) => account.address));

        // console.log(owner.address, investor1.address, investor2.address);

        await investmentContract.connect(owner).flipWithdraw();

        // const tokensBeforeWithdraw = await investmentContract
        //   .connect(investor1)
        //   .balanceOf(investor1.address);
        // console.log(tokensBeforeWithdraw);
      });
    });
  });
});

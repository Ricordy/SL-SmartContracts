import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { describe } from 'mocha'
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
} from '../typechain-types'

const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs')

const INVESTMENT_1_AMOUNT = 100000,
  CONTRACT_NUMBER_ID = 1,
  ENTRY_BATCH_CAP = 1000,
  ENTRY_BATCH_PRICE = 100,
  INVESTED_LEVEL_1 = 3000,
  INVESTED_LEVEL_2 = 5000,
  INVESTED_LEVEL_3 = 7000,
  ENTRY_TOKEN_URI = 'TOKEN_URI'

function withDecimals(toConvert: number) {
  return toConvert * 10 ** 6
}

describe('Logics Contract Tests', async () => {
  let paymentTokenContract: CoinTest,
    puzzleContract: SLCore,
    logicsContract: SLLogics,
    factoryContract: Factory,
    accounts: SignerWithAddress[],
    owner: SignerWithAddress,
    investor1: SignerWithAddress,
    investmentContractLevel1: Investment,
    investmentContractLevel2: Investment,
    investmentContractLevel3: Investment

  async function DeployContracts() {
    accounts = await ethers.getSigners()
    owner = accounts[0]
    investor1 = accounts[1]

    const investmentContractFactory = new Factory__factory(owner),
      paymentTokenFactory = new CoinTest__factory(owner),
      puzzleContractFactory = new SLCore__factory(owner),
      logicsContractFactory = new SLLogics__factory(owner)

    factoryContract = await investmentContractFactory.deploy()
    await factoryContract.deployed()
    paymentTokenContract = await paymentTokenFactory.deploy()
    await paymentTokenContract.deployed()
    logicsContract = await logicsContractFactory.deploy(
      factoryContract.address,
      paymentTokenContract.address,
    )
    await logicsContract.deployed()
    puzzleContract = await puzzleContractFactory.deploy(
      factoryContract.address,
      logicsContract.address,
    )
    await puzzleContract.deployed()

    await factoryContract.setEntryAddress(puzzleContract.address)
    // Allow SLCore to make changes in SLLogics
    await logicsContract.setAllowedContracts(puzzleContract.address, true)
    // Create a new entry batch
    await puzzleContract.generateNewEntryBatch(
      ENTRY_BATCH_CAP,
      ENTRY_BATCH_PRICE,
      ENTRY_TOKEN_URI,
    )

    // mint and approve payment token
    await paymentTokenContract.connect(investor1).mint(ENTRY_BATCH_PRICE)
    await paymentTokenContract
      .connect(investor1)
      .approve(logicsContract.address, withDecimals(ENTRY_BATCH_PRICE))

    return {
      factoryContract,
      paymentTokenContract,
      investor1,
      puzzleContract,
      logicsContract,
    }
  }

  describe('Access Control', async () => {
    it('setEntryPrice() should only be called by SLCore', async () => {
      const { logicsContract, puzzleContract, investor1 } = await loadFixture(
        DeployContracts,
      )

      await puzzleContract.generateNewEntryBatch(
        ENTRY_BATCH_CAP,
        ENTRY_BATCH_PRICE,
        ENTRY_TOKEN_URI,
      )
      let currentEntryPrice = await logicsContract._getEntryPrice()

      await expect(
        logicsContract.connect(investor1).setEntryPrice(1000, 'testing'),
      ).to.be.reverted

      await puzzleContract.generateNewEntryBatch(
        ENTRY_BATCH_CAP,
        ENTRY_BATCH_PRICE + 100,
        ENTRY_TOKEN_URI,
      )
      let newEntryPrice = await logicsContract._getEntryPrice()

      expect(currentEntryPrice).to.not.be.equal(newEntryPrice)
    })
    it('payEntryFee() must only be called by SLCore', async () => {
      const {
        logicsContract,
        paymentTokenContract,
        investor1,
      } = await loadFixture(DeployContracts)

      await puzzleContract.generateNewEntryBatch(
        ENTRY_BATCH_CAP,
        ENTRY_BATCH_PRICE,
        ENTRY_TOKEN_URI,
      )
      await expect(
        logicsContract.connect(investor1).payEntryFee(investor1.address),
      ).to.be.reverted

      await expect(puzzleContract.connect(investor1).mintEntry()).to.not.be
        .reverted
    })

    it('only contract owner(or assigned CEO) can withdraw tokens', async () => {
      const {
        logicsContract,
        paymentTokenContract,
        investor1,
      } = await loadFixture(DeployContracts)

      await expect(
        logicsContract.connect(investor1).withdrawTokens(investor1.address),
      ).to.be.reverted

      await expect(logicsContract.withdrawTokens(owner.address)).to.not.be
        .reverted
    })
  })

  describe('Token Transfer', async () => {
    it('afetr payEntryFee() contract balance should be previousBalance + entryFee', async () => {
      const {
        logicsContract,
        paymentTokenContract,
        investor1,
      } = await loadFixture(DeployContracts)

      await puzzleContract.generateNewEntryBatch(
        ENTRY_BATCH_CAP,
        ENTRY_BATCH_PRICE,
        ENTRY_TOKEN_URI,
      )

      let previousBalance = await paymentTokenContract.balanceOf(
        logicsContract.address,
      )

      await puzzleContract.connect(investor1).mintEntry()

      let newBalance = await paymentTokenContract.balanceOf(
        logicsContract.address,
      )

      expect(newBalance).to.be.equal(previousBalance.add(ENTRY_BATCH_PRICE))
    })
  })
})

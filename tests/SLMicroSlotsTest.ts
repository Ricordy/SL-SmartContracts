import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SLMicroSlots, SLMicroSlots__factory } from "../typechain-types";

describe("SLMircoSlots Contract", async () => {
  async function deployContractFixture() {
    let slMicroSlots: SLMicroSlots;

    const accounts = await ethers.getSigners();
    const owner = accounts[0];

    const factorySlMicroSlots = new SLMicroSlots__factory(owner);

    slMicroSlots = await factorySlMicroSlots.deploy();
    await slMicroSlots.deployed();

    return {
      owner,
      slMicroSlots,
    };
  }

  describe("Test", async () => {
    it("Should be set to zero when digit is 999", async () => {
      const { slMicroSlots } = await loadFixture(deployContractFixture);
      const digit = 999;
      const expected = 0;
      const actual = await slMicroSlots.incrementXPositionInFactor3(digit, 1);
      expect(actual).to.equal(expected);
    });
    it("Should revert when  digit is 99999", async () => {
      const { slMicroSlots } = await loadFixture(deployContractFixture);
      const digit = 100_000;
      const expected = 0;

      await expect(
        slMicroSlots.changetXPositionInFactor5(1_000_000, 1, digit)
      ).to.revertedWithCustomError(slMicroSlots, "InvalidNumber");
    });
  });
});

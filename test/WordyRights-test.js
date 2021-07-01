const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('WordyRights', function () {
  let WordyRights, wordyrights, dev, alice, bob;
  const NAME = 'WordyRights';
  const SYMBOL = 'WYR';
  const hash1 = '0xd42e479d3682d1e97562daf080a04a4388dd7445cc9175e60b3c9e3efa2f5d5d';
  //const hash2 = '0x7b2198046bc1068dba9a8cf1cac3da1322f94655a94c2e9167ddcee3314199a3';

  beforeEach(async function () {
    [dev, alice, bob] = await ethers.getSigners();
    WordyRights = await ethers.getContractFactory('WordyRights');
    wordyrights = await WordyRights.connect(dev).deploy();
    await wordyrights.deployed();
  });

  describe('Deployment', function () {
    it('Should have name WordyRights', async function () {
      expect(await wordyrights.name()).to.equal('WordyRights');
    });
    it('Should have symbol WYR', async function () {
      expect(await wordyrights.symbol()).to.equal('WYR');
    });
    it('Should give Minter Role to dev', async function () {
      expect(await wordyrights.hasRole(ethers.utils.id('MINTER_ROLE'), dev.address)).to.equal(true);
    });
  });

  describe('CreateRights', function () {
    beforeEach(async function () {
      await wordyrights.connect(alice).createRights(hash1);
    });
    it('Should return alice as owner of WYR N°1', async function () {
      expect(await wordyrights.ownerOf(1)).to.equal(alice.address);
    });
    it('Sould return 1 as balance of Alice', async function () {
      expect(await wordyrights.balanceOf(alice.address)).to.equal(1);
    });
    it('Should return 1 as NFT Id at index 0', async function () {
      expect(await wordyrights.tokenByIndex(0)).to.equal(1);
    });
  });

  describe('SetForSale', function () {
    it('Should revert because Bob not owner', async function () {
      await wordyrights.connect(alice).createRights(hash1);
      await expect(wordyrights.connect(bob).setForSale(1)).to.be.reverted;
    });
    it('Should return true because WYR is for sale', async function () {
      await wordyrights.connect(alice).createRights(hash1);
      await wordyrights.connect(alice).setForSale(1, 1);
      expect(await wordyrights.isForSale(1)).to.equal(true);
    });
  });

  describe('NotForSale', function () {
    it('Should return false because WYR not for sale anymore', async function () {
      await wordyrights.connect(alice).createRights(hash1);
      await wordyrights.connect(alice).setForSale(1, 1);
      await wordyrights.connect(alice).notForSale(1);
      expect(await wordyrights.isForSale(1)).to.equal(false);
    });
    it('Should revert because WYR not for sale', async function () {
      await wordyrights.connect(alice).createRights(hash1);
      await expect(wordyrights.connect(alice).notForSale(1)).to.be.reverted;
    });
    it('Should revert because Bob is not owner', async function () {
      await wordyrights.connect(alice).createRights(hash1);
      await expect(wordyrights.connect(bob).notForSale(1)).to.be.reverted;
    });
  });

  describe('BuyWYR', function () {
    it('Should revert because WYR not for sale', async function () {
      await wordyrights.connect(alice).createRights(hash1);
      await expect(wordyrights.connect(bob).buyWYR(1)).to.be.reverted;
    });
    it('Should revert because msg.value does not match price of WYR', async function () {
      await wordyrights.connect(alice).createRights(hash1);
      await wordyrights.connect(alice).setForSale(1, 1);
      await expect(wordyrights.connect(bob).buyWYR(1, { value: 2 })).to.be.reverted;
    });
    it('Should transfer property of WYR to buyer', async function () {
      await wordyrights.connect(alice).createRights(hash1);
      await wordyrights.connect(alice).setForSale(1, 1);
      await wordyrights.connect(bob).buyWYR(1, { value: 1 });
      expect(await wordyrights.ownerOf(1)).to.equal(bob.address);
      expect(await wordyrights.balanceOf(alice.address)).to.equal(0);
    });
  });
});

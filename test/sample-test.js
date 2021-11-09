const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("CRUD Contract", function() {
  let crud = null;
  before(async () => {
    const CRUD = await ethers.getContractFactory("CRUD");
    crud = await CRUD.deploy();
  });
  
  it("Should create a new users", async() => {
    await crud.create("Viet");
    const user = await crud.read(1);
    expect(user[0]).to.equal(1);
    expect(user[1]).to.equal("Viet");
  })

  it("Should update a user", async() => {
    await crud.update(1, "Viet Vo");
    const user = await crud.read(1);
    expect(user[0]).to.equal(1);
    expect(user[1]).to.equal("Viet Vo");
  })

  it("Should not update a non-existing user", async() => {
    try{
      await crud.update(2, "Viet Vo");
    } catch(error) {
      expect(error.message).include("User not found");
      return;
    }
    // If not error is thrown, then fail the test
    assert(false, "Should not update a Non-existing user");
  })

  it("Should destroy a user", async() => {
    await crud.destroy(1);
    try {
      await crud.read(1);
    } catch(error) {
      expect(error.message).include("User not found");
      return;
    }
    // If not error is thrown, this mean destroy not success 
    assert(false, "Should destroy a user");
  })

  it("Should not destroy a non-existing user", async() => {
    try {
      await crud.destroy(2);
    } catch(error) {
      expect(error.message).include("User not found");
      return;
    }

    assert(false, "Should not destroy a non-existing user");
  })
});

describe("EtherWallet Contract", function() {
  let etherWallet = null;
  let ownerAddress = null;
  let accounts = null;
  before(async () => {
    const EtherWallet = await ethers.getContractFactory("EtherWallet");
    accounts = await ethers.getSigners();
    ownerAddress = accounts[0].address;
    etherWallet = await EtherWallet.deploy(ownerAddress);
  });
  
  it("Should set the deployer is owner", async() => {
    const walletOwner = await etherWallet.owner();
    expect(ownerAddress).to.equal(walletOwner);
  })

  it("Should deposit wei to wallet contract", async() => {
    await etherWallet.deposit({from: ownerAddress, value: 100});
    const balance = await ethers.provider.getBalance(etherWallet.address);

    expect(parseInt(balance)).to.equal(100);
  })

  it("Should transfer wei to another address", async() => {
    const receiverBalanceBefore = await ethers.provider.getBalance(accounts[1].address);
    await etherWallet.send(accounts[1].address, 50, {from: ownerAddress});

    const walletBalance = await ethers.provider.getBalance(etherWallet.address);
    expect(parseInt(walletBalance)).to.equal(50);

    const receiverBalanceAfter = await ethers.provider.getBalance(accounts[1].address);
    expect(parseInt(receiverBalanceAfter)).to.equal(parseInt(receiverBalanceBefore) + 50);
  })

  it("Should NOT transfer if tx not sent from owner", async() => {
    try {
      await etherWallet.connect(accounts[2]).send(accounts[1].address, 50);
    } catch (error) {
      expect(error.message).include("Sender is not the owner");
      return;
    }
    assert(false, "Should NOT transfer if tx not sent from owner");
  })
})

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { expectRevert } = require("@openzeppelin/test-helpers");

describe("MultiSignWallet Contract", function () {
    let multiSignWalletContract;
    let accounts;
    before(async () => {
        accounts = await ethers.getSigners();
        // Deploy the contract
        const MultiSignWalletFactory = await ethers.getContractFactory(
            "MultiSignWallet"
        );
        multiSignWalletContract = await MultiSignWalletFactory.deploy(
            [accounts[0].address, accounts[1].address, accounts[2].address],
            2
        );
    });

    it("Should create transfer", async () => {
        await multiSignWalletContract.createTransfer(100, accounts[4].address);
        const transfer = await multiSignWalletContract.transfers(0);

        expect(transfer.id).to.equal(0);
        expect(transfer.amount).to.equal(100);
    });

    it("Should NOT create if not approvers", async () => {
        await expectRevert(
            multiSignWalletContract
                .connect(accounts[6])
                .createTransfer(100, accounts[5].address),
            "Only approvers"
        );
    });
});

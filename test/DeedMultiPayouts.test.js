const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("DeedMultiPayouts Contract", function () {
    let DeedMultiPayouts;
    let accounts;
    let owner;
    let deed;

    const amount = 100;

    before(async () => {
        DeedMultiPayouts = await ethers.getContractFactory("DeedMultiPayouts");
        accounts = await ethers.getSigners();
        owner = accounts[0].address;
        //Deploy the contract and deposit 100wei as the amount
        deed = await DeedMultiPayouts.deploy(owner, accounts[1].address, 1, {
            value: amount,
        });
    });

    it("Should withdraw for all payouts (1)", async () => {
        for (let i = 0; i < 4; i++) {
            const balanceBefore = ethers.BigNumber.from(
                await ethers.provider.getBalance(accounts[1].address)
            );

            // Wait until enough time to withdraw
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await deed.withdraw({ from: owner });

            const balanceAfter = ethers.BigNumber.from(
                await ethers.provider.getBalance(accounts[1].address)
            );
            expect(balanceAfter.sub(balanceBefore).toNumber()).to.equal(25);
        }
    });

    it("Should withdraw for all payouts (2)", async () => {
        deed = await DeedMultiPayouts.deploy(owner, accounts[1].address, 1, {
            value: amount,
        });
        for (let i = 0; i < 2; i++) {
            const balanceBefore = ethers.BigNumber.from(
                await ethers.provider.getBalance(accounts[1].address)
            );

            // Wait until enough time to withdraw
            await new Promise((resolve) => setTimeout(resolve, 2000));
            await deed.withdraw({ from: owner });

            const balanceAfter = ethers.BigNumber.from(
                await ethers.provider.getBalance(accounts[1].address)
            );
            expect(balanceAfter.sub(balanceBefore).toNumber()).to.equal(50);
        }
    });

    it("Should NOT withdraw if too early", async () => {
        // We must redeploy the contract to reset the time
        const deed = await DeedMultiPayouts.deploy(
            owner,
            accounts[1].address,
            5,
            {
                value: amount,
            }
        );

        try {
            await deed.withdraw({ from: owner });
        } catch (error) {
            expect(error.message).to.include("Too early");
            return;
        }
        assert(false, "Withdraw too early");
    });

    it("Should NOT withdraw if sender not lawyer", async () => {
        // We must redeploy the contract to reset the time
        const deed = await DeedMultiPayouts.deploy(
            owner,
            accounts[1].address,
            5,
            {
                value: amount,
            }
        );

        try {
            await deed.connect(accounts[2]).withdraw();
        } catch (error) {
            expect(error.message).to.include("Only lawyer");
            return;
        }
        assert(false, "Withdraw from non-owner");
    });
});

const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("SplitPayment Contract", function () {
    let splitPayment;
    let accounts;
    let owner;
    before(async () => {
        accounts = await ethers.getSigners();
        owner = accounts[0].address;

        const SplitPayment = await ethers.getContractFactory("SplitPayment");
        splitPayment = await SplitPayment.deploy(owner);
    });

    it("Should split payment", async () => {
        const receivers = [
            accounts[1].address,
            accounts[2].address,
            accounts[3].address,
        ];
        const amounts = [10, 20, 30];

        const initialBalance = await Promise.all(
            receivers.map((receiver) => ethers.provider.getBalance(receiver))
        );

        await splitPayment.send(receivers, amounts, { from: owner, value: 90 });

        const finalBalance = await Promise.all(
            receivers.map((receiver) => ethers.provider.getBalance(receiver))
        );
        receivers.forEach((receiver, index) => {
            const BN_finalBalance = ethers.BigNumber.from(finalBalance[index]);
            const BN_initialBalance = ethers.BigNumber.from(
                initialBalance[index]
            );

            expect(BN_finalBalance.sub(BN_initialBalance).toNumber()).to.equal(
                amounts[index]
            );
        });
    });

    it("Should NOT split payment if length not match", async () => {
        try {
            const receivers = [accounts[1].address, accounts[2].address];
            const amounts = [10, 20, 30];

            await splitPayment.send(receivers, amounts, {
                from: owner,
                value: 90,
            });
        } catch (error) {
            expect(error.message).include(
                "Length of _to and _value must be equal"
            );
            return;
        }
        assert(false, "Should NOT split payment if length not match");
    });

    it("Should NOT split payment if sender not owner", async () => {
        try {
            const receivers = [accounts[1].address, accounts[2].address];
            const amounts = [10, 20];

            await splitPayment.connect(accounts[3]).send(receivers, amounts, {
                value: 90,
            });
        } catch (error) {
            expect(error.message).include("Only owner can do this");
            return;
        }
        assert(false, "Should NOT split payment if sender not owner");
    });
});

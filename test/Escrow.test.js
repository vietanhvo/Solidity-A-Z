const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

const assertError = async (promise, errorMessage) => {
    try {
        await promise;
    } catch (error) {
        expect(error.message).to.include(errorMessage);
        return;
    }
    assert(false);
};

describe("Escrow Contract", function () {
    let lawyer, payer, payee;
    let escrow;
    let escrowFactory;

    before(async () => {
        // Get the list of accounts
        [lawyer, payer, payee] = await ethers.getSigners();
        escrowFactory = await ethers.getContractFactory("Escrow");
        escrow = await escrowFactory.deploy(payer.address, payee.address, 1000);
    });

    it("Should deposit", async () => {
        await escrow.connect(payer).deposit({ value: 900 });
        const escrowBalance = await ethers.provider.getBalance(escrow.address);

        expect(escrowBalance).to.equal(900);
    });

    it("Should only payer deposit", async () => {
        assertError(escrow.deposit({ value: 900 }), "Only payer");
    });

    it("Should not deposit out of money", async () => {
        assertError(
            escrow.connect(payer).deposit({ value: 1001 }),
            "Out of money"
        );
    });

    it("Should not release if not enough money", async () => {
        assertError(escrow.release(), "Not enough money");
    });

    it("Should not release if sender not lawyer", async () => {
        await escrow.connect(payer).deposit({ value: 100 });
        assertError(escrow.connect(payee).release(), "Only lawyer");
    });

    it("Should release", async () => {
        const payeeBalanceBefore = ethers.BigNumber.from(
            await ethers.provider.getBalance(payee.address)
        );

        await escrow.release();

        const payeeBalanceAfter = ethers.BigNumber.from(
            await ethers.provider.getBalance(payee.address)
        );

        expect(payeeBalanceAfter.sub(payeeBalanceBefore).toNumber()).to.equal(
            1000
        );
    });
});

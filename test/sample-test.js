const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("CRUD Contract", function () {
    let crud = null;
    before(async () => {
        const CRUD = await ethers.getContractFactory("CRUD");
        crud = await CRUD.deploy();
    });

    it("Should create a new users", async () => {
        await crud.create("Viet");
        const user = await crud.read(1);
        expect(user[0]).to.equal(1);
        expect(user[1]).to.equal("Viet");
    });

    it("Should update a user", async () => {
        await crud.update(1, "Viet Vo");
        const user = await crud.read(1);
        expect(user[0]).to.equal(1);
        expect(user[1]).to.equal("Viet Vo");
    });

    it("Should not update a non-existing user", async () => {
        try {
            await crud.update(2, "Viet Vo");
        } catch (error) {
            expect(error.message).include("User not found");
            return;
        }
        // If not error is thrown, then fail the test
        assert(false, "Should not update a Non-existing user");
    });

    it("Should destroy a user", async () => {
        await crud.destroy(1);
        try {
            await crud.read(1);
        } catch (error) {
            expect(error.message).include("User not found");
            return;
        }
        // If not error is thrown, this mean destroy not success
        assert(false, "Should destroy a user");
    });

    it("Should not destroy a non-existing user", async () => {
        try {
            await crud.destroy(2);
        } catch (error) {
            expect(error.message).include("User not found");
            return;
        }

        assert(false, "Should not destroy a non-existing user");
    });
});

describe("EtherWallet Contract", function () {
    let etherWallet = null;
    let ownerAddress = null;
    let accounts = null;
    before(async () => {
        const EtherWallet = await ethers.getContractFactory("EtherWallet");
        accounts = await ethers.getSigners();
        ownerAddress = accounts[0].address;
        etherWallet = await EtherWallet.deploy(ownerAddress);
    });

    it("Should set the deployer is owner", async () => {
        const walletOwner = await etherWallet.owner();
        expect(ownerAddress).to.equal(walletOwner);
    });

    it("Should deposit wei to wallet contract", async () => {
        await etherWallet.deposit({ from: ownerAddress, value: 100 });
        const balance = await ethers.provider.getBalance(etherWallet.address);

        expect(parseInt(balance)).to.equal(100);
    });

    it("Should transfer wei to another address", async () => {
        const amount = 50;
        const receiverBalanceBefore = await ethers.provider.getBalance(
            accounts[1].address
        );

        // Owner -> Contract -> account[1]
        await etherWallet.send(accounts[1].address, amount, {
            from: ownerAddress,
        });

        const walletBalance = await ethers.provider.getBalance(
            etherWallet.address
        );
        expect(parseInt(walletBalance)).to.equal(amount);

        const receiverBalanceAfter = await ethers.provider.getBalance(
            accounts[1].address
        );

        const initialBalance = ethers.BigNumber.from(receiverBalanceBefore);
        const finalBalance = ethers.BigNumber.from(receiverBalanceAfter);
        expect(finalBalance.sub(initialBalance)).to.equal(amount);
    });

    it("Should NOT transfer if tx not sent from owner", async () => {
        try {
            await etherWallet
                .connect(accounts[2])
                .send(accounts[1].address, 50);
        } catch (error) {
            expect(error.message).include("Sender is not the owner");
            return;
        }
        assert(false, "Should NOT transfer if tx not sent from owner");
    });
});

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

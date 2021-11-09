const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

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

        // After the tx from owner to contract done -> check the balance of contract
        const walletBalance = await ethers.provider.getBalance(
            etherWallet.address
        );
        expect(parseInt(walletBalance)).to.equal(amount);

        // When we are checking the balance of contract, the tx from contract to account[1] is done
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

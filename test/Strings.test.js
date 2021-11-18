const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("Strings Contract", function () {
    let stringsContract;
    before(async () => {
        // Deploy the contract
        const stringsFactory = await ethers.getContractFactory("Strings");
        stringsContract = await stringsFactory.deploy();
    });

    it("Should returns the length of string", async () => {
        let length = await stringsContract.length("abc");
        expect(length).to.equal(3);
    });

    it("Should concat 2 strings", async () => {
        let concat = await stringsContract.concat("abc", "def");
        expect(concat).to.equal("abcdef");
    });
});

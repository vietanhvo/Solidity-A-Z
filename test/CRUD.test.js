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

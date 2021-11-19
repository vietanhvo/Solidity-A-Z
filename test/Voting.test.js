const { expect } = require("chai");
const { ethers } = require("hardhat");
const { expectRevert, time } = require("@openzeppelin/test-helpers");

describe("Voting Contract", function () {
    let votingContract;
    let accounts;
    let owner;
    let voter1, voter2, voter3;
    let nonVoter;
    before(async () => {
        accounts = await ethers.getSigners();
        [owner, voter1, voter2, voter3, nonVoter] = accounts;

        const contractFactory = await ethers.getContractFactory("Voting");
        votingContract = await contractFactory.deploy();
    });

    it("Should add voters", async () => {
        await votingContract.addVoters([
            voter1.address,
            voter2.address,
            voter3.address,
        ]);
        const result = await Promise.all(
            [voter1, voter2, voter3].map((voter) =>
                votingContract.voters(voter.address)
            )
        );
        result.forEach((voter) => {
            expect(voter).to.be.true;
        });
    });

    it("Should NOT add voters if not owner", async () => {
        expectRevert(
            votingContract
                .connect(nonVoter)
                .addVoters([voter1.address, voter2.address, voter3.address]),
            "Only owner"
        );
    });

    it("Should create ballot", async () => {
        await votingContract.createBallot(
            "Ballot 1",
            ["Choice 1", "Choice 2", "Choice 3"],
            5
        );
        const result = await votingContract.ballots(0);
        expect(result.name).to.equal("Ballot 1");
    });

    it("Should NOT create ballot if not owner", async () => {
        expectRevert(
            votingContract
                .connect(nonVoter)
                .createBallot(
                    "Ballot 1 Failed",
                    ["Choice 1", "Choice 2", "Choice 3"],
                    5
                ),
            "Only owner"
        );
    });

    it("Should vote", async () => {
        await votingContract.createBallot(
            "Ballot 2",
            ["Choice 1", "Choice 2", "Choice 3"],
            5
        );
        await votingContract.connect(voter1).vote(1, 0);
        await votingContract.connect(voter2).vote(1, 1);
        await votingContract.connect(voter3).vote(1, 2);

        await time.increase(5001);
        const result = await votingContract.result(1);
        expect(result[0].votes).to.equal(1);
        expect(result[1].votes).to.equal(1);
        expect(result[2].votes).to.equal(1);
    });

    it("Should NOT vote if sender not voters", async () => {
        await votingContract.createBallot(
            "Ballot 3",
            ["Choice 1", "Choice 2", "Choice 3"],
            5
        );
        expectRevert(
            votingContract.connect(nonVoter).vote(2, 0),
            "Only voters"
        );
    });

    it("Should NOT vote if the voter voted", async () => {
        await votingContract.createBallot(
            "Ballot 4",
            ["Choice 1", "Choice 2"],
            5
        );
        await votingContract.connect(voter1).vote(3, 0);
        expectRevert(
            votingContract.connect(voter1).vote(3, 1),
            "Only vote 1 time"
        );
    });

    it("Should NOT vote if the ballot ended", async () => {
        await votingContract.createBallot("Ballot 5", ["Choice 1"], 5);
        time.increase(5001);
        expectRevert(
            votingContract.connect(voter1).vote(4, 0),
            "Ballot is over"
        );
    });
});

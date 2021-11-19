//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Voting {
    mapping(address => bool) public voters;
    struct Choice {
        uint256 id;
        string name;
        uint256 votes;
    }
    struct Ballot {
        uint256 id;
        string name;
        Choice[] choices;
        uint256 end;
    }

    mapping(uint256 => Ballot) public ballots;
    uint256 nextBallotID;
    address public owner;
    mapping(address => mapping(uint256 => bool)) public votes; //check voters vote for a ballot yet or not

    constructor() {
        owner = msg.sender;
    }

    function addVoters(address[] calldata _voters) external onlyOwner {
        for (uint256 i = 0; i < _voters.length; i++) {
            voters[_voters[i]] = true;
        }
    }

    function createBallot(
        string calldata _name,
        string[] calldata _choices,
        uint256 _offset
    ) external onlyOwner {
        ballots[nextBallotID].id = nextBallotID;
        ballots[nextBallotID].name = _name;
        ballots[nextBallotID].end = block.timestamp + _offset;
        for (uint256 i = 0; i < _choices.length; i++) {
            ballots[nextBallotID].choices.push(Choice(i, _choices[i], 0));
        }
        nextBallotID++;
    }

    function vote(uint256 _ballotID, uint256 _choiceID) external {
        require(voters[msg.sender], "Only voters");
        require(!votes[msg.sender][_ballotID], "Only vote 1 time");
        require(block.timestamp < ballots[_ballotID].end, "Ballot is over");
        ballots[_ballotID].choices[_choiceID].votes++;
        votes[msg.sender][_ballotID] = true;
    }

    function result(uint256 _ballotID) external view returns (Choice[] memory) {
        require(block.timestamp >= ballots[_ballotID].end, "Voting time");
        return ballots[_ballotID].choices;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
}

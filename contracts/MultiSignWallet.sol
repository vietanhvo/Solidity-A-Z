//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract MultiSignWallet {
    address[] public approvers;
    uint256 public quorum;
    struct Transfer {
        uint256 id;
        uint256 amount;
        address payable to;
        uint256 approvals;
        bool sent;
    }
    uint256 nextID;
    mapping(uint256 => Transfer) public transfers;
    mapping(address => mapping(uint256 => bool)) public approvals; //approvals[msg.sender][2] = true

    constructor(address[] memory _approvers, uint256 _quorum) {
        approvers = _approvers;
        quorum = _quorum;
    }

    function createTransfer(uint256 _amount, address payable _to)
        external
        onlyApprovers
    {
        transfers[nextID] = Transfer(nextID, _amount, _to, 0, false);
        nextID++;
    }

    function sendTransfer(uint256 _id) external onlyApprovers {
        require(!transfers[_id].sent, "This transfer sent");
        if (transfers[_id].approvals >= quorum) {
            transfers[_id].to.transfer(transfers[_id].amount);
            transfers[_id].sent = true;
            return;
        }
        if (!approvals[msg.sender][_id]) {
            approvals[msg.sender][_id] = true;
            transfers[_id].approvals++;
        }
    }

    modifier onlyApprovers() {
        bool validApprover = false;
        for (uint256 i = 0; i < approvers.length; i++) {
            if (approvers[i] == msg.sender) {
                validApprover = true;
                break;
            }
        }
        require(validApprover, "Only approvers");
        _;
    }
}

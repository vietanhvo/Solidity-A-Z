//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Deed {
    address public lawyer;
    address payable public beneficiary;
    uint256 public earliest;

    constructor(
        address _lawyer,
        address payable _beneficiary,
        uint256 _after
    ) payable {
        lawyer = _lawyer;
        beneficiary = _beneficiary;
        earliest = block.timestamp + _after;
    }

    modifier onlylawyer() {
        require(msg.sender == lawyer, "Only lawyer");
        _;
    }

    function withdraw() external onlylawyer {
        require(block.timestamp >= earliest, "Too early");
        beneficiary.transfer(address(this).balance);
    }
}

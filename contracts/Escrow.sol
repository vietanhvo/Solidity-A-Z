//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

contract Escrow {
    address public payer;
    address payable public payee;
    address public laywer;
    uint256 public amount;

    constructor(
        address _payer,
        address payable _payee,
        uint256 _amount
    ) payable {
        payer = _payer;
        payee = _payee;
        laywer = msg.sender;
        amount = _amount;
    }

    function deposit() external payable {
        require(msg.sender == payer, "Only payer");
        require(address(this).balance <= amount, "Out of money");
    }

    function release() external {
        require(msg.sender == laywer, "Only lawyer");
        require(address(this).balance == amount, "Not enough money");
        payee.transfer(amount);
    }

    function balanceOf() external view returns (uint256) {
        return address(this).balance;
    }
}

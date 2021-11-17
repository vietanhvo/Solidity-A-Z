//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract DeedMultiPayouts {
    address public laywer;
    address payable public beneficiary;
    uint256 public earliest;
    uint256 constant PAYOUTS = 4; // Divide the total payout into 4 equal parts
    uint256 constant INTERVALS = 1; // Can be withdraw after 10 seconds
    uint256 public paidPayouts; // The number of payouts paid
    uint256 public amounts; // The amount of money for each payout

    constructor(
        address _laywer,
        address payable _beneficiary,
        uint256 _after
    ) payable {
        laywer = _laywer;
        beneficiary = _beneficiary;
        earliest = block.timestamp + _after;
        amounts = msg.value / PAYOUTS;
    }

    modifier onlyLaywer() {
        require(msg.sender == laywer, "Only lawyer");
        _;
    }

    function withdraw() external payable onlyLaywer {
        require(block.timestamp >= earliest, "Too early");
        require(paidPayouts < PAYOUTS, "Too many payouts");
        // The  total number of payouts valids for this withdraw (Based on time and interval)
        uint256 totalDuePayouts = 1 + (block.timestamp - earliest) / INTERVALS;
        // The real number of payouts can be withdrawn (Based on times of payouts)
        uint256 realDuePayouts = totalDuePayouts - paidPayouts;
        realDuePayouts = realDuePayouts + paidPayouts > PAYOUTS
            ? PAYOUTS - paidPayouts
            : realDuePayouts;
        // Update new value for paidPayouts
        paidPayouts += realDuePayouts;
        // Pay payouts
        beneficiary.transfer(amounts * realDuePayouts);
    }
}

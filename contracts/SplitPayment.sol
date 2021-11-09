//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract SplitPayment {
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can do this");
        _;
    }

    function send(address payable[] memory _to, uint256[] memory _value)
        public
        payable
        onlyOwner
    {
        require(
            _to.length == _value.length,
            "Length of _to and _value must be equal"
        );
        for (uint256 i = 0; i < _to.length; i++) {
            _to[i].transfer(_value[i]);
        }
    }
}

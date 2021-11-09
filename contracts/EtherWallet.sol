//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract EtherWallet {
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function deposit() external payable {}

    function send(address payable _to, uint256 _value) external {
        if (msg.sender == owner) {
            _to.transfer(_value);
            return;
        }
        revert("Sender is not the owner");
    }

    function balanceOf() external view returns (uint256) {
        return address(this).balance;
    }
}

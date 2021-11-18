//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Strings {
    function length(string memory str) public pure returns (uint256) {
        // String don't have length method
        bytes memory str_bytes = bytes(str);
        return str_bytes.length;
    }

    function concat(string memory a, string memory b)
        public
        pure
        returns (string memory)
    {
        bytes memory a_bytes = bytes(a);
        bytes memory b_bytes = bytes(b);
        string memory concatStr = new string(a_bytes.length + b_bytes.length);
        bytes memory concatStr_bytes = bytes(concatStr);

        uint256 j = 0;
        for (uint256 i = 0; i < a_bytes.length; i++) {
            concatStr_bytes[j] = a_bytes[i];
            j++;
        }

        for (uint256 i = 0; i < b_bytes.length; i++) {
            concatStr_bytes[j] = b_bytes[i];
            j++;
        }

        return string(concatStr_bytes);
    }
}

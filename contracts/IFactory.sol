// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFactory {
    function getAddressTotal(
        address user
    ) external view returns (uint256 userTotal);

    function getAddressTotalInLevel(
        address user,
        uint256 level
    ) external view returns (uint256 userTotal);
}

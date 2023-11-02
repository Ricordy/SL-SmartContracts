// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IInvestment {
    function invest(uint256 _amount, uint256 _paymentToken) external;
}
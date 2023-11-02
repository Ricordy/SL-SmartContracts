// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SLCore.sol";
import "./IInvestment.sol";
import "./IPaymentToken.sol";
import "./ISLCore.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract InvestmentAttackInvest {
    ISLCore public slCore;
    IInvestment public investment;

    constructor(
        address _slCoreAddress,
        address _paymentToken,
        address _investmentAddress,
        address _spender,
        uint256 _amount
    ) {
        slCore = ISLCore(_slCoreAddress);
        investment = IInvestment(_investmentAddress);
        mintERC20(_paymentToken, 5_000_000_000);
        approveERC20(_paymentToken, _spender, _amount);
        approveERC20(_paymentToken, _investmentAddress, 5_000_000_000);
        investment.invest(100, 0);
    }

    function approveERC20(
        address _paymentToken,
        address _spender,
        uint256 _amount
    ) public {
        IERC20(_paymentToken).approve(_spender, _amount);
    }

    function mintERC20(address _paymentToken, uint256 amount) public {
        IPaymentToken(_paymentToken).mint(amount);
    }

    // Helper function to check the balance of this contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}

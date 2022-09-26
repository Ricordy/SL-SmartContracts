//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


contract Investment is ERC20, Ownable, ReentrancyGuard {

    uint256 totalInvestment;
    uint256 returnProfit;

    event UserInvest (
        address user,
        uint256 amount,
        uint256 time
    );

    event SLWithdraw (
        uint256 amount,
        uint256 time
    );

    event Withdraw (
        address user,
        uint256 amount,
        uint256 time
    );

    event ContractRefilled (
        uint256 amount,
        uint256 time
    );




    constructor(uint256 _totalInvestment) ERC20("InvestmentCurrency", "IC"){
        totalInvestment = _totalInvestment;

    }

    function invest(uint256 _amount) public nonReentrant{
        IERC20 _token = IERC20(0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557);
        _token.approve(msg.sender, _amount);
        require(_token.allowance(msg.sender, address(this)) >= 100, "Error");
        require(_token.allowance(msg.sender, address(this)) <= totalInvestment /10 , "Error");
        _token.transferFrom(msg.sender, address(this), _amount);
        _mint(msg.sender, _amount);
        totalInvestment += _amount;
        emit UserInvest(msg.sender, _amount, block.timestamp);

    }

    function withdraw() public nonReentrant {
        require(balanceOf(msg.sender) > 0, "not invested");
        IERC20 _token = IERC20(0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557);
        _token.transferFrom(address(this), msg.sender, calculateFinalAmount(balanceOf(msg.sender)));


        
    }

    function withdrawSL() public onlyOwner {
        IERC20 _token = IERC20(0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557);
        uint256 totalBalance = totalContractBalanceStable(_token);
        _token.transferFrom(address(this), msg.sender, totalBalance);

    }

    function refill(uint256 _amount, uint256 profitRate) public onlyOwner {
        //require(condition); state
        IERC20 _token = IERC20(0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557);
        require(totalContractBalanceStable(_token) == 0);
        require(totalInvestment + (totalInvestment * profitRate /100) == _amount); //Implementar com taxa de retorno
        _token.approve(msg.sender, _amount);
        _token.transferFrom(msg.sender, address(this), _amount);

    }


    function totalContractBalanceStable(IERC20 _token) public view returns(uint256 totalBalance) {
        totalBalance = _token.balanceOf(address(this));

    }

    function calculateFinalAmount(uint256 _amount) internal view returns(uint256 totalAmount){
        totalAmount = _amount + (_amount * returnProfit / 100);
    }
}

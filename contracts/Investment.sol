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
        uint256 profit,
        uint256 time
    );

    constructor(uint256 _totalInvestment) ERC20("InvestmentCurrency", "IC"){
        totalInvestment = _totalInvestment;

    }

    function invest(uint256 _amount) public nonReentrant{
        require(_amount >= 100, "Error");
        require(_amount <= totalInvestment / 10 , "Error");
        
        //ERC20 _token = ERC20(0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557);
        //require(_token.balanceOf(address(this)) < totalInvestment, "Total reached");
        
        //require(_token.allowance(msg.sender, address(this)) >= _amount, "Not correct allowance");
        ERC20(0xBC45823a879CB9A789ed394A8Cf4bd8b7aa58e27).transferFrom(msg.sender, address(this), _amount);
        
        _mint(msg.sender, _amount);
        
        emit UserInvest(msg.sender, _amount, block.timestamp);

    }

    function withdraw() public nonReentrant {
        uint256 balance = balanceOf(msg.sender);
        require(balance > 0, "not invested");
        
        _burn(msg.sender, balance);
        
        IERC20 _token = IERC20(0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557);
        _token.transferFrom(address(this), msg.sender, calculateFinalAmount(balance));

        emit Withdraw(msg.sender, calculateFinalAmount(balance), block.timestamp);
        
    }

    function withdrawSL() public onlyOwner {
        IERC20 _token = IERC20(0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557);
        
        require(_token.balanceOf(address(this)) >= totalInvestment, "Total not reached");
        _token.transferFrom(address(this), msg.sender, totalContractBalanceStable(_token));

        emit SLWithdraw(totalInvestment, block.timestamp);

    }

    function refill(uint256 _amount, uint256 profitRate) public onlyOwner {
        IERC20 _token = IERC20(0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557);
        require(totalContractBalanceStable(_token) == 0);
        require(totalInvestment + (totalInvestment * profitRate /100) == _amount); //Implementar com taxa de retorno
        _token.approve(msg.sender, _amount);
        _token.transferFrom(msg.sender, address(this), _amount);

        emit ContractRefilled(_amount, profitRate, block.timestamp);

    }

    function totalContractBalanceStable(IERC20 _token) public view returns(uint256 totalBalance) {
        totalBalance = _token.balanceOf(address(this));

    }

    function calculateFinalAmount(uint256 _amount) internal view returns(uint256 totalAmount){
        totalAmount = _amount + (_amount * returnProfit / 100);
    }
}

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// Investing amount exceeded the maximum allowed
/// @param amount the amount user is trying to invest
/// @param maxAllowed max amount allowed to invest
error InvestmentExceedMax(uint256 amount, uint256 maxAllowed);

contract Investment is ERC20, Ownable, ReentrancyGuard {

    ///
    //-----STATUS------
    ///
    enum Status {
        Pause,
        Progress,
        Process,
        Withdraw,
        Refunding
    }

    ///
    //-----STATE VARIABLES------
    ///
    Status public status;
    uint256 public totalInvestment;
    uint256 public returnProfit;
    address public paymentTokenAddress;
    address public entryNFTAddress;
    uint256 public constant MINIMUM_INVESTMENT = 100;
    uint8 public constant LEVEL1 = 10;

    ///
    //-----EVENTS------
    ///
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

    event ContractFilled (
        uint256 time
    );

    ///
    //-----CONSTRUCTOR------
    ///
    constructor(uint256 _totalInvestment, address _entryNFTAddress, address _paymentTokenAddress) ERC20("InvestmentCurrency", "IC"){
        totalInvestment = _totalInvestment;
        entryNFTAddress = _entryNFTAddress;
        paymentTokenAddress = _paymentTokenAddress;
        changeStatus(Status.Progress);
    }

    ///
    //-----MAIN FUNCTIONS------
    ///
    function invest(uint256 _amount) public nonReentrant isAllowed isProgress isNotPaused{
        require(_amount >= MINIMUM_INVESTMENT, "Not enough amount to invest");
        uint256 userInvested = _amount + balanceOf(msg.sender);
        uint256 maxToInvest = getMaxToInvest();
        if ( userInvested > maxToInvest) {
            revert InvestmentExceedMax(userInvested, maxToInvest);
        }
        
        ERC20 _token = ERC20(paymentTokenAddress);
        _token.transferFrom(msg.sender, address(this), _amount);
        _mint(msg.sender, _amount);

        uint256 remainingToFill = getMaxToInvest();
        
        if (remainingToFill == 0) {
            _changeStatus(Status.Process);
            emit ContractFilled(block.timestamp);
        }
        
        emit UserInvest(msg.sender, _amount, block.timestamp);
    }

    function withdraw() external nonReentrant isNotPaused isAllowed isWithdrawOrRefunding {
        uint256 balance = balanceOf(msg.sender);
        require(balance > 0, "Not enough balance");
        
        _burn(msg.sender, balance);

        ERC20 _token = ERC20(paymentTokenAddress);
        uint256 finalAmount = calculateFinalAmount(balance);
        _token.transfer(msg.sender, finalAmount);

        emit Withdraw(msg.sender, finalAmount, block.timestamp);
    }

    function withdrawSL() external onlyOwner isAllowed isProcess isNotPaused {
        uint256 totalBalance;

        ERC20 _token = ERC20(paymentTokenAddress);
        totalBalance = totalContractBalanceStable(_token);
    
        require(totalBalance >= totalInvestment * 80 / 100 , "Total not reached"); 
        
        _token.transfer(msg.sender, totalContractBalanceStable(_token));
    
        emit SLWithdraw(totalBalance, block.timestamp);
    }

    function refill(uint256 _amount, uint256 _profitRate) public onlyOwner isAllowed isProcess isNotPaused {
        ERC20 _token = ERC20(paymentTokenAddress);
        require(totalContractBalanceStable(_token) == 0, "Contract still have funds");
        require(totalInvestment + (totalInvestment * _profitRate /100) == _amount, "Not correct value");
        _token.transferFrom(msg.sender, address(this), _amount);
        returnProfit = _profitRate;
        // Change status to withdraw
        changeStatus(Status.Withdraw);

        emit ContractRefilled(_amount, _profitRate, block.timestamp);
    }

    ///
    //-----GETTERS------
    ///
    function totalContractBalanceStable(ERC20 _token) public view returns(uint256 totalBalance) {
        totalBalance = _token.balanceOf(address(this));
    }

    function getMaxToInvest() public view returns (uint256 maxToInvest) {
        maxToInvest = totalInvestment - totalContractBalanceStable(ERC20(paymentTokenAddress));
        if (maxToInvest > totalInvestment / 10) {
            maxToInvest = totalInvestment / 10;
        }
    }

    function calculateFinalAmount(uint256 _amount) internal view returns(uint256 totalAmount) {
        totalAmount = _amount + (_amount * returnProfit / 100);
    }

    /// 
    //---- MODIFIERS------
    /// 
    modifier isNotPaused() {
        require(status != Status.Pause, "Contract paused");
        _;
    }

    modifier isProgress() {
        require(status == Status.Progress, "Not on progress");
        _;
    }

    modifier isProcess() {
        require(status == Status.Process, "Not on process");
        _;
    }

    modifier isWithdrawOrRefunding() {
        require(status == Status.Withdraw || status == Status.Refunding, "Not on Withdraw or Refunding");
        _;
    }

    modifier isRefunding() {
        require(status == Status.Refunding, "Not on refunding");
        _;
    }

    modifier isAllowed() {
        require(ERC1155(entryNFTAddress).balanceOf(msg.sender, LEVEL1) > 0, "User does not have the Entry NFT");
        _;
    }

    /// 
    //----STATUS FUNCTIONS------
    /// 
    function changeStatus(Status _status) public onlyOwner {
        status = _status;
    }

    function _changeStatus(Status _status) internal {
        status = _status;
    }
}

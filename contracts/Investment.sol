//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";


contract Investment is ERC20, Ownable, ReentrancyGuard {


    using SafeMath for uint256;
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
    Status public state;
    uint256 public totalInvestment;
    uint256 public returnProfit;
    address[] public paymentTokenAddress;
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

    ///
    //-----CONSTRUCTOR------
    ///
    constructor(uint256 _totalInvestment, address _entryNFTAddress, address _paymentTokenAddress, address _paymentTokenAddress2) ERC20("InvestmentCurrency", "IC"){
        totalInvestment = _totalInvestment;
        entryNFTAddress = _entryNFTAddress;
        paymentTokenAddress.push(_paymentTokenAddress);
        paymentTokenAddress.push(_paymentTokenAddress2);
        flipProgress();
    }

    ///
    //-----MAIN FUNCTIONS------
    ///
     ///@notice _coin represents the stable coin wanted 0 = USDC, 1 = USDT
    function invest(uint256 _amount, uint256 _coin) public nonReentrant isAllowed isProgress isNotPaused{
        require(_amount >= MINIMUM_INVESTMENT, "Not enough amount to invest");
        require(_amount <= totalInvestment / 10 , "Amount exceed the total allowed");
        
        require(_coin == 1 || _coin == 0, "Not correct value for coin");
        ERC20 _token = ERC20(paymentTokenAddress[_coin]);
        
        require(_token.balanceOf(address(this)) + _amount <= totalInvestment, "Total reached");
        
        require(_token.allowance(msg.sender, address(this)) >= _amount, "Not enough allowance");
        _token.transferFrom(msg.sender, address(this), _amount);
        _mint(msg.sender, _amount);
        
        emit UserInvest(msg.sender, _amount, block.timestamp);

    }

    function withdraw() external nonReentrant isNotPaused isAllowed isWithdrawOrRefunding {
        uint256 balance = balanceOf(msg.sender);
        require(balance > 0, "Not enough balance");
        
        _burn(msg.sender, balance);

        ERC20 _token = ERC20(paymentTokenAddress[0]);
        uint256 finalAmount = calculateFinalAmount(balance);
        _token.transfer(msg.sender, finalAmount);

        emit Withdraw(msg.sender, finalAmount, block.timestamp);
    }

    function withdrawSL() external onlyOwner isAllowed isProcess isNotPaused {
        uint256 totalBalance;

        ERC20 _token = ERC20(paymentTokenAddress[0]);
        totalBalance += totalContractBalanceStable(_token);

        _token = ERC20(paymentTokenAddress[1]);
        totalBalance += totalContractBalanceStable(_token);

        require(totalBalance >= totalInvestment.div(100).mul(80), "Total not reached"); 
        _token.transfer(msg.sender, totalBalance);

        emit SLWithdraw(totalInvestment, block.timestamp);

    }

    function refill(uint256 _amount, uint256 _profitRate) public onlyOwner isAllowed isProcess isNotPaused {
        ERC20 _token = ERC20(paymentTokenAddress[0]);
        require(totalContractBalanceStable(_token) == 0, "Contract still have funds");
        require(totalInvestment + (totalInvestment * _profitRate /100) == _amount, "Not correct value");
        _token.transferFrom(msg.sender, address(this), _amount);
        returnProfit = _profitRate;

        emit ContractRefilled(_amount, _profitRate, block.timestamp);

    }

    ///
    //-----GETTERS------
    ///
    function totalContractBalanceStable(ERC20 _token) public view returns(uint256 totalBalance) {
        totalBalance = _token.balanceOf(address(this));
    }

    function calculateFinalAmount(uint256 _amount) internal view returns(uint256 totalAmount) {
        totalAmount = _amount + (_amount * returnProfit / 100);
    }

    function profitRate() public view returns(uint256 profit){
        profit = returnProfit;
    }

    /// 
    //---- MODIFIERS------
    /// 
    modifier isNotPaused() {
        require(state != Status.Pause, "Contract paused");
        _;
    }

    modifier isProgress() {
        require(state == Status.Progress, "Not on progress");
        _;
    }

    modifier isProcess() {
        require(state == Status.Process, "Not on process");
        _;
    }

    modifier isWithdrawOrRefunding() {
        require(state == Status.Withdraw || state == Status.Refunding, "Not on Withdraw or Refunding");
        _;
    }

    modifier isRefunding() {
        require(state == Status.Refunding, "Not on refunding");
        _;
    }

    modifier isAllowed() {
        require(ERC1155(entryNFTAddress).balanceOf(msg.sender, LEVEL1) > 0, "User does not have the Entry NFT");
        _;
    }

    /// 
    //----STATUS FUNCTIONS------
    /// 
    function flipPause() public onlyOwner {
        state = Status.Pause;
    }

    function flipProgress() public onlyOwner {
        state = Status.Progress;
    }

    function flipProcess() public onlyOwner {
        state = Status.Process;
    }

    function flipWithdraw() public onlyOwner {
        state = Status.Withdraw;
    }

    function flipRefunding() public onlyOwner {
        state = Status.Refunding;
    }

}

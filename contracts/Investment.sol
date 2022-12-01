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
    address public paymentTokenAddress = 0xBC45823a879CB9A789ed394A8Cf4bd8b7aa58e27;
    address public entryNFTAddress;
    uint256 public constant MINIMUM_INVESTMENT = 100;

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
    constructor(uint256 _totalInvestment, address _entryNFTAddress, address _paymentTokenAddress) ERC20("InvestmentCurrency", "IC"){
        totalInvestment = _totalInvestment;
        entryNFTAddress = _entryNFTAddress;
        paymentTokenAddress = _paymentTokenAddress;
        flipProgress();
    }

    ///
    //-----MAIN FUNCTIONS------
    ///
    function invest(uint256 _amount) public nonReentrant isAllowed isProgress isPaused{
        require(_amount >= MINIMUM_INVESTMENT, "Not enough amount to invest");
        require(_amount <= totalInvestment / 10 , "Amount exceed the total allowed");
        
        ERC20 _token = ERC20(paymentTokenAddress);
        require(_token.balanceOf(address(this)) + _amount <= totalInvestment, "Total reached");
        
        require(_token.allowance(msg.sender, address(this)) >= _amount, "Not enough allowance");
        _token.transferFrom(msg.sender, address(this), _amount);
        
        _mint(msg.sender, _amount);
        
        emit UserInvest(msg.sender, _amount, block.timestamp);

    }

    function withdraw() public nonReentrant isPaused isAllowed isWithdrawOrRefunding {
        uint256 balance = balanceOf(msg.sender);
        require(balance > 0, "not invested");
        
        _burn(msg.sender, balance);

        ERC20 _token = ERC20(paymentTokenAddress);
        uint256 finalAmount = calculateFinalAmount(balance);
        _token.transfer(msg.sender, finalAmount);

        emit Withdraw(msg.sender, finalAmount, block.timestamp);
    }

    function withdrawSL() public onlyOwner isAllowed isProcess isPaused {
        ERC20 _token = ERC20(paymentTokenAddress);
        
        require(_token.balanceOf(address(this)) >= totalInvestment.div(100).mul(80), "Total not reached"); 
        _token.transfer(msg.sender, totalContractBalanceStable(_token));

        emit SLWithdraw(totalInvestment, block.timestamp);

    }

    function refill(uint256 _amount, uint256 _profitRate) public onlyOwner isAllowed isProcess isPaused {
        ERC20 _token = ERC20(paymentTokenAddress);
        require(totalContractBalanceStable(_token) == 0, "Contract still have funds"); //Verificar com mercado secundário
        require(totalInvestment + (totalInvestment * _profitRate /100) == _amount, "Not correct value"); //Implementar com taxa de retorno
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
    modifier isPaused() {
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
        require(ERC1155(entryNFTAddress).balanceOf(msg.sender, 10) > 0, "User does not have the Entry NFT");
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

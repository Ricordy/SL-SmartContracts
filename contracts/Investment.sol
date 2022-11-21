//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


contract Investment is ERC20, Ownable, ReentrancyGuard {

    ///
    //-----STATUS------
    ///
    enum Status {
        Pause,
        Progress,
        Process,
        Wtihdraw,
        Refunding

    }

    ///
    //-----STATE VARIABLES------
    ///
    Status public state;
    uint256 totalInvestment;
    uint256 returnProfit;
    address stable = 0xBC45823a879CB9A789ed394A8Cf4bd8b7aa58e27;
    address entryAdd;

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
    constructor(uint256 _totalInvestment, address lgentry, address stableContractAddress) ERC20("InvestmentCurrency", "IC"){
        totalInvestment = _totalInvestment;
        entryAdd = lgentry;
        stable = stableContractAddress;
        flipProgress();

    }

    ///
    //-----MAIN FUNCTIONS------
    ///
    function invest(uint256 _amount) public nonReentrant isAllowed isProgress isPaused{
        require(_amount >= 100, "Error");
        require(_amount <= totalInvestment / 10 , "Error");
        
        ERC20 _token = ERC20(stable);
        require(_token.balanceOf(address(this)) < totalInvestment, "Total reached");
        
        require(_token.allowance(msg.sender, address(this)) >= _amount, "Not enough allowance");
        _token.transferFrom(msg.sender, address(this), _amount);
        
        _mint(msg.sender, _amount);
        
        emit UserInvest(msg.sender, _amount, block.timestamp);

    }

    function withdraw() public nonReentrant isPaused isAllowed isWithdraw isRefunding{
        uint256 balance = balanceOf(msg.sender);
        require(balance > 0, "not invested");
        
        _burn(msg.sender, balance);

        ERC20 _token = ERC20(stable);
        _token.transferFrom(address(this), msg.sender, calculateFinalAmount(balance));

        emit Withdraw(msg.sender, calculateFinalAmount(balance), block.timestamp);
        
    }

    function withdrawSL() public onlyOwner isAllowed isProcess isPaused {
        ERC20 _token = ERC20(stable);
        
        require(_token.balanceOf(address(this)) >= totalInvestment, "Total not reached"); // TODO: fazer para 80%
        _token.transferFrom(address(this), msg.sender, totalContractBalanceStable(_token));

        emit SLWithdraw(totalInvestment, block.timestamp);

    }

    function refill(uint256 _amount, uint256 profitRate) public onlyOwner isAllowed isProcess isPaused {
        ERC20 _token = ERC20(stable);
        require(totalContractBalanceStable(_token) == 0); //Verificar com mercado secundário
        require(totalInvestment + (totalInvestment * profitRate /100) == _amount); //Implementar com taxa de retorno
        _token.transferFrom(msg.sender, address(this), _amount);
        returnProfit = profitRate;

        emit ContractRefilled(_amount, profitRate, block.timestamp);

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

    /// 
    //---- MODIFIERS------
    /// 
    modifier isPaused() {
        require(state != Status.Pause);
        _;
    }

    modifier isProgress() {
        require(state == Status.Progress);
        _;
    }

    modifier isProcess() {
        require(state == Status.Progress);
        _;
    }

    modifier isWithdraw() {
        require(state == Status.Wtihdraw);
        _;
    }

    modifier isRefunding() {
        require(state == Status.Refunding);
        _;
    }

    modifier isAllowed() {
        require(ERC1155(entryAdd).balanceOf(msg.sender, 10) > 0, "Not accessible");
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
        state = Status.Wtihdraw;
    }

    function flipRefunding() public onlyOwner {
        state = Status.Refunding;
    }

}

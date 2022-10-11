//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


contract Investment is ERC20, Ownable, ReentrancyGuard {

    uint256 totalInvestment;
    uint256 returnProfit;
    address stable = 0xBC45823a879CB9A789ed394A8Cf4bd8b7aa58e27;

    ///
    //-----Stages------
    ///
    bool paused;
    bool progress;
    bool process;
    bool withdrawB;
    bool refunding;
    
    



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

    function invest(uint256 _amount) public nonReentrant isProgress isPaused{
        require(_amount >= 100, "Error");
        require(_amount <= totalInvestment / 10 , "Error");
        
        ERC20 _token = ERC20(stable);
        require(_token.balanceOf(address(this)) < totalInvestment, "Total reached");
        
        require(_token.allowance(msg.sender, address(this)) >= _amount, "Not enough allowance");
        _token.transferFrom(msg.sender, address(this), _amount);
        
        _mint(msg.sender, _amount);
        
        emit UserInvest(msg.sender, _amount, block.timestamp);

    }

    function withdraw() public nonReentrant isPaused isWithdraw{
        uint256 balance = balanceOf(msg.sender);
        require(balance > 0, "not invested");
        
        _burn(msg.sender, balance);
        
        ERC20 _token = ERC20(stable);
        _token.transferFrom(address(this), msg.sender, calculateFinalAmount(balance));

        emit Withdraw(msg.sender, calculateFinalAmount(balance), block.timestamp);
        
    }

    function withdrawSL() public onlyOwner isProcess isPaused {
        ERC20 _token = ERC20(stable);
        
        require(_token.balanceOf(address(this)) >= totalInvestment, "Total not reached"); // TODO: fazer para 80%
        _token.transferFrom(address(this), msg.sender, totalContractBalanceStable(_token));

        emit SLWithdraw(totalInvestment, block.timestamp);

    }

    function refill(uint256 _amount, uint256 profitRate) public onlyOwner isProcess isPaused {
        ERC20 _token = ERC20(stable);
        require(totalContractBalanceStable(_token) == 0); //Verificar com mercado secundário
        require(totalInvestment + (totalInvestment * profitRate /100) == _amount); //Implementar com taxa de retorno
        _token.transferFrom(msg.sender, address(this), _amount);
        returnProfit = profitRate;

        emit ContractRefilled(_amount, profitRate, block.timestamp);

    }

    function totalContractBalanceStable(ERC20 _token) public view returns(uint256 totalBalance) {
        totalBalance = _token.balanceOf(address(this));

    }

    function calculateFinalAmount(uint256 _amount) internal view returns(uint256 totalAmount){
        totalAmount = _amount + (_amount * returnProfit / 100);
    }

    /// 
    //---- MODIFIERS------
    /// 
    modifier isPaused() {
        require(paused == false);
        _;
    }
    modifier isProgress() {
        require(progress == true);
        _;
    }
    modifier isProcess() {
        require(process == true);
        _;
    }
    modifier isWithdraw() {
        require(withdrawB == true);
        _;
    }
    modifier isRefunding() {
        require(refunding == true);
        _;
    }

     /// 
    //----STAGES FUNCTIONS------
    /// 

    function flipPause() public onlyOwner {
        paused = true;
        progress = false;
        process = false;
        withdrawB = false;
        refunding = false;
    }

    function flipProgress() public onlyOwner {
        paused = false;
        progress = true;
        process = false;
        withdrawB = false;
        refunding = false;
    }

        function flipProcess() public onlyOwner {
        paused = false;
        progress = false;
        process = true;
        withdrawB = false;
        refunding = false;
    }

        function flipWithdraw() public onlyOwner {
        paused = false;
        progress = false;
        process = false;
        withdrawB = true;
        refunding = false;
    }

        function flipRefunding() public onlyOwner {
        paused = false;
        progress = false;
        process = false;
        withdrawB = false;
        refunding = true;
    }

}

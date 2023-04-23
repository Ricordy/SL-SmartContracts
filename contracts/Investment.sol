//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


/// Investing amount exceeded the maximum allowed
/// @param amount the amount user is trying to invest
/// @param maxAllowed max amount allowed to invest
error InvestmentExceedMax(uint256 amount, uint256 maxAllowed);

interface ISLCore{
    function whichLevelUserHas(
        address user
    ) external view returns(uint);

}

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
    uint256 public immutable totalInvestment;
    uint256 public returnProfit;
    address public immutable paymentTokenAddress;
    address public immutable entryNFTAddress;
    uint256 public constant MINIMUM_INVESTMENT = 100;
    uint8 public immutable CONTRACT_LEVEL;
    mapping(address => bool) public userWithdrawed;

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
    constructor(uint256 _totalInvestment, address _entryNFTAddress, address _paymentTokenAddress, uint8 _contractLevel) ERC20("InvestmentCurrency", "IC"){
        require(
            _entryNFTAddress != address(0) && _paymentTokenAddress != address(0),
            "Investment: Check the parameters and redeploy"
        );
        totalInvestment = _totalInvestment * 10 ** decimals();
        entryNFTAddress = _entryNFTAddress;
        paymentTokenAddress = _paymentTokenAddress;
        changeStatus(Status.Progress);
        CONTRACT_LEVEL = _contractLevel;
    }

    ///
    //-----MAIN FUNCTIONS------
    ///
    function invest(uint256 _amount) public nonReentrant isAllowed isProgress {
        require(_amount >= MINIMUM_INVESTMENT, "Not enough amount to invest");

        uint256 userInvested = _amount * 10 ** decimals() + balanceOf(msg.sender);
        uint256 maxToInvest = getMaxToInvest();
        
        if ( userInvested > maxToInvest) {
            revert InvestmentExceedMax(userInvested, maxToInvest);
        }
        if (totalSupply() + _amount * 10 ** 6 == totalInvestment) {
            _changeStatus(Status.Process);
            emit ContractFilled(block.timestamp);
        }

        _mint(msg.sender, _amount * 10 ** decimals());
        
        ERC20 _token = ERC20(paymentTokenAddress);
        require(_token.transferFrom(msg.sender, address(this), _amount *  10 ** _token.decimals()), "Puzzle: Error in token transfer");
        
        
        emit UserInvest(msg.sender, _amount, block.timestamp);
    }

    function withdraw() external nonReentrant isNotPaused isAllowed isWithdrawOrRefunding {
        require(!userWithdrawed[msg.sender], "Investment: User already withdrawed");
        userWithdrawed[msg.sender] = true;
        
        ERC20 _token = ERC20(paymentTokenAddress);
        uint256 finalAmount = calculateFinalAmount(balanceOf(msg.sender));
        
        require( _token.transfer(msg.sender, finalAmount), "Puzzle: Error in token transfer");

        
        emit Withdraw(msg.sender, finalAmount, block.timestamp);
    }

    function withdrawSL() external onlyOwner isAllowed isProcess isNotPaused {
        uint256 totalBalance;
        ERC20 _token = ERC20(paymentTokenAddress);
        totalBalance = totalContractBalanceStable();
    
        require(totalBalance >= totalInvestment * 80 / 100 , "Total not reached"); 
        require(_token.balanceOf(address(this)) >= totalInvestment * 80 / 100 , "Total not reached"); //Maybe to be removed 

        emit SLWithdraw(totalBalance, block.timestamp);
        require(_token.transfer(msg.sender, totalContractBalanceStable()), "Puzzle: Error in token transfer");
    
    }

    function refill(uint256 _amount, uint256 _profitRate) public nonReentrant onlyOwner isAllowed isProcess isNotPaused {
        ERC20 _token = ERC20(paymentTokenAddress);
        require(totalInvestment + (totalInvestment * _profitRate /100) == _amount * 10 **  _token.decimals() , "Not correct value");

        
        returnProfit = _profitRate;
        // Change status to withdraw
        _changeStatus(Status.Withdraw);

        require(_token.transferFrom(msg.sender, address(this), _amount *  10 ** _token.decimals()), "Puzzle: Error in token transfer");
        emit ContractRefilled(_amount, _profitRate, block.timestamp);
    }

    ///
    //-----GETTERS------
    ///
    function totalContractBalanceStable() public view returns(uint256 totalBalance) {
        totalBalance = totalSupply(); //check is totalSuppkly burns when burn is called
    }

    function getMaxToInvest() public view returns (uint256 maxToInvest) {
        maxToInvest = totalInvestment - totalContractBalanceStable();
        if (maxToInvest > totalInvestment / 10) {
            maxToInvest = totalInvestment / 10;
        }
    }

    function calculateFinalAmount(uint256 _amount) internal view returns(uint256 totalAmount) {
        totalAmount = (_amount + (_amount * returnProfit / 100));
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
        require(ISLCore(entryNFTAddress).whichLevelUserHas(msg.sender) >= CONTRACT_LEVEL, "User does not have the required level NFT");
        _;
    }

    /// 
    //----STATUS FUNCTIONS------
    /// 
    function changeStatus(Status _newStatus) public onlyOwner nonReentrant {
        status = _newStatus;
    }

    function _changeStatus(Status _newStatus) private {
        status = _newStatus;
    }

    /// 
    //----OVERRIDES------
    /// 

    function decimals() override public pure returns(uint8){
        return 6;
    }


    
}

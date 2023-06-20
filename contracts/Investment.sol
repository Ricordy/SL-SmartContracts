//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// Investing amount exceeded the maximum allowed
/// @param amount the amount user is trying to invest
/// @param maxAllowed max amount allowed to invest
error InvestmentExceedMax(uint256 amount, uint256 maxAllowed);

interface ISLCore {
    function whichLevelUserHas(address user) external view returns (uint);
}

interface ISLPermissions {
    function isCEO(address _address) external view returns (bool);

    function isCFO(address _address) external view returns (bool);

    function isCLevel(address _address) external view returns (bool);

    function isPlatformPaused() external view returns (bool);

    function isInvestmentsPaused() external view returns (bool);
}

interface IToken is IERC20 {}

contract Investment is ERC20, ReentrancyGuard {
    using SafeERC20 for IERC20;

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
    address public immutable slPermissionsAddress;
    uint256 public constant MINIMUM_INVESTMENT = 100;
    uint256 public investors;
    uint8 public immutable CONTRACT_LEVEL;
    mapping(address => bool) public userWithdrawed;

    ///
    //-----EVENTS------
    ///
    event UserInvest(address user, uint256 amount, uint256 time);

    event SLWithdraw(uint256 amount, uint256 time);

    event Withdraw(address user, uint256 amount, uint256 time);

    event ContractRefilled(uint256 amount, uint256 profit, uint256 time);

    event ContractFilled(uint256 time);

    ///
    //-----CONSTRUCTOR------
    ///
    constructor(
        uint256 _totalInvestment,
        address _slPermissionsAddress,
        address _entryNFTAddress,
        address _paymentTokenAddress,
        uint8 _contractLevel
    ) ERC20("InvestmentCurrency", "IC") {
        require(
            _entryNFTAddress != address(0) &&
                _paymentTokenAddress != address(0),
            "Investment: Check the parameters and redeploy"
        );
        totalInvestment = _totalInvestment * 10 ** decimals();
        slPermissionsAddress = _slPermissionsAddress;
        entryNFTAddress = _entryNFTAddress;
        paymentTokenAddress = _paymentTokenAddress;
        changeStatus(Status.Progress);
        CONTRACT_LEVEL = _contractLevel;
    }

    ///
    //-----MAIN FUNCTIONS------
    ///
    function invest(
        uint256 _amount
    ) public nonReentrant isAllowed isProgress isNotGloballyStoped {
        require(_amount >= MINIMUM_INVESTMENT, "Not enough amount to invest");

        uint256 userInvested = _amount *
            10 ** decimals() +
            balanceOf(msg.sender);
        uint256 maxToInvest = getMaxToInvest();

        if (userInvested > maxToInvest) {
            revert InvestmentExceedMax(userInvested, maxToInvest);
        }
        if (totalSupply() + _amount * 10 ** 6 == totalInvestment) {
            _changeStatus(Status.Process);
            emit ContractFilled(block.timestamp);
        }

        _mint(msg.sender, _amount * 10 ** decimals());
        investors++;

        ERC20 _token = ERC20(paymentTokenAddress);
        IERC20(paymentTokenAddress).safeTransferFrom(
            msg.sender,
            address(this),
            _amount * 10 ** _token.decimals()
        );

        emit UserInvest(msg.sender, _amount, block.timestamp);
    }

    function withdraw()
        external
        nonReentrant
        isAllowed
        isWithdrawOrRefunding
        isNotGloballyStoped
    {
        require(
            !userWithdrawed[msg.sender],
            "Investment: User already withdrawed"
        );
        userWithdrawed[msg.sender] = true;

        ERC20 _token = ERC20(paymentTokenAddress);
        uint256 finalAmount = calculateFinalAmount(balanceOf(msg.sender));

        IERC20(paymentTokenAddress).safeTransfer(msg.sender, finalAmount);

        emit Withdraw(msg.sender, finalAmount, block.timestamp);
    }

    function withdrawSL() external isProcess isNotGloballyStoped isCFO {
        uint256 totalBalance;
        ERC20 _token = ERC20(paymentTokenAddress);
        totalBalance = totalContractBalanceStable();

        require(
            totalBalance >= (totalInvestment * 80) / 100,
            "Total not reached"
        );
        require(
            _token.balanceOf(address(this)) >= (totalInvestment * 80) / 100,
            "Total not reached"
        ); //Maybe to be removed

        emit SLWithdraw(totalBalance, block.timestamp);

        IERC20(paymentTokenAddress).safeTransfer(
            msg.sender,
            totalContractBalanceStable()
        );
    }

    function refill(
        uint256 _amount,
        uint256 _profitRate
    ) public nonReentrant isNotGloballyStoped isProcess isCFO {
        ERC20 _token = ERC20(paymentTokenAddress);
        require(
            totalInvestment + ((totalInvestment * _profitRate) / 100) ==
                _amount * 10 ** _token.decimals(),
            "Not correct value"
        );

        returnProfit = _profitRate;
        // Change status to withdraw
        _changeStatus(Status.Withdraw);

        IERC20(paymentTokenAddress).transferFrom(
            msg.sender,
            address(this),
            _amount * 10 ** _token.decimals()
        );
        emit ContractRefilled(_amount, _profitRate, block.timestamp);
    }

    ///
    //-----GETTERS------
    ///
    function totalContractBalanceStable()
        public
        view
        returns (uint256 totalBalance)
    {
        totalBalance = totalSupply();
    }

    function getMaxToInvest() public view returns (uint256 maxToInvest) {
        maxToInvest = totalInvestment - totalContractBalanceStable();
        if (maxToInvest > totalInvestment / 10) {
            maxToInvest = totalInvestment / 10;
        }
    }

    function calculateFinalAmount(
        uint256 _amount
    ) internal view returns (uint256 totalAmount) {
        totalAmount = (_amount + ((_amount * returnProfit) / 100));
    }

    ///
    //---- MODIFIERS------
    ///

    modifier isNotGloballyStoped() {
        require(
            !ISLPermissions(slPermissionsAddress).isInvestmentsPaused(),
            "InvestmentsPaused"
        );
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
        require(
            status == Status.Withdraw || status == Status.Refunding,
            "Not on Withdraw or Refunding"
        );
        _;
    }

    modifier isRefunding() {
        require(status == Status.Refunding, "Not on refunding");
        _;
    }

    modifier isAllowed() {
        require(
            ISLCore(entryNFTAddress).whichLevelUserHas(msg.sender) >=
                CONTRACT_LEVEL,
            "User does not have the required level NFT"
        );
        _;
    }

    modifier isCEO() {
        require(
            ISLPermissions(slPermissionsAddress).isCEO(msg.sender),
            "User not CEO"
        );
        _;
    }

    modifier isCFO() {
        require(
            ISLPermissions(slPermissionsAddress).isCFO(msg.sender),
            "User not CFO"
        );
        _;
    }

    modifier isCLevel() {
        require(
            ISLPermissions(slPermissionsAddress).isCLevel(msg.sender),
            "User not CLVL"
        );
        _;
    }

    ///
    //----STATUS FUNCTIONS------
    ///
    function changeStatus(Status _newStatus) public isCEO nonReentrant {
        status = _newStatus;
    }

    function _changeStatus(Status _newStatus) private {
        status = _newStatus;
    }

    ///
    //----OVERRIDES------
    ///

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        return false;
    }

    function transfer(
        address to,
        uint256 amount
    ) public override returns (bool) {
        return false;
    }
}

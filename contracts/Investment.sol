//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ISLPermissions.sol";

interface ISLCore {
    function whichLevelUserHas(address user) external view returns (uint256);
}

interface IToken is IERC20 {}

/// @title Investment Contract
/// @author Something Legendary
/// @notice This contract is used for managing an investment.
/// @dev The contract includes functions for investing, withdrawing, processing, and refilling.
contract Investment is ERC20, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Enum for the status of the contract.
    /// @dev The status can be Pause, Progress, Process, Withdraw, or Refunding.
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
    /// @notice The status of the contract.
    /// @dev The status is public and can be changed through the changeStatus function.
    Status public status;
    /// @notice The total investment in the contract.
    /// @dev This value is immutable and set at the time of contract deployment.
    uint256 public immutable TOTAL_INVESTMENT;
    /// @notice The return profit.
    /// @dev This value is set as 0 until contract is refilled.
    uint256 public returnProfit;
    /// @notice The address of the payment token.
    /// @dev This value is set at the time of contract deployment.
    address public immutable PAYMENT_TOKEN_ADDRESS_0;
    /// @notice The address of the payment token.
    /// @dev This value is set at the time of contract deployment.
    address public immutable PAYMENT_TOKEN_ADDRESS_1;
    /// @notice The address of SLCore contract.
    /// @dev This value is set at the time of contract deployment.
    address public immutable SLCORE_ADDRESS;
    /// @notice The address of the Access Control contract.
    /// @dev This value is set at the time of contract deployment.
    address public immutable SLPERMISSIONS_ADDRESS;
    /// @notice Minimum investment amount
    /// @dev This value is set at the time of contract deployment.
    uint256 public constant MINIMUM_INVESTMENT = 100;
    /// @notice The Level of the contract.
    /// @dev This value is set at the time of contract deployment.
    uint256 public immutable CONTRACT_LEVEL;
    /// @notice Stores if user has withdrawn.
    /// @dev Keeps user from withdrawing twice.
    mapping(address => uint256) public userWithdrew;

    ///
    //-----EVENTS------
    ///
    /// @notice An event that is emitted when a user invests.
    /// @param user The address of the user who invested.
    /// @param amount The amount invested.
    /// @param time The timestamp where action was perfomed.
    event UserInvest(
        address indexed user,
        uint256 indexed amount,
        uint256 indexed time
    );

    /// @notice An event that is emitted when a user withdraws.
    /// @param user The address of said user.
    /// @param amount The amount withdrawn.
    /// @param time The timestamp where action was perfomed.
    event Withdraw(
        address indexed user,
        uint256 indexed amount,
        uint256 indexed time
    );

    /// @notice An event that is emitted when Something Legendary wtihdraws tokens for processing.
    /// @param amount The amount withdrawn.
    /// @param time The timestamp where action was perfomed.
    event SLWithdraw(uint256 indexed amount, uint256 indexed time);

    /// @notice An event that is emitted when Something Legendary refill contract with tokens.
    /// @param amount The amount refilled.
    /// @param profit The profit rate.
    /// @param time The timestamp where action was perfomed.
    event ContractRefilled(
        uint256 indexed amount,
        uint256 indexed profit,
        uint256 indexed time
    );

    /// @notice An event that is emitted when contract is filled by an investment.
    /// @param time The timestamp where action was perfomed.
    event ContractFilled(uint256 indexed time);

    ///
    //-----ERRORS------
    ///
    /// @notice Reverts if a certain address == address(0)
    /// @param reason which address is missing
    error InvalidAddress(string reason);

    /// @notice Reverts if input is not in level range
    /// @param input level inputed
    /// @param min minimum level value
    /// @param max maximum level value
    error InvalidLevel(uint256 input, uint256 min, uint256 max);

    /// Investing amount exceeded the maximum allowed
    /// @param amount the amount user is trying to invest
    /// @param minAllowed minimum amount allowed to invest
    /// @param maxAllowed maximum amount allowed to invest
    error WrongfulInvestmentAmount(
        uint256 amount,
        uint256 minAllowed,
        uint256 maxAllowed
    );

    /// @notice Reverts if input is not in level range
    /// @param currentStatus current contract status
    /// @param expectedStatus expected status for function to run
    error InvalidContractStatus(Status currentStatus, Status expectedStatus);

    /// @notice Reverts if user is not at least at contract level
    /// @param expectedLevel expected user minimum level
    /// @param userLevel user level
    error IncorrectUserLevel(uint256 expectedLevel, uint256 userLevel);

    /// @notice reverts if refill value is incorrect
    /// @param expected expected refill amount
    /// @param input input amount
    error IncorrectRefillValue(uint256 expected, uint256 input);

    /// @notice reverts if paltofrm hasn´t enough investment for starting process
    /// @param expected expected investment total
    /// @param actual actual investment total
    error NotEnoughForProcess(uint256 expected, uint256 actual);

    /// @notice reverts if user tries a second withdraw
    error CannotWithdrawTwice();

    /// @notice Reverts if platform is paused
    error PlatformPaused();

    ///Function caller is not CEO level
    error NotCEO();

    ///Function caller is not CEO level
    error NotCFO();

    ///
    //-----CONSTRUCTOR------
    ///
    /// @notice Initializes contract with given parameters.
    /// @dev Requires a valid SLCore address and payment token address.
    /// @param _totalInvestment The total value of the investment.
    /// @param _slPermissionsAddress The address of the Access Control contract.
    /// @param _slCoreAddress The SLCore address.
    /// @param  _paymentTokenAddress0 The address of the payment token 0.
    /// @param  _paymentTokenAddress1 The address of the payment token 1.
    /// @param _contractLevel The level of this contract.
    constructor(
        uint256 _totalInvestment,
        address _slPermissionsAddress,
        address _slCoreAddress,
        address _paymentTokenAddress0,
        address _paymentTokenAddress1,
        uint256 _contractLevel
    ) ERC20("InvestmentCurrency", "IC") {
        if (_slCoreAddress == address(0)) {
            revert InvalidAddress("SLCore");
        }
        if (_paymentTokenAddress0 == address(0)) {
            revert InvalidAddress("PaymentToken");
        }
        TOTAL_INVESTMENT = _totalInvestment * 10 ** decimals();
        SLPERMISSIONS_ADDRESS = _slPermissionsAddress;
        SLCORE_ADDRESS = _slCoreAddress;
        PAYMENT_TOKEN_ADDRESS_0 = _paymentTokenAddress0;
        PAYMENT_TOKEN_ADDRESS_1 = _paymentTokenAddress1;
        _changeStatus(Status.Progress);
        CONTRACT_LEVEL = _contractLevel;
    }

    ///
    //-----MAIN FUNCTIONS------
    ///
    /// @notice Allows a user to invest a certain amount.
    /// @dev The function requires the contract to be in Progress status and the platform to be active.
    /// @param _amount The amount to be invested.
    function invest(
        uint256 _amount
    ) public nonReentrant isAllowed isProgress isNotGloballyStoped {
        //Get amount already invested by user
        uint256 userInvested = _amount *
            10 ** decimals() +
            balanceOf(msg.sender);
        //Get max to invest
        uint256 maxToInvest = getMaxToInvest();
        //Check if amount invested is at least the minimum amount for investment
        if (_amount < MINIMUM_INVESTMENT) {
            revert WrongfulInvestmentAmount(
                userInvested,
                MINIMUM_INVESTMENT,
                maxToInvest
            );
        }
        //If user has invested more than the max to invest, he's not allowed to invest
        if (userInvested > maxToInvest) {
            revert WrongfulInvestmentAmount(
                userInvested,
                MINIMUM_INVESTMENT,
                maxToInvest
            );
        }
        //If the amount invested by the user fills the contract, the status is automaticaly changed
        if (totalSupply() + _amount * 10 ** 6 == TOTAL_INVESTMENT) {
            _changeStatus(Status.Process);
            emit ContractFilled(block.timestamp);
        }
        //Mint the equivilent amount of investment token to user
        _mint(msg.sender, _amount * 10 ** decimals());

        //ask for user payment
        IERC20(PAYMENT_TOKEN_ADDRESS_0).safeTransferFrom(
            msg.sender,
            address(this),
            _amount * 10 ** decimals()
        );

        emit UserInvest(msg.sender, _amount, block.timestamp);
    }

    /// @notice Allows a user to withdraw their investment.
    /// @dev The function requires the contract to be in Withdraw or Refunding status and the platform to be active.
    /// @custom:logic If contract is in Refunding status, profit will be 0 and users will withdraw exactly the same amount invested
    function withdraw()
        external
        nonReentrant
        isAllowed
        isWithdrawOrRefunding
        isNotGloballyStoped
    {
        //Check if user has withdrawed already
        if (userWithdrew[msg.sender] == 1) {
            revert CannotWithdrawTwice();
        }
        //Set user as withdrawed
        userWithdrew[msg.sender] = 1;
        //Calculate final amount
        uint256 finalAmount = calculateFinalAmount(balanceOf(msg.sender));
        //Transfer final amount
        IERC20(PAYMENT_TOKEN_ADDRESS_0).safeTransfer(msg.sender, finalAmount);
        emit Withdraw(msg.sender, finalAmount, block.timestamp);
    }

    // @notice Allows the CFO to withdraw funds for processing.
    /// @dev The function requires the contract to be in Process status and the platform to be active.
    function withdrawSL() external isProcess isNotGloballyStoped isCFO {
        //get total invested by users
        uint256 totalBalance = totalContractBalanceStable();
        //check if total invested is at least 80% of totalInvestment
        if (totalBalance < (TOTAL_INVESTMENT * 80) / 100) {
            revert NotEnoughForProcess(
                (TOTAL_INVESTMENT * 80) / 100,
                totalBalance
            );
        }

        emit SLWithdraw(totalBalance, block.timestamp);
        //Transfer tokens to caller
        IERC20(PAYMENT_TOKEN_ADDRESS_0).safeTransfer(msg.sender, totalBalance);
    }

    /// @notice Allows the CFO to refill the contract.
    /// @dev The function requires the contract to be in Process status and the platform to be active.
    /// @param _amount The amount to be refilled.
    /// @param _profitRate The profit rate for the refill.
    function refill(
        uint256 _amount,
        uint256 _profitRate
    ) public nonReentrant isNotGloballyStoped isProcess isCFO {
        //Verify if _amount is the total needed to fulfill users withdraw
        if (
            TOTAL_INVESTMENT + ((TOTAL_INVESTMENT * _profitRate) / 100) !=
            _amount * 10 ** decimals()
        ) {
            //calculates the amount expected without the decimals
            revert IncorrectRefillValue(
                TOTAL_INVESTMENT +
                    ((TOTAL_INVESTMENT * _profitRate) / 100) /
                    10 ** decimals(),
                _amount
            );
        }
        //globally sets profit rate amount
        returnProfit = _profitRate;
        // Change status to withdraw
        _changeStatus(Status.Withdraw);
        //ask for caller tokens
        IERC20(PAYMENT_TOKEN_ADDRESS_0).transferFrom(
            msg.sender,
            address(this),
            _amount * 10 ** decimals()
        );
        emit ContractRefilled(_amount, _profitRate, block.timestamp);
    }

    ///
    //-----GETTERS------
    ///
    /// @notice returns the total invested by users
    /// @return totalBalance the total amount invested
    function totalContractBalanceStable()
        public
        view
        returns (uint256 totalBalance)
    {
        totalBalance = totalSupply();
    }

    /// @notice Calculates the possible amount to invest
    /// @dev Checks if contract is more than 90% full and returns the remaining to fill, if not, returns 10% of total investment
    /// @return maxToInvest max allowed to invest at any time (by a user that didn't invest yet)
    function getMaxToInvest() public view returns (uint256 maxToInvest) {
        maxToInvest = TOTAL_INVESTMENT - totalContractBalanceStable();
        if (maxToInvest > TOTAL_INVESTMENT / 10) {
            maxToInvest = TOTAL_INVESTMENT / 10;
        }
    }

    /// @notice calculates the amount that the user has for withdrawal
    /// @dev if profit rate = 0 the amount returned will be as same as the amount invested
    /// @param _amount amount invested by the user
    /// @return totalAmount amount that the user has the right to withdraw
    /// @custom:obs minimum amount returned: [{_amount}]
    function calculateFinalAmount(
        uint256 _amount
    ) internal view returns (uint256 totalAmount) {
        totalAmount = (_amount + ((_amount * returnProfit) / 100));
    }

    ///
    //---- MODIFIERS------
    ///
    /// @notice Verifies if platform is paused.
    /// @dev If platform is paused, the whole contract is stopped
    modifier isNotGloballyStoped() {
        if (ISLPermissions(SLPERMISSIONS_ADDRESS).isPlatformPaused()) {
            revert PlatformPaused();
        }
        _;
    }
    /// @notice Verifies if contract is in progress status.
    /// @dev If contract is in progress, the only available functions are invest(), changeStatus()
    modifier isProgress() {
        if (status != Status.Progress) {
            revert InvalidContractStatus(status, Status.Progress);
        }
        _;
    }
    /// @notice Verifies if contract is in process status.
    /// @dev If contract is in process, the only available functions are withdrawSL(), changeStatus() and refill()
    modifier isProcess() {
        if (status != Status.Process) {
            revert InvalidContractStatus(status, Status.Process);
        }
        _;
    }
    /// @notice Verifies if contract is in withdraw or refunding status.
    /// @dev If contract is in progress, the only available functions are withdraw(), changeStatus()
    modifier isWithdrawOrRefunding() {
        if (status != Status.Withdraw && status != Status.Refunding) {
            revert InvalidContractStatus(status, Status.Withdraw);
        }
        _;
    }
    /// @notice Verifies if user has the necessary NFT to interact with the contract.
    /// @dev User should be at least the same level as the contract
    modifier isAllowed() {
        uint256 userLevel = ISLCore(SLCORE_ADDRESS).whichLevelUserHas(
            msg.sender
        );
        if (userLevel < CONTRACT_LEVEL) {
            revert IncorrectUserLevel(CONTRACT_LEVEL, userLevel);
        }
        _;
    }
    /// @notice Verifies if user is CEO.
    /// @dev CEO has the right to interact with: changeStatus()
    modifier isCEO() {
        if (!ISLPermissions(SLPERMISSIONS_ADDRESS).isCEO(msg.sender)) {
            revert NotCEO();
        }
        _;
    }
    /// @notice Verifies if user is CFO.
    /// @dev CEO has the right to interact with: withdrawSL() and refill()
    modifier isCFO() {
        if (!ISLPermissions(SLPERMISSIONS_ADDRESS).isCFO(msg.sender)) {
            revert NotCFO();
        }
        _;
    }

    ///
    //----STATUS FUNCTIONS------
    ///
    /// @notice Changes the status of the contract.
    /// @dev The function requires the caller to be a CEO.
    /// @param _newStatus The new status for the contract.
    function changeStatus(Status _newStatus) public isCEO nonReentrant {
        _changeStatus(_newStatus);
    }

    function _changeStatus(Status _newStatus) private {
        status = _newStatus;
    }

    ///
    //----OVERRIDES------
    ///
    /// @notice Returns the number of decimals for investment token. Is the same number of decimals as the payment token!
    /// @dev This function is overridden from the ERC20 standard.
    function decimals() public view override returns (uint8) {
        return 6;
    }

    /// @notice Disallows investment token transfers from one address to another.
    /// @dev This function is overridden from the ERC20 standard and always returns false.
    /// @param from The address to NOT transfer from.
    /// @param to The address to NOT transfer to.
    /// @param amount The amount to NOT be transferred.
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        return false;
    }

    /// @notice Disallows investment token transfers to another wallet.
    /// @dev This function is overridden from the ERC20 standard and always returns false.
    /// @param to The address to NOT transfer to.
    /// @param amount The amount to NOT be transferred.
    function transfer(
        address to,
        uint256 amount
    ) public override returns (bool) {
        return false;
    }
}

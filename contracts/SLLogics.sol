// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./SLMicroSlots.sol";
import "./ISLPermissions.sol";

interface IFactory {
    function getAddressTotal(
        address user
    ) external view returns (uint256 userTotal);

    function getAddressTotalInLevel(
        address user,
        uint256 level
    ) external view returns (uint256 userTotal);
}

interface IToken is IERC20 {}

/// @title Base contract for SL puzzle management
/// @author The name of the author
/// @notice Centralizes information on this contract, making sure that all of the ERC1155 communications and
/// memory writting calls happens thorugh here!
/// @dev Extra details about storage: https://app.diagrams.net/#G1Wi7A1SK0y8F9X-XDm65IUdfRJ81Fo7bF
contract SLLogics is ReentrancyGuard, SLMicroSlots {
    using SafeERC20 for IERC20;
    ///
    //-----STATE VARIABLES------
    ///
    /// @notice The address of the Access Control contract.
    /// @dev This value is set at the time of contract deployment.
    address public immutable SLPERMISSIONS_ADDRESS;
    /// @notice The address of the Investment factory.
    /// @dev This value is set at the time of contract deployment.
    address public factoryAddress;
    /// @notice The address of the payment token.
    /// @dev This value is set at the time of contract deployment.
    address public paymentTokenAddress;
    /// @notice Uint to store minimum claim amount for all levels and the current entry price
    /// @dev This value is set at the time of contract deployment. Entry price changes in time
    uint256 public min_claim_amount_and_entry_price = 100150001000005000;
    /// @notice Base uri for 0 -> 31 token
    /// @dev This value is set at the time of contract deployment.
    string public constant URI = "INSERT_HERE";
    // @notice uri for each entry batch
    /// @dev This value is set at the time of batch creation.
    string[] public batches_uri;

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

    /// @notice Reverts if input is not in level range
    /// @param level lvel of the pieces
    /// @param currentPieces current number of pieces
    /// @param maxPieces pieces limit
    error PiecesLimit(uint256 level, uint256 currentPieces, uint256 maxPieces);

    /// @notice Reverts if input is not in level range
    /// @param allowedPieces number of allowed pieces to claim by the user
    /// @param currentPieces number of claimed pieces
    error MissingInvestmentToClaim(
        uint256 allowedPieces,
        uint256 currentPieces
    );

    ///Function caller is not CFO level
    error NotCFO();

    ///Function caller is not Can allowed contract
    error NotAllowedContract();

    ///
    //-----CONSTRUCTOR------
    ///
    /// @notice Initilizes contract with given parameters.
    /// @dev Requires a valid SLCore, payment token and factory addresses .
    /// @param _factoryAddress The total value of the investmnet.
    /// @param  _paymentTokenAddress The address of the token management contract.
    /// @param _slPermissionsAddress The address of the Access Control contract.
    constructor(
        address _factoryAddress,
        address _paymentTokenAddress,
        address _slPermissionsAddress
    ) {
        if (_factoryAddress == address(0)) {
            revert InvalidAddress("Factory");
        }
        if (_paymentTokenAddress == address(0)) {
            revert InvalidAddress("Payment Token");
        }
        SLPERMISSIONS_ADDRESS = _slPermissionsAddress;
        factoryAddress = _factoryAddress;
        paymentTokenAddress = _paymentTokenAddress;
    }

    /// @notice An event that is emitted when Something Legendary wtihdraws tokens for processing.
    /// @param withdrawer The amount withdrawn.
    /// @param quantity The timestamp where action was perfomed.
    event TokensWithdrawn(address indexed withdrawer, uint256 indexed quantity);

    /// @notice Transfer the entry fee from the user's account to the contract's account
    /// @dev Uses the ERC20 `transferFrom` function
    /// @param _user The address of the user
    function payEntryFee(
        address _user
    ) external isAllowedContract nonReentrant {
        IERC20(paymentTokenAddress).safeTransferFrom(
            _user,
            address(this),
            _getEntryPrice()
        );
    }

    /// @notice Allow the CFO of the contract to withdraw tokens from the contract's account
    /// @dev Can only be called by the CFO of the contract
    /// @param _user The address of the user
    function withdrawTokens(address _user) external isCFO {
        IERC20 paymentToken = IERC20(paymentTokenAddress);
        uint256 amount = paymentToken.balanceOf(address(this));
        //Transfer tokens to the user
        IERC20(paymentTokenAddress).safeTransfer(_user, amount);
        //Emit event
        emit TokensWithdrawn(_user, amount);
    }

    ///CHECKER FOR PIECE CLAIMING
    // Function to verify if user has the right to claim the next level
    /// @notice Check if a user is allowed to claim a puzzle piece, verifiyng that user does not surpass 999 limit of pieces per user per level
    /// @dev Takes into account the user's current level and the number of puzzle pieces they have for their current level
    /// @param _user The address of the user
    /// @param _tokenId The ID of the token
    /// @param _currentUserLevel The current level of the user
    /// @param _userPuzzlePiecesForUserCurrentLevel The number of puzzle pieces the user has for their current level
    function _userAllowedToClaimPiece(
        address _user,
        uint256 _tokenId,
        uint256 _currentUserLevel,
        uint256 _userPuzzlePiecesForUserCurrentLevel
    ) public view {
        //Check if user has the right to claim pieces from this level
        if (_currentUserLevel != _tokenId) {
            revert InvalidLevel(_currentUserLevel, _tokenId, _tokenId);
        }
        //Check if user is allowed to claim more pieces in current level
        if (_userPuzzlePiecesForUserCurrentLevel >= 999) {
            revert PiecesLimit(
                _currentUserLevel,
                _userPuzzlePiecesForUserCurrentLevel,
                999
            );
        }
        //Check if user has the right amount of puzzle pieces
        IFactory factory = IFactory(factoryAddress);
        uint256 allowedToMint = (factory.getAddressTotalInLevel(
            _user,
            _tokenId
        ) / 10 ** 6) / getMinClaimAmount(_tokenId);
        if (_userPuzzlePiecesForUserCurrentLevel + 1 > allowedToMint) {
            revert MissingInvestmentToClaim(
                allowedToMint,
                _userPuzzlePiecesForUserCurrentLevel
            );
        }
    }

    /// @notice Check if a user is allowed to claim a puzzle piece
    /// @dev Takes into account the user's current level and the number of puzzle pieces they have for their current level
    /// @param _user The address of the user
    /// @param _tokenId The ID of the token
    /// @param _currentUserLevel The current level of the user
    /// @param _userPuzzlePiecesForUserCurrentLevel The number of puzzle pieces the user has for their current level
    /// @return A boolean indicating whether the user is allowed to claim the puzzle piece
    function userAllowedToClaimPiece(
        address _user,
        uint256 _tokenId,
        uint256 _currentUserLevel,
        uint256 _userPuzzlePiecesForUserCurrentLevel
    ) public view returns (bool) {
        _userAllowedToClaimPiece(
            _user,
            _tokenId,
            _currentUserLevel,
            _userPuzzlePiecesForUserCurrentLevel
        );
        return true;
    }

    ///SETTERS
    /// @notice Set the entry price for a new entry batch
    /// @dev This function can only be called by one of the allowed contracts
    /// @param _newPrice The price for the new entry batch
    /// @param _tokenURI The URI for the new entry batch
    function setEntryPrice(
        uint256 _newPrice,
        string memory _tokenURI
    ) external isAllowedContract {
        min_claim_amount_and_entry_price = changetXPositionInFactor5(
            min_claim_amount_and_entry_price,
            4,
            _newPrice
        );
        batches_uri.push(_tokenURI);
    }

    /// @notice returns entry NFT price
    /// @return uint256 price of entry
    function _getEntryPrice() public view returns (uint256) {
        return
            getPositionXInDivisionByY(min_claim_amount_and_entry_price, 4, 5);
    }

    /// @notice returns the minimum amount for claiming a puzzle piece per level
    /// @return uint256 minimum claim amount
    function getMinClaimAmount(uint256 _level) public view returns (uint256) {
        if (_level == 0) {
            revert InvalidLevel(_level, 1, 3);
        }
        if (_level > 3) {
            revert InvalidLevel(_level, 1, 3);
        }
        return
            getPositionXInDivisionByY(
                min_claim_amount_and_entry_price,
                _level,
                5
            );
    }

    /// @notice returns the uri of specified collection id
    /// @return uint256 link where NFT metadata is stored
    function uri(uint256 _tokenID) external view returns (string memory) {
        if (_tokenID <= 32) {
            return
                string(
                    abi.encodePacked(
                        URI,
                        "/",
                        Strings.toString(_tokenID),
                        ".json"
                    )
                );
        } else {
            (uint256 batch, ) = unmountEntryID(_tokenID);
            return batches_uri[batch];
        }
    }

    /// @notice Verifies if caller is an allowed contract.
    /// @dev allowed contracts has the right to interact with: payEntryFee() and setEntryPrice()
    modifier isAllowedContract() {
        if (
            !ISLPermissions(SLPERMISSIONS_ADDRESS).isAllowedContract(msg.sender)
        ) {
            revert NotAllowedContract();
        }
        _;
    }

    /// @notice Verifies if user is CFO.
    /// @dev CEO has the right to interact with: withdrawTokens()
    modifier isCFO() {
        if (!ISLPermissions(SLPERMISSIONS_ADDRESS).isCFO(msg.sender)) {
            revert NotCFO();
        }
        _;
    }
}

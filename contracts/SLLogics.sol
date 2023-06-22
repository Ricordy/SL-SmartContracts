// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./SLMicroSlots.sol";
import "./ISLPermissions.sol";

interface IFactory {
    function getAddressTotal(
        address user
    ) external view returns (uint userTotal);

    function getAddressTotalInLevel(
        address user,
        uint level
    ) external view returns (uint userTotal);
}

/// @title Base contract for SL puzzle management
/// @author The name of the author
/// @notice Centralizes information on this contract, making sure that all of the ERC1155 communications and
/// memory writting calls happens thorugh here!
/// @dev Extra details about storage: https://app.diagrams.net/#G1Wi7A1SK0y8F9X-XDm65IUdfRJ81Fo7bF
contract SLLogics is ERC20, ReentrancyGuard, SLMicroSlots {
    address public immutable slPermissionsAddress;
    address factoryAddress;
    address paymentTokenAddress;
    //Uint to store minimum claim amount for all levels and the entry price
    uint256 min_claim_amount_and_entry_price = 100150001000005000;
    string constant URI = "INSERT_HERE";
    string[] batches_uri;

    constructor(
        address _factoryAddress,
        address _paymentTokenAddress,
        address _slPermissionsAddress
    ) ERC20("", "") {
        require(
            _factoryAddress != address(0) && _paymentTokenAddress != address(0),
            "SLLogics: Re-check input parameters"
        );
        slPermissionsAddress = _slPermissionsAddress;
        factoryAddress = _factoryAddress;
        paymentTokenAddress = _paymentTokenAddress;
    }

    ///EVENTS
    //Tokens Withdrawn
    event TokensWithdrawn(
        address indexed withdrawer,
        uint256 indexed tokenId,
        uint256 quantity
    );

    ///ENTRY PAYMENT
    //Function to pay the entry fee
    function payEntryFee(
        address _user
    ) external isAllowedContract nonReentrant {
        require(
            IERC20(paymentTokenAddress).transferFrom(
                _user,
                address(this),
                _getEntryPrice()
            ),
            "SLLOGIC: Transfer failed"
        );
    }

    ///WITHDRAW FUNCTION
    //Function to withdraw tokens to the caller, this must be the CEO
    function withdrawTokens(address _user) external isCFO {
        //Transfer tokens to the user
        IERC20 paymentToken = IERC20(paymentTokenAddress);
        require(
            paymentToken.transfer(_user, paymentToken.balanceOf(address(this))),
            "SLLogics: Transfer incompleted"
        );
        //Emit event
    }

    ///CHECKER FOR PIECE CLAIMING
    // Function to verify if user has the right to claim the next level
    function _userAllowedToClaimPiece(
        address user,
        uint _tokenId,
        uint _currentUserLevel,
        uint _userPuzzlePiecesForUserCurrentLevel
    ) public view {
        //Check if user has the right to claim the next level
        require(
            _currentUserLevel == _tokenId,
            "SLLogics: User does not have the right to claim piece from this level"
        );
        //Check if user is allowed to claim more pieces in current level
        require(
            _userPuzzlePiecesForUserCurrentLevel < 999,
            "SLLogics: User has already claimed the max amount of pieces for this level"
        );
        //Check if user has the right amount of puzzle pieces
        IFactory factory = IFactory(factoryAddress);
        uint256 allowedToMint = (factory.getAddressTotalInLevel(
            user,
            _tokenId
        ) / 10 ** 6) / getMinClaimAmount(_tokenId);
        require(
            (_userPuzzlePiecesForUserCurrentLevel + 1) <= allowedToMint,
            "SLLogics: User does not have enough investment to claim this piece"
        );
    }

    function userAllowedToClaimPiece(
        address _user,
        uint _tokenId,
        uint _currentUserLevel,
        uint _userPuzzlePiecesForUserCurrentLevel
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
    //function to set the entry price
    //function to rewrite the price of the entry token
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

    ///GETTERS

    //function to get entry price
    function _getEntryPrice() public view returns (uint256) {
        return
            getPositionXInDivisionByY(min_claim_amount_and_entry_price, 4, 5);
    }

    //Get minimum claim amount per level
    function getMinClaimAmount(uint256 _level) public view returns (uint256) {
        require(
            _level == 1 || _level == 2 || _level == 3,
            "SLPuzzles: Not a valid puzzle level"
        );
        return
            getPositionXInDivisionByY(
                min_claim_amount_and_entry_price,
                _level,
                5
            );
    }

    function uri(uint _tokenID) external view returns (string memory) {
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
            (uint batch, ) = unmountEntryID(_tokenID);
            return batches_uri[batch];
        }
    }

    modifier isAllowedContract() {
        require(
            ISLPermissions(slPermissionsAddress).isAllowedContract(msg.sender),
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
}

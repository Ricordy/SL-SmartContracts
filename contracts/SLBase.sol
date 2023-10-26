// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./SLMicroSlots.sol";
import "./ISLPermissions.sol";
import "./ISLLogics.sol";

/// @title SLBase
/// @author Something Legendary
/// @notice Centralizes information on this contract, making sure that all of the ERC1155 communications and
/// memory writting calls happens thorugh here!
/// @dev Extra details about storage: https://app.diagrams.net/#G1Wi7A1SK0y8F9X-XDm65IUdfRJ81Fo7bF
contract SLBase is ERC1155, ReentrancyGuard, SLMicroSlots {
    ///
    //-----STATE VARIABLES------
    ///
    /// @notice Array to store the the levels and puzzles collection ids
    /// @dev Each ID is stored in 2 slots of the variable. Ex: IDs {00, 01, 02, ..., 30, 31}
    uint256 public constant COLLECTION_IDS =
        3130292827262524232221201918171615141312111009080706050403020100;
    /// @notice Array to store the entry batchs' IDs
    /// @dev Key: Entry batch number, reutrns enough to compute TokenID, max lotation and current token ID.
    uint24[] public entryIdsArray;
    /// @notice Mapping to tack number of user puzzle pieces
    /// @dev Key: Ke: user address, returns user puzzle pieces for all levels (separated the same way as COLLECTION_IDS).
    mapping(address => uint32) public userPuzzlePieces;
    /// @notice The address of SLLogics contract.
    /// @dev This value is set at the time of contract deployment.
    address public slLogicsAddress;
    /// @notice The address of Access control contract.
    /// @dev This value is set at the time of contract deployment.
    address public slPermissionsAddress;

    ///
    //-----EVENTS------
    ///
    /// @notice An event that is emitted when a user mint a level or a piece NFT.
    /// @param claimer The address of said user.
    /// @param tokenId The id of the collection minted from.
    event TokensClaimed(address indexed claimer, uint256 indexed tokenId);

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

    /// @notice Reverts if a token ID is invalid
    error InvalidTokenID();

    /// @notice Reverts if user is not at least at contract level
    /// @param expectedLevel expected user minimum level
    /// @param userLevel user level
    error IncorrectUserLevel(uint256 expectedLevel, uint256 userLevel);

    /// @notice Reverts if user don't have the complete puzzle
    /// @param level level of the required puzzle
    error UserMustHaveCompletePuzzle(uint256 level);

    /// @notice Reverts if there is no entry batch
    error InexistentEntryBatch();

    /// @notice Reverts if there is no tokens remaining on current entry batch
    error NoTokensRemaining();

    /// @notice Reverts if platform is paused
    error PlatformPaused();

    ///Function caller is not CEO level
    error EntryMintPaused();

    ///Function caller is not CEO level
    error ClaimingPaused();

    ///Function caller is not CEO level
    error NotCEO();

    constructor() ERC1155("Something Legendary") {}

    ///
    //-----WRITTING FUNCTIONS------
    ///
    /// @notice function call the necessary functions to try to pass the user to the next one
    /// @dev puzzle tokens required to pass the level are burned during the transaction
    /// @param _receiver the recevier of the level (the user).
    /// @param _tokenId the collection id that the user wants to mint from
    /// @custom:requires _tokenId should be 30(level 2) or 31(level 3)
    function _claimLevel(address _receiver, uint256 _tokenId) internal {
        if (_tokenId < 30) {
            revert InvalidLevel(_tokenId, 30, 31);
        }
        if (_tokenId > 31) {
            revert InvalidLevel(_tokenId, 30, 31);
        }
        //Check if user has the right to claim the next level or puzzle piece
        verifyClaim(msg.sender, _tokenId);

        //Burn puzzle pieces
        _dealWithPuzzleBurning(_receiver, _tokenId);
        //Transfer tokens to user
        _transferTokensOnClaim(_receiver, _tokenId, 1);

        emit TokensClaimed(_receiver, _tokenId);
    }

    /// @notice function call the necessary functions to try to mint a puzzle piece for the user
    /// @dev puser must be in the same level as the piece his minting
    /// @param _receiver the recevier of the puzzle piece (the user).
    /// @param _puzzleLevel the level from which the user wants to mint the puzzle from
    function _claimPiece(address _receiver, uint256 _puzzleLevel) internal {
        if (_puzzleLevel == 0) {
            revert InvalidLevel(_puzzleLevel, 1, 3);
        }
        if (_puzzleLevel > 3) {
            revert InvalidLevel(_puzzleLevel, 1, 3);
        }
        //Check if user has the right to claim the next level or puzzle piece
        verifyClaim(msg.sender, _puzzleLevel);
        //Transfer tokens to user
        _transferTokensOnClaim(
            _receiver,
            _dealWithPuzzleClaiming(_receiver, _puzzleLevel),
            1
        );

        emit TokensClaimed(_receiver, _puzzleLevel);
    }

    ///
    //-------------------------FUNCTIONS TO BE OVERRIDEN----------------------
    ///
    /// @notice Verifies if user can claim given piece or level NFT
    /// @dev Override the verify claim function to check if user has the right to claim the next level or puzzle piece
    /// @param _claimer the user's address
    /// @param _tokenIdOrPuzzleLevel The token id of the level (30 or 30) or LEvel of the piece (1,2,3)
    function verifyClaim(
        address _claimer,
        uint256 _tokenIdOrPuzzleLevel
    ) public view virtual {}

    /// @notice returns random number
    function _random() public view virtual returns (uint8) {}

    ///
    //-----------------INTERNAL OVERRIDE FUNCTIONS----------------
    ///
    /// @notice Function that defines which piece is going to be minted
    /// @dev Override to implement puzzle piece claiming logic
    /// @param _receiver the user's address
    /// @param _puzzleLevel The level of the piece (1,2,3)
    /// @return _collectionToMint the collection from which the piece is going to be minted
    function _dealWithPuzzleClaiming(
        address _receiver,
        uint256 _puzzleLevel
    ) internal virtual returns (uint8 _collectionToMint) {}

    /// @notice Auxiliary function to burn user puzzle depending on his level
    /// @dev burns in batch to be gas wiser
    /// @param _user the user's address
    /// @param _levelId The id of piece's level (lvl 2->30, lvl3->31)
    function _dealWithPuzzleBurning(address _user, uint256 _levelId) private {
        //Helpers
        uint256 helperSize = 10;
        uint256[] memory amountsForBurn = new uint256[](helperSize);
        //Fill needed arrays
        for (uint256 i; i < helperSize; ++i) {
            amountsForBurn[i] = 1;
        }
        //Puzzle verification for passing to level2
        if (_levelId == 30) {
            //Burn user puzzle right away (so verify claim doesnt get to big)
            _burnBatch(_user, _getPuzzleCollectionIds(1), amountsForBurn);
            //Puzzle verification for passing to level3
        } else if (_levelId == 31) {
            _burnBatch(_user, _getPuzzleCollectionIds(2), amountsForBurn);
        }
    }

    /// @notice Function that verifies if user is allowed to pass to the next level
    /// @dev function have no return, it should fail if user is not allowed to burn
    /// @param _claimer the user's address
    /// @param _levelId The id of piece's level (lvl 2->30, lvl3->31)
    function _userAllowedToBurnPuzzle(
        address _claimer,
        uint256 _levelId
    ) public view virtual {}

    ///
    //----------------INTERNAL NON-OVERRIDE FUNCTIONS------------------
    ///
    /// @notice Increments by 1 the number of user puzzle pieces in a specified level
    /// @dev Uses SLMicroSlots to write in a variable in such format "333222111"
    /// (where 333 -> Nº of LVL3 pieces, 222 -> Nº of LVL2 pieces, 111 -> Nº of LVL1 pieces)
    /// @param _user user's address
    /// @param _puzzleLevel level in which we want to increment the amount by 1
    function _incrementUserPuzzlePieces(
        address _user,
        uint256 _puzzleLevel
    ) internal {
        userPuzzlePieces[_user] = incrementXPositionInFactor3(
            userPuzzlePieces[_user],
            uint32(_puzzleLevel)
        );
    }

    /// @notice function to mint tokens on claim
    /// @param _receiver user's address
    /// @param _tokenId the id of the collection from which the NFT should be minted
    /// @param _quantity quantity to mint
    function _transferTokensOnClaim(
        address _receiver,
        uint256 _tokenId,
        uint256 _quantity
    ) internal {
        _mint(_receiver, _tokenId, _quantity, "");
    }

    ///
    //------------------GETTERS MOST OVERRIDEN------------------------
    ///
    /// @notice funtion that returns the level token ids
    /// @dev should be overriden
    /// @param level the level that we want the token IDs
    /// @return uint256[] memory with ids for level 2 and 3 (30,31) or all level 1 collection ids
    function _getLevelTokenIds(
        uint256 level
    ) internal view virtual returns (uint256[] memory) {}

    /// @notice funtion that returns the puzzle pieces for a specified level
    /// @dev should be overriden
    /// @param level the level that we want the token IDs
    /// @return uint256[] memory with 10 ids for 10 pieces
    function _getPuzzleCollectionIds(
        uint256 level
    ) public view virtual returns (uint256[] memory) {}

    //
    /// @notice function to create a user address array with the given size
    /// @param _user user intented to create the array
    /// @param _size size of new array
    /// @return uint256[] memory with size slots of user addresses
    function _createUserAddressArray(
        address _user,
        uint256 _size
    ) internal pure returns (address[] memory) {
        address[] memory userAddress = new address[](_size);
        for (uint256 i; i < _size; ++i) {
            userAddress[i] = _user;
        }
        return userAddress;
    }

    ///
    //---- MODIFIERS------
    ///
    /// @notice Verifies if user is CEO.
    /// @dev CEO has the right to interact with certain functions
    modifier isCEO() {
        if (!ISLPermissions(slPermissionsAddress).isCEO(msg.sender)) {
            revert NotCEO();
        }
        _;
    }
    /// @notice Verifies if entry minting is not paused.
    /// @dev If it is paused, the only available actions are claimLevel() and claimPiece()
    modifier isEntryMintNotPaused() {
        if (ISLPermissions(slPermissionsAddress).isEntryMintPaused()) {
            revert EntryMintPaused();
        }
        _;
    }
    /// @notice Verifies if puzzle and level 2 and 3 minting is stoped.
    /// @dev If it is paused, the only action available is mintEntry()
    modifier isPuzzleMintNotPaused() {
        if (ISLPermissions(slPermissionsAddress).isClaimPaused()) {
            revert ClaimingPaused();
        }
        _;
    }
    /// @notice Verifies if platform is paused.
    /// @dev If platform is paused, the whole contract is stopped
    modifier isNotGloballyStoped() {
        if (ISLPermissions(slPermissionsAddress).isPlatformPaused()) {
            revert PlatformPaused();
        }
        _;
    }
}

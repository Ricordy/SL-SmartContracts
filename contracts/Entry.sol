// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IFactory {
    function getAddressTotal(address user) external view returns(uint userTotal);
}
interface ILevelsFactory {
    function userHasLevel2(address user) external view returns(bool uLvl2Ownership);
    function currentLevel2() external view returns(address level2Address);
}
interface ILevelsContract {
    function mintLevel2(address user) external returns(bool result);
}




contract Entry is ERC1155, Ownable, ReentrancyGuard {
    ///
    //-----STATE VARIABLES------
    ///
    //-----1155 IDS-----
    uint8 public constant WHEEL = 0;
    uint8 public constant STEERING = 1;
    uint8 public constant GLASS = 2;
    uint8 public constant CHASIS = 3;
    uint8 public constant BREAK = 4;
    uint8 public constant DOOR = 5;
    uint8 public constant LIGHT = 6;
    uint8 public constant AC = 7;
    uint8 public constant CHAIR = 8;
    uint8 public constant MOTOR = 9;
    uint8 public constant LEVEL1 = 10;
    uint256[] COLLECTION_IDS = [
        WHEEL,
        STEERING,
        GLASS,
        CHASIS,
        BREAK,
        DOOR,
        LIGHT,
        AC,
        CHAIR,
        MOTOR,
        LEVEL1
    ];
    //-----GENERAL------
    uint256 public constant MAX_PER_COLLECTION = 15;
    uint256 public constant ENTRY_NFT_PRICE = 100;
    uint256 public constant MIN_CLAIM_AMOUNT = 5000;
    //-----CURRENTTOTAL------
    mapping(uint8 => uint256) private tokenID; //CURRENT TOKEN ID FOR EACH COLLECTION
    //-----USERTOTALPUZZLE------
    mapping(address => uint256) private userPuzzlePieces;
    //-----RESERVED------               TO BE IMPLEMENTED
    //uint256 reserved_owner = 10;
    //uint256 reservedForFree = 100;
    //-----URI------
    string private constant base_uri_not_revealed = "insert ipfs link";
    string public constant base_uri =
        "ipfs://bafybeiemgzx3i5wa5cw47kpyz44m3t76crqdahe5onjibmgmpshjiivnjm";
    bool isReaveled = false;
    //-----ADDRESSES OF COMMUNICATIONS-----
    address public immutable factoryAddress;
    address public level2FactoryAddress;
    address public immutable paymentTokenAddress;

    ///
    //------EVENTS--------
    ///

    event Minted(uint8 collection, uint256 id, address user);
    event Burned(address user);

    event BurnedAndMinted(address user, uint256[] burnedIds, uint256[] amount);

    ///
    //------TESTING DECLARATIONS--------
    ///
    event Max(uint8 collection, uint256 max_amount);

    constructor(
        address _factoryAddress,
        address _paymentTokenAddress,
        address _level2FactoryAddress
    ) ERC1155("") {
        require(
            _factoryAddress != address(0) && _paymentTokenAddress != address(0),
            "Puzzle: Check the parameters and redeploy"
        );
        for (uint8 i = 0; i < COLLECTION_IDS.length; i++) {
            tokenID[i]++;
        }
        factoryAddress = _factoryAddress;
        paymentTokenAddress = _paymentTokenAddress;
        level2FactoryAddress = _level2FactoryAddress;
    }

    ///
    //-----MINT------
    ///

    function claim() external isAllowed nonReentrant {
        require(verifyClaim(msg.sender), "User not able to claim");
        uint8 ID = tRandom();
        require(tokenID[ID] <= MAX_PER_COLLECTION, "Collection limit reached");
        userPuzzlePieces[msg.sender]++;
        tokenID[ID]++;
        _mint(msg.sender, ID, 1, "");
        emit Minted(ID, 1, msg.sender);
    }

    function mintEntry() external nonReentrant {
        require(tokenID[LEVEL1] <= MAX_PER_COLLECTION, "Collection limit reached");
        require(
            balanceOf(msg.sender, LEVEL1) < 1,
            "User already has the Entry NFT"
        );

        tokenID[LEVEL1]++;
        _mint(msg.sender, LEVEL1, 1, "");

        ERC20 _token = ERC20(paymentTokenAddress);
        require(
            _token.transferFrom(
                msg.sender,
                address(this),
                ENTRY_NFT_PRICE * 10 ** _token.decimals()
            ) == true,
            "Puzzle: Error in token transfer"
        );

        emit Minted(LEVEL1, 1, msg.sender);
    }

    ///
    //-----GET RANDOM ID------
    ///
    function tRandom() private view isAllowed returns (uint8) {
        uint rnd = (uint256(
            keccak256(
                abi.encodePacked(block.timestamp, block.difficulty /*Check this out */, msg.sender)
            )
        ) % MOTOR);
        return uint8(rnd);
    }

    ///
    //-----BURNBATCH------
    ///
    function burn() external isAllowed nonReentrant {
        ILevelsFactory levels = ILevelsFactory(level2FactoryAddress);
        require(
            levels.userHasLevel2(msg.sender) == false,
            "User already has the LEVEL2 NFT"
        );
        (
            bool burnable,
            uint256[] memory _idsToBurn,
            uint256[] memory newIDS
        ) = verifyBurn(msg.sender);
        require(burnable, "Not able to burn");
        emit BurnedAndMinted(msg.sender, newIDS, _idsToBurn);
        _burnBatch(msg.sender, newIDS, _idsToBurn);
         require(
            ILevelsContract(levels.currentLevel2()).mintLevel2(msg.sender),
            "Not able to mint level2"
        );
    }

    ///
    //-----CHECKERS------
    ///
    function verifyBurn(
        address user
    ) public view isAllowed returns (bool, uint256[] memory, uint256[] memory) {
        uint256[] memory idsForBurn = new uint256[](10);
        uint256[] memory newIDS = new uint256[](10);
        address[] memory userAddress = new address[](10);
        for (uint i = 0; i < newIDS.length; i++) {
            userAddress[i] = user;
            newIDS[i] = COLLECTION_IDS[i];
        }
        uint256[] memory balance = balanceOfBatch(userAddress, newIDS);
        for (uint i = 0; i < balance.length; i++) {
            if (balance[i] == 0) {
                return (false, idsForBurn, newIDS);
            }
            idsForBurn[i] = 1;
        }

        return (true, idsForBurn, newIDS);
    }

    function verifyClaim(address user) public view isAllowed returns (bool) {
        IFactory factory = IFactory(factoryAddress);
        uint256 allowedToMint = factory.getAddressTotal(user) /
            MIN_CLAIM_AMOUNT;
        if (userPuzzlePieces[user] + 1 > allowedToMint) {
            return false;
        }
        return true;
    }

    function tokenURI(uint256 tokenId) public pure returns (string memory) {
        if (/*isReaveled*/ true) {
            string memory _post_uri = string(
                abi.encodePacked(
                    base_uri,
                    "/",
                    Strings.toString(tokenId),
                    ".json"
                )
            );
            return _post_uri;
        } else {
            return base_uri_not_revealed;
        }
    }

    function uri(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        return tokenURI(tokenId);
    }

    /*
    function reveal() external onlyOwner 
    {
      isRevealed = true;
    }

*/
    ///
    //-----TESTING FUNCTIONS------
    ///
    function mintTest() public {
        for (uint8 i; i < COLLECTION_IDS.length - 2; i++) {
            _mint(msg.sender, i, 1, "");
            tokenID[i]++;
        }
    }

    modifier isAllowed() {
        require(balanceOf(msg.sender, LEVEL1) > 0, "Puzzle: Missing Entry NFT");
        _;
    }

    
}
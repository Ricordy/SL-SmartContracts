// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

interface IFactory {
    function getAddressTotal(address user) external view returns(uint userTotal);
}


contract Puzzle is ERC1155, Ownable, ReentrancyGuard{

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
    uint8 public constant LEVEL2 = 11;
    uint256[] COLLECTION_IDS = [WHEEL,STEERING,GLASS,CHASIS,BREAK,DOOR,LIGHT,AC,CHAIR,MOTOR,LEVEL1,LEVEL2];
            //-----GENERAL------
    mapping(uint8 => uint256) MAX_LOT;
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
    string private base_uri_not_revealed;
    string public base_uri = "ipfs://bafybeiemgzx3i5wa5cw47kpyz44m3t76crqdahe5onjibmgmpshjiivnjm";
    bool isReaveled = false;
            //-----ADDRESSES OF COMMUNICATIONS-----
    address public factoryAddress;
    address public paymentTokenAddress;
            //------VALUES-------


    ///
    //------EVENTS--------
    /// 

    event Minted(
        uint8 collection,
        uint256 id,
        address user
    );
    event Burned(
        address user
    );

    event BurnedAndMinted(
        address user,
        uint256[] burnedIds,
        uint256[] amount
    );
    
    ///
    //------TESTING DECLARATIONS--------
    /// 
    event Max(
        uint8 collection,
        uint256 max_amount
    );

    constructor(address _factoryAddress,address _paymentTokenAddress) ERC1155(""){
        for(uint8 i; i < COLLECTION_IDS.length; i++){
            MAX_LOT[i] = MAX_PER_COLLECTION; 
            tokenID[i]++;
        }
        factoryAddress = _factoryAddress;
        paymentTokenAddress = _paymentTokenAddress;
    }

    ///
    //-----MINT------
    ///

    function claim() external isAllowed nonReentrant {
        require(verifyClaim(msg.sender), "User not able to claim");
        uint8 ID = tRandom();
        require(tokenID[ID] <= MAX_PER_COLLECTION, "Collection limit reached");
        _mint(msg.sender, ID, 1, "");
        userPuzzlePieces[msg.sender]++;
        tokenID[ID]++;
        emit Minted(ID, 1, msg.sender);
    }

    function mintEntry() external nonReentrant {
        require(balanceOf(msg.sender, LEVEL1) < 1, "User already has the Entry NFT");
        require(tokenID[LEVEL1] <= MAX_LOT[LEVEL1], "Collection limit reached");
        ERC20 _token = ERC20(paymentTokenAddress);
        _token.transferFrom(msg.sender, address(this), ENTRY_NFT_PRICE);
        tokenID[LEVEL1]++;
        _mint(msg.sender, LEVEL1, 1, "");
        emit Minted(LEVEL1, 1, msg.sender);
    }
  


    ///
    //-----GET RANDOM ID------
    ///
    function tRandom() private view isAllowed returns(uint8) {
        uint rnd = (uint256(keccak256(abi.encodePacked(block.timestamp,block.difficulty,  
        msg.sender)) ) % MOTOR) ;
        return uint8(rnd);
    }

    ///
    //-----BURNBATCH------
    ///
    function burn() external isAllowed nonReentrant {
        require(balanceOf(msg.sender, LEVEL2) == 0, "User already has the LEVEL2 NFT"); 
        (bool burnable, uint256[] memory _idsToBurn, uint256[] memory newIDS)=verifyBurn(msg.sender);
        require(burnable, "Not able to burn");
        _burnBatch(msg.sender, newIDS, _idsToBurn);
        _mint(msg.sender, LEVEL2, 1, "");
        emit BurnedAndMinted(msg.sender, newIDS, _idsToBurn);
        tokenID[LEVEL2]++;

    }

    ///
    //-----CHECKERS------
    ///
    function verifyBurn(address user) public view isAllowed returns(bool, uint256[] memory, uint256[] memory) {
        uint256[] memory idsForBurn = new uint256[](10);
        uint256[] memory newIDS = new uint256[](10);
        address[] memory userAddress = new address[](10);
        for(uint i = 0; i < newIDS.length; i++){
            userAddress[i] = user;
            newIDS[i] = COLLECTION_IDS[i];
        }
        uint256[] memory balance = balanceOfBatch(userAddress, newIDS);
        for(uint i; i< balance.length; i++){
            if(balance[i] == 0){
                return(false, idsForBurn, newIDS);
            }
            idsForBurn[i] = 1;
        }

        return(true, idsForBurn, newIDS);
        
        
    }

    function verifyClaim(address user) public view isAllowed returns(bool){
        IFactory factory = IFactory(factoryAddress);
        uint256 allowedToMint = factory.getAddressTotal(user) / MIN_CLAIM_AMOUNT;
        if(userPuzzlePieces[user] + 1 > allowedToMint){
            return false;
        }
        return true;
    }

    function tokenURI(uint256 tokenId) public view returns (string memory)
    {
      if(/*isReaveled*/ true)
      {
        string memory _post_uri = string(abi.encodePacked(base_uri ,'/', Strings.toString(tokenId),".json"));
        return _post_uri ;
      } else 
      {
        return base_uri_not_revealed;
      }
    }

    function uri(uint256 tokenId) public view virtual override returns (string memory) {
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
        for(uint8 i; i < COLLECTION_IDS.length - 2; i++){
            _mint(msg.sender, i, 1, "");
            tokenID[i]++;
        }
    }
    function getMaxCollection(uint8 collection) public view returns(uint256 max){
        max = MAX_LOT[collection];
    }


    

    modifier isAllowed() {
        require(balanceOf(msg.sender, LEVEL1) > 0, "Puzzle: Not accessible");
        _;
   }

}
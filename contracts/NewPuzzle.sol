// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Puzzle is ERC1155, Ownable{



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
    uint8 public constant LEVEL2 = 10;
    uint256[] IDS = [WHEEL,STEERING,GLASS,CHASIS,BREAK,DOOR,LIGHT,AC,CHAIR,MOTOR,LEVEL2];
            //-----GENERAL------
    mapping(uint8 => uint256) MAX_LOT;
    uint256 max_per_mint = 100;
    uint256 price = 0.0001 ether;
            //-----CURRENTID------
    mapping(uint8 => uint256) private tokenID ; //CURRENT TOKEN ID FOR EACH COLLECTION
            //-----RESERVED------               TO BE IMPLEMENTED
    //uint256 reserved_owner = 10;        
    //uint256 reservedForFree = 100;
            //-----URI------
    string private base_uri_not_revealed;
    string private base_uri = "ipfs://bafybeibs2wctspbnprvyuye62ddondu2rxjvpqxpskx2dzymzewbrxhzqi";
    //string private base_uri = "ipfs://bafybeidtqcijajia3af4evji3tnax5kwsqjcp2pejhmm52a4kfagtcpze4";
    bool isReaveled = false;
            //-----VERIFICATION------
    address[] userAddress = new address[](10);
            //-----LGENTRY ADDRESS-----
    address private entryAdd;




    ///
    //------EVENTS--------
    /// 

    event Minted(
        uint8 collection,
        uint256 id
    );
    event Burned(
        bool 
    );


    constructor(/*address lgentry*/) ERC1155(""){
        for(uint8 i; i < IDS.length ; i++){
            MAX_LOT[i] = 1000;
            tokenID[i]++;
            _mint(msg.sender, i, tokenID[i], "");

        }
        //entryAdd = lgentry;

    }

    ///
    //-----MINT------
    ///

    function mint() public isAllowed{
        uint8 ID = tRandom();
        _mint(msg.sender, ID, nextID(ID), "");
        emit Minted(ID, tokenID[ID]);

    }



    ///
    //-----GET NEXT TOKENID------
    ///

    function nextID(uint8 _ID) private isAllowed returns(uint256) {
        uint idToToken = tokenID[_ID];
        tokenID[_ID]++;
        return idToToken;

    }

    ///
    //-----GET RANDOM ID------
    ///
    function tRandom() private view isAllowed returns(uint8) {
        uint rnd = (uint256(keccak256(abi.encodePacked(block.timestamp,block.difficulty,  
        msg.sender)) ) % IDS.length) ;
        return uint8(rnd);
    }

    ///
    //-----BURNBATCH------
    ///
    function burn() public isAllowed {
        (bool burnable, uint256[] memory _idsToBurn, uint256[] memory newIDS)=verifyBurn(msg.sender);
        require(burnable, "Not able to burn");
        _burnBatch(msg.sender, newIDS, _idsToBurn);
        emit Burned(true);
        _mint(msg.sender, LEVEL2, nextID(LEVEL2), "");
        
    }

    ///
    //-----VERIFY USER ABILITY TO BURN------
    ///
    function verifyBurn(address user) public isAllowed returns(bool, uint256[] memory, uint256[] memory) {
        uint256[] memory idsForBurn = new uint256[](10);
        uint256[] memory newIDS = new uint256[](10);
        for(uint i = 0; i < newIDS.length; i++){
            userAddress[i] = user;
            newIDS[i] = IDS[i];
        }
        uint256[] memory balance = balanceOfBatch(userAddress, newIDS);
        for(uint i; i< balance.length; i++){
            if(balance[i] == 0){
                return(false, idsForBurn, newIDS);
            }
            idsForBurn[i] = balance[i];
        }

        return(true, idsForBurn, newIDS);
        
        
    }


    ///
    //-----TESTING FUNCTIONS------
    ///
    function mintTest() public {
        for(uint8 i; i < IDS.length - 1; i++){
            tokenID[i]++;
            _mint(msg.sender, i, tokenID[i], "");


        }
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

    function reveal() external onlyOwner 
    {
      isReaveled = true;
    }


    
    
   modifier isAllowed() {
        //require(ERC721(entryAdd).balanceOf(msg.sender) > 0, "Not accessible");
            _;
   }





}
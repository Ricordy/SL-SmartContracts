// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
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
    uint256[] IDS = [WHEEL,STEERING,GLASS,CHASIS,BREAK,DOOR,LIGHT,AC,CHAIR,MOTOR];
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
    bool isRevealed = false;
    string base_uri;
            //-----VERIFICATION------
    address[] userAddress = new address[](10);

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


    constructor() ERC1155(""){
        for(uint8 i; i < IDS.length ; i++){
            tokenID[i]++;
            MAX_LOT[i] = 1000;
            _mint(msg.sender, i, tokenID[i], "");
            

        }


        /*
        OpenZeppelin's Example, may be needed. 

        _mint(msg.sender, WHEEL, 1, "");
        _mint(msg.sender, STEERING, 1, "");
        _mint(msg.sender, GLASS, 1, "");
        _mint(msg.sender, CHASIS, 1, "");
        _mint(msg.sender, BREAK, 1, "");
        */


    }

    ///
    //-----MINT------
    ///

    function mint() public {
        uint8 ID = tRandom();
        _mint(msg.sender, ID, nextID(ID), "");
        emit Minted(ID, tokenID[ID]);

        

    }

    ///
    //-----GET NEXT TOKENID------
    ///

    function nextID(uint8 _ID) private returns(uint256) {
        uint idToToken = tokenID[_ID];
        tokenID[_ID]++;
        return idToToken;

    }

    ///
    //-----GET RANDOM ID------
    ///
    function tRandom() private view returns(uint8) {
        uint rnd = (uint256(keccak256(abi.encodePacked(block.timestamp,block.difficulty,  
        msg.sender)) ) % BREAK) ;
        return uint8(rnd);

    }

    ///
    //-----BURNBATCH------
    ///
    function burn() public {
        (bool burnable, uint256[] memory _idsToBurn)=verifyBurn(msg.sender);
        require(burnable, "Not able to burn");
        _burnBatch(msg.sender, IDS, _idsToBurn);
        emit Burned(true);
        
    }

    ///
    //-----VERIFY USER ABILITY TO BURN------
    ///
    function verifyBurn(address user) public returns(bool, uint256[] memory){
        uint256[] memory idsForBurn = new uint256[](10);
        for(uint i = 0; i < IDS.length; i++){
            userAddress[i] = user;
        }
        uint256[] memory balance = balanceOfBatch(userAddress, IDS);
        for(uint i; i< balance.length; i++){
            if(balance[i] == 0){
                return(false, idsForBurn);
            }
            idsForBurn[i] = balance[i];
            console.log(idsForBurn[i]);
        }

        return(true, idsForBurn);
        
        
    }



    




}


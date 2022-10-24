// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract Puzzle is ERC1155{



    ///
    //-----STATE VARIABLES------
    ///
            //-----1155 IDS-----
    uint8 public constant WHEEL = 0;
    uint8 public constant STEERING = 1;
    uint8 public constant GLASS = 2;
    uint8 public constant CHASIS = 3;
    uint8 public constant BREAK = 4;
    uint256[]  IDS = [0,1,2,3,4,5];
            //-----GENERAL------
    mapping(uint8 => uint256) MAX_LOT;
    uint256 max_per_mint = 100;
    uint256 price = 0.0001 ether;
            //-----CURRENTID------
    mapping(uint8 => uint256) private tokenID ;
    mapping(uint8 => mapping(uint256 => bool)) private tracer; // To implement
            //-----RESERVED------               TO BE IMPLEMENTED
    //uint256 reserved_owner = 10;        
    //uint256 reservedForFree = 100;
            //-----URI------
    bool isRevealed = false;
    string base_uri;
            //-----Verification------
    address[] userAddress ;


    constructor() ERC1155(""){
        for(uint8 i; i < BREAK ; i++){
            MAX_LOT[i] = 1000;
            _mint(msg.sender, i, 1, "");
            tokenID[i]++;
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
    function tRandom() private returns(uint8) {
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
    }

    ///
    //-----VERIFY USER ABILITY TO BURN------
    ///
    function verifyBurn(address user) public returns(bool, uint256[] memory){
        uint256[] memory idsForBurn;
        for(uint i; i < BREAK; i++){
            userAddress[i] = user;
        }
        uint256[] memory balance = balanceOfBatch(userAddress, IDS);
        for(uint i; i< balance.length; i++){
            if(balance[i] == 0){
                return(false, idsForBurn);
            }
            idsForBurn[i] = balance[i];
        }
        
        
    }

    




}


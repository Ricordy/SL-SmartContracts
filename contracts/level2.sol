// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;



import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

interface INFTPuzzle {


    function burnForClaim(uint256[] memory tokenIds) external returns(bool/* Operations is sucesselful */);


    function addressInfo(address _address) external view returns(uint256 _amount /* Address total tokens amount*/, uint256[] memory _tokenIds /*All address token ids sotred in array */);

    function getBalnceUser(address _address, uint256 _amount) external returns(uint256[] memory);

    
}

contract Level2Legendary is  Ownable, ReentrancyGuard, ERC721Enumerable{


    INFTPuzzle _NFTPuzzle;



    uint256 maxAmount;
    uint256 maxUserAmount;
    uint256 reservedForOwner;
    uint256 internal tokenID;


    string private base_uri;
    bool isRevealed;

    mapping(address => uint256) addressToTokenId;
    uint8 maxPerTransaction = 1;
    address nftPuzzleContractAddress;

    constructor(uint256 _maxAmount, uint256 _maxUserAmount ,uint256 _reservedForOwner, string memory _baseURI, address _nftPuzzleContractAddress) ERC721("Level2Legendary", "LVL2"){
        nftPuzzleContractAddress = _nftPuzzleContractAddress;
        maxAmount = _maxAmount;
        maxUserAmount = _maxUserAmount;
        reservedForOwner = _reservedForOwner;
        base_uri = _baseURI;
    }


    /*

    EVENTS FOR TESTING

    */
   
    event UserInfo(
        uint256 amount,
        uint256[] ids

    );







    /*

    LOGICAL FUNCTIONS

    */

    function burnIf() public nonReentrant {
        (uint256 _userAmount, uint256[] memory userTokenIndexes) = getAddressInfo();
        require(checkDifferents(10000,_userAmount,userTokenIndexes),"Not all NFTPuzzle are different");
        require(INFTPuzzle(nftPuzzleContractAddress).burnForClaim(userTokenIndexes), "Not able to burn tokens");
        require(addressToTokenId[msg.sender] < maxUserAmount, "Address cannot mint more than maxPerUser");
        _mint(msg.sender, tokenID);
        addressToTokenId[msg.sender] = tokenID;
        tokenID++;

    }


    function checkDifferents(uint256 _coleectionTotal, uint256 _userAmount, uint256[] memory userTokenIndexes) internal pure returns(bool){
        uint[] memory checked;
        
        require(_userAmount == 10, "Not exactly 10 tokens.");
        for(uint i = 0; i<_userAmount; i++){
            checked[i] = (userTokenIndexes[i] % _coleectionTotal + 1);
            for(uint _i = 0; _i<i; _i++){
                if(checked[i] == checked[_i]){
                    return false;
                }
            }
        }

        return true;

    }




    /*

    METADATA

    */




    function reveal(string memory _base_uri) external onlyOwner 
    {
        base_uri = _base_uri;
        isRevealed = true;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory)
    {
        if(isRevealed)
        {
            string memory _post_uri = string(abi.encodePacked(base_uri ,'/', Strings.toString(tokenId),".json"));
            return _post_uri ;
        } 
        else 
        {
            return base_uri;
        }
      }

    function getAddressInfo() public returns(uint256, uint256[] memory){
        (uint256 _userAmount, uint256[] memory userTokenIndexes) = INFTPuzzle(nftPuzzleContractAddress).addressInfo(msg.sender);
        emit UserInfo(_userAmount, userTokenIndexes);
        return(_userAmount, userTokenIndexes);
    }

    /*

    FOR TESTS

    */

   /*

   function getUserAmount(address _address) public returns(uint256[] memory ){
    (uint256[] memory _userAmount) = INFTPuzzle(nftPuzzleContractAddress).getBalnceUser(_address, 10);
    emit UserInfo(_userAmount);
    return _userAmount;
   } 

   */

}



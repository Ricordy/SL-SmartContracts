// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./SLPermissions.sol";
/// @title Base contract for SL puzzle management
/// @author The name of the author
/// @notice Centralizes information on this contract, making sure that all of the ERC1155 communications and 
/// memory writting calls happens thorugh here!
/// @dev Extra details about storage: https://app.diagrams.net/#G1Wi7A1SK0y8F9X-XDm65IUdfRJ81Fo7bF
contract SLBase is ERC1155, SLPermissions {

    //Mapping to store the Levels batchs 
    // mapping (uint => mapping (uint => uint)) Levels;
    //Mapping to store the Puzzles batchs 
    // mapping (uint => mapping (uint => mapping (uint=>uint))) Puzzles;
    
    //Array to store the Levels batchs 
    uint32[3][] Levels;
    //Array to store the Puzzles batchs 
    uint32[3][] Puzzles;
    constructor () ERC1155("") {
        
    }
}
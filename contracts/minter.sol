// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../contracts/node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../contracts/node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../contracts/node_modules/@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "../contracts/node_modules/@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";

contract GameMinter is ERC1155, ERC20, VRFConsumerBaseV2, Ownable {
    VRFCoordinatorV2Interface private immutable vrfCoordinator;
    uint64 private immutable subscriptionId;
    bytes32 private immutable keyHash;
    uint32 private constant CALLBACK_GAS_LIMIT = 2500000;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 5; // Changed to 5 words for 5 NFTs

    mapping(uint256 => address) private requestToUser;
    
    uint256 private constant MAX_NFT = 1200;
    uint256 private constant NFT_TO_MINT = 5;
    uint256 private constant TOKEN_REWARD = 5000 ether;

    mapping(address => bool) public hasClaimed;

    event GameStarted(address indexed user, uint256 requestId);
    event NFTsMinted(address indexed user, uint256[] tokenIds);

    constructor(
       
        address _vrfCoordinator,
        uint64 _subscriptionId,
        bytes32 _keyHash,
        string memory name,
        string memory uri,
        string memory symbol
    )
        ERC1155("https://gateway.lighthouse.storage/ipfs/bafybeiem7ucsjote74moefa2kmprng6cdtcey43hakgvpww3icahqtpgee/{id}.json")
        ERC20("AuraCoin", "CoA")
        VRFConsumerBaseV2(_vrfCoordinator) // Fixed initialization
    {
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
    }

    function startGame() external {
        require(!hasClaimed[msg.sender], "Already claimed");
        uint256 requestId = vrfCoordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            REQUEST_CONFIRMATIONS,
            CALLBACK_GAS_LIMIT,
            NUM_WORDS
        );
        requestToUser[requestId] = msg.sender;
        emit GameStarted(msg.sender, requestId);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address user = requestToUser[requestId];
        require(user != address(0), "Invalid request");
        
        uint256[] memory tokenIds = new uint256[](NFT_TO_MINT);
        uint256[] memory amounts = new uint256[](NFT_TO_MINT); // Fixed array initialization
        
        for (uint256 i = 0; i < NFT_TO_MINT; i++) {
            tokenIds[i] = (randomWords[i] % MAX_NFT) + 1;
            amounts[i] = 1;
        }

        _mintBatch(user, tokenIds, amounts, "");
        _mint(user, TOKEN_REWARD);
        hasClaimed[user] = true;
        
        emit NFTsMinted(user, tokenIds);
    }

    // Fixed interface support
    function supportsInterface(bytes4 interfaceId) public view override(ERC1155) returns (bool) {
        return 
            interfaceId == type(IERC1155).interfaceId ||
            interfaceId == type(IERC20).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
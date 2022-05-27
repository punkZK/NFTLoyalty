// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

// NFT contract to inherit from.
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Helper functions OpenZeppelin provides.
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

// Chainlink contract for Pricefeed
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract MyLoyaltyShop is ERC721 {

    address public owner;
    AggregatorV3Interface public priceFeed;

    struct LoyaltyCardAttributes {
        uint256 cardIndex;
        string name;
        string imageURI;
        uint256 stampCount;
        uint256 maxStampCount;
    }

    struct Product {
        uint256 productIndex;
        string name;
        string imageURI;
        uint256 cost;
    }

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    LoyaltyCardAttributes[] defaultCards;
    Product[] products;

    mapping(uint256 => LoyaltyCardAttributes)
        public loyaltyCardHolderAttributes;
    mapping(address => uint256) public loyaltyCardHolders;


    event LoyaltyCardNFTMinted(address sender, uint256 tokenId, uint256 cardIndex);
    event LoyaltyCardNFTStamped(address sender, uint256 tokenId, uint256 stampCount);
    event LoyaltyCardNFTRedeemed(address sender, uint256 tokenId);

    constructor(
        address _priceFeed,
        string[] memory cardNames,
        string[] memory cardImageURIs,
        uint256[] memory stampCount,
        uint256[] memory maxStampCount,
        string[] memory productNames,
        string[] memory productImageURIs,
        uint256[] memory productCost
    ) ERC721("Loyalty", "LOYL") {
        priceFeed = AggregatorV3Interface(_priceFeed);
        owner = msg.sender;

        for (uint256 i = 0; i < cardNames.length; i += 1) {
            defaultCards.push(
                LoyaltyCardAttributes({
                    cardIndex: i,
                    name: cardNames[i],
                    imageURI: cardImageURIs[i],
                    stampCount: stampCount[i],
                    maxStampCount: maxStampCount[i]
                })
            );

            LoyaltyCardAttributes memory c = defaultCards[i];
        }
        for (uint256 i = 0; i < productNames.length; i += 1) {
            products.push(
                Product({
                    productIndex: i,
                    name: productNames[i],
                    imageURI: productImageURIs[i],
                    cost: productCost[i]                    
                })
            );
            Product memory c = products[i];
        }

        _tokenIds.increment();
    }

    function mintLoyaltyCard(uint256 _cardIndex) external {
        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);

        loyaltyCardHolderAttributes[newItemId] = LoyaltyCardAttributes({
            cardIndex: _cardIndex,
            name: defaultCards[_cardIndex].name,
            imageURI: defaultCards[_cardIndex].imageURI,
            stampCount: defaultCards[_cardIndex].stampCount,
            maxStampCount: defaultCards[_cardIndex].maxStampCount
        });

        loyaltyCardHolders[msg.sender] = newItemId;

        _tokenIds.increment();

        emit LoyaltyCardNFTMinted(msg.sender, newItemId, _cardIndex);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        LoyaltyCardAttributes
            memory cardAttributes = loyaltyCardHolderAttributes[_tokenId];

        string memory strStampCount = Strings.toString(
            cardAttributes.stampCount
        );
        string memory strMaxStampCount = Strings.toString(
            cardAttributes.maxStampCount
        );

        string memory json = Base64.encode(
            abi.encodePacked(
                '{"name": "',
                cardAttributes.name,
                " -- NFT #: ",
                Strings.toString(_tokenId),
                '", "description": "This is an NFT that tracks customer loyalty!", "image": "ipfs://',
                cardAttributes.imageURI,
                '", "attributes": [ { "trait_type": "Stamp Count", "value": ',
                strStampCount,
                ', "max_value":',
                strMaxStampCount,
                "} ]}"
            )
        );

        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        return output;
    }

    function stampLoyaltyCard() public {
        uint256 nftTokenIdOfUser = loyaltyCardHolders[msg.sender];
        LoyaltyCardAttributes storage user = loyaltyCardHolderAttributes[
            nftTokenIdOfUser
        ];

        require(
            user.stampCount < user.maxStampCount,
            "Error: Loyalty card must have empty slots to stamp."
        );

        user.stampCount += 1;
        emit LoyaltyCardNFTStamped(msg.sender, nftTokenIdOfUser, user.stampCount);
    }

    function redeemLoyaltyCard() public {
        uint256 nftTokenIdOfUser = loyaltyCardHolders[msg.sender];
        LoyaltyCardAttributes storage user = loyaltyCardHolderAttributes[
            nftTokenIdOfUser
        ];

        require(
            user.stampCount == user.maxStampCount,
            "Error: Loyalty card must have all the stamps."
        );

        _burn(nftTokenIdOfUser);
        loyaltyCardHolders[msg.sender] = 0; // should this be ZERO
        emit LoyaltyCardNFTRedeemed(msg.sender, nftTokenIdOfUser);
    }

    function checkIfUserHasLoyaltyCard() public view returns(bool) {
        uint256 userLoyaltyCardNftTokenId = loyaltyCardHolders[msg.sender];
        if(userLoyaltyCardNftTokenId > 0 ) {
            return true;
        } else {
            return false;
        }
    }

    function getUserHasLoyaltyCard() public view returns (LoyaltyCardAttributes memory) {
        uint256 userLoyaltyCardNftTokenId = loyaltyCardHolders[msg.sender];
        if(userLoyaltyCardNftTokenId > 0 ) {
            return loyaltyCardHolderAttributes[userLoyaltyCardNftTokenId];
        } else {
            LoyaltyCardAttributes memory emptyStruct;
            return emptyStruct;
        }
    }

    function getAllDefaultCards() public view returns(LoyaltyCardAttributes[] memory) {
        return defaultCards;
    }

    function getAllProducts() public view returns(Product[] memory) {
        return products;
    }

    function purchaseProduct(uint256 costUSD) public payable {
        // 1. Transfer money to Contract owner
        uint256 minimumUSD = costUSD * 10**18;
        require(
            getConversionRate(msg.value) >= minimumUSD,
            "You need to spend more ETH!"
        );
        // 2.If User has an eligible NFT stamp it;
        if ( checkIfUserHasLoyaltyCard() ) {
            stampLoyaltyCard();
        } 

    }

    function redeemProduct(uint256 id) public {
        if ( checkIfUserHasLoyaltyCard() ) {
            redeemLoyaltyCard();
        }        
    }
    
    function getPrice() public view returns(uint256){
        AggregatorV3Interface priceFeed = AggregatorV3Interface(priceFeed);
        (,int256 answer,,,) = priceFeed.latestRoundData();
         // ETH/USD rate in 18 digit 
         return uint256(answer * 10000000000);
    }
    
    // 1000000000
    function getConversionRate(uint256 ethAmount) public view returns (uint256){
        uint256 ethPrice = getPrice();
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1000000000000000000;
        // the actual ETH/USD conversation rate, after adjusting the extra 0s.
        return ethAmountInUsd;
    }

    function getProductPriceInEth(uint256 cost) public view returns (uint256) {
        uint256 priceInUSD = cost * 10**18;
        uint256 price = getPrice();
        uint256 precision = 1 * 10**18;
        // We fixed a rounding error found in the video by adding one!
        return ((priceInUSD * precision) / price) + 1;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function withdraw() public payable onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

}

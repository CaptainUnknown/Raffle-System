// SPDX-License-Identifier: UNLICENSED
/**
* @title Whoopdoop ⚠️ WIP Marketplace
* @author Captain Unknown
*/
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

interface IERC20{
    function balanceOf(address _owner) external view returns (uint256 balance);
    function transfer(address _to, uint256 _value) external returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success);
}

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256 balance);
    function transferFrom(address from, address to, uint256 tokenId) external;
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
}

contract WhoopP2PMarketplace is Ownable, Initializable {
    using Counters for Counters.Counter;
    Counters.Counter public currentListingId;

    struct NFT {
        address contractAddress;
        uint256 tokenId;
    }

    struct Listing {
        uint256 listingId;
        uint256 ethPrice;
        uint256 tokenPrice;
        bool payableWithDoop;
        bool soldOut;
        bool closed;
        address buyer;
        address opener;
        NFT nft;
    }

    address public immutable doopToken;

    mapping (uint256 => Listing) public OpenedListings;

    event ListingAdded(uint256 indexed listingId, address listedBy, uint256 price, NFT nft);
    event Purchased(uint256 indexed listingId, address buyer);

    constructor(address _doopToken) {
        doopToken = _doopToken;
        _disableInitializers();
    }

    function openListing(uint256 _priceInEth, uint256 _tokenPrice, bool _payableWithDoop, address _NFTContract, uint256 _NFTTokenId) public returns (uint256) {
        IERC721(_NFTContract).transferFrom(msg.sender, address(this), _NFTTokenId);

        Listing memory newListing = Listing({
            listingId: currentListingId.current(),
            ethPrice: _priceInEth,
            tokenPrice: _tokenPrice,
            payableWithDoop: _payableWithDoop,
            soldOut: false,
            closed: false,
            buyer: address(0),
            opener: msg.sender,
            nft: NFT({
                contractAddress: _NFTContract,
                tokenId: _NFTTokenId
            })
        });
        OpenedListings[currentListingId.current()] = newListing;
        currentListingId.increment();

        emit ListingAdded(newListing.listingId, msg.sender, _payableWithDoop ? _tokenPrice : _priceInEth, newListing.nft);
        return currentListingId.current() - 1;
    }

    function purchase(uint256 _listingId) public payable {
        require(_listingId < currentListingId.current(), "Invalid ID");
        Listing storage listing = OpenedListings[_listingId];
        require(!listing.soldOut, "Sold Out");

        if (listing.payableWithDoop) {
            require(IERC20(doopToken).transferFrom(msg.sender, listing.opener, listing.tokenPrice), "Transfer failed");
        } else {
            require(listing.ethPrice == msg.value, "Not enough Eth");
            payable(listing.opener).transfer(msg.value);
        }

        listing.soldOut = true;
        listing.buyer = msg.sender;
        IERC721(listing.nft.contractAddress).safeTransferFrom(address(this), listing.buyer, listing.nft.tokenId);
    }

    function deleteListing(uint256 _listingId) public {
        Listing storage listing = OpenedListings[_listingId];
        require(listing.opener == msg.sender || owner() == msg.sender, "Not Authorized");
        listing.closed = false;
    }
    
    // Read functions
    function listingExists(uint256 _listingId) public view returns (bool) {
        return _listingId < currentListingId.current();
    }

    function getOpenedListings() public view returns (uint256[] memory) {
        uint256[] memory listingIds = new uint256[](currentListingId.current());
        uint256 count = 0;
        for (uint256 i = 0; i < currentListingId.current(); i++) {
            if (!OpenedListings[i].soldOut) {
                listingIds[count] = i;
                count++;
            }
        }
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = listingIds[i];
        }
        return result;
    }

    function getEndedListings() public view returns (uint256[] memory) {
        uint256[] memory listingIds = new uint256[](currentListingId.current());
        uint256 count = 0;
        for (uint256 i = 0; i < currentListingId.current(); i++) {
            if (OpenedListings[i].soldOut) {
                listingIds[count] = i;
                count++;
            }
        }
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = listingIds[i];
        }
        return result;
    }
}
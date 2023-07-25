// SPDX-License-Identifier: UNLICENSED
/**
* @title Whoopdoop ⚠️ WIP Marketplace
* @author Captain Unknown
*/
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

interface IERC20 {
    function balanceOf(address _owner) external view returns (uint256 balance);
    function transfer(address _to, uint256 _value) external returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success);
}

interface IERC721 {
    function transferFrom(address from, address to, uint256 tokenId) external;
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
}

contract WhoopMarketplace is Ownable, Initializable {
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
        bool payableWithToken2;
        bool soldOut;
        address buyer;
        NFT nft;
    }

    address public immutable doopToken;
    address public immutable token2;

    mapping (address => bool) private admin;
    mapping (uint256 => Listing) public OpenedListings;

    event ListingAdded(uint256 indexed listingId, uint256 price, NFT nft);
    event Purchased(uint256 indexed listingId, address buyer);

    constructor(address _doopToken, address _token2) {
        doopToken = _doopToken;
        token2 = _token2;
        _disableInitializers();
    }

    function openListing(uint256 _priceInEth, uint256 _tokenPrice, bool _payableWithDoop, bool _payableWithToken2, address _NFTContract, uint256 _NFTTokenId) public {
        require(admin[msg.sender], "Not Authorized");
        require(!(_payableWithDoop && _payableWithToken2), "Conflicting params");
        IERC721(_NFTContract).transferFrom(msg.sender, address(this), _NFTTokenId);

        Listing memory newListing = Listing({
            listingId: currentListingId.current(),
            ethPrice: _priceInEth,
            tokenPrice: _tokenPrice,
            payableWithDoop: _payableWithDoop,
            payableWithToken2: _payableWithToken2,
            soldOut: false,
            buyer: address(0),
            nft: NFT({
                contractAddress: _NFTContract,
                tokenId: _NFTTokenId
            })
        });
        OpenedListings[currentListingId.current()] = newListing;
        currentListingId.increment();

        emit ListingAdded(newListing.listingId, _payableWithDoop || _payableWithToken2 ? _tokenPrice : _priceInEth, newListing.nft);
    }

    function purchase(uint256 _listingId) public payable {
        require(_listingId < currentListingId.current(), "Invalid ID");
        Listing storage listing = OpenedListings[_listingId];
        require(!listing.soldOut, "Sold out");

        if (listing.payableWithDoop) {
            require(IERC20(doopToken).transferFrom(msg.sender, address(this), listing.tokenPrice), "Doop transfer failed");
        } else if (listing.payableWithToken2) {
            require(IERC20(token2).transferFrom(msg.sender, address(this), listing.tokenPrice), "transfer failed");
        } else {
            require(listing.ethPrice == msg.value, "Not enough Eth");
        }

        listing.soldOut = true;
        listing.buyer = msg.sender;
        IERC721(listing.nft.contractAddress).safeTransferFrom(address(this), listing.buyer, listing.nft.tokenId);
    }

    // Utilities
    function withdrawAll() public payable onlyOwner {
        require(address(this).balance > 0 || IERC20(doopToken).balanceOf(address(this)) > 0);
        IERC20(doopToken).transfer(msg.sender, IERC20(doopToken).balanceOf(address(this)));
        payable(msg.sender).transfer(address(this).balance);
    }

    function withdrawEth(uint256 amount) public payable onlyOwner {
        require(address(this).balance >= amount);
        payable(msg.sender).transfer(amount);
    }

    function withdrawDoop(uint256 amount) public payable onlyOwner {
        require(IERC20(doopToken).balanceOf(address(this)) >= amount);
        IERC20(doopToken).transfer(msg.sender, amount);
    }

    function addAdmin(address _admin) public onlyOwner {
        admin[_admin] = true;
    }

    function removeAdmin(address _admin) public onlyOwner {
        admin[_admin] = false;
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
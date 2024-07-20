// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @custom:security-contact captainunknown7@gmail.com
contract WrappedNFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    address public immutable l1CollectionAddress;
    constructor(address initialOwner, address _l1CollectionAddress, string memory _name, string memory _symbol) ERC721(_name, _symbol) Ownable(initialOwner) {
        l1CollectionAddress = _l1CollectionAddress;
    }

    function safeMint(address to, uint256 tokenId, string memory uri) public onlyOwner {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

event NFTWrapped(address l1CollectionAddress, address wrappedCollectionAddress, uint256 tokenId);
event NFTUnwrapped(address l1CollectionAddress, address wrappedCollectionAddress, uint256 tokenId);

contract WhoopsiesNFTWrapper is Ownable {
    address public whoopsiesRaffleContract;
    // L1Collection => WrappedNFT
    mapping (address => address) public wrappedAddresses;
    // WrappedNFT => L1Collection
    mapping (address => address) public l1Collections;
    // WrappedNFT => TokenIds
    mapping (address => uint256[]) public wrappedTokenIds;
    uint256 public unwrapFees;

    constructor(address _whoopsiesRaffleContract) Ownable(msg.sender) {
        whoopsiesRaffleContract = _whoopsiesRaffleContract;
    }

    function wrapNFT(address l1CollectionAddress, uint256 tokenId, string calldata _name, string calldata _symbol, string calldata uri) public onlyOwner returns (address) {
        address wrappedAddress = wrappedAddresses[l1CollectionAddress];
        WrappedNFT wrappedCollection;
        if (wrappedAddress == address(0)) {
            wrappedCollection = new WrappedNFT(address(this), l1CollectionAddress, _name, _symbol);
        } else {
            wrappedCollection = WrappedNFT(wrappedAddress);
        }
        wrappedCollection.safeMint(whoopsiesRaffleContract, tokenId, uri);

        address wrappedCollectionAddress = address(wrappedCollection);
        wrappedAddresses[l1CollectionAddress] = wrappedCollectionAddress;
        l1Collections[wrappedCollectionAddress] = l1CollectionAddress;
        wrappedTokenIds[wrappedCollectionAddress].push(tokenId);
        emit NFTWrapped(l1CollectionAddress, wrappedCollectionAddress, tokenId);
        return wrappedCollectionAddress;
    }

    function unwrapNFT(address wrappedCollectionAddress, uint256 tokenId) payable public returns (address) {
        address l1CollectionAddress = l1Collections[wrappedCollectionAddress];
        require(l1CollectionAddress != address(0), "Wrapped asset not recognized!");
        require(msg.value == unwrapFees, "Not enough unwrap fees paid.");

        WrappedNFT wrappedCollection = WrappedNFT(wrappedCollectionAddress);
        wrappedCollection.transferFrom(msg.sender, address(this), tokenId);
        wrappedCollection.burn(tokenId);

        emit NFTUnwrapped(l1CollectionAddress, wrappedCollectionAddress, tokenId);
        return l1CollectionAddress;
    }

    function changeRaffleContract(address _whoopsiesRaffleContract) public onlyOwner {
        whoopsiesRaffleContract = _whoopsiesRaffleContract;
    }

    function setUnwrapFees(uint256 _fees) public onlyOwner {
        unwrapFees = _fees;
    }

    function withdrawETH() public payable onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}
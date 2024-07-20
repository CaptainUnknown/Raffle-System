// SPDX-License-Identifier: MIT

/// @title ERC721 Implementation of Whoopsies v2 Collection
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./SoladyOwnable.sol";
import "./DefaultOperatorFilterer.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

// Errors
error NotOwner();
error NotActive();
error invalidValue();
error ClaimNotActive();
error TransferFailed();
error ZeroClaimable();
error CoolDownActive();

/// @custom:security-contact captainunknown7@gmail.com
contract Whoopsies is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    Ownable,
    DefaultOperatorFilterer
{
    address public constant whoopsiesV1 =
        0x646Eb9B8E6bED62c0e46b67f3EfdEF926Fb9D621;
    bool public v2ClaimActive = false;
    bool public doopClaimActive = false;
    string public baseUri =
        "ipfs://QmYJGEoa3zRNMVFLsRcgzXNNQ3g2HsQQeipSLFstivW4hB/";
    string public constant baseExtension = ".json";
    uint256 public immutable initialTime;
    uint256 public claimPrice;
    IERC20 public doopToken;

    mapping(address => uint256) public totalClaimed;
    mapping(address => uint256) public lastDoopClaimTime;

    constructor() ERC721("Whoopsies", "WHOOP") {
        _initializeOwner(msg.sender);
        initialTime = block.timestamp;
    }

    /// @notice Transfers v2 equivalent old collection to the caller
    /// @param requestedTokenIds TokenID(s) to claim
    function claimV2NFTs(uint256[] calldata requestedTokenIds) public payable {
        if (!v2ClaimActive) revert NotActive();
        if (requestedTokenIds.length * claimPrice != msg.value)
            revert invalidValue();
        for (uint256 i; i < requestedTokenIds.length; ) {
            if (
                IERC721(whoopsiesV1).ownerOf(requestedTokenIds[i]) != msg.sender
            ) revert NotOwner();
            _safeMint(msg.sender, requestedTokenIds[i]);
            unchecked {
                i++;
            }
        }
    }

    /// @notice Transfers claimable Doop to the caller
    function claimDoop() public {
        if (!doopClaimActive) revert ClaimNotActive();
        uint256 balance = balanceOf(_msgSender());
        if (balance == 0) revert ZeroClaimable();

        uint256 claimablePerNFT;
        uint256 previous = lastDoopClaimTime[msg.sender];
        uint256 timestamp = block.timestamp;

        if (previous != 0) {
            if (previous + 1 days > timestamp) revert CoolDownActive();
            claimablePerNFT = ((timestamp - previous) / 1 days) * 5;
        } else {
            claimablePerNFT = ((timestamp - initialTime) / 1 days) * 5;
        }

        lastDoopClaimTime[msg.sender] = timestamp;
        uint256 totalClaimable = claimablePerNFT * balance;
        unchecked {
            totalClaimed[msg.sender] += totalClaimable;
        }

        if (!doopToken.transfer(msg.sender, totalClaimable * 10 ** 18))
            revert TransferFailed();
    }

    /// @notice Retrieves Doop tokens available to claim for the given address
    /// @param _address The address to query claimable Doop tokens for
    /// @return Amount of claimable Doop tokens
    function retrieveClaimableDoop(
        address _address
    ) public view returns (uint256) {
        uint256 balance = balanceOf(_msgSender());
        uint256 timestamp = block.timestamp;
        if (balance == 0) return 0;
        uint256 claimablePerNFT;
        uint256 pTime = lastDoopClaimTime[_address];
        if (pTime != 0) claimablePerNFT = ((timestamp - pTime) / 1 days) * 5;
        else claimablePerNFT = ((timestamp - initialTime) / 1 days) * 5;

        uint256 claimable = claimablePerNFT * balance;
        return claimable * 10 ** 18;
    }

    // Utils
    /// @notice Toggle v2 NFTs claim eligibility state
    function toggleV2ClaimActive() public onlyOwner {
        v2ClaimActive = !v2ClaimActive;
    }

    /// @notice Toggle Doop Tokens claim eligibility state
    function toggleDoopClaimActive() public onlyOwner {
        doopClaimActive = !doopClaimActive;
    }

    /// @notice Changes Doop Token address to the given address
    /// @param _tokenAddress Address to change the Doop token address to
    function setDoopAddress(address _tokenAddress) public onlyOwner {
        doopToken = IERC20(_tokenAddress);
    }

    /// @notice Changes claim price to the given price
    /// @param newClaimPrice The new claim price for single claim
    function setClaimPrice(uint256 newClaimPrice) public onlyOwner {
        claimPrice = newClaimPrice;
    }

    // The following functions are operator filterer overrides.
    function setApprovalForAll(
        address operator,
        bool approved
    ) public override(ERC721, IERC721) onlyAllowedOperatorApproval(operator) {
        super.setApprovalForAll(operator, approved);
    }

    function approve(
        address operator,
        uint256 tokenId
    ) public override(ERC721, IERC721) onlyAllowedOperatorApproval(operator) {
        super.approve(operator, tokenId);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override(ERC721, IERC721) onlyAllowedOperator(from) {
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override(ERC721, IERC721) onlyAllowedOperator(from) {
        super.safeTransferFrom(from, to, tokenId);
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /// @notice Changes token base URI to the given string
    /// @param _newBaseURI URI to change the base URI to
    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseUri = _newBaseURI;
    }

    /// @return Current Base URI
    function _baseURI() internal view override returns (string memory) {
        return baseUri;
    }

    /// @param tokenId TokenID to retrieve URI for
    /// @return Current URI for the given tokenId
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Strings.toString(tokenId),
                    baseExtension
                )
            );
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /// @notice Withdraws given amount of Doop Tokens
    /// @param amount Amount of Doop token to withdraw
    function withdrawDoop(uint256 amount) public onlyOwner {
        doopToken.transfer(msg.sender, amount);
    }

    /// @notice Withdraws all the Eth balance of the contract to the caller
    function withdrawEth() public payable onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}

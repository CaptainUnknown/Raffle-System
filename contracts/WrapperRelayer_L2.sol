// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./L2Wrapper.sol";

contract WhoopsiesNFTWrapperRelayer {
    WhoopsiesNFTWrapper public wrapper;

    constructor(address _wrapperAddress) {
        wrapper = WhoopsiesNFTWrapper(_wrapperAddress);
    }

    function getL1Addresses(address[] calldata wrappedAddresses) public view returns (address[] memory) {
        uint256 length = wrappedAddresses.length;
        address[] memory l1Addresses = new address[](length);
        for (uint256 i = 0; i < length; ) {
            l1Addresses[i] = wrapper.l1Collections(wrappedAddresses[i]);
        unchecked {i++;}
        }
        return l1Addresses;
    }

    function getOwnerAddresses(address[] calldata wrappedAddresses) public view returns (address[] memory) {
        uint256 length = wrappedAddresses.length;
        address[] memory ownerAddresses = new address[](length);
        for (uint256 i = 0; i < length; ) {
            WrappedNFT nft = WrappedNFT(wrappedAddresses[i]);
            ownerAddresses[i] = nft.owner();
        unchecked {i++;}
        }
        return ownerAddresses;
    }
}
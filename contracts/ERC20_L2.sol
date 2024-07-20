// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/// @custom:security-contact captainunknown7@gmail.com
contract Doop is ERC20, Ownable, ERC20Permit {
    constructor(address initialOwner)
        ERC20("Doop", "DOOP")
        Ownable(initialOwner)
        ERC20Permit("Doop")
    {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Doop Contract Address on Eth mainnet
     * @return Doop address
     */
    function getL1ContractAddress() public pure returns(address) {
        return 0xAB8C867A8BF0C9eC800cfED5236c14E78e324926;
    }

    /**
     * @notice Version string for the EIP712 domain separator
     * @return Version string
     */
    function version() external pure returns (string memory) {
        return "1";
    }
}
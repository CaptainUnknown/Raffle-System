// SPDX-License-Identifier: Unlicensed
/**
* @title Whoop EA Royalties Engine
* @author Captain Unknown
*/
pragma solidity ^0.8.19.0;

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

contract WhoopEARoyaltiesEngine is Ownable, Initializable {
    // Context
    bool public isActivated = true;
    address public immutable EAPass;
    address public immutable doopToken;
    uint256 public immutable initialTime;
    
    mapping (address => uint256) public totalClaimed;
    mapping (address => uint256) public previousTime;

    event Claimed(address indexed claimant, uint256 indexed time, uint256 amount);

    constructor(address _EAPass, address _doopToken) {
        EAPass = _EAPass;
        doopToken = _doopToken;
        initialTime = block.timestamp;
        _disableInitializers();
    }

    function depositReserves(uint256 toDeposit) public payable returns (bool) {
        require(IERC20(doopToken).transferFrom(msg.sender, address(this), toDeposit));
        return true;
    }

    function claim() public {
        require(isActivated, "SC Deactivated");
        require(isHolderOf(msg.sender, EAPass), "No NFT Owned");
        uint256 claimablePerNFT;
        uint256 previous = previousTime[msg.sender];

        if (previous != 0) {
            require(previous + 1 days < block.timestamp, "Wait for Cooldown");
            claimablePerNFT = ((block.timestamp - previous) / 1 days) * 72;
        } else {
            claimablePerNFT = ((block.timestamp - initialTime) / 1 days) * 72;
        }
        previousTime[msg.sender] = block.timestamp;
        
        uint256 totalClaimable = claimablePerNFT * IERC721(EAPass).balanceOf(msg.sender);

        totalClaimed[msg.sender] += totalClaimable;
        require(IERC20(doopToken).transfer(msg.sender, totalClaimable * 10 ** 18), "Failed to Dispatch");
        emit Claimed(msg.sender, block.timestamp, totalClaimable);
    }
    
    function getClaimable(address user) public view returns (uint256) {
        if (!isHolderOf(user, EAPass)) return 0;
        uint256 claimablePerNFT = 0;
        uint256 pTime = previousTime[user];
        if (pTime != 0) claimablePerNFT = ((block.timestamp - pTime) / 1 days) * 72;
        else claimablePerNFT = ((block.timestamp - initialTime) / 1 days) * 72;

        uint256 claimable = claimablePerNFT * IERC721(EAPass).balanceOf(user);
        return claimable * 10 ** 18;
    }

    // Read Functions
    function isHolderOf(address user, address NFT) private view returns(bool) {
        return IERC721(NFT).balanceOf(user) > 0;
    }

    function getReserves() public view returns (uint256) {
        return IERC20(doopToken).balanceOf(address(this));
    }

    // Utilities
    function withdrawDoop(uint256 amount) public payable onlyOwner {
        require(IERC20(doopToken).balanceOf(address(this)) >= amount);
        IERC20(doopToken).transfer(msg.sender, amount);
    }

    function flipActivated() public onlyOwner {
        isActivated = !isActivated;
    }
}
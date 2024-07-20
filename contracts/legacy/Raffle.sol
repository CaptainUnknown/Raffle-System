// SPDX-License-Identifier: CC-BY-NC-SA-4.0
/**
* @title Whoopdoop Raffle
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

contract WhoopDoopRaffle is Ownable, Initializable {
    using Counters for Counters.Counter;
    Counters.Counter public currentRaffleId;

    struct Entry {
        uint32 lowerBound;
        uint32 upperBound;
        address wallet;
    }

    struct Prize {
        address NFTContract;
        uint32 NFTTokenId;
    }

    struct Raffle {
        uint32 raffleId;
        uint128 ethPrice;
        uint128 doopPrice;
        uint64 endTime;
        uint32 entriesCount;
        bool payableWithDoop;
        bool hasEnded;
        address winner;
        Prize rafflePrize;
    }

    // Context
    address public immutable EAPass;
    address public immutable WDCollection;
    address public immutable doopToken;
    uint8 public immutable maxTicketCount;

    mapping (address => bool) private admin;
    mapping (uint256 => Raffle) public OnGoingRaffles;
    mapping (uint256 => Entry[]) public Entries;

    event RaffleStarted(uint256 indexed raffleId, uint256 price, uint256 endTime, Prize rafflePrize);
    event Winner(uint256 indexed raffleId, address winner);

    constructor(address _EAPass, address _WDCollection, address _doopToken, uint8 _maxTicketCount) {
        EAPass = _EAPass;
        WDCollection = _WDCollection;
        doopToken = _doopToken;
        maxTicketCount = _maxTicketCount;
        _disableInitializers();
    }

    function startRaffle(uint128 _priceInEth, uint128 _doopPrice, bool _payableWithDoop, uint64 _duration, address _prizeNFTContract, uint32 _prizeNFTTokenId) public {
        require(admin[msg.sender]);
        uint64 _endTime = uint64(block.timestamp) + _duration;

        Raffle memory newRaffle = Raffle({
            raffleId: uint32(currentRaffleId.current()),
            ethPrice: _priceInEth,
            doopPrice: _doopPrice,
            endTime: _endTime,
            entriesCount: 0,
            payableWithDoop: _payableWithDoop,
            hasEnded: false,
            winner: address(0),
            rafflePrize: Prize({
            NFTContract: _prizeNFTContract,
            NFTTokenId: _prizeNFTTokenId
        })
        });
        OnGoingRaffles[currentRaffleId.current()] = newRaffle;
        currentRaffleId.increment();

        IERC721(_prizeNFTContract).transferFrom(msg.sender, address(this), _prizeNFTTokenId);

        emit RaffleStarted(newRaffle.raffleId, _payableWithDoop ? _doopPrice : _priceInEth, newRaffle.endTime, newRaffle.rafflePrize);
    }

    function buyTicket(uint32 _RaffleId, uint32 ticketCount) public payable {
        isIdValid(_RaffleId);
        Raffle storage raffle = OnGoingRaffles[_RaffleId];

        require(block.timestamp < raffle.endTime);
        require(!raffle.hasEnded);
        require(ticketCount > 0);
        require(ticketCount <= maxTicketCount);

        if (raffle.payableWithDoop) {
            require(IERC20(doopToken).transferFrom(msg.sender, address(this), raffle.doopPrice * ticketCount));
        } else {
            require(raffle.ethPrice * ticketCount == msg.value);
        }

        if (isHolderOf(msg.sender, EAPass)) {
            ticketCount *= 5;
        } else if (isHolderOf(msg.sender, WDCollection)) {
            ticketCount *= 3;
        }

        Entry[] storage raffleEntries = Entries[_RaffleId];
        Entry memory lastEntry = raffleEntries.length > 0 ? raffleEntries[raffleEntries.length - 1] : Entry(0, 0, address(0));
        if (lastEntry.wallet == msg.sender) {
            raffleEntries[raffleEntries.length - 1].upperBound += ticketCount;
        } else {
            uint32 newUpperBound = lastEntry.upperBound + ticketCount;
            raffleEntries.push(Entry(lastEntry.upperBound + 1, newUpperBound, msg.sender));
        }
        raffle.entriesCount += ticketCount;
    }

    function endRaffle(uint32 _RaffleId, uint256 seed) public {
        require(msg.sender == owner() || admin[msg.sender]);

        Raffle storage raffle = OnGoingRaffles[_RaffleId];
        isIdValid(_RaffleId);
        require(raffle.entriesCount > 0);
        require(block.timestamp >= raffle.endTime);
        require(!raffle.hasEnded);
        raffle.hasEnded = true;

        if (raffle.entriesCount == 0) {
            IERC721(raffle.rafflePrize.NFTContract).safeTransferFrom(address(this), owner(), raffle.rafflePrize.NFTTokenId);
            emit Winner(_RaffleId, address(0));
        } else {
            Entry[] storage raffleEntries = Entries[_RaffleId];
            uint256 winnerIndex = seed % raffle.entriesCount;

            uint256 left = 0;
            uint256 right = raffleEntries.length - 1;
            while (left < right) {
                uint256 mid = (left + right) / 2;

                if (winnerIndex < raffleEntries[mid].lowerBound) {
                    right = mid - 1;
                } else if (winnerIndex >= raffleEntries[mid].upperBound) {
                    left = mid + 1;
                } else {
                    left = mid;
                    break;
                }
            }

            address winner = raffleEntries[left].wallet;
            raffle.winner = winner;

            IERC721(raffle.rafflePrize.NFTContract).safeTransferFrom(address(this), raffle.winner, raffle.rafflePrize.NFTTokenId);
            emit Winner(_RaffleId, winner);
        }
    }

    // Read functions
    function raffleExists(uint32 _RaffleId) public view returns (bool) {
        return _RaffleId < currentRaffleId.current();
    }

    function getTotalParticipants(uint256 _RaffleId) public view returns (uint256) {
        return Entries[_RaffleId].length;
    }

    function getOngoingRaffles() public view returns (uint256[] memory) {
        uint256[] memory raffleIds = new uint256[](currentRaffleId.current());
        uint256 count = 0;
        for (uint256 i = 0; i < currentRaffleId.current(); i++) {
            if (!OnGoingRaffles[i].hasEnded) {
                raffleIds[count] = i;
                count++;
            }
        }
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = raffleIds[i];
        }
        return result;
    }

    function getEndedRaffles() public view returns (uint256[] memory) {
        uint256[] memory raffleIds = new uint256[](currentRaffleId.current());
        uint256 count = 0;
        for (uint256 i = 0; i < currentRaffleId.current(); i++) {
            if (OnGoingRaffles[i].hasEnded) {
                raffleIds[count] = i;
                count++;
            }
        }
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = raffleIds[i];
        }
        return result;
    }

    function isHolderOf(address user, address NFT) private view returns(bool) {
        return IERC721(NFT).balanceOf(user) > 0;
    }

    function isIdValid(uint32 _RaffleId) internal view {
        require(raffleExists(_RaffleId));
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
}
// SPDX-License-Identifier: CC-BY-NC-SA-4.0
/**
* @title Whoopdoop Raffle
* @author Captain Unknown
*/
pragma solidity ^0.8.19.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./WhoopsiesRaffleHoldersLogger.sol";

interface IERC20 {
    function balanceOf(address _owner) external view returns (uint256 balance);
    function transfer(address _to, uint256 _value) external returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success);
    function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) external;
}

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256 balance);
    function transferFrom(address from, address to, uint256 tokenId) external;
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
}

contract WhoopsiesRaffleL2 is Ownable {
    uint256 public currentRaffleId;

    struct Entry {
        uint32 lowerBound;
        uint32 upperBound;
        address wallet;
    }

    struct Prize {
        address NFTContract;
        address NFTContract_L2;
        uint32 NFTTokenId;
        uint32 NFTTokenId_L2;
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
    IERC20 public immutable doopToken;
    WhoopsiesRaffleHoldersLogger private HoldersLogger;

    mapping (address => bool) private admin;
    mapping (uint256 => Raffle) public OnGoingRaffles;
    mapping (uint256 => Entry[]) public Entries;

    event RaffleStarted(uint256 indexed raffleId, uint256 price, uint256 endTime, Prize rafflePrize);
    event Winner(uint256 indexed raffleId, address winner);

    constructor(address _doopToken, address _HoldersLoggerAddress) Ownable(msg.sender) {
        doopToken = IERC20(_doopToken);
        currentRaffleId = 19; // Continued from the 18th
        HoldersLogger = WhoopsiesRaffleHoldersLogger(_HoldersLoggerAddress);
    }

    function startRaffle(uint128 _priceInEth, uint128 _doopPrice, bool _payableWithDoop, uint64 _duration, address _prizeNFTContract_mainnet, address _prizeNFTContract_bridged, uint32 _prizeNFTTokenId_mainnet, uint32 _prizeNFTTokenId_bridged, address _currentPrizeOwner) public {
        require(admin[msg.sender], "Unauthorized Action");
        uint64 _endTime = uint64(block.timestamp) + _duration;
        uint256 _id = currentRaffleId;

        Raffle memory newRaffle = Raffle({
            raffleId: uint32(_id),
            ethPrice: _priceInEth,
            doopPrice: _doopPrice,
            endTime: _endTime,
            entriesCount: 0,
            payableWithDoop: _payableWithDoop,
            hasEnded: false,
            winner: address(0),
            rafflePrize: Prize({
                NFTContract: _prizeNFTContract_mainnet,
                NFTContract_L2: _prizeNFTContract_bridged,
                NFTTokenId: _prizeNFTTokenId_mainnet,
                NFTTokenId_L2: _prizeNFTTokenId_bridged
            })
        });
        OnGoingRaffles[_id] = newRaffle;
        unchecked { currentRaffleId++; }

        IERC721(_prizeNFTContract_bridged).transferFrom(_currentPrizeOwner, address(this), _prizeNFTTokenId_bridged);

        emit RaffleStarted(newRaffle.raffleId, _payableWithDoop ? _doopPrice : _priceInEth, newRaffle.endTime, newRaffle.rafflePrize);
    }

    function buyTicket(uint32 _RaffleId, uint32 ticketCount, uint8 v, bytes32 r, bytes32 s) public payable {
        isIdValid(_RaffleId);
        Raffle storage raffle = OnGoingRaffles[_RaffleId];

        require(block.timestamp < raffle.endTime, "Raffle Time Ended");
        require(!raffle.hasEnded, "Raffle is Closed");
        require(ticketCount > 0, "No Tickets requested");

        if (raffle.payableWithDoop) {
            doopToken.permit(msg.sender, address(this), raffle.doopPrice * ticketCount, raffle.endTime, v, r, s);
            require(doopToken.transferFrom(msg.sender, address(this), raffle.doopPrice * ticketCount));
        } else {
            require(raffle.ethPrice * ticketCount == msg.value);
        }

        if (HoldersLogger.qualifiesForTwoX(msg.sender)) {
            ticketCount *= 3;
        } else if (HoldersLogger.qualifiesForThreeX(msg.sender)) {
            ticketCount *= 2;
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
        require(msg.sender == owner() || admin[msg.sender], "Unauthorized Action");

        Raffle storage raffle = OnGoingRaffles[_RaffleId];
        isIdValid(_RaffleId);
        require(block.timestamp >= raffle.endTime, "Time not out yet");
        require(!raffle.hasEnded, "Raffle has already ended");
        raffle.hasEnded = true;

        if (raffle.entriesCount == 0) {
            IERC721(raffle.rafflePrize.NFTContract_L2).safeTransferFrom(address(this), owner(), raffle.rafflePrize.NFTTokenId_L2);
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

            IERC721(raffle.rafflePrize.NFTContract_L2).safeTransferFrom(address(this), raffle.winner, raffle.rafflePrize.NFTTokenId_L2);
            emit Winner(_RaffleId, winner);
        }
    }

    function pauseRaffle(uint32 _RaffleId) public onlyOwner {
        Raffle storage raffle = OnGoingRaffles[_RaffleId];
        isIdValid(_RaffleId);
        raffle.hasEnded = true;
    }

    function resumeRaffle(uint32 _RaffleId, bool toIncreaseTime, uint64 addedTime) public onlyOwner {
        Raffle storage raffle = OnGoingRaffles[_RaffleId];
        isIdValid(_RaffleId);
        raffle.hasEnded = false;
        if (toIncreaseTime) {
            if (addedTime == 0) {
                raffle.endTime += uint64(block.timestamp) - raffle.endTime;
            } else raffle.endTime += addedTime;
        }
        else raffle.hasEnded = true;
    }

    // Read functions
    function getTotalParticipants(uint256 _RaffleId) public view returns (uint256) {
        return Entries[_RaffleId].length;
    }

    function getOngoingRaffles() public view returns (uint256[] memory) {
        uint256[] memory raffleIds = new uint256[](currentRaffleId - 19);
        uint256 count = 0;
        for (uint256 i = 19; i < currentRaffleId; i++) {
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
        uint256[] memory raffleIds = new uint256[](currentRaffleId);
        uint256 count = 0;
        for (uint256 i = 0; i < currentRaffleId; i++) {
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

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function isIdValid(uint32 _RaffleId) internal view {
        require(_RaffleId < currentRaffleId, "Invalid Raffle ID");
    }

    // Utilities
    function withdrawEth(uint256 amount) public payable onlyOwner {
        require(address(this).balance >= amount, "Not enough balance");
        payable(msg.sender).transfer(amount);
    }

    function withdrawDoop(uint256 amount) public payable onlyOwner {
        require(doopToken.balanceOf(address(this)) >= amount, "Not enough balance");
        doopToken.transfer(msg.sender, amount);
    }

    function addAdmin(address _admin) public onlyOwner {
        admin[_admin] = true;
    }

    function removeAdmin(address _admin) public onlyOwner {
        admin[_admin] = false;
    }

    function updateHoldersLogger(address loggerAddress) public onlyOwner {
        HoldersLogger = WhoopsiesRaffleHoldersLogger(loggerAddress);
    }
}
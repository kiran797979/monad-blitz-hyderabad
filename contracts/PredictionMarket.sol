// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PredictionMarket is Ownable {
    IERC20 public immutable bettingToken;

    struct Market {
        uint256 battleId;
        uint256 totalPoolA;
        uint256 totalPoolB;
        uint256 winner;
        MarketStatus status;
        uint256 createdAt;
        uint256 resolvedAt;
    }

    struct Bet {
        address bettor;
        uint256 marketId;
        uint256 agentId;
        uint256 amount;
        bool claimed;
    }

    enum MarketStatus {
        Open,
        Closed,
        Resolved
    }

    uint256 public nextMarketId = 1;
    uint256 public nextBetId = 1;
    uint256 public constant MIN_BET = 0.001 ether;
    uint256 public platformFeePercent = 3;

    mapping(uint256 => Market) public markets;
    mapping(uint256 => Bet) public bets;
    mapping(uint256 => uint256[]) public marketBets;
    mapping(address => uint256[]) public userBets;

    event MarketCreated(uint256 indexed marketId, uint256 indexed battleId);
    event BetPlaced(uint256 indexed betId, uint256 indexed marketId, address indexed bettor, uint256 agentId, uint256 amount);
    event MarketResolved(uint256 indexed marketId, uint256 winner);
    event PayoutClaimed(uint256 indexed betId, address indexed bettor, uint256 amount);

    constructor(address _bettingToken) Ownable(msg.sender) {
        bettingToken = IERC20(_bettingToken);
    }

    function createMarket(uint256 battleId) external onlyOwner returns (uint256) {
        uint256 marketId = nextMarketId++;
        markets[marketId] = Market({
            battleId: battleId,
            totalPoolA: 0,
            totalPoolB: 0,
            winner: 0,
            status: MarketStatus.Open,
            createdAt: block.timestamp,
            resolvedAt: 0
        });

        emit MarketCreated(marketId, battleId);
        return marketId;
    }

    function placeBet(uint256 marketId, uint256 agentId, uint256 amount) external returns (uint256) {
        Market storage market = markets[marketId];
        require(market.status == MarketStatus.Open, "Market not open");
        require(amount >= MIN_BET, "Bet below minimum");

        uint256 battleId = market.battleId;
        require(agentId != 0, "Invalid agent");

        bettingToken.transferFrom(msg.sender, address(this), amount);

        uint256 betId = nextBetId++;
        bets[betId] = Bet({
            bettor: msg.sender,
            marketId: marketId,
            agentId: agentId,
            amount: amount,
            claimed: false
        });

        marketBets[marketId].push(betId);
        userBets[msg.sender].push(betId);

        emit BetPlaced(betId, marketId, msg.sender, agentId, amount);
        return betId;
    }

    function resolveMarket(uint256 marketId, uint256 winnerAgentId) external onlyOwner {
        Market storage market = markets[marketId];
        require(market.status == MarketStatus.Open, "Market not open");

        market.winner = winnerAgentId;
        market.status = MarketStatus.Resolved;
        market.resolvedAt = block.timestamp;

        emit MarketResolved(marketId, winnerAgentId);
    }

    function claimPayout(uint256 betId) external {
        Bet storage bet = bets[betId];
        Market storage market = markets[bet.marketId];

        require(bet.bettor == msg.sender, "Not bet owner");
        require(market.status == MarketStatus.Resolved, "Market not resolved");
        require(!bet.claimed, "Already claimed");
        require(bet.agentId == market.winner, "Bet was on loser");

        bet.claimed = true;

        uint256[] storage allBets = marketBets[bet.marketId];
        uint256 winningPool = 0;
        uint256 losingPool = 0;

        for (uint256 i = 0; i < allBets.length; i++) {
            Bet storage b = bets[allBets[i]];
            if (b.agentId == market.winner) {
                winningPool += b.amount;
            } else {
                losingPool += b.amount;
            }
        }

        uint256 totalPool = winningPool + losingPool;
        uint256 platformFee = (totalPool * platformFeePercent) / 100;
        uint256 distributablePool = totalPool - platformFee;

        uint256 payout = (bet.amount * distributablePool) / winningPool;

        bettingToken.transfer(msg.sender, payout);
        bettingToken.transfer(owner(), platformFee);

        emit PayoutClaimed(betId, msg.sender, payout);
    }

    function getMarket(uint256 marketId) external view returns (Market memory) {
        return markets[marketId];
    }

    function getBet(uint256 betId) external view returns (Bet memory) {
        return bets[betId];
    }

    function getMarketBets(uint256 marketId) external view returns (uint256[] memory) {
        return marketBets[marketId];
    }

    function getUserBets(address user) external view returns (uint256[] memory) {
        return userBets[user];
    }

    function getMarketOdds(uint256 marketId) external view returns (uint256 oddsA, uint256 oddsB) {
        Market storage market = markets[marketId];
        if (market.totalPoolA == 0 && market.totalPoolB == 0) {
            return (5000, 5000);
        }
        uint256 total = market.totalPoolA + market.totalPoolB;
        oddsA = (market.totalPoolA * 10000) / total;
        oddsB = (market.totalPoolB * 10000) / total;
    }

    function setPlatformFeePercent(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 10, "Fee too high");
        platformFeePercent = _feePercent;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PredictionMarket {
    address public owner;
    uint256 public marketCount;
    uint256 public platformFee = 200;

    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => uint256)) public yesBets;
    mapping(uint256 => mapping(address => uint256)) public noBets;
    mapping(uint256 => mapping(address => bool)) public claimed;

    enum MarketStatus { Open, Resolved, Cancelled }

    struct Market {
        string question;
        address creator;
        uint256 deadline;
        MarketStatus status;
        bool outcome;
        uint256 totalYes;
        uint256 totalNo;
        uint256 feeCollected;
        uint256 createdAt;
        uint256 resolvedAt;
    }

    event MarketCreated(uint256 indexed marketId, string question, uint256 deadline, uint256 timestamp);
    event BetPlaced(uint256 indexed marketId, address indexed bettor, bool isYes, uint256 amount, uint256 timestamp);
    event MarketResolved(uint256 indexed marketId, bool outcome, uint256 totalPool, uint256 platformFee, uint256 timestamp);
    event Claimed(uint256 indexed marketId, address indexed claimer, uint256 payout, uint256 timestamp);
    event MarketCancelled(uint256 indexed marketId, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {}

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function createMarket(string calldata question, uint256 deadline) external onlyOwner returns (uint256 marketId) {
        require(bytes(question).length > 0, "Question required");
        require(bytes(question).length <= 256, "Question too long");
        require(deadline > block.timestamp, "Deadline must be future");

        marketId = ++marketCount;

        markets[marketId] = Market({
            question: question,
            creator: msg.sender,
            deadline: deadline,
            status: MarketStatus.Open,
            outcome: false,
            totalYes: 0,
            totalNo: 0,
            feeCollected: 0,
            createdAt: block.timestamp,
            resolvedAt: 0
        });

        emit MarketCreated(marketId, question, deadline, block.timestamp);
    }

    function placeBet(uint256 marketId, bool isYes) external payable {
        Market storage market = markets[marketId];

        require(market.status == MarketStatus.Open, "Market not open");
        require(block.timestamp < market.deadline, "Deadline passed");
        require(msg.value > 0, "Bet required");

        if (isYes) {
            yesBets[marketId][msg.sender] += msg.value;
            market.totalYes += msg.value;
        } else {
            noBets[marketId][msg.sender] += msg.value;
            market.totalNo += msg.value;
        }

        emit BetPlaced(marketId, msg.sender, isYes, msg.value, block.timestamp);
    }

    function resolveMarket(uint256 marketId, bool outcome) external onlyOwner {
        Market storage market = markets[marketId];

        require(market.status == MarketStatus.Open, "Market not open");

        uint256 totalPool = market.totalYes + market.totalNo;
        uint256 fee = (totalPool * platformFee) / 10000;

        market.outcome = outcome;
        market.status = MarketStatus.Resolved;
        market.resolvedAt = block.timestamp;
        market.feeCollected = fee;

        if (fee > 0) {
            (bool success, ) = payable(owner).call{value: fee}("");
            require(success, "Fee transfer failed");
        }

        emit MarketResolved(marketId, outcome, totalPool, fee, block.timestamp);
    }

    function claim(uint256 marketId) external {
        Market storage market = markets[marketId];

        require(market.status == MarketStatus.Resolved, "Market not resolved");
        require(!claimed[marketId][msg.sender], "Already claimed");

        uint256 winningPool = market.outcome ? market.totalYes : market.totalNo;
        require(winningPool > 0, "No winning bets");

        uint256 userBet = market.outcome ? yesBets[marketId][msg.sender] : noBets[marketId][msg.sender];
        require(userBet > 0, "No bet on winning side");

        uint256 totalPool = market.totalYes + market.totalNo;
        uint256 distributablePool = totalPool - market.feeCollected;
        uint256 payout = (userBet * distributablePool) / winningPool;

        claimed[marketId][msg.sender] = true;

        (bool success, ) = payable(msg.sender).call{value: payout}("");
        require(success, "Payout failed");

        emit Claimed(marketId, msg.sender, payout, block.timestamp);
    }

    function cancelMarket(uint256 marketId) external onlyOwner {
        Market storage market = markets[marketId];

        require(market.status == MarketStatus.Open, "Market not open");

        market.status = MarketStatus.Cancelled;
        market.resolvedAt = block.timestamp;

        emit MarketCancelled(marketId, block.timestamp);
    }

    function refund(uint256 marketId) external {
        Market storage market = markets[marketId];

        require(market.status == MarketStatus.Cancelled, "Market not cancelled");
        require(!claimed[marketId][msg.sender], "Already refunded");

        uint256 userBet = yesBets[marketId][msg.sender] + noBets[marketId][msg.sender];
        require(userBet > 0, "No bet found");

        claimed[marketId][msg.sender] = true;

        (bool success, ) = payable(msg.sender).call{value: userBet}("");
        require(success, "Refund failed");
    }

    function getMarket(uint256 marketId) external view returns (
        string memory,
        address,
        uint256,
        uint8,
        bool,
        uint256,
        uint256,
        uint256,
        uint256,
        uint256
    ) {
        Market storage m = markets[marketId];
        return (
            m.question,
            m.creator,
            m.deadline,
            uint8(m.status),
            m.outcome,
            m.totalYes,
            m.totalNo,
            m.feeCollected,
            m.createdAt,
            m.resolvedAt
        );
    }

    function getUserBets(uint256 marketId, address user) external view returns (
        uint256,
        uint256,
        bool
    ) {
        return (
            yesBets[marketId][user],
            noBets[marketId][user],
            claimed[marketId][user]
        );
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }

    function setFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high");
        platformFee = newFee;
    }

    function withdrawDust() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Nothing to withdraw");
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdraw failed");
    }
}
HI

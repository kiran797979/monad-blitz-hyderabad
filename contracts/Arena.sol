// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Arena {
    address public owner;
    uint256 public fightCount;
    uint256 public platformFee = 250;
    uint256 public totalVolume;

    mapping(uint256 => Fight) public fights;
    mapping(address => uint256[]) public userFights;

    enum FightStatus { Open, Accepted, Resolved, Cancelled }

    struct Fight {
        address agent1;
        address agent2;
        uint256 wager;
        address winner;
        FightStatus status;
        uint256 createdAt;
        uint256 resolvedAt;
    }

    event FightCreated(uint256 indexed fightId, address indexed agent1, address indexed agent2, uint256 wager, uint256 timestamp);
    event FightAccepted(uint256 indexed fightId, address indexed agent2, uint256 timestamp);
    event FightResolved(uint256 indexed fightId, address indexed winner, uint256 winnerPayout, uint256 platformFeePaid, uint256 timestamp);
    event FightCancelled(uint256 indexed fightId, uint256 refund, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {}

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function createChallenge(address opponent) external payable returns (uint256 fightId) {
        require(msg.value > 0, "Wager required");
        require(opponent != msg.sender, "Cannot challenge self");

        fightId = ++fightCount;

        fights[fightId] = Fight({
            agent1: msg.sender,
            agent2: opponent,
            wager: msg.value,
            winner: address(0),
            status: FightStatus.Open,
            createdAt: block.timestamp,
            resolvedAt: 0
        });

        userFights[msg.sender].push(fightId);
        if (opponent != address(0)) {
            userFights[opponent].push(fightId);
        }

        totalVolume += msg.value;

        emit FightCreated(fightId, msg.sender, opponent, msg.value, block.timestamp);
    }

    function acceptChallenge(uint256 fightId) external payable {
        Fight storage fight = fights[fightId];

        require(fight.status == FightStatus.Open, "Fight not open");
        require(fight.agent2 == address(0) || fight.agent2 == msg.sender, "Not designated opponent");
        require(msg.sender != fight.agent1, "Cannot accept own challenge");
        require(msg.value == fight.wager, "Must match wager");

        fight.agent2 = msg.sender;
        fight.status = FightStatus.Accepted;

        userFights[msg.sender].push(fightId);
        totalVolume += msg.value;

        emit FightAccepted(fightId, msg.sender, block.timestamp);
    }

    function resolveFight(uint256 fightId, address winner) external onlyOwner {
        Fight storage fight = fights[fightId];

        require(fight.status == FightStatus.Accepted, "Fight not accepted");
        require(winner == fight.agent1 || winner == fight.agent2, "Invalid winner");

        uint256 totalPool = fight.wager * 2;
        uint256 fee = (totalPool * platformFee) / 10000;
        uint256 payout = totalPool - fee;

        fight.winner = winner;
        fight.status = FightStatus.Resolved;
        fight.resolvedAt = block.timestamp;

        (bool successWinner, ) = payable(winner).call{value: payout}("");
        require(successWinner, "Winner payout failed");

        (bool successFee, ) = payable(owner).call{value: fee}("");
        require(successFee, "Fee payout failed");

        emit FightResolved(fightId, winner, payout, fee, block.timestamp);
    }

    function cancelChallenge(uint256 fightId) external {
        Fight storage fight = fights[fightId];

        require(fight.status == FightStatus.Open, "Fight not open");
        require(msg.sender == fight.agent1, "Only creator can cancel");

        uint256 refund = fight.wager;
        fight.status = FightStatus.Cancelled;
        fight.resolvedAt = block.timestamp;

        (bool success, ) = payable(fight.agent1).call{value: refund}("");
        require(success, "Refund failed");

        emit FightCancelled(fightId, refund, block.timestamp);
    }

    function getFight(uint256 fightId) external view returns (
        address,
        address,
        uint256,
        address,
        uint8,
        uint256,
        uint256
    ) {
        Fight storage f = fights[fightId];
        return (
            f.agent1,
            f.agent2,
            f.wager,
            f.winner,
            uint8(f.status),
            f.createdAt,
            f.resolvedAt
        );
    }

    function getUserFightIds(address user) external view returns (uint256[] memory) {
        return userFights[user];
    }

    function setFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high");
        platformFee = newFee;
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdraw failed");
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
HI

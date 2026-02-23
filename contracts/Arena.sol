// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Arena is Ownable {
    IERC20 public immutable stakingToken;

    struct Agent {
        address owner;
        string name;
        string metadataURI;
        uint256 wins;
        uint256 losses;
        uint256 totalBattles;
        uint256 stakedAmount;
        bool isActive;
    }

    struct Battle {
        uint256 agentA;
        uint256 agentB;
        uint256 winner;
        uint256 timestamp;
        uint256 stakeAmount;
        BattleStatus status;
    }

    enum BattleStatus {
        Pending,
        InProgress,
        Completed,
        Cancelled
    }

    uint256 public nextAgentId = 1;
    uint256 public nextBattleId = 1;
    uint256 public constant MIN_STAKE = 0.01 ether;
    uint256 public platformFeePercent = 5;

    mapping(uint256 => Agent) public agents;
    mapping(uint256 => Battle) public battles;
    mapping(address => uint256[]) public ownerAgents;
    mapping(uint256 => uint256[]) public agentBattles;

    event AgentRegistered(uint256 indexed agentId, address indexed owner, string name);
    event BattleCreated(uint256 indexed battleId, uint256 agentA, uint256 agentB, uint256 stakeAmount);
    event BattleCompleted(uint256 indexed battleId, uint256 winner, uint256 loser);
    event StakeDeposited(uint256 indexed agentId, uint256 amount);
    event StakeWithdrawn(uint256 indexed agentId, uint256 amount);

    constructor(address _stakingToken) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
    }

    function registerAgent(string calldata name, string calldata metadataURI) external returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(bytes(name).length <= 32, "Name too long");

        uint256 agentId = nextAgentId++;
        agents[agentId] = Agent({
            owner: msg.sender,
            name: name,
            metadataURI: metadataURI,
            wins: 0,
            losses: 0,
            totalBattles: 0,
            stakedAmount: 0,
            isActive: true
        });

        ownerAgents[msg.sender].push(agentId);

        emit AgentRegistered(agentId, msg.sender, name);
        return agentId;
    }

    function depositStake(uint256 agentId, uint256 amount) external {
        require(agents[agentId].owner == msg.sender, "Not agent owner");
        require(agents[agentId].isActive, "Agent not active");
        require(amount > 0, "Amount must be positive");

        stakingToken.transferFrom(msg.sender, address(this), amount);
        agents[agentId].stakedAmount += amount;

        emit StakeDeposited(agentId, amount);
    }

    function withdrawStake(uint256 agentId, uint256 amount) external {
        require(agents[agentId].owner == msg.sender, "Not agent owner");
        require(agents[agentId].stakedAmount >= amount, "Insufficient stake");

        agents[agentId].stakedAmount -= amount;
        stakingToken.transfer(msg.sender, amount);

        emit StakeWithdrawn(agentId, amount);
    }

    function createBattle(uint256 agentA, uint256 agentB, uint256 stakeAmount) external returns (uint256) {
        require(agentA != agentB, "Cannot battle self");
        require(agents[agentA].isActive && agents[agentB].isActive, "Agents must be active");
        require(agents[agentA].stakedAmount >= stakeAmount, "Agent A insufficient stake");
        require(agents[agentB].stakedAmount >= stakeAmount, "Agent B insufficient stake");
        require(stakeAmount >= MIN_STAKE, "Stake below minimum");

        uint256 battleId = nextBattleId++;
        battles[battleId] = Battle({
            agentA: agentA,
            agentB: agentB,
            winner: 0,
            timestamp: block.timestamp,
            stakeAmount: stakeAmount,
            status: BattleStatus.Pending
        });

        agentBattles[agentA].push(battleId);
        agentBattles[agentB].push(battleId);

        emit BattleCreated(battleId, agentA, agentB, stakeAmount);
        return battleId;
    }

    function resolveBattle(uint256 battleId, uint256 winner) external onlyOwner {
        Battle storage battle = battles[battleId];
        require(battle.status == BattleStatus.Pending, "Invalid battle status");
        require(winner == battle.agentA || winner == battle.agentB, "Invalid winner");

        uint256 loser = winner == battle.agentA ? battle.agentB : battle.agentA;

        battle.winner = winner;
        battle.status = BattleStatus.Completed;

        agents[winner].wins++;
        agents[winner].totalBattles++;
        agents[loser].losses++;
        agents[loser].totalBattles++;

        uint256 totalStake = battle.stakeAmount * 2;
        uint256 platformFee = (totalStake * platformFeePercent) / 100;
        uint256 winnerPrize = totalStake - platformFee;

        agents[battle.agentA].stakedAmount -= battle.stakeAmount;
        agents[battle.agentB].stakedAmount -= battle.stakeAmount;

        stakingToken.transfer(agents[winner].owner, winnerPrize);
        stakingToken.transfer(owner(), platformFee);

        emit BattleCompleted(battleId, winner, loser);
    }

    function getAgent(uint256 agentId) external view returns (Agent memory) {
        return agents[agentId];
    }

    function getBattle(uint256 battleId) external view returns (Battle memory) {
        return battles[battleId];
    }

    function getAgentBattles(uint256 agentId) external view returns (uint256[] memory) {
        return agentBattles[agentId];
    }

    function getOwnerAgents(address owner) external view returns (uint256[] memory) {
        return ownerAgents[owner];
    }

    function setPlatformFeePercent(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 20, "Fee too high");
        platformFeePercent = _feePercent;
    }
}

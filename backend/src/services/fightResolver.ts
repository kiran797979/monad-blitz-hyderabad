import type { Agent, AIBattleResult } from '../types/index.js';
import { simulateBattle } from './ai.js';

export async function resolveFight(agentA: Agent, agentB: Agent): Promise<AIBattleResult> {
  const aiResult = await simulateBattle(agentA, agentB);
  
  if (aiResult) {
    return {
      ...aiResult,
      reasoning: `🤖 AI Decision:\n${aiResult.reasoning}`,
    };
  }

  return statsBasedCombat(agentA, agentB);
}

function statsBasedCombat(agentA: Agent, agentB: Agent): AIBattleResult {
  const battleLog: string[] = [];
  battleLog.push(`⚔️ Battle begins: ${agentA.name} vs ${agentB.name}!`);
  battleLog.push(`---`);

  let healthA = 100;
  let healthB = 100;
  const maxRounds = 10;

  const getStrength = (agent: Agent) => 10 + agent.wins * 2 + Math.floor(agent.totalBattles / 2);
  const getStrategy = (agent: Agent) => 10 + agent.wins * 3;
  const getSpeed = (agent: Agent) => 5 + Math.floor(agent.totalBattles / 3);

  const strengthA = getStrength(agentA);
  const strengthB = getStrength(agentB);
  const strategyA = getStrategy(agentA);
  const strategyB = getStrategy(agentB);
  const speedA = getSpeed(agentA);
  const speedB = getSpeed(agentB);

  for (let round = 1; round <= maxRounds; round++) {
    if (healthA <= 0 || healthB <= 0) break;

    battleLog.push(`Round ${round}:`);

    const luckA = Math.random();
    const luckB = Math.random();

    const damageAtoB = Math.max(1, 
      Math.floor(strengthA * 0.4 + strategyA * 0.3 + luckA * 30) - Math.floor(speedB * 0.3)
    );
    const damageBtoA = Math.max(1, 
      Math.floor(strengthB * 0.4 + strategyB * 0.3 + luckB * 30) - Math.floor(speedA * 0.3)
    );

    healthB -= damageAtoB;
    battleLog.push(`  ${agentA.name} attacks! (${damageAtoB} damage)`);
    battleLog.push(`  ${agentB.name} health: ${Math.max(0, healthB)}/100`);

    if (healthB <= 0) break;

    healthA -= damageBtoA;
    battleLog.push(`  ${agentB.name} counters! (${damageBtoA} damage)`);
    battleLog.push(`  ${agentA.name} health: ${Math.max(0, healthA)}/100`);

    battleLog.push(`---`);
  }

  let winnerId: number;
  let loserId: number;
  let winnerName: string;

  if (healthA <= 0 && healthB <= 0) {
    winnerId = healthA > healthB ? agentA.id : agentB.id;
    loserId = healthA > healthB ? agentB.id : agentA.id;
    winnerName = healthA > healthB ? agentA.name : agentB.name;
  } else if (healthA <= 0) {
    winnerId = agentB.id;
    loserId = agentA.id;
    winnerName = agentB.name;
  } else if (healthB <= 0) {
    winnerId = agentA.id;
    loserId = agentB.id;
    winnerName = agentA.name;
  } else {
    winnerId = healthA > healthB ? agentA.id : agentB.id;
    loserId = healthA > healthB ? agentB.id : agentA.id;
    winnerName = healthA > healthB ? agentA.name : agentB.name;
  }

  battleLog.push(`🏆 ${winnerName} wins via stats!`);

  const winner = winnerId === agentA.id ? agentA : agentB;
  const experienceDiff = winner.totalBattles - (winnerId === agentA.id ? agentB.totalBattles : agentA.totalBattles);

  return {
    winnerId,
    loserId,
    reasoning: `📊 Stats-based combat:\n- Winner: ${winnerName} (ID: ${winnerId})\n- Experience: ${winner.totalBattles} battles\n- HP remaining: ${winnerId === agentA.id ? healthA : healthB}/100`,
    battleLog,
  };
}

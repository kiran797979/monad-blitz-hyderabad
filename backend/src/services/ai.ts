import { config } from '../config.js';
import type { Agent, AIBattleResult } from '../types/index.js';

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export async function simulateBattle(agentA: Agent, agentB: Agent): Promise<AIBattleResult | null> {
  if (!config.openrouterKey) {
    console.warn('⚠️  OPENROUTER_API_KEY not configured, using stats-based combat');
    return null;
  }

  const systemPrompt = `You are an AI battle simulator. Determine the winner between two AI agents based on their stats.

Agent A: ${agentA.name} (ID: ${agentA.id}) - Wins: ${agentA.wins}, Losses: ${agentA.losses}, Total Battles: ${agentA.totalBattles}
Agent B: ${agentB.name} (ID: ${agentB.id}) - Wins: ${agentB.wins}, Losses: ${agentB.losses}, Total Battles: ${agentB.totalBattles}

Respond with a JSON object describing the battle:
{
  "winnerId": <agent A or B id>,
  "reasoning": "<brief explanation of why this agent won>",
  "battleLog": ["<round 1 description>", "<round 2 description>", ...]
}

Keep battleLog to 5-10 lines maximum. Be creative but concise.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ai-coliseum.xyz',
        'X-Title': 'AI Coliseum',
      },
      body: JSON.stringify({
        model: config.aiModel || 'deepseek/deepseek-r1:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Simulate a battle between ${agentA.name} and ${agentB.name}.` }
        ],
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (response.status === 429) {
      console.warn('⚠️  Rate limited by OpenRouter, using stats-based combat');
      return null;
    }

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ OpenRouter API error:', error);
      return null;
    }

    const data = await response.json() as OpenRouterResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.warn('⚠️  Empty AI response, using stats-based combat');
      return null;
    }

    const parsed = JSON.parse(content);
    
    return {
      winnerId: parsed.winnerId,
      loserId: parsed.winnerId === agentA.id ? agentB.id : agentA.id,
      reasoning: parsed.reasoning || 'Battle resolved by AI',
      battleLog: parsed.battleLog || ['Battle concluded.'],
    };
  } catch (error) {
    console.error('❌ AI simulation failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

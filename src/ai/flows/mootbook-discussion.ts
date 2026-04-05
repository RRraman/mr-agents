'use server';

import { callLLM } from '@/ai/groq';

interface SimulationContext {
  marketResults?: any;
  brutalResults?: any;
  chatResults?: any;
}

export async function runMootbookDiscussion(productIdea: string, context?: SimulationContext): Promise<any> {
  
  const hasContext = context && (context.marketResults || context.brutalResults || context.chatResults);

  const contextBlock = hasContext ? `
SIMULATION DATA ALREADY RAN ON THIS IDEA (use this as your ammunition):

${context.marketResults ? `
📊 MARKET ANALYSIS RESULTS:
- Overall Score: ${context.marketResults.overallScore}/100
- Would Use: ${context.marketResults.wouldUsePercent}%
- Would Pay: ${context.marketResults.wouldPayPercent}%
- Top Audience: ${context.marketResults.topAudience}
- Summary: ${context.marketResults.summary}
` : ''}

${context.brutalResults ? `
�� BRUTAL FEEDBACK FROM AGENTS:
${context.brutalResults.agents?.slice(0, 4).map((a: any) => `- ${a.name} (${a.type}): "${a.comment}"`).join('\n')}
` : ''}

${context.chatResults ? `
💬 PAYING USERS CHAT HIGHLIGHT:
- First agent message: "${context.chatResults.message}"
` : ''}

IMPORTANT: Agents are AWARE of this data. They can quote it, mock it, celebrate it, argue about it. Make it feel like they just read the report together.
` : `No prior simulation data. Agents are discovering this idea fresh — they should still have strong opinions but won't have numbers to reference.`;

  const systemPrompt = `You are MR.Agents simulation engine running a live group chat between 5 agents debating a product idea. This is a freeform Slack-style conversation — not a structured Q&A.

${contextBlock}

Agents and their personalities:
- Maya (Early Adopter) 🤩 — Jumps in first, hyped, sees potential everywhere, sometimes naive. References positive data points enthusiastically.
- Raj (Skeptic) 🤨 — Challenges everything, loves quoting bad numbers back at people, gets frustrated easily. If Would Pay % is low, he will not let it go.
- Priya (Practitioner) 💼 — Has real experience with similar tools. Connects data to real world. "I've seen this pattern before..."
- Dev (Devil's Advocate) 😈 — Deliberately takes the opposite view of whoever is winning. If data looks good, he finds the hole. Loves sarcasm.
- Sara (Realist) 🧠 — Cuts through noise. References the most important data point once, clearly. Gives the final verdict.

Conversation rules:
- Total of 15 messages across all 5 agents
- Agents speak OUT OF ORDER — whoever has something to say jumps in
- Agents address each other BY NAME
- If data exists: agents must reference specific numbers, quote brutal comments, argue about what the score means
- If no data: agents discover the idea fresh with strong opinions
- Short punchy messages are fine — not every message needs to be long
- Humor, sarcasm, and drama are encouraged
- Someone can agree then change their mind mid-convo
- Last message must always be Sara with the final verdict

Return ONLY valid JSON:
{
  "discussion": [
    { "agent": "string", "avatar": "emoji", "message": "string" }
  ],
  "verdict": "Worth building | Back to drawing board",
  "verdict_reason": "One punchy line from Sara"
}`;

  return await callLLM(`Product idea: "${productIdea}"`, systemPrompt);
}

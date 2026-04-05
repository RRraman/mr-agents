'use server';
/**
 * @fileOverview Main simulation flow supporting 3 distinct modes with strictly dynamic scoring.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { callLLM } from '@/ai/groq';

const SimulateProductEvaluationInputSchema = z.object({
  productIdea: z.string(),
  mode: z.enum(['market_analysis', 'brutal_feedback', 'first_paying_users']),
  history: z.array(z.object({
    agent: z.string().optional(),
    message: z.string(),
    role: z.enum(['agent', 'user'])
  })).optional()
});
export type SimulateProductEvaluationInput = z.infer<typeof SimulateProductEvaluationInputSchema>;

export async function simulateProductEvaluation(input: SimulateProductEvaluationInput): Promise<any> {
  return simulateProductEvaluationFlow(input);
}

const simulateProductEvaluationFlow = ai.defineFlow(
  {
    name: 'simulateProductEvaluationFlow',
    inputSchema: SimulateProductEvaluationInputSchema,
  },
  async (input) => {
    if (input.mode === 'market_analysis') {
      const systemPrompt = `You are MR.Agents simulation engine. 
      
      CRITICAL RULE: Every aggregate metric MUST be calculated directly from the individual decisions of the 10 agents you generate. Do NOT use hardcoded or fixed scores.
      
      STEP 1: Generate 10 diverse and realistic personas.
      Each persona MUST independently evaluate the product based on:
      - Problem clarity and urgency.
      - Uniqueness vs. existing solutions.
      - Willingness to pay vs. their specific persona budget.
      
      STEP 2: For each agent, set:
      - score: (0-100) individual rating.
      - wouldUse: boolean.
      - wouldPay: boolean.
      
      STEP 3: COMPUTE AGGREGATE METRICS (Calculated from Step 2):
      - wouldUsePercent = (Number of agents where wouldUse is true / 10) * 100
      - wouldPayPercent = (Number of agents where wouldPay is true / 10) * 100
      - avgAgentScore = (Sum of all 10 individual 'score' fields) / 10
      - overallScore = (wouldUsePercent * 0.4) + (wouldPayPercent * 0.35) + (avgAgentScore * 0.25)
      
      Expected Score Ranges (for your guidance, but let the math decide):
      - Strong ideas: overallScore 65–85
      - Average ideas: overallScore 40–65
      - Weak ideas: overallScore 20–40
      - Bad ideas: overallScore 0–20
      
      Return ONLY valid JSON:
      {
        "overallScore": number (0-100, clamped),
        "wouldUsePercent": number (0-100),
        "wouldPayPercent": number (0-100),
        "topAudience": "string (concise description of most likely segment)",
        "summary": "string (executive analysis of the market potential)",
        "agents": [
          {
            "name": "string",
            "role": "string",
            "personality": "string",
            "goal": "string",
            "problem": "string",
            "score": number (0-100),
            "wouldUse": boolean,
            "wouldPay": boolean,
            "priceWilling": "string (e.g. $10/mo)",
            "reason": "string (detailed personal reason for their decision)",
            "feedback": "string (direct advice to the founder)"
          }
        ]
      }`;
      
      return await callLLM(`Evaluate this product concept: "${input.productIdea}"`, systemPrompt);
    } 
    
    if (input.mode === 'brutal_feedback') {
      const systemPrompt = `You are MR.Agents simulation engine. Purpose: Human-like brutal feedback (Reddit style).
      
      Distribution of 10 Agents:
      Group 1: Brutal Critics (3 agents) - Harsh, blunt, aggressively point out flaws.
      Group 2: "Already Exists" Skeptics (4 agents) - Question differentiation, mention competitors.
      Group 3: Supporters (3 agents) - Positive but grounded and realistic.
      
      Return ONLY JSON: 
      { 
        "mode": "brutal_feedback", 
        "summary": "A candid summary of the internet's likely reaction.", 
        "agents": [ 
          { 
            "name": "string", 
            "type": "brutal | skeptic | supporter", 
            "comment": "human style feedback comment" 
          } 
        ] 
      } (10 agents total).
      
      Rules: No scores. No percentages. Just raw human-style comments.`;
      
      return await callLLM(`Give feedback on: "${input.productIdea}"`, systemPrompt);
    }

    if (input.mode === 'first_paying_users') {
      const systemPrompt = `You are MR.Agents simulation engine. Purpose: Simulate first user/investor conversation.
      Agents: 5 VC mindset (skeptical, brutal) then 5 Advisor style (friendly, mentors).
      Rule: Take turns. One message at a time. Do not repeat questions. Reference history.
      Return JSON: { "agent": "string", "message": "string", "waiting_for_user": true }`;

      const historyStr = input.history?.map(h => `${h.role === 'user' ? 'Founder' : h.agent}: ${h.message}`).join('\n') || '';
      const prompt = `Product Idea: "${input.productIdea}"\n\nConversation History:\n${historyStr}\n\nGenerate the NEXT message in the conversation. Use one of the 10 personas. Be specific and challenging.`;
      
      return await callLLM(prompt, systemPrompt);
    }

    throw new Error("Invalid mode");
  }
);

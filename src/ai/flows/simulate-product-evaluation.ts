'use server';
/**
 * @fileOverview Main simulation flow supporting 3 distinct modes with dynamic scoring.
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
      const systemPrompt = `You are MR.Agents simulation engine. Purpose: Dynamic, realistic market validation.
      
      CRITICAL RULE: Each agent must decide INDEPENDENTLY based on the product idea's quality. Do NOT force a fixed distribution of buyers or rejectors.
      
      Evaluation Criteria for each of the 10 agents:
      - Problem clarity and urgency: Is it a "must-have" or "nice-to-have"?
      - Uniqueness: How does it stand out from competitors?
      - Competition: What are they using now?
      - Willingness to Pay: Is the value high enough for their specific persona's budget?
      - Complexity: Is the solution easy for them to adopt?
      
      Realistic Scoring Benchmarks:
      - Strong ideas: High individual scores (80+), ~60-80% aggregate adoption, ~20-40% aggregate paying conversion.
      - Average ideas: Mid individual scores (50-70), ~30-60% aggregate adoption, ~10-25% aggregate paying conversion.
      - Weak ideas: Low individual scores (<50), ~10-30% aggregate adoption, ~0-10% aggregate paying conversion.
      - Bad ideas: Very low scores, <15% aggregate adoption, <5% aggregate paying conversion.
      
      Calculations (YOU MUST COMPUTE THESE BASED ON YOUR 10 GENERATED AGENTS):
      - wouldUsePercent = (Count of agents where wouldUse is true / 10) * 100
      - wouldPayPercent = (Count of agents where wouldPay is true / 10) * 100
      - avgAgentScore = Average of the individual 'score' fields of the 10 agents.
      - overallScore = (wouldUsePercent * 0.4) + (wouldPayPercent * 0.3) + (avgAgentScore * 0.3)
      
      Do NOT clamp or normalize these values to arbitrary round numbers. Return real computed results.

      Return ONLY valid JSON:
      {
        "overallScore": number (0-100),
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

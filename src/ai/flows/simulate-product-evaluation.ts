
'use server';
/**
 * @fileOverview Main simulation flow supporting 3 distinct modes.
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
      const systemPrompt = `You are MR.Agents simulation engine. Purpose: Realistic market validation. 
      Distribution: 2 buyers, 3 interested, 2 free users, 3 rejectors. Tone: Analytical, Startup research.
      Return JSON with: overallScore (0-100), wouldUsePercent (0-100), wouldPayPercent (0-100), topAudience, summary, agents (array of 10 items with name, role, score, reason, feedback).`;
      
      return await callLLM(`Evaluate: "${input.productIdea}"`, systemPrompt);
    } 
    
    if (input.mode === 'brutal_feedback') {
      const systemPrompt = `You are MR.Agents simulation engine. Purpose: Human-like brutal feedback (Reddit style).
      Group 1: Brutal Critics (3 agents). Group 2: "Already Exists" (4 agents). Group 3: Supporters (3 agents).
      Return JSON: { "mode": "brutal_feedback", "summary": "...", "agents": [ { "name": "...", "type": "brutal | skeptic | supporter", "comment": "..." } ] } (10 agents total).
      No scores. No percentages. Just raw human-style comments.`;
      
      return await callLLM(`Give feedback on: "${input.productIdea}"`, systemPrompt);
    }

    if (input.mode === 'first_paying_users') {
      const systemPrompt = `You are MR.Agents simulation engine. Purpose: Simulate first user/investor conversation.
      Agents: 5 VC mindset (skeptical, brutal) then 5 Advisor style (friendly, mentors).
      Rule: Take turns. One message at a time. Do not repeat questions. Reference history.
      Return JSON: { "agent": "...", "message": "...", "waiting_for_user": true }`;

      const historyStr = input.history?.map(h => `${h.role === 'user' ? 'Founder' : h.agent}: ${h.message}`).join('\n') || '';
      const prompt = `Product Idea: "${input.productIdea}"\n\nConversation History:\n${historyStr}\n\nGenerate the NEXT message in the conversation. Use one of the 10 personas. Be specific.`;
      
      return await callLLM(prompt, systemPrompt);
    }

    throw new Error("Invalid mode");
  }
);

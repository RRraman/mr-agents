'use server';
/**
 * @fileOverview This file defines the Genkit flow for simulating product evaluations using Groq AI.
 * It uses a single-shot prompt to generate the entire market simulation for better reliability.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { callLLM } from '@/ai/groq';

const AgentEvaluationOutputSchema = z.object({
  name: z.string(),
  role: z.string(),
  personality: z.string(),
  goal: z.string(),
  problem: z.string(),
  score: z.number().int().min(0).max(100),
  wouldUse: z.boolean(),
  wouldPay: z.boolean(),
  priceWilling: z.string(),
  timeToAdopt: z.string(),
  reason: z.string(),
  feedback: z.string(),
});

const OverallMarketAnalysisSchema = z.object({
  overallScore: z.number(),
  wouldUsePercent: z.number(),
  wouldPayPercent: z.number(),
  topAudience: z.string(),
  summary: z.string(),
});

const SimulateProductEvaluationInputSchema = z.object({
  productIdea: z.string(),
  evaluationType: z.enum(['Product Feedback', 'Market Fit', 'First Paying Users']),
});
export type SimulateProductEvaluationInput = z.infer<typeof SimulateProductEvaluationInputSchema>;

const SimulateProductEvaluationOutputSchema = z.object({
  agents: z.array(AgentEvaluationOutputSchema),
  overallAnalysis: OverallMarketAnalysisSchema,
});
export type SimulateProductEvaluationOutput = z.infer<typeof SimulateProductEvaluationOutputSchema>;

export async function simulateProductEvaluation(input: SimulateProductEvaluationInput): Promise<SimulateProductEvaluationOutput> {
  return simulateProductEvaluationFlow(input);
}

const simulateProductEvaluationFlow = ai.defineFlow(
  {
    name: 'simulateProductEvaluationFlow',
    inputSchema: SimulateProductEvaluationInputSchema,
    outputSchema: SimulateProductEvaluationOutputSchema,
  },
  async (input) => {
    const prompt = `Act as an expert market research engine. Conduct a simulation for the following product idea:
    
    PRODUCT IDEA: "${input.productIdea}"
    EVALUATION FOCUS: "${input.evaluationType}"
    
    Your task is to:
    1. Generate 10 diverse AI personas (agents) representing distinct market segments.
    2. Each agent must evaluate the product based on their unique personality, role, goals, and problems.
    3. Each agent has a mental budget of ₹1000.
    4. Provide an overall market analysis based on all evaluations.
    
    You MUST return an object with the following structure:
    {
      "overallAnalysis": {
        "overallScore": 0-100,
        "wouldUsePercent": 0-100,
        "wouldPayPercent": 0-100,
        "topAudience": "description",
        "summary": "comprehensive executive summary"
      },
      "agents": [
        {
          "name": "string",
          "role": "string",
          "personality": "string",
          "goal": "string",
          "problem": "string",
          "score": 0-100,
          "wouldUse": boolean,
          "wouldPay": boolean,
          "priceWilling": "string",
          "timeToAdopt": "string",
          "reason": "short explanation of decision",
          "feedback": "detailed advice for the founder"
        }
      ] (10 items)
    }`;

    const response = await callLLM(prompt);
    
    // Ensure agents array always exists for UI safety
    if (!response.agents) {
      response.agents = [];
    }

    return SimulateProductEvaluationOutputSchema.parse(response);
  }
);

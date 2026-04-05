'use server';
/**
 * @fileOverview This file defines the Genkit flow for simulating product evaluations using Groq AI.
 * It uses a single-shot prompt with strict realism constraints for better market validation.
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
    const prompt = `Act as an expert market research engine. Conduct a CRITICAL and REALISTIC simulation for the following product idea:
    
    PRODUCT IDEA: "${input.productIdea}"
    EVALUATION FOCUS: "${input.evaluationType}"
    
    Your task is to generate 10 diverse AI personas (agents) and have them evaluate the product with BRUTAL HONESTY. This is market validation, NOT promotion.

    REALISM CONSTRAINTS (Mandatory):
    1. AGENT DISTRIBUTION (Strictly follow this for the 10 agents):
       - 2 Agents: Enthusiastic early adopters / Strong buyers.
       - 2 Agents: Interested in the concept but REFUSE to pay (looking for free alternatives).
       - 2 Agents: Would only use a free version; price sensitivity is very high.
       - 2 Agents: Complete indifference / Will ignore the product.
       - 2 Agents: Hard rejection (Foundational flaws, too niche, bad timing, or already have a superior solution).
    
    2. SENTIMENT & FEEDBACK:
       - Agents MUST disagree.
       - Include critical points like: "Too niche," "I already use X and it's better," "Not worth the subscription," "Unclear value proposition," "Bad timing," "Too complex."
    
    3. QUANTITATIVE BENCHMARKS:
       - 'wouldUsePercent' (Adoption Rate) should rarely exceed 60%.
       - 'wouldPayPercent' (Paying Conversion) should rarely exceed 30%.
       - Overall Score should reflect a realistic, often mediocre, market reception.

    4. AGENT BUDGET:
       - Each agent has a mental budget of ₹1000 for this category.

    You MUST return an object with the following structure:
    {
      "overallAnalysis": {
        "overallScore": 0-100,
        "wouldUsePercent": 0-100,
        "wouldPayPercent": 0-100,
        "topAudience": "description",
        "summary": "comprehensive executive summary highlighting both potential and significant friction points"
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
          "feedback": "detailed, potentially harsh advice for the founder"
        }
      ] (Exactly 10 items)
    }`;

    const response = await callLLM(prompt);
    
    if (!response.agents) {
      response.agents = [];
    }

    return SimulateProductEvaluationOutputSchema.parse(response);
  }
);

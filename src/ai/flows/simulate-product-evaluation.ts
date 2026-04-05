'use server';
/**
 * @fileOverview This file defines the Genkit flow for simulating product evaluations using Groq AI.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { callLLM } from '@/ai/groq';

const AgentProfileSchema = z.object({
  name: z.string(),
  role: z.string(),
  personality: z.string(),
  problem: z.string(),
  goal: z.string(),
  budget: z.number().int(),
});

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
    // Step 1: Generate 10 AI agents
    const generateAgentsPrompt = `You are an expert market researcher. Create 10 distinct and realistic user personas to evaluate a product idea.
    Evaluation type: "${input.evaluationType}".
    Product Idea: "${input.productIdea}"
    
    Each user should have a unique name, professional role, personality, specific problem, and goal. Each agent has a fixed budget of ₹1000.
    Return a JSON object with an 'agents' key containing the array of 10 agent profiles.`;

    const agentsResponse = await callLLM(generateAgentsPrompt);
    const agentsData = JSON.parse(agentsResponse);
    const agentProfiles = z.array(AgentProfileSchema).parse(agentsData.agents || agentsData);

    // Step 2: Each agent evaluates the product
    const agentEvaluations: any[] = [];
    for (const agentProfile of agentProfiles) {
      const evaluateAgentPrompt = `You are ${agentProfile.name}, a ${agentProfile.role}. 
      Personality: "${agentProfile.personality}". Problem: "${agentProfile.problem}". Goal: "${agentProfile.goal}".
      Budget: ₹${agentProfile.budget}.

      Evaluate this product idea ("${input.evaluationType}" assessment):
      "${input.productIdea}"

      Return a JSON object with: score (0-100), wouldUse (bool), wouldPay (bool), priceWilling (string), timeToAdopt (string), reason (string), feedback (string).
      Include your profile details (name, role, etc.) in the response as well.`;

      const evaluationResponse = await callLLM(evaluateAgentPrompt);
      const evaluation = JSON.parse(evaluationResponse);
      
      agentEvaluations.push(AgentEvaluationOutputSchema.parse({
        ...agentProfile,
        ...evaluation
      }));
    }

    // Step 3: Calculate overall market analysis
    const analysisPrompt = `Based on these AI agent evaluations for "${input.productIdea}", provide an overall market analysis.
    Evaluations: ${JSON.stringify(agentEvaluations)}
    
    Return a JSON object with: 
    - overallScore (avg score)
    - wouldUsePercent (% of wouldUse)
    - wouldPayPercent (% of wouldPay)
    - topAudience (string description)
    - summary (concise insights)`;

    const analysisResponse = await callLLM(analysisPrompt);
    const overallAnalysis = OverallMarketAnalysisSchema.parse(JSON.parse(analysisResponse));

    return {
      agents: agentEvaluations,
      overallAnalysis: overallAnalysis,
    };
  }
);

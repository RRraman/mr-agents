'use server';
/**
 * @fileOverview This file defines the Genkit flow for simulating product evaluations using AI agents.
 *
 * - simulateProductEvaluation - A function that initiates the product evaluation simulation.
 * - SimulateProductEvaluationInput - The input type for the simulateProductEvaluation function.
 * - SimulateProductEvaluationOutput - The return type for the simulateProductEvaluation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AgentProfileSchema = z.object({
  name: z.string().describe('The name of the AI agent.'),
  role: z.string().describe('The professional role of the AI agent.'),
  personality: z.string().describe('A brief description of the AI agent\'s personality.'),
  problem: z.string().describe('A key problem or pain point the AI agent faces that the product might address.'),
  goal: z.string().describe('A primary goal the AI agent is trying to achieve.'),
  budget: z.number().int().describe('The budget in ₹ available to the AI agent for solutions (e.g., 1000).'),
});

const AgentEvaluationOutputSchema = z.object({
  name: z.string().describe('The name of the AI agent.'),
  role: z.string().describe('The professional role of the AI agent.'),
  personality: z.string().describe('A brief description of the AI agent\'s personality.'),
  goal: z.string().describe('A primary goal the AI agent is trying to achieve.'),
  problem: z.string().describe('A key problem or pain point the AI agent faces.'),
  score: z.number().int().min(0).max(100).describe('A score from 0-100 representing how well the product addresses the agent\'s needs. Higher is better.'),
  wouldUse: z.boolean().describe('True if the agent would genuinely use the product, false otherwise.'),
  wouldPay: z.boolean().describe('True if the agent would be willing to pay for the product, false otherwise.'),
  priceWilling: z.string().describe('The price the agent would be willing to pay for the product, or "N/A" if not applicable. If wouldPay is true, this should be a specific amount; otherwise, it can be "N/A" or "0".'),
  timeToAdopt: z.string().describe('An estimated timeframe for the agent to adopt the product (e.g., "Immediately", "Within a month", "Never relevant", "After significant improvements").'),
  reason: z.string().describe('The primary reason for the agent\'s decision to use/not use and pay/not pay for the product.'),
  feedback: z.string().describe('Detailed feedback from the agent about the product, including pros, cons, and suggestions.'),
});

const OverallMarketAnalysisSchema = z.object({
  overallScore: z.number().describe('The average score across all agents.'),
  wouldUsePercent: z.number().describe('The percentage of agents who would use the product.'),
  wouldPayPercent: z.number().describe('The percentage of agents who would pay for the product.'),
  topAudience: z.string().describe('A description of the most receptive audience segment identified from the agents, e.g., "Small business owners looking for CRM solutions".'),
  summary: z.string().describe('A concise summary of the simulation results, including key strengths and weaknesses of the product based on agent feedback.'),
});

const SimulateProductEvaluationInputSchema = z.object({
  productIdea: z.string().describe('The product idea, SaaS description, or link to be evaluated.'),
  evaluationType: z.enum(['Product Feedback', 'Market Fit', 'First Paying Users']).describe('The type of evaluation to perform.'),
});
export type SimulateProductEvaluationInput = z.infer<typeof SimulateProductEvaluationInputSchema>;

const SimulateProductEvaluationOutputSchema = z.object({
  agents: z.array(AgentEvaluationOutputSchema).describe('An array of detailed evaluations from each AI agent.'),
  overallAnalysis: OverallMarketAnalysisSchema.describe('Overall market analysis and summary of the simulation.'),
});
export type SimulateProductEvaluationOutput = z.infer<typeof SimulateProductEvaluationOutputSchema>;

export async function simulateProductEvaluation(input: SimulateProductEvaluationInput): Promise<SimulateProductEvaluationOutput> {
  return simulateProductEvaluationFlow(input);
}

const generateAgentsPrompt = ai.definePrompt({
  name: 'generateAgentsPrompt',
  input: { schema: SimulateProductEvaluationInputSchema },
  output: { schema: z.array(AgentProfileSchema) },
  prompt: `You are an expert market researcher. Your task is to create 10 distinct and realistic user personas to evaluate a product idea.
  The evaluation type is "{{{evaluationType}}}".
  
  Product Idea to evaluate: "{{{productIdea}}}"
  
  Each user should have a unique name, professional role, personality, a specific problem they face, and a goal they want to achieve. Each agent has a fixed budget of ₹1000 for solutions, which they must consider when deciding to pay.
  
  Ensure the agents are diverse and represent a realistic market, allowing for a range of opinions from keen adoption to complete disinterest or irrelevance. Some agents should find the product highly relevant, others moderately, and some not at all.

  Generate a JSON array containing 10 agent profiles.`,
});

const EvaluateAgentInputSchema = z.object({
  productIdea: z.string().describe('The product idea, SaaS description, or link being evaluated.'),
  evaluationType: z.enum(['Product Feedback', 'Market Fit', 'First Paying Users']).describe('The type of evaluation to perform.'),
  agentProfile: AgentProfileSchema.describe('The profile of the AI agent performing the evaluation.'),
});

const evaluateAgentPrompt = ai.definePrompt({
  name: 'evaluateAgentPrompt',
  input: { schema: EvaluateAgentInputSchema },
  output: { schema: AgentEvaluationOutputSchema },
  prompt: `You are {{{agentProfile.name}}}, a {{{agentProfile.role}}} with the following personality: "{{{agentProfile.personality}}}".
  Your main problem is "{{{agentProfile.problem}}}" and your goal is "{{{agentProfile.goal}}}".
  You have a limited budget of ₹{{{agentProfile.budget}}} for solutions.

  You are asked to critically evaluate the following product idea for a "{{{evaluationType}}}" assessment:
  Product Idea: "{{{productIdea}}}"

  Based on your persona (role, personality, problem, goal, and budget), answer the following questions:
  - Would you use this product? Only say yes if it genuinely helps your workflow or solves your problem effectively.
  - Would you be willing to pay for this product? Consider your budget of ₹{{{agentProfile.budget}}} and the value it provides.
  - If you would pay, what price would you be willing to pay? If not, state "N/A" or "0".
  - What is your estimated time to adopt this product? (e.g., "Immediately", "Within a month", "Never relevant", "After significant improvements")
  - What is your primary reason for your decision to use/not use and pay/not pay?
  - Provide detailed feedback about the product, including pros, cons, and suggestions for improvement, considering how it aligns or doesn't align with your goals and problems.

  Remember to be critical and realistic. You are not obligated to like or adopt the product. If it's not relevant to you, you might ignore it. If it's relevant but too expensive, you might not pay. Ensure your score (0-100) reflects your overall sentiment, with 0 meaning completely irrelevant/useless and 100 meaning perfectly solves your problem and worth paying for.`,
});


const calculateOverallAnalysisPrompt = ai.definePrompt({
  name: 'calculateOverallAnalysisPrompt',
  input: {
    schema: z.object({
      productIdea: z.string().describe('The product idea being evaluated.'),
      agentEvaluations: z.array(AgentEvaluationOutputSchema).describe('The array of individual agent evaluations.'),
    }),
  },
  output: { schema: OverallMarketAnalysisSchema },
  prompt: `Based on the following product idea and a series of AI agent evaluations, calculate the overall market analysis.

  Product Idea: "{{{productIdea}}}"
  
  Agent Evaluations:
  {{{agentEvaluations}}}
  
  Calculate the following metrics:
  - overallScore: The average score across all agents.
  - wouldUsePercent: The percentage of agents who answered 'true' for 'wouldUse'.
  - wouldPayPercent: The percentage of agents who answered 'true' for 'wouldPay'.
  - topAudience: Identify the most receptive audience segment based on the roles and feedback of the agents who scored the product highly or expressed willingness to use/pay.
  - summary: Provide a concise summary of the simulation results, highlighting the product's key strengths, weaknesses, and overall market potential based on the aggregated agent feedback.`,
});

const simulateProductEvaluationFlow = ai.defineFlow(
  {
    name: 'simulateProductEvaluationFlow',
    inputSchema: SimulateProductEvaluationInputSchema,
    outputSchema: SimulateProductEvaluationOutputSchema,
  },
  async (input) => {
    // Step 1: Generate 10 AI agents
    const { output: agentProfiles } = await generateAgentsPrompt(input);
    if (!agentProfiles || agentProfiles.length === 0) {
      throw new Error('Failed to generate agent profiles.');
    }

    // Step 2: Each agent evaluates the product
    const agentEvaluations: z.infer<typeof AgentEvaluationOutputSchema>[] = [];
    for (const agentProfile of agentProfiles) {
      const { output: evaluation } = await evaluateAgentPrompt({
        productIdea: input.productIdea,
        evaluationType: input.evaluationType,
        agentProfile: agentProfile,
      });
      if (evaluation) {
        agentEvaluations.push(evaluation);
      }
    }

    if (agentEvaluations.length === 0) {
      throw new Error('No agent evaluations were generated.');
    }

    // Step 3: Calculate overall market analysis
    const { output: overallAnalysis } = await calculateOverallAnalysisPrompt({
      productIdea: input.productIdea,
      agentEvaluations: agentEvaluations,
    });

    if (!overallAnalysis) {
      throw new Error('Failed to calculate overall market analysis.');
    }

    return {
      agents: agentEvaluations,
      overallAnalysis: overallAnalysis,
    };
  }
);

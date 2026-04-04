'use server';
/**
 * @fileOverview A Genkit flow for generating an overall market summary and identifying top audience segments
 *               from a collection of AI agent evaluations.
 *
 * - generateMarketSummaryAndTopAudience - A function that handles the market summary generation process.
 * - GenerateMarketSummaryInput - The input type for the generateMarketSummaryAndTopAudience function.
 * - GenerateMarketSummaryOutput - The return type for the generateMarketSummaryAndTopAudience function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Agent JSON Output Format (input to this flow)
const AgentEvaluationSchema = z.object({
  name: z.string().describe("The name of the AI agent."),
  role: z.string().describe("The role of the AI agent."),
  personality: z.string().describe("The personality of the AI agent."),
  goal: z.string().describe("The primary goal of the AI agent."),
  problem: z.string().describe("The problem the AI agent is trying to solve."),
  score: z.number().int().min(0).max(100).describe("The agent's evaluation score for the product (0-100)."),
  wouldUse: z.boolean().describe("Whether the agent would use the product (true/false)."),
  wouldPay: z.boolean().describe("Whether the agent would pay for the product (true/false)."),
  priceWilling: z.string().describe("The price the agent would be willing to pay for the product, if any."),
  timeToAdopt: z.string().describe("The estimated time for the agent to adopt the product."),
  reason: z.string().describe("The primary reason for the agent's decision."),
  feedback: z.string().describe("Detailed feedback from the agent about the product."),
});

// Input Schema for the market summary flow
const GenerateMarketSummaryInputSchema = z.object({
  productIdea: z.string().describe("The original product idea, SaaS description, or link that was evaluated."),
  evaluationType: z.enum(['Product Feedback', 'Market Fit', 'First Paying Users']).describe("The type of evaluation performed."),
  agentEvaluations: z.array(AgentEvaluationSchema).describe("An array of evaluation results from individual AI agents."),
});
export type GenerateMarketSummaryInput = z.infer<typeof GenerateMarketSummaryInputSchema>;

// Output Schema for the market summary flow
const GenerateMarketSummaryOutputSchema = z.object({
  overallScore: z.number().int().min(0).max(100).describe("The average score across all agents (0-100), representing the overall market sentiment."),
  wouldUsePercent: z.number().int().min(0).max(100).describe("The percentage of agents who indicated they would use the product (0-100)."),
  wouldPayPercent: z.number().int().min(0).max(100).describe("The percentage of agents who indicated they would pay for the product (0-100)."),
  topAudience: z.string().describe("A concise description of the most promising target audience segment identified from the agent evaluations."),
  summary: z.string().describe("A comprehensive summary of the market simulation results, highlighting key strengths, weaknesses, opportunities, and overall insights."),
});
export type GenerateMarketSummaryOutput = z.infer<typeof GenerateMarketSummaryOutputSchema>;

// Exported wrapper function
export async function generateMarketSummaryAndTopAudience(input: GenerateMarketSummaryInput): Promise<GenerateMarketSummaryOutput> {
  return generateMarketSummaryAndTopAudienceFlow(input);
}

// Genkit Prompt definition
const marketSummaryPrompt = ai.definePrompt({
  name: 'marketSummaryPrompt',
  input: { schema: GenerateMarketSummaryInputSchema },
  output: { schema: GenerateMarketSummaryOutputSchema },
  prompt: `You are an expert market analyst specializing in evaluating new product concepts.
You have been provided with the results of a market simulation where 10 AI agents, representing real-world users, evaluated a product.
Your task is to analyze these individual evaluations and provide an overall market summary and identify the top audience segments.

Product Idea: {{{productIdea}}}
Evaluation Type: {{{evaluationType}}}

Here are the evaluation results from each AI agent:
{{#each agentEvaluations}}
- Agent Name: {{{this.name}}}
  Role: {{{this.role}}}
  Personality: {{{this.personality}}}
  Goal: {{{this.goal}}}
  Problem: {{{this.problem}}}
  Score: {{{this.score}}}
  Would Use: {{{this.wouldUse}}}
  Would Pay: {{{this.wouldPay}}}
  Price Willing: {{{this.priceWilling}}}
  Time to Adopt: {{{this.timeToAdopt}}}
  Reason: {{{this.reason}}}
  Feedback: {{{this.feedback}}}
{{/each}}

Based on these evaluations, perform the following:
1. Calculate the 'overallScore' as the average of all agents' scores (round to nearest integer).
2. Calculate the 'wouldUsePercent' as the percentage of agents who responded 'true' for 'wouldUse' (round to nearest integer).
3. Calculate the 'wouldPayPercent' as the percentage of agents who responded 'true' for 'wouldPay' (round to nearest integer).
4. Identify the 'topAudience' by recognizing patterns among agents who gave high scores, expressed willingness to use, and willingness to pay. Describe this audience concisely.
5. Write a 'summary' that synthesizes all feedback, noting common themes, strengths, weaknesses, and overall market potential for the product. Ensure the summary is comprehensive and insightful.

Return your analysis in the specified JSON format. Ensure all numerical percentages are integers between 0 and 100.`,
});

// Genkit Flow definition
const generateMarketSummaryAndTopAudienceFlow = ai.defineFlow(
  {
    name: 'generateMarketSummaryAndTopAudienceFlow',
    inputSchema: GenerateMarketSummaryInputSchema,
    outputSchema: GenerateMarketSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await marketSummaryPrompt(input);
    if (!output) {
      throw new Error('Failed to generate market summary and top audience.');
    }
    return output;
  }
);

'use server';
/**
 * @fileOverview A flow for generating market summary using Groq.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { callLLM } from '@/ai/groq';

const GenerateMarketSummaryInputSchema = z.object({
  productIdea: z.string(),
  evaluationType: z.enum(['Product Feedback', 'Market Fit', 'First Paying Users']),
  agentEvaluations: z.array(z.any()),
});
export type GenerateMarketSummaryInput = z.infer<typeof GenerateMarketSummaryInputSchema>;

const GenerateMarketSummaryOutputSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  wouldUsePercent: z.number().int().min(0).max(100),
  wouldPayPercent: z.number().int().min(0).max(100),
  topAudience: z.string(),
  summary: z.string(),
});
export type GenerateMarketSummaryOutput = z.infer<typeof GenerateMarketSummaryOutputSchema>;

export async function generateMarketSummaryAndTopAudience(input: GenerateMarketSummaryInput): Promise<GenerateMarketSummaryOutput> {
  return generateMarketSummaryAndTopAudienceFlow(input);
}

const generateMarketSummaryAndTopAudienceFlow = ai.defineFlow(
  {
    name: 'generateMarketSummaryAndTopAudienceFlow',
    inputSchema: GenerateMarketSummaryInputSchema,
    outputSchema: GenerateMarketSummaryOutputSchema,
  },
  async (input) => {
    const prompt = `Analyze these 10 AI agent evaluations for "${input.productIdea}" (${input.evaluationType}):
    ${JSON.stringify(input.agentEvaluations)}
    
    Calculate and return a JSON object with:
    1. overallScore (integer 0-100)
    2. wouldUsePercent (integer 0-100)
    3. wouldPayPercent (integer 0-100)
    4. topAudience (concise description)
    5. summary (comprehensive insights)`;

    const response = await callLLM(prompt);
    return GenerateMarketSummaryOutputSchema.parse(JSON.parse(response));
  }
);

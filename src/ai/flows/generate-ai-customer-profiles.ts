'use server';
/**
 * @fileOverview A flow to generate unique AI customer profiles using Groq.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { callLLM } from '@/ai/groq';

const GenerateAiCustomerProfilesInputSchema = z.object({
  productConcept: z.string(),
  evaluationType: z.enum(['Product Feedback', 'Market Fit', 'First Paying Users']),
});
export type GenerateAiCustomerProfilesInput = z.infer<typeof GenerateAiCustomerProfilesInputSchema>;

const AgentProfileSchema = z.object({
  name: z.string(),
  role: z.string(),
  personality: z.string(),
  problem: z.string(),
  goal: z.string(),
  budget: z.number(),
});

const GenerateAiCustomerProfilesOutputSchema = z.array(AgentProfileSchema).length(10);
export type GenerateAiCustomerProfilesOutput = z.infer<typeof GenerateAiCustomerProfilesOutputSchema>;

export async function generateAiCustomerProfiles(input: GenerateAiCustomerProfilesInput): Promise<GenerateAiCustomerProfilesOutput> {
  return generateAiCustomerProfilesFlow(input);
}

const generateAiCustomerProfilesFlow = ai.defineFlow(
  {
    name: 'generateAiCustomerProfilesFlow',
    inputSchema: GenerateAiCustomerProfilesInputSchema,
    outputSchema: GenerateAiCustomerProfilesOutputSchema,
  },
  async (input) => {
    const prompt = `Create 10 realistic and diverse user profiles for: "${input.productConcept}".
    Evaluation mode: ${input.evaluationType}.
    Each profile needs: name, role, personality, problem, goal, budget (in Rupees).
    Return a JSON array of 10 objects.`;

    const response = await callLLM(prompt);
    const data = JSON.parse(response);
    const profiles = Array.isArray(data) ? data : (data.profiles || data.agents);
    return GenerateAiCustomerProfilesOutputSchema.parse(profiles);
  }
);

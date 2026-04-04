'use server';
/**
 * @fileOverview A Genkit flow to generate 10 unique AI customer profiles for market simulation.
 *
 * - generateAiCustomerProfiles - A function that handles the generation of AI customer profiles.
 * - GenerateAiCustomerProfilesInput - The input type for the generateAiCustomerProfiles function.
 * - GenerateAiCustomerProfilesOutput - The return type for the generateAiCustomerProfiles function, an array of agent profiles.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAiCustomerProfilesInputSchema = z.object({
  productConcept: z.string().describe('The product idea, SaaS description, or link that the AI agents will evaluate.'),
  evaluationType: z.enum(['Product Feedback', 'Market Fit', 'First Paying Users']).describe('The type of market evaluation to perform, influencing agent generation.'),
});
export type GenerateAiCustomerProfilesInput = z.infer<typeof GenerateAiCustomerProfilesInputSchema>;

const AgentProfileSchema = z.object({
  name: z.string().describe('The name of the AI agent.'),
  role: z.string().describe('The professional or personal role of the AI agent, e.g., "Small Business Owner", "Software Developer", "Parent".'),
  personality: z.string().describe('A brief description of the AI agent\'s personality, e.g., "tech-savvy and budget-conscious", "busy and seeking convenience".'),
  problem: z.string().describe('A key problem or pain point the AI agent faces that the product might address, e.g., "struggles with managing social media presence".'),
  goal: z.string().describe('A primary goal or objective of the AI agent, e.g., "to grow my online store by 20%", "to automate repetitive tasks".'),
  budget: z.number().describe('The general budget (in Rupees) available to the AI agent for purchasing solutions relevant to their problems.'),
});
export type AgentProfile = z.infer<typeof AgentProfileSchema>; // Export individual agent type for clarity if needed elsewhere.

const GenerateAiCustomerProfilesOutputSchema = z.array(AgentProfileSchema).length(10).describe('An array of 10 unique AI customer profiles.');
export type GenerateAiCustomerProfilesOutput = z.infer<typeof GenerateAiCustomerProfilesOutputSchema>;

export async function generateAiCustomerProfiles(input: GenerateAiCustomerProfilesInput): Promise<GenerateAiCustomerProfilesOutput> {
  return generateAiCustomerProfilesFlow(input);
}

const generateAiCustomerProfilesPrompt = ai.definePrompt({
  name: 'generateAiCustomerProfilesPrompt',
  input: {schema: GenerateAiCustomerProfilesInputSchema},
  output: {schema: GenerateAiCustomerProfilesOutputSchema},
  prompt: `You are an expert market researcher. Your task is to create 10 realistic and diverse user profiles that represent potential customers for the given product concept.
Each profile should include a distinct name, a clear role, a defining personality trait, a significant problem they face, a specific goal they aim to achieve, and a realistic budget (in Rupees) they might have for solutions related to their problem.
Ensure these profiles are varied in their demographics, needs, and financial capacity to simulate a diverse market.
The profiles should be tailored considering the product will undergo a '{{{evaluationType}}}' evaluation, so their characteristics should be relevant to that type of analysis.

Product Concept for Evaluation:
{{{productConcept}}}

The output MUST be a JSON array containing exactly 10 user objects.`,
});

const generateAiCustomerProfilesFlow = ai.defineFlow(
  {
    name: 'generateAiCustomerProfilesFlow',
    inputSchema: GenerateAiCustomerProfilesInputSchema,
    outputSchema: GenerateAiCustomerProfilesOutputSchema,
  },
  async (input) => {
    const {output} = await generateAiCustomerProfilesPrompt(input);
    if (!output) {
      throw new Error('Failed to generate AI customer profiles.');
    }
    return output;
  }
);

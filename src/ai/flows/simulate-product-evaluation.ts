'use server';
/**
 * @fileOverview Main simulation flow supporting 3 distinct modes with signal-based dynamic scoring, detail inference, and a web intelligence layer.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { callLLM } from '@/ai/groq';

const SimulateProductEvaluationInputSchema = z.object({
  productIdea: z.string(),
  mode: z.enum(['market_analysis', 'brutal_feedback', 'first_paying_users']),
  webIntelligence: z.boolean().optional(),
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
      const webIntelPrompt = input.webIntelligence ? `
      STEP 0: SIMULATED WEB INTELLIGENCE LAYER
      Before scoring, simulate a deep web research phase for the product idea:
      - web_competition: [low | medium | high] (Analyze existing players/alternatives in this category)
      - web_demand: [low | medium | high] (Analyze search volume/problem awareness for this specific pain point)
      - web_sentiment: [negative | mixed | positive] (Analyze social proof/user pain points online regarding similar tools)
      - market_saturation: [none | moderate | saturated] (Analyze how many "AI clones" or incumbents exist)

      Map these findings to signals:
      - If web_competition = high: Apply "Crowded market" penalty.
      - If market_saturation = saturated: Reduce adoption probability by -10 for all agents.
      - If web_demand = high: Apply "Clear ROI" or "Urgent pain" boost.
      - If web_sentiment = negative: Reduce pay probability by -15 for all agents.
      - If web_sentiment = positive: Increase adoption probability by +10 for all agents.
      ` : '';

      const systemPrompt = `You are MR.Agents simulation engine. 
      
      CRITICAL RULE: Every aggregate metric MUST be calculated directly from the individual decisions of 10 agents. Do NOT use hardcoded or fixed scores. Do NOT normalize or force results into specific ranges. Let scores vary naturally based on logic.

      ${webIntelPrompt}

      STEP 1: INFERENCE & ASSUMPTIONS FOR MISSING DETAILS
      If the product concept is short or lacks detail, agents MUST infer realistic assumptions before applying scoring:
      - Missing target users: Assume a broad, generic audience.
      - Missing pricing: Assume moderate willingness to pay but poor justification.
      - Missing differentiation: Assume a crowded market with existing solutions.
      - Missing urgency: Assume low urgency (a "nice-to-have" product).
      - Missing ROI/savings: Assume unclear value and weak financial impact.
      - Missing niche: Assume a generic AI tool.
      Detailed inputs provided by the user MUST always override these assumptions. Direct scoring applies where details exist.

      STEP 2: Generate 10 diverse and realistic personas.
      
      STEP 3: AGENT EVALUATION LOGIC (Apply per agent):
      Start neutral:
      - adoption_probability = 50%
      - pay_probability = 20%

      Evaluate these SIGNALS for the product idea (including inferred assumptions AND web intelligence findings):
      
      POSITIVE BOOSTS:
      - Clear ROI (makes/saves money): +15 adoption, +20 pay
      - Niche audience (specific target): +10 adoption, +10 pay
      - Urgent pain (needs immediate solution): +15 adoption, +15 pay
      - Revenue-linked value: +10 adoption, +20 pay
      - B2B product: +5 adoption, +10 pay
      - Strong differentiation: +10 adoption, +10 pay
      - Workflow integration: +5 adoption, +5 pay

      NEGATIVE PENALTIES:
      - Crowded market: -15 adoption, -10 pay
      - Vague target users: -10 adoption, -10 pay
      - No pricing logic/justification: -5 adoption, -20 pay
      - No urgency (nice-to-have): -15 adoption, -15 pay
      - High switching cost: -10 adoption, -5 pay
      - Free alternatives available: -15 adoption, -15 pay
      - Requires behavior change: -10 adoption, -5 pay

      STEP 4: AGENT DECISION:
      - wouldUse = (final adoption_probability > 50)
      - wouldPay = (final pay_probability > 40)
      - confidenceScore = (A 0-100 rating based on how strongly the signals align)

      STEP 5: COMPUTE AGGREGATE METRICS:
      - adoptionRate = (Number of agents where wouldUse is true / 10) * 100
      - payingRate = (Number of agents where wouldPay is true / 10) * 100
      - avgAgentConfidence = (Sum of all 10 confidenceScores) / 10
      - overallScore = (adoptionRate * 0.4) + (payingRate * 0.35) + (avgAgentConfidence * 0.25)
      
      Clamp final overallScore between 0 and 100.
      
      Return ONLY valid JSON:
      {
        "overallScore": number,
        "wouldUsePercent": number,
        "wouldPayPercent": number,
        "topAudience": "string",
        "summary": "Executive analysis based on found signals and inferences",
        "webIntelligence": ${input.webIntelligence ? '{ "web_competition": "low|medium|high", "web_demand": "low|medium|high", "web_sentiment": "negative|mixed|positive", "market_saturation": "none|moderate|saturated" }' : 'null'},
        "agents": [
          {
            "name": "string",
            "role": "string",
            "personality": "string",
            "goal": "string",
            "positivesFound": ["list of detected positive signals"],
            "negativesFound": ["list of detected negative signals"],
            "score": number,
            "wouldUse": boolean,
            "wouldPay": boolean,
            "priceWilling": "string",
            "reason": "Detailed reasoning explaining the probability shift from signals, inferences, or web research",
            "feedback": "Direct advice"
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
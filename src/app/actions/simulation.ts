'use server';

import { simulateProductEvaluation, SimulateProductEvaluationInput } from '@/ai/flows/simulate-product-evaluation';

/**
 * Server action to run the AI simulation.
 * It strictly handles the AI logic and returns serializable data.
 * Firestore persistence is handled on the client side to comply with architecture rules.
 */
export async function runSimulation(input: SimulateProductEvaluationInput) {
  try {
    const results = await simulateProductEvaluation(input);
    return { success: true, data: results };
  } catch (error: any) {
    console.error('Simulation failed:', error);
    return { success: false, error: error.message || 'Failed to run simulation' };
  }
}

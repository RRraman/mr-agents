'use server';

import { simulateProductEvaluation, SimulateProductEvaluationInput } from '@/ai/flows/simulate-product-evaluation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function runSimulation(input: SimulateProductEvaluationInput) {
  try {
    const results = await simulateProductEvaluation(input);
    
    // Save to Firestore
    const simulationRef = collection(db, 'simulations');
    await addDoc(simulationRef, {
      input: input.productIdea,
      mode: input.evaluationType,
      agents: results.agents,
      overallAnalysis: results.overallAnalysis,
      createdAt: serverTimestamp(),
    });

    return { success: true, data: results };
  } catch (error: any) {
    console.error('Simulation failed:', error);
    return { success: false, error: error.message || 'Failed to run simulation' };
  }
}

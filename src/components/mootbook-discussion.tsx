'use client';

import { useState, useEffect } from 'react';
import { runMootbookDiscussion } from '@/ai/flows/mootbook-discussion';

interface Message {
  agent: string;
  avatar: string;
  message: string;
}

interface MootbookResult {
  discussion: Message[];
  verdict: string;
  verdict_reason: string;
}

interface SimulationContext {
  marketResults?: any;
  brutalResults?: any;
  chatResults?: any;
}

export function MootbookDiscussion({ productIdea, context }: { productIdea: string; context?: SimulationContext }) {
  const [result, setResult] = useState<MootbookResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [runCount, setRunCount] = useState(0);

  const hasContext = context && (context.marketResults || context.brutalResults || context.chatResults);

  useEffect(() => {
    if (productIdea.trim()) {
      fetchConvo();
    }
  }, [runCount]);

  const fetchConvo = async () => {
    if (!productIdea.trim()) return;
    setLoading(true);
    setResult(null);
    setVisibleCount(0);
    setError(null);
    try {
      const data = await runMootbookDiscussion(productIdea, context);
      setResult(data);
      data.discussion.forEach((_: Message, i: number) => {
        setTimeout(() => setVisibleCount(i + 1), i * 1000);
      });
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleRerun = () => setRunCount(prev => prev + 1);

  if (loading) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-purple-500/20 rounded-2xl bg-card/10 space-y-4">
        <div className="flex gap-2">
          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-sm text-purple-300">
          {hasContext ? 'Agents reviewing your simulation data...' : 'Agents are gathering...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-red-500/20 rounded-2xl space-y-4">
        <p className="text-red-400 text-sm">{error}</p>
        <button onClick={handleRerun} className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg text-sm hover:bg-red-500/30">
          Retry
        </button>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-mono">Live Roundtable</p>
          {hasContext && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/20">
              📊 Using simulation data
            </span>
          )}
        </div>
        <button onClick={handleRerun} className="text-xs text-purple-400 hover:text-purple-300 underline">
          Re-run
        </button>
      </div>

      {result.discussion.slice(0, visibleCount).map((msg, i) => (
        <div key={i} className="flex gap-3 p-4 bg-gray-900 rounded-xl border border-white/5">
          <span className="text-2xl">{msg.avatar}</span>
          <div>
            <p className="font-semibold text-sm text-white">{msg.agent}</p>
            <p className="text-sm text-gray-300 mt-1">{msg.message}</p>
          </div>
        </div>
      ))}

      {visibleCount >= result.discussion.length && result.discussion.length > 0 && (
        <div className={`p-4 rounded-xl font-semibold text-center mt-2 ${
          result.verdict === 'Worth building'
            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {result.verdict === 'Worth building' ? '✅' : '❌'} {result.verdict}
          <p className="text-xs font-normal mt-1 opacity-70">{result.verdict_reason}</p>
        </div>
      )}
    </div>
  );
}

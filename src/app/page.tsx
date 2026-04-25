'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { runSimulation } from '@/app/actions/simulation';
import { MarketResults } from '@/components/market-results';
import { BrutalResults } from '@/components/brutal-results';
import { ChatInterface } from '@/components/chat-interface';
import { MootbookDiscussion } from '@/components/mootbook-discussion';
import { Loader2, Rocket, Info, LayoutDashboard, Brain, MessageSquare, AlertTriangle, Globe, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useAuth } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

type Mode = 'market_analysis' | 'brutal_feedback' | 'first_paying_users' | 'agent_convo';

export default function HomePage() {
  const [productIdea, setProductIdea] = useState('');
  const [mode, setMode] = useState<Mode>('market_analysis');
  const [webIntelligence, setWebIntelligence] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [agentConvoStarted, setAgentConvoStarted] = useState(false);
  const [marketResults, setMarketResults] = useState<any | null>(null);
  const [brutalResults, setBrutalResults] = useState<any | null>(null);
  const [chatResults, setChatResults] = useState<any | null>(null);

  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const handleRunSimulation = async () => {
    if (!productIdea.trim()) {
      toast({ title: "Input required", description: "Please enter your product idea first.", variant: "destructive" });
      return;
    }

    if (mode === 'agent_convo') {
      setAgentConvoStarted(true);
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const response = await runSimulation({ productIdea, mode, webIntelligence });
      if (response.success && response.data) {
        setResults(response.data);
        if (mode === 'market_analysis') setMarketResults(response.data);
        if (mode === 'brutal_feedback') setBrutalResults(response.data);
        if (mode === 'first_paying_users') setChatResults(response.data);

        if (firestore && user && mode !== 'first_paying_users') {
          const simRef = doc(collection(firestore, 'users', user.uid, 'simulations'));
          setDocumentNonBlocking(simRef, {
            id: simRef.id,
            input: productIdea,
            mode,
            ...response.data,
            createdAt: new Date().toISOString()
          }, { merge: true });
        }
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      toast({ title: "Simulation Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setResults(null);
    setAgentConvoStarted(false);
  };

  const simulationContext = {
    marketResults: marketResults || undefined,
    brutalResults: brutalResults || undefined,
    chatResults: chatResults || undefined,
  };

  const hasAnyContext = !!(marketResults || brutalResults || chatResults);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
          <Rocket className="w-4 h-4" />
          MR.Agents: Multi-Engine Validation
        </div>

        {/* ✅ UPDATED TITLE */}
        <h1 className="text-5xl md:text-6xl font-headline font-bold text-white tracking-tight">
          Idea Analysis and Validation using <span className="text-accent">Agent Systems</span>
        </h1>

        {/* ✅ UPDATED DESCRIPTION */}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
          Analyze and validate product ideas using agent-based systems to evaluate feasibility and potential outcomes.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-white/5 shadow-2xl space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Info className="w-4 h-4" />
                Product Concept
              </label>
              <Textarea
                placeholder="Describe your idea or paste a link..."
                className="min-h-[150px] bg-background border-white/10"
                value={productIdea}
                onChange={(e) => setProductIdea(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-muted-foreground">Simulation Engine</label>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant={mode === 'market_analysis' ? 'default' : 'outline'}
                  className="justify-start gap-2"
                  onClick={() => handleModeChange('market_analysis')}
                >
                  <Brain className="w-4 h-4" /> Market Analysis
                  {marketResults && <span className="ml-auto text-xs text-green-400">✓</span>}
                </Button>
                <Button
                  variant={mode === 'brutal_feedback' ? 'default' : 'outline'}
                  className="justify-start gap-2 text-red-400 border-red-900/20"
                  onClick={() => handleModeChange('brutal_feedback')}
                >
                  <AlertTriangle className="w-4 h-4" /> Brutal Feedback
                  {brutalResults && <span className="ml-auto text-xs text-green-400">✓</span>}
                </Button>
                <Button
                  variant={mode === 'first_paying_users' ? 'default' : 'outline'}
                  className="justify-start gap-2 text-cyan-400 border-cyan-900/20"
                  onClick={() => handleModeChange('first_paying_users')}
                >
                  <MessageSquare className="w-4 h-4" /> Paying Users Chat
                  {chatResults && <span className="ml-auto text-xs text-green-400">✓</span>}
                </Button>
                <Button
                  variant={mode === 'agent_convo' ? 'default' : 'outline'}
                  className="justify-start gap-2 text-purple-400 border-purple-900/20"
                  onClick={() => handleModeChange('agent_convo')}
                >
                  <Users className="w-4 h-4" /> Agent Convo
                  {hasAnyContext && <span className="ml-auto text-xs text-purple-400">📊</span>}
                </Button>
              </div>
            </div>

            {mode === 'market_analysis' && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-accent" />
                  <div className="space-y-0.5">
                    <Label htmlFor="web-intel" className="text-sm cursor-pointer">Web Intelligence</Label>
                    <p className="text-[10px] text-muted-foreground">Simulate market research</p>
                  </div>
                </div>
                <Switch
                  id="web-intel"
                  checked={webIntelligence}
                  onCheckedChange={setWebIntelligence}
                />
              </div>
            )}

            {mode === 'agent_convo' && (
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-xs text-purple-300">
                  {hasAnyContext
                    ? `📊 Agents will use your data: ${[marketResults && 'Market', brutalResults && 'Brutal', chatResults && 'Chat'].filter(Boolean).join(', ')}`
                    : '5 agents debate your idea fresh — run other engines first for richer convo.'}
                </p>
              </div>
            )}

            <Button
              className="w-full h-12 text-lg font-headline font-bold"
              onClick={handleRunSimulation}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : mode === 'agent_convo' ? 'Start Agent Convo' : 'Start Simulation'}
            </Button>
          </div>
        </aside>

        <main className="lg:col-span-8">
          {mode === 'agent_convo' && agentConvoStarted ? (
            <MootbookDiscussion productIdea={productIdea} context={simulationContext} />
          ) : results ? (
            <>
              {mode === 'market_analysis' && <MarketResults results={results} />}
              {mode === 'brutal_feedback' && <BrutalResults results={results} />}
              {mode === 'first_paying_users' && <ChatInterface productIdea={productIdea} initialMessage={results} />}
            </>
          ) : (
            <div className="h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-card/10 text-muted-foreground space-y-4">
              {isLoading ? (
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                  <p className="text-xl font-headline font-medium text-white">Initializing Engine...</p>
                  <p className="text-xs text-muted-foreground italic">
                    {webIntelligence ? "Simulating deep web research and competitor analysis..." : "Preparing simulation personas..."}
                  </p>
                </div>
              ) : (
                <>
                  <LayoutDashboard className="w-16 h-16 opacity-20" />
                  <p className="text-lg font-medium text-center px-6">
                    {mode === 'agent_convo' ? 'Enter your idea and start Agent Convo.' : 'Select an engine and run simulation.'}
                  </p>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

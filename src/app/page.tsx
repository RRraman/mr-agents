
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { runSimulation } from '@/app/actions/simulation';
import { MarketResults } from '@/components/market-results';
import { BrutalResults } from '@/components/brutal-results';
import { ChatInterface } from '@/components/chat-interface';
import { Loader2, Rocket, Info, LayoutDashboard, Brain, MessageSquare, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useAuth } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

export default function HomePage() {
  const [productIdea, setProductIdea] = useState('');
  const [mode, setMode] = useState<'market_analysis' | 'brutal_feedback' | 'first_paying_users'>('market_analysis');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  
  const { toast } = useToast();
  const { firestore } = useFirestore();
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

    setIsLoading(true);
    setResults(null);
    
    try {
      const response = await runSimulation({ productIdea, mode });
      if (response.success && response.data) {
        setResults(response.data);
        
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
          <Rocket className="w-4 h-4" />
          MR.Agents: Multi-Engine Validation
        </div>
        <h1 className="text-5xl md:text-6xl font-headline font-bold text-white tracking-tight">
          AI Market <span className="text-accent">Simulator</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
          Choose your engine. Validate your idea with deep analysis, brutal honesty, or interactive pressure.
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Simulation Engine</label>
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  variant={mode === 'market_analysis' ? 'default' : 'outline'}
                  className="justify-start gap-2"
                  onClick={() => setMode('market_analysis')}
                >
                  <Brain className="w-4 h-4" /> Market Analysis
                </Button>
                <Button 
                  variant={mode === 'brutal_feedback' ? 'default' : 'outline'}
                  className="justify-start gap-2 text-red-400 border-red-900/20"
                  onClick={() => setMode('brutal_feedback')}
                >
                  <AlertTriangle className="w-4 h-4" /> Brutal Feedback
                </Button>
                <Button 
                  variant={mode === 'first_paying_users' ? 'default' : 'outline'}
                  className="justify-start gap-2 text-cyan-400 border-cyan-900/20"
                  onClick={() => setMode('first_paying_users')}
                >
                  <MessageSquare className="w-4 h-4" /> Paying Users Chat
                </Button>
              </div>
            </div>

            <Button 
              className="w-full h-12 text-lg font-headline font-bold"
              onClick={handleRunSimulation}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Start Simulation'}
            </Button>
          </div>
        </aside>

        <main className="lg:col-span-8">
          {results ? (
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
                </div>
              ) : (
                <>
                  <LayoutDashboard className="w-16 h-16 opacity-20" />
                  <p className="text-lg font-medium text-center px-6">Select an engine and run simulation.</p>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

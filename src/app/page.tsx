'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { runSimulation } from '@/app/actions/simulation';
import { MarketResults } from '@/components/market-results';
import { Loader2, Rocket, Info, LayoutDashboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SimulateProductEvaluationOutput } from '@/ai/flows/simulate-product-evaluation';

export default function HomePage() {
  const [productIdea, setProductIdea] = useState('');
  const [evaluationType, setEvaluationType] = useState<'Product Feedback' | 'Market Fit' | 'First Paying Users'>('Product Feedback');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SimulateProductEvaluationOutput | null>(null);
  const { toast } = useToast();

  const handleRunSimulation = async () => {
    if (!productIdea.trim()) {
      toast({
        title: "Input required",
        description: "Please enter your product idea or SaaS concept first.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResults(null);
    
    try {
      const response = await runSimulation({ productIdea, evaluationType });
      if (response.success && response.data) {
        console.log("Simulation result:", response.data);
        setResults(response.data);
        toast({
          title: "Simulation Complete",
          description: "10 AI agents have evaluated your product idea.",
        });
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      console.error("Simulation error:", error);
      toast({
        title: "Simulation Error",
        description: error.message || "Something went wrong while running the simulation.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
          <Rocket className="w-4 h-4" />
          Beta: AI-Driven Market Testing
        </div>
        <h1 className="text-5xl md:text-6xl font-headline font-bold text-white tracking-tight">
          AI Market <span className="text-accent">Simulator</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
          Paste your product concept and let 10 diverse AI personas evaluate its potential, adoption rate, and willingness to pay.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-white/5 shadow-2xl space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Info className="w-4 h-4" />
                Product Idea or Link
              </label>
              <Textarea 
                placeholder="Paste your product idea, SaaS description, or project link here..."
                className="min-h-[200px] bg-background border-white/10 focus:ring-accent"
                value={productIdea}
                onChange={(e) => setProductIdea(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Evaluation Focus</label>
              <Select value={evaluationType} onValueChange={(value: any) => setEvaluationType(value)}>
                <SelectTrigger className="bg-background border-white/10">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Product Feedback">Product Feedback</SelectItem>
                  <SelectItem value="Market Fit">Market Fit</SelectItem>
                  <SelectItem value="First Paying Users">First Paying Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full h-12 text-lg font-headline font-bold bg-primary hover:bg-primary/90 text-white shadow-lg transition-all active:scale-95"
              onClick={handleRunSimulation}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Simulating Market...
                </>
              ) : (
                'Run Simulation'
              )}
            </Button>
          </div>
          
          <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-accent mb-2">Agent Rules</h4>
            <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
              <li>10 realistic personas generated per niche</li>
              <li>Fixed budget of ₹1000 per agent</li>
              <li>Calculated decision to use, pay, or ignore</li>
              <li>Diverse personalities (skeptics to enthusiasts)</li>
            </ul>
          </div>
        </aside>

        {/* Results Main Area */}
        <main className="lg:col-span-8">
          {results ? (
            <MarketResults results={results} />
          ) : (
            <div className="h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-card/10 text-muted-foreground space-y-4">
              {isLoading ? (
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                  <div className="space-y-2">
                    <p className="text-xl font-headline font-medium text-white">Simulating Market Response...</p>
                    <p className="text-sm">Agents are evaluating your product...</p>
                  </div>
                </div>
              ) : (
                <>
                  <LayoutDashboard className="w-16 h-16 opacity-20" />
                  <p className="text-lg font-medium">Results will appear here once the simulation starts</p>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      <footer className="pt-12 border-t border-white/5 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} AI Market Simulator. Built for data-driven product validation.</p>
      </footer>
    </div>
  );
}

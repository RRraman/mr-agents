import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Target, Brain, AlertCircle, CheckCircle2, XCircle, Wallet, PlusCircle, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentProps {
  agent: {
    name: string;
    role: string;
    personality: string;
    goal: string;
    positivesFound?: string[];
    negativesFound?: string[];
    score: number;
    wouldUse: boolean;
    wouldPay: boolean;
    priceWilling: string;
    reason: string;
    feedback: string;
  };
}

export function AgentCard({ agent }: AgentProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <Card className="h-full bg-card/50 border-white/10 hover:border-primary/50 transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-headline">{agent.name}</CardTitle>
              <CardDescription className="text-xs">{agent.role}</CardDescription>
            </div>
          </div>
          <div className={cn("text-2xl font-bold font-headline", getScoreColor(agent.score))}>
            {agent.score}%
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant={agent.wouldUse ? "default" : "secondary"} className={cn(agent.wouldUse && "bg-green-600 hover:bg-green-700")}>
            {agent.wouldUse ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
            {agent.wouldUse ? "Would Use" : "Won't Use"}
          </Badge>
          <Badge variant={agent.wouldPay ? "default" : "secondary"} className={cn(agent.wouldPay && "bg-cyan-600 hover:bg-cyan-700")}>
            <Wallet className="w-3 h-3 mr-1" />
            {agent.wouldPay ? `Pay: ${agent.priceWilling}` : "Won't Pay"}
          </Badge>
        </div>

        {/* Signals Section */}
        <div className="grid grid-cols-2 gap-2">
          {agent.positivesFound && agent.positivesFound.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-green-400 font-bold uppercase flex items-center gap-1">
                <PlusCircle className="w-2.5 h-2.5" /> Boosts
              </p>
              <ul className="text-[10px] text-foreground/70 space-y-0.5">
                {agent.positivesFound.slice(0, 3).map((s, i) => (
                  <li key={i} className="truncate">• {s}</li>
                ))}
              </ul>
            </div>
          )}
          {agent.negativesFound && agent.negativesFound.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-red-400 font-bold uppercase flex items-center gap-1">
                <MinusCircle className="w-2.5 h-2.5" /> Penalties
              </p>
              <ul className="text-[10px] text-foreground/70 space-y-0.5">
                {agent.negativesFound.slice(0, 3).map((s, i) => (
                  <li key={i} className="truncate">• {s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1 text-xs uppercase tracking-wider font-semibold">
              <Brain className="w-3 h-3" /> Personality
            </p>
            <p className="italic text-foreground/80 text-xs">{agent.personality}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1 text-xs uppercase tracking-wider font-semibold">
              <AlertCircle className="w-3 h-3" /> Logic
            </p>
            <p className="text-foreground/80 text-xs leading-relaxed">{agent.reason}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5">
          <p className="text-xs uppercase tracking-wider font-semibold text-primary mb-1">Feedback</p>
          <p className="text-xs text-foreground/70 leading-relaxed italic">"{agent.feedback}"</p>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Target, Brain, AlertCircle, CheckCircle2, XCircle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentProps {
  agent: {
    name: string;
    role: string;
    personality: string;
    goal: string;
    problem: string;
    score: number;
    wouldUse: boolean;
    wouldPay: boolean;
    priceWilling: string;
    timeToAdopt: string;
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

        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1 text-xs uppercase tracking-wider font-semibold">
              <Brain className="w-3 h-3" /> Personality
            </p>
            <p className="italic text-foreground/80">{agent.personality}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1 text-xs uppercase tracking-wider font-semibold">
              <Target className="w-3 h-3" /> Goal
            </p>
            <p className="text-foreground/80">{agent.goal}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1 text-xs uppercase tracking-wider font-semibold">
              <AlertCircle className="w-3 h-3" /> Decision Reason
            </p>
            <p className="text-foreground/80">{agent.reason}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5">
          <p className="text-xs uppercase tracking-wider font-semibold text-primary mb-2">Detailed Feedback</p>
          <p className="text-sm text-foreground/70 leading-relaxed italic">"{agent.feedback}"</p>
        </div>
      </CardContent>
    </Card>
  );
}

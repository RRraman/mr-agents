import { AgentCard } from "@/components/agent-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, CreditCard, Sparkles, TrendingUp, Info, Globe, ShieldAlert, BarChart3, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MarketResultsProps {
  results: {
    overallScore: number;
    wouldUsePercent: number;
    wouldPayPercent: number;
    topAudience: string;
    summary: string;
    webIntelligence?: {
      web_competition: string;
      web_demand: string;
      web_sentiment: string;
      market_saturation: string;
    } | null;
    agents: Array<any>;
  };
}

export function MarketResults({ results }: MarketResultsProps) {
  const { overallScore, wouldUsePercent, wouldPayPercent, topAudience, summary, agents, webIntelligence } = results;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Sparkles className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-headline text-primary">{Math.round(overallScore || 0)}%</div>
            <Progress value={overallScore || 0} className="h-2 mt-4 bg-primary/20" />
          </CardContent>
        </Card>

        <Card className="bg-green-500/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Adoption Rate</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-headline text-green-500">{wouldUsePercent || 0}%</div>
            <p className="text-xs text-muted-foreground mt-2">Likely users</p>
          </CardContent>
        </Card>

        <Card className="bg-cyan-500/10 border-cyan-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Paying Conversion</CardTitle>
            <CreditCard className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-headline text-cyan-500">{wouldPayPercent || 0}%</div>
            <p className="text-xs text-muted-foreground mt-2">Willing to pay</p>
          </CardContent>
        </Card>
      </div>

      {webIntelligence && (
        <Card className="bg-card/40 border-accent/20 overflow-hidden">
          <div className="bg-accent/10 px-6 py-3 border-b border-accent/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-headline font-bold uppercase tracking-wider text-accent">Simulated Web Intelligence Insights</h3>
            </div>
            <Badge variant="outline" className="text-accent border-accent/30 text-[10px]">Step 0 Complete</Badge>
          </div>
          <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Competition
              </p>
              <p className="text-sm font-bold capitalize text-white">{webIntelligence.web_competition}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                <BarChart3 className="w-3 h-3" /> Market Demand
              </p>
              <p className="text-sm font-bold capitalize text-white">{webIntelligence.web_demand}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                <MessageCircle className="w-3 h-3" /> Sentiment
              </p>
              <p className="text-sm font-bold capitalize text-white">{webIntelligence.web_sentiment}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Saturation
              </p>
              <p className="text-sm font-bold capitalize text-white">{webIntelligence.market_saturation}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/30 border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-accent" />
              Top Audience Segment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/90">{topAudience}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/30 border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="w-5 h-5 text-accent" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80 leading-relaxed">{summary}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-headline flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          Market Agents (10 Simulation Profiles)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents?.map((agent, index) => (
            <AgentCard key={index} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  );
}
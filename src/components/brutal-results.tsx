
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Trash2, Heart, User } from "lucide-react";

interface BrutalResultsProps {
  results: {
    summary: string;
    agents: Array<{
      name: string;
      type: 'brutal' | 'skeptic' | 'supporter';
      comment: string;
    }>;
  };
}

export function BrutalResults({ results }: BrutalResultsProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="bg-red-500/10 border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <Trash2 className="w-5 h-5" /> The Brutal Verdict
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium text-white leading-relaxed">{results.summary}</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-2xl font-headline flex items-center gap-2 text-white">
          <AlertCircle className="w-6 h-6" /> Feed
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {results.agents.map((agent, i) => (
            <Card key={i} className="bg-card/40 border-white/5 hover:border-white/10 transition-colors">
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{agent.name}</span>
                    <Badge variant="outline" className={
                      agent.type === 'brutal' ? "text-red-400 border-red-400/20 bg-red-400/5" :
                      agent.type === 'skeptic' ? "text-yellow-400 border-yellow-400/20 bg-yellow-400/5" :
                      "text-green-400 border-green-400/20 bg-green-400/5"
                    }>
                      {agent.type}
                    </Badge>
                  </div>
                  <p className="text-foreground/90 italic leading-relaxed">"{agent.comment}"</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

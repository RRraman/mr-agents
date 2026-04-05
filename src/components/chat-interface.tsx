
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { runSimulation } from '@/app/actions/simulation';
import { User, MessageSquare, Send, Loader2, Award, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  agent?: string;
  message: string;
  role: 'agent' | 'user';
}

export function ChatInterface({ productIdea, initialMessage }: { productIdea: string, initialMessage: any }) {
  const [messages, setMessages] = useState<Message[]>([
    { agent: initialMessage.agent, message: initialMessage.message, role: 'agent' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { message: input, role: 'user' };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const response = await runSimulation({ 
        productIdea, 
        mode: 'first_paying_users', 
        history: newMessages 
      });

      if (response.success && response.data) {
        setMessages([...newMessages, { 
          agent: response.data.agent, 
          message: response.data.message, 
          role: 'agent' 
        }]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card className="flex flex-col h-[700px] bg-card/40 border-white/5">
      <CardHeader className="border-b border-white/5 py-4">
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          Interactive Market Pressure
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  m.role === 'user' ? "bg-primary" : "bg-muted"
                )}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Award className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className={cn(
                  "max-w-[80%] rounded-2xl p-4 space-y-1 shadow-sm",
                  m.role === 'user' ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted/50 text-foreground rounded-tl-none"
                )}>
                  {m.agent && <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{m.agent}</p>}
                  <p className="text-sm leading-relaxed">{m.message}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
                <div className="bg-muted/30 rounded-2xl rounded-tl-none p-4 w-12 flex justify-center">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-white/5 bg-background/50">
          <div className="flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Defend your idea..."
              className="bg-background border-white/10"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} disabled={isTyping || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Answer the agents to move to the next phase of simulation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

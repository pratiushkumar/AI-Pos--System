import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, User, Bot, Loader2 } from 'lucide-react';
import api from '@/utils/api';
import { useSelector } from 'react-redux';

const AIChat = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hello! I'm your POS AI Assistant. How can I help you manage your store today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const { userProfile } = useSelector((state) => state.user);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await api.post('/api/ai/chat', {
        message: userMessage,
        storeAdminId: userProfile?.id
      });

      setMessages(prev => [...prev, { role: 'ai', content: response.data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error connecting to the AI service." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Smart Store Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="flex flex-col gap-4 pb-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar className="h-8 w-8">
                  {msg.role === 'ai' ? (
                    <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-4 w-4" /></AvatarFallback>
                  ) : (
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  )}
                </Avatar>
                <div className={`p-3 rounded-lg max-w-[80%] ${
                  msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex gap-2 pt-4 border-t">
          <Input 
            placeholder="Ask about your sales, stock, or tips..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <Button size="icon" onClick={handleSend} disabled={loading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChat;

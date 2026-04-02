import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import api from '@/utils/api';
import { useSelector } from 'react-redux';

const ChatBotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', content: "Hi! I'm your POS AI Assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const { userProfile } = useSelector((state) => state.user);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

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
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {isOpen && (
                <Card className="w-80 sm:w-96 h-[500px] shadow-2xl border-primary/20 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    <CardHeader className="bg-green-600 text-white p-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            <CardTitle className="text-md">AI Store Assistant</CardTitle>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col p-4 overflow-hidden bg-background">
                        <ScrollArea className="flex-1 pr-3 overflow-y-auto" ref={scrollRef}>
                            <div className="flex flex-col gap-4 pb-2">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <Avatar className="h-7 w-7 border">
                                            <AvatarFallback className={msg.role === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                                                {msg.role === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${
                                            msg.role === 'user' 
                                            ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                            : 'bg-muted rounded-tl-none'
                                        }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex gap-2">
                                        <Avatar className="h-7 w-7 border">
                                            <AvatarFallback className="bg-primary text-primary-foreground">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="p-3 rounded-2xl bg-muted rounded-tl-none">
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce"></span>
                                                <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                                <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                        <div className="flex gap-2 pt-4 border-t mt-2">
                            <Input 
                                placeholder="Type a message..." 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                disabled={loading}
                                className="h-10 text-sm"
                            />
                            <Button size="icon" onClick={handleSend} disabled={loading} className="h-10 w-10 shrink-0">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Button 
                onClick={() => setIsOpen(!isOpen)}
                className={`h-14 w-14 rounded-full shadow-lg transition-all duration-300 ${isOpen ? 'rotate-90' : 'hover:scale-110'}`}
                size="icon"
            >
                {isOpen ? <X className="h-7 w-7" /> : (
                    <div className="relative">
                        <MessageSquare className="h-7 w-7" />
                        <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
                    </div>
                )}
            </Button>
        </div>
    );
};

export default ChatBotWidget;

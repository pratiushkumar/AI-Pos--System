import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, TrendingUp, Sparkles, AlertTriangle } from 'lucide-react';
import AIChat from './AIChat';
import AIRecommendations from './AIRecommendations';
import AIPredictions from './AIPredictions';
import AIInventoryWarnings from './AIInventoryWarnings';

const AIAssistant = () => {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground">
            Leverage AI to grow your business, predict sales, and manage inventory.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-sm font-medium text-primary">Powered by Gemini AI</span>
        </div>
      </div>

      <Tabs defaultValue="chat" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Sales Predictions
          </TabsTrigger>
          <TabsTrigger value="warnings" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Inventory Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <AIChat />
        </TabsContent>

        <TabsContent value="recommendations">
          <AIRecommendations />
        </TabsContent>

        <TabsContent value="predictions">
          <AIPredictions />
        </TabsContent>

        <TabsContent value="warnings">
          <AIInventoryWarnings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAssistant;

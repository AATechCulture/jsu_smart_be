'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send } from "lucide-react";

export const AIChatBox = () => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hi! I'm MoreLife your community AI assistant.What would you like help with?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
  
    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          type: 'community-chat'  // Specify this is a community chat request
        })
      });
  
      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.reply 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I'm having trouble responding right now. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Chat Box */}
      <Card className="min-h-[400px] flex flex-col bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <CardTitle className="text-xl">Community Assistant</CardTitle>
          </div>
          <CardDescription className="text-sm text-gray-500">
            Get instant help and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-4">
          <div className="flex-1 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`rounded-2xl px-4 py-3 max-w-[85%] text-[16px] leading-relaxed
                  ${msg.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-50'
                  }`}
                >
                  {msg.content.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="mb-2 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            />
            <Button 
              onClick={handleSend}
              size="icon"
              className="bg-blue-500 hover:bg-blue-600 rounded-xl h-10 w-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Card */}
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Recommended for You</CardTitle>
            <Button variant="ghost" size="icon" className="rounded-xl bg-gray-900 text-white">
              <Send className="h-4 w-4 rotate-45" />
            </Button>
          </div>
          <CardDescription className="text-sm text-gray-500">
            Personalized suggestions based on your interests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Discussion</div>
            <div className="text-lg font-semibold">JavaScript Best Practices</div>
            <div className="text-sm text-gray-500">Based on your recent activity</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Event</div>
            <div className="text-lg font-semibold">Web Development Workshop</div>
            <div className="text-sm text-gray-500">Matches your interests</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
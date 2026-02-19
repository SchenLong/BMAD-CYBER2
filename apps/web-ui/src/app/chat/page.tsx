/**
 * Chat Page
 * Agent chat interface for real-time conversations
 */

'use client';

import { ChatInterface } from '@/components/chat/ChatInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="size-6" />
          Agent Chat
        </h1>
        <p className="text-muted-foreground">
          Have real-time conversations with BMAD agents
        </p>
      </div>

      <Card className="h-[calc(100vh-200px)]">
        <CardHeader className="pb-4">
          <CardTitle>Chat</CardTitle>
        </CardHeader>
        <CardContent className="h-full p-0">
          <ChatInterface />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Welcome Screen Component
 * Story 2.2: Abdul Welcome Screen
 *
 * Main container for the welcome screen with:
 * - Abdul's avatar and personalized greeting
 * - Role-configured quick actions (3 buttons)
 * - Recent projects for quick resume
 * - Conversational input field
 *
 * Abdul is the primary interface - not a sidebar or secondary element
 */

'use client';

import { useState } from 'react';
import { UserRoleType } from '@/lib/types/onboarding';
import { getChatPlaceholder } from '@/lib/role-config';
import { AbdulAvatar } from './AbdulAvatar';
import { QuickActions } from './QuickActions';
import { RecentProjects, RecentProject } from '@/components/projects/RecentProjects';
import { ChatInput } from './ChatInput';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  userId: string;
  role: UserRoleType | null;
  userName?: string | null;
  recentProjects?: RecentProject[];
  onProjectClick?: (projectId: string) => void;
  onActionClick?: (action: string) => void;
  onSendMessage?: (message: string) => void;
  className?: string;
}

export function WelcomeScreen({
  userId,
  role,
  userName,
  recentProjects = [],
  onProjectClick,
  onActionClick,
  onSendMessage,
  className = ''
}: WelcomeScreenProps) {
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (message: string) => {
    if (isSending) return;

    setIsSending(true);
    try {
      await onSendMessage?.(message);
    } finally {
      setIsSending(false);
    }
  };

  const chatPlaceholder = getChatPlaceholder(role);
  const firstName = userName?.split(' ')[0] || userName;

  return (
    <div className={`max-w-4xl mx-auto space-y-8 ${className}`}>
      {/* Abdul Avatar and Greeting */}
      <AbdulAvatar
        role={role}
        userName={firstName}
      />

      {/* Quick Actions - 3 role-configured buttons */}
      <QuickActions
        role={role}
        onActionClick={onActionClick}
      />

      {/* Recent Projects - Up to 3 most recent */}
      {recentProjects.length > 0 && (
        <RecentProjects
          projects={recentProjects}
          onProjectClick={onProjectClick}
        />
      )}

      {/* Conversational Input - Always available */}
      <Card className="p-6 bg-muted/30">
        <ChatInput
          placeholder={chatPlaceholder}
          onSend={handleSendMessage}
          disabled={isSending}
        />
      </Card>

      {/* Help hint */}
      <p className="text-xs text-muted-foreground text-center">
        Use quick actions above or type a natural language request to get started
      </p>
    </div>
  );
}

/**
 * Loading state for welcome screen
 */
export function WelcomeScreenLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="size-16 rounded-full bg-muted" />
        <div className="flex-1 pt-2 space-y-2">
          <div className="h-6 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-32" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-24 bg-muted rounded" />
          <div className="h-24 bg-muted rounded" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
      <div className="h-24 bg-muted rounded" />
    </div>
  );
}

/**
 * Error state for welcome screen
 */
interface WelcomeScreenErrorProps {
  error: string;
  onRetry?: () => void;
}

export function WelcomeScreenError({ error, onRetry }: WelcomeScreenErrorProps) {
  return (
    <Card className="p-6 border-destructive/50">
      <div className="text-center space-y-4">
        <p className="text-destructive font-medium">Unable to load welcome screen</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="default">
            Try Again
          </Button>
        )}
      </div>
    </Card>
  );
}

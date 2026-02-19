/**
 * Welcome Screen Client Component
 * Story 2.2: Abdul Welcome Screen
 *
 * Client component that fetches data and renders the WelcomeScreen
 */

'use client';

import { WelcomeScreen, WelcomeScreenLoading, WelcomeScreenError } from '@/components/chat/WelcomeScreen';
import { useRecentProjects } from '@/hooks/use-recent-projects';
import { UserRoleType } from '@/lib/types/onboarding';
import { useState } from 'react';

interface WelcomeScreenClientProps {
  userId: string;
  userName: string | null;
  onboardingRole: UserRoleType | null;
}

export function WelcomeScreenClient({ userId, userName, onboardingRole }: WelcomeScreenClientProps) {
  const { projects, isLoading: projectsLoading, error: projectsError } = useRecentProjects();
  const [error, setError] = useState<string | null>(null);

  const handleProjectClick = (projectId: string) => {
    // TODO: Story 6.4 - Navigate to project detail view
    console.log('Navigate to project:', projectId);
    // For now, show a toast or notification
  };

  const handleActionClick = (action: string) => {
    // TODO: Route to appropriate view based on action
    console.log('Action clicked:', action);
    // Actions will be routed in future stories
  };

  const handleSendMessage = async (message: string) => {
    // TODO: Story 3.x - Send message to Abdul
    console.log('Message sent:', message);
    // For now, just acknowledge the message
    // In future stories, this will send to the chat API
  };

  if (error) {
    return <WelcomeScreenError error={error} />;
  }

  if (projectsLoading) {
    return <WelcomeScreenLoading />;
  }

  return (
    <WelcomeScreen
      userId={userId}
      role={onboardingRole}
      userName={userName}
      recentProjects={projects}
      onProjectClick={handleProjectClick}
      onActionClick={handleActionClick}
      onSendMessage={handleSendMessage}
    />
  );
}

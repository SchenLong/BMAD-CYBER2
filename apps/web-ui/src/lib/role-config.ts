/**
 * Role Configuration for Welcome Screen
 * Story 2.2: Abdul Welcome Screen
 *
 * Role-based greetings, placeholders, and configurations
 */

import { UserRoleType } from '@/lib/types/onboarding';

export interface RoleGreeting {
  greeting: string;
  placeholder: string;
  timeBasedGreeting: (timeOfDay: 'morning' | 'afternoon' | 'evening') => string;
}

/**
 * Role-appropriate greeting messages
 * Each role has a distinct tone and conversational style
 */
export const ROLE_GREETINGS: Record<UserRoleType, RoleGreeting> = {
  SOLO_OPERATOR: {
    greeting: "I'm here to help you get things done. What are you working on today?",
    placeholder: "Or just tell me what you need...",
    timeBasedGreeting: (timeOfDay) => {
      const greetings = {
        morning: "Good morning. What are you working on today?",
        afternoon: "Good afternoon. What are you working on today?",
        evening: "Good evening. What are you working on today?",
      };
      return greetings[timeOfDay];
    },
  },
  TEAM_LEAD: {
    greeting: "Good to see you. What can I help your team accomplish today?",
    placeholder: "Describe what your team needs...",
    timeBasedGreeting: (timeOfDay) => {
      const greetings = {
        morning: "Good morning. What can I help your team with today?",
        afternoon: "Good afternoon. What can I help your team with today?",
        evening: "Good evening. What can I help your team with today?",
      };
      return greetings[timeOfDay];
    },
  },
  EXECUTIVE: {
    greeting: "Here's your overview. What would you like to focus on?",
    placeholder: "What do you need to see or do?",
    timeBasedGreeting: (timeOfDay) => {
      const greetings = {
        morning: "Good morning. Here's your overview. What would you like to focus on?",
        afternoon: "Good afternoon. Here's your overview. What would you like to focus on?",
        evening: "Good evening. Here's your overview. What would you like to focus on?",
      };
      return greetings[timeOfDay];
    },
  },
  DEVELOPER: {
    greeting: "Ready to build. What do you need?",
    placeholder: "Ask me anything, or use CLI commands...",
    timeBasedGreeting: (timeOfDay) => {
      const greetings = {
        morning: "Good morning. Ready to build. What do you need?",
        afternoon: "Good afternoon. Ready to build. What do you need?",
        evening: "Good evening. Ready to build. What do you need?",
      };
      return greetings[timeOfDay];
    },
  },
};

/**
 * Get time of day for greeting
 */
export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

/**
 * Get personalized greeting with user's name and time-based message
 */
export function getPersonalizedGreeting(
  role: UserRoleType | null,
  firstName?: string | null
): string {
  if (!role) {
    return firstName ? `Welcome back, ${firstName}. What do you need today?` : "Welcome. What do you need today?";
  }

  const timeOfDay = getTimeOfDay();
  const roleGreeting = ROLE_GREETINGS[role];

  if (firstName) {
    return `${roleGreeting.timeBasedGreeting(timeOfDay)} ${firstName},`;
  }

  return roleGreeting.timeBasedGreeting(timeOfDay);
}

/**
 * Get chat input placeholder for user's role
 */
export function getChatPlaceholder(role: UserRoleType | null): string {
  if (!role) return "Type your message...";
  return ROLE_GREETINGS[role].placeholder;
}

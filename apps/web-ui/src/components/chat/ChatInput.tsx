/**
 * Chat Input Component
 * Story 2.2: Abdul Welcome Screen
 *
 * Conversational input field for natural language requests
 * Auto-expanding textarea with keyboard shortcuts
 */

'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface ChatInputProps {
  placeholder?: string;
  onSend?: (message: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ChatInput({
  placeholder = "Type your message...",
  onSend,
  disabled = false,
  className = ''
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled && onSend) {
      onSend(trimmed);
      setMessage('');
      // Reset height after send
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Allow Shift+Enter for new line (default behavior)
  };

  return (
    <div className={`relative ${className}`}>
      <label htmlFor="chat-input" className="sr-only">
        Chat with Abdul
      </label>
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            id="chat-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full min-h-[48px] max-h-[200px] px-4 py-3 pr-12 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
            style={{
              scrollbarWidth: 'thin',
            }}
          />
          {/* Character counter hint */}
          <div className="absolute bottom-2 right-14 text-xs text-muted-foreground pointer-events-none" aria-live="polite" aria-atomic="true">
            {message.length > 0 && (
              <span className="bg-background/80 px-1 rounded" aria-label={`${message.length} characters`}>
                {message.length}
              </span>
            )}
          </div>
        </div>
        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          size="icon"
          className="h-[48px] w-[48px] shrink-0"
          aria-label="Send message"
        >
          <Send className="size-5" />
        </Button>
      </div>
      {/* Keyboard shortcut hint */}
      <p className="mt-2 text-xs text-muted-foreground">
        Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-xs">Enter</kbd> to send,
        <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-xs ml-1">Shift + Enter</kbd> for new line
      </p>
    </div>
  );
}

/**
 * Compact chat input variant
 */
interface ChatInputCompactProps {
  placeholder?: string;
  onSend?: (message: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ChatInputCompact({
  placeholder = "Type a message...",
  onSend,
  disabled = false,
  className = ''
}: ChatInputCompactProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled && onSend) {
      onSend(trimmed);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <Button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        size="sm"
        aria-label="Send message"
      >
        <Send className="size-4" />
      </Button>
    </div>
  );
}

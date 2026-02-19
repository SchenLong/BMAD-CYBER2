/**
 * Code Block Component
 * Story 8.4: API Documentation
 * Task 6: Code Examples
 *
 * Displays code with syntax highlighting and copy-to-clipboard functionality
 */

"use client"

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
}

/**
 * Simple syntax highlighting for common languages
 */
function highlightCode(code: string, language: string): string {
  // Escape HTML first
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Apply basic syntax highlighting based on language
  if (language === 'bash' || language === 'sh' || language === 'curl') {
    // Highlight commands and flags
    escaped = escaped
      .replace(/(curl|wget|http|GET|POST|PUT|DELETE)/g, '<span class="text-cyan-400">$1</span>')
      .replace(/(--[\w-]+)/g, '<span class="text-yellow-400">$1</span>')
      .replace(/(-\w+)/g, '<span class="text-yellow-400">$1</span>')
      .replace(/'(.*?)'/g, '<span class="text-green-400">\'$1\'</span>')
      .replace(/("(.*?)")/g, '<span class="text-green-400">$1</span>');
  } else if (language === 'javascript' || language === 'js') {
    // Highlight JS keywords and strings
    escaped = escaped
      .replace(/\b(const|let|var|function|async|await|return|import|export|from|default|if|else|for|while|try|catch|new|this|class)\b/g, '<span class="text-purple-400">$1</span>')
      .replace(/("(.*?)")/g, '<span class="text-green-400">$1</span>')
      .replace(/('(.*?)')/g, '<span class="text-green-400">$1</span>')
      .replace(/`(.*?)`/g, '<span class="text-green-400">`$1`</span>')
      .replace(/(\/\/.*)/g, '<span class="text-gray-500">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="text-orange-400">$1</span>');
  } else if (language === 'python' || language === 'py') {
    // Highlight Python keywords
    escaped = escaped
      .replace(/\b(import|from|def|class|return|if|else|for|while|try|except|async|await|True|False|None)\b/g, '<span class="text-purple-400">$1</span>')
      .replace(/("(.*?)")/g, '<span class="text-green-400">$1</span>')
      .replace(/('(.*?)')/g, '<span class="text-green-400">$1</span>')
      .replace(/(#.*)/g, '<span class="text-gray-500">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="text-orange-400">$1</span>');
  } else if (language === 'json') {
    // Highlight JSON
    escaped = escaped
      .replace(/("(.*?)"):/g, '<span class="text-blue-400">$1</span>:')
      .replace(/: ("(.*?)")/g, ': <span class="text-green-400">"$1"</span>')
      .replace(/: (\d+)/g, ': <span class="text-orange-400">$1</span>')
      .replace(/: (true|false|null)/g, ': <span class="text-purple-400">$1</span>');
  }

  return escaped;
}

export function CodeBlock({ code, language = 'text', filename, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLanguage = language === 'curl' ? 'bash' : language;

  return (
    <div className={cn('group relative my-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-t-lg border">
        <div className="flex items-center gap-2">
          {filename && (
            <span className="text-sm text-muted-foreground">{filename}</span>
          )}
          {!filename && (
            <span className="text-xs uppercase text-muted-foreground font-medium">
              {displayLanguage}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md hover:bg-muted-foreground/20 transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-500">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <pre className="overflow-x-auto p-4 bg-muted/50 rounded-b-lg border-x border-b text-sm">
        <code
          dangerouslySetInnerHTML={{
            __html: highlightCode(code, language),
          }}
        />
      </pre>
    </div>
  );
}

/**
 * Inline code component
 */
export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">
      {children}
    </code>
  );
}

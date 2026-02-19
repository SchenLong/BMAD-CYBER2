/**
 * Backup Codes Display Component
 * Story 1.4: Authentication - Multi-Factor Auth
 *
 * Displays and manages backup codes for MFA recovery.
 */

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Copy } from 'lucide-react';

interface BackupCodesDisplayProps {
  onClose: () => void;
}

export default function BackupCodesDisplay({ onClose }: BackupCodesDisplayProps) {
  const [codes, setCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/mfa/status');
      if (response.ok) {
        // Note: Backend only returns count, not actual codes
        // This is for display after regeneration
        setCodes([]); // Codes are only shown during setup/regeneration
      }
    } catch (err) {
      console.error('Failed to fetch codes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    const text = codes.join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = `BMAD Backup Codes\nGenerated: ${new Date().toLocaleString()}\n\n` + codes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bmad-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto" />
      </div>
    );
  }

  if (codes.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Backup codes are only shown when you first enable MFA or regenerate them. This is for
            security purposes.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button
            onClick={() => {
              // Trigger regeneration
              fetch('/api/auth/mfa/regenerate-codes', { method: 'POST' })
                .then((res) => res.json())
                .then((data) => {
                  if (data.success) {
                    setCodes(data.backupCodes);
                  }
                });
            }}
          >
            Regenerate Codes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
        <div className="grid grid-cols-2 gap-2">
          {codes.map((code, i) => (
            <code key={i} className="text-sm font-mono">
              {code}
            </code>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={handleCopy} className="flex-1">
          <Copy className="h-4 w-4 mr-2" />
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <Button variant="outline" onClick={handleDownload} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Important:</strong> Save these codes in a secure location. Each code can only be
          used once. You won&apos;t be able to see these codes again after closing this dialog.
        </p>
      </div>

      <Button onClick={onClose} className="w-full">
        I Have Saved My Codes
      </Button>
    </div>
  );
}

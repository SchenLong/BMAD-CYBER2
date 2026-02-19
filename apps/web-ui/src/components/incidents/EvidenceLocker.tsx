/**
 * Evidence Locker Component
 * Story 6.6, Task 4: Evidence Locker Integration
 *
 * Displays:
 * - File list with SHA-256 verification status
 * - Upload button
 * - Evidence count badge
 * - Link evidence items to timeline events
 * - File type icons
 */

'use client';

import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Download,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Search,
  Filter,
  FileImage,
  FileArchive,
  Film,
  File,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { EvidenceItem } from '@/lib/types/incidents';
import { formatIncidentTime } from '@/lib/types/incidents';

interface EvidenceLockerProps {
  evidence: EvidenceItem[];
  onUpload?: (files: FileList) => Promise<void>;
  onDownload?: (evidenceId: string) => Promise<void>;
  onDelete?: (evidenceId: string) => Promise<void>;
  onVerify?: (evidenceId: string) => Promise<boolean>;
  className?: string;
  editable?: boolean;
}

/**
 * File type icon mapping
 */
function getFileIcon(mimeType: string): React.ElementType {
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType.includes('pdf')) return FileText;
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar'))
    return FileArchive;
  if (mimeType.startsWith('video/')) return Film;
  return File;
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Truncate SHA-256 hash for display
 */
function truncateHash(hash: string): string {
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}

/**
 * Evidence item component
 */
function EvidenceItem({
  item,
  onDownload,
  onDelete,
  onVerify,
  editable,
}: {
  item: EvidenceItem;
  onDownload?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onVerify?: (id: string) => Promise<boolean>;
  editable?: boolean;
}) {
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(item.verified);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const FileIcon = getFileIcon(item.mimeType);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const result = await onVerify?.(item.id);
      setVerified(result ?? true);
    } finally {
      setVerifying(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete?.(item.id);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="flex items-start gap-3 p-3 rounded-lg border border-border-subtle bg-background-hover hover:border-border-default transition-colors">
        {/* File Icon */}
        <div className="w-10 h-10 rounded-lg bg-background-base flex items-center justify-center shrink-0">
          <FileIcon className="w-5 h-5 text-text-secondary" />
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-text-primary truncate">
              {item.title}
            </h4>
            {verified ? (
              <Badge variant="outline" className="gap-1 text-accent-success border-accent-success/30 bg-accent-success/10">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-text-muted">
                <ShieldAlert className="w-3 h-3" />
                Unverified
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
            <span>{formatFileSize(item.fileSize)}</span>
            <span>•</span>
            <span className="font-mono">{truncateHash(item.fileHash)}</span>
            <span>•</span>
            <span>by {item.uploaderName}</span>
            <span>•</span>
            <span>{formatIncidentTime(new Date(item.uploadedAt))}</span>
          </div>

          {item.description && (
            <p className="text-sm text-text-secondary mt-2 line-clamp-1">
              {item.description}
            </p>
          )}

          {/* Metadata */}
          {(item.collector || item.source) && (
            <div className="flex items-center gap-2 mt-2">
              {item.collector && (
                <span className="text-xs text-text-muted">
                  Collector: {item.collector}
                </span>
              )}
              {item.source && (
                <>
                  <span className="text-text-muted">•</span>
                  <span className="text-xs text-text-muted">
                    Source: {item.source}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDownload?.(item.id)}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleVerify}
              disabled={verifying || verified}
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              {verifying ? 'Verifying...' : verified ? 'Verified' : 'Verify Hash'}
            </DropdownMenuItem>
            {editable && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-accent-error"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Evidence?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{item.title}&quot; from the
              evidence locker. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-accent-error hover:bg-accent-error/90"
            >
              {deleting ? 'Deleting...' : 'Delete Evidence'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Upload dialog component
 */
function UploadDialog({
  open,
  onOpenChange,
  onUpload,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: FileList, metadata: UploadMetadata) => Promise<void>;
  loading?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [collector, setCollector] = useState('');
  const [source, setSource] = useState('');

  const resetForm = () => {
    setSelectedFiles(null);
    setTitle('');
    setDescription('');
    setCollector('');
    setSource('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
      // Auto-fill title from first filename if empty
      if (!title) {
        setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = async () => {
    if (selectedFiles && title) {
      await onUpload(selectedFiles, { title, description, collector, source });
      resetForm();
      onOpenChange(false);
    }
  };

  const canUpload = selectedFiles && title && !loading;

  return (
    <AlertDialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Upload Evidence</AlertDialogTitle>
          <AlertDialogDescription>
            Upload files to the evidence locker. All files will have their SHA-256
            hash calculated for chain of custody verification.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 my-4">
          {/* File Input */}
          <div>
            <label className="text-sm font-medium text-text-primary">
              Select Files *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="mt-2 w-full"
              multiple
            />
            {selectedFiles && (
              <p className="text-xs text-text-secondary mt-1">
                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-text-primary">
              Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Evidence title"
              className="mt-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-text-primary">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this evidence..."
              className="mt-2 w-full min-h-[80px] p-3 rounded-lg border border-border-subtle bg-background-hover text-text-primary text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
            />
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-primary">
                Collector
              </label>
              <Input
                value={collector}
                onChange={(e) => setCollector(e.target.value)}
                placeholder="Who collected this?"
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">
                Source
              </label>
              <Input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Source system/location"
                className="mt-2"
              />
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUpload}
            disabled={!canUpload}
          >
            {loading ? 'Uploading...' : 'Upload Evidence'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface UploadMetadata {
  title: string;
  description?: string;
  collector?: string;
  source?: string;
}

/**
 * Main Evidence Locker Component
 */
export function EvidenceLocker({
  evidence,
  onUpload,
  onDownload,
  onDelete,
  onVerify,
  className,
  editable = false,
}: EvidenceLockerProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');

  const filteredEvidence = React.useMemo(() => {
    return evidence.filter((item) => {
      // Search filter
      if (
        searchQuery &&
        !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Verification filter
      if (filterVerified === 'verified' && !item.verified) return false;
      if (filterVerified === 'unverified' && item.verified) return false;

      return true;
    });
  }, [evidence, searchQuery, filterVerified]);

  const verifiedCount = evidence.filter((e) => e.verified).length;

  const handleUpload = async (files: FileList, metadata: UploadMetadata) => {
    await onUpload?.(files);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-accent-primary" />
          <h2 className="text-lg font-semibold text-text-primary">
            Evidence Locker
          </h2>
          <Badge variant="secondary" className="text-xs">
            {evidence.length} items
          </Badge>
          {verifiedCount > 0 && (
            <Badge variant="outline" className="text-xs text-accent-success border-accent-success/30">
              <ShieldCheck className="w-3 h-3 mr-1" />
              {verifiedCount} verified
            </Badge>
          )}
        </div>

        {editable && (
          <Button onClick={() => setUploadDialogOpen(true)} size="sm" className="gap-2">
            <Upload className="w-4 h-4" />
            Upload Evidence
          </Button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search evidence..."
            className="pl-10 h-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 h-9">
              <Filter className="w-4 h-4" />
              {filterVerified === 'all'
                ? 'All'
                : filterVerified === 'verified'
                ? 'Verified'
                : 'Unverified'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Verification</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilterVerified('all')}>
              All Evidence
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterVerified('verified')}>
              <CheckCircle className="w-4 h-4 mr-2 text-accent-success" />
              Verified Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterVerified('unverified')}>
              <XCircle className="w-4 h-4 mr-2 text-text-muted" />
              Unverified Only
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Evidence List */}
      <div className="space-y-2">
        {filteredEvidence.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No evidence found</p>
            {searchQuery || filterVerified !== 'all' ? (
              <p className="text-sm mt-1">Try adjusting your filters</p>
            ) : (
              <p className="text-sm mt-1">
                {editable ? 'Upload evidence to get started' : 'Evidence will appear here'}
              </p>
            )}
          </div>
        ) : (
          filteredEvidence.map((item) => (
            <EvidenceItem
              key={item.id}
              item={item}
              onDownload={onDownload}
              onDelete={onDelete}
              onVerify={onVerify}
              editable={editable}
            />
          ))
        )}
      </div>

      {/* Upload Dialog */}
      {editable && (
        <UploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          onUpload={handleUpload}
        />
      )}
    </div>
  );
}

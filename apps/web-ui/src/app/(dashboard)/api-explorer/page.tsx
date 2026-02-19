/**
 * API Explorer Page
 * Story 8.5: API Explorer
 *
 * Interactive tool for testing BMAD API endpoints
 */

import { ApiExplorer } from '@/components/features/api-explorer';

export const metadata = {
  title: 'API Explorer | BMAD',
  description: 'Interactive API explorer for testing BMAD endpoints',
};

// Force dynamic rendering - this page uses client-side features
export const dynamic = 'force-dynamic';

export default function ApiExplorerPage() {
  return (
    <div className="h-full">
      <ApiExplorer />
    </div>
  );
}

/**
 * API Documentation Layout
 * Story 8.4: API Documentation
 * Task 1: Documentation Structure
 */

import { DocsLayout } from '@/components/docs';

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocsLayout>{children}</DocsLayout>;
}

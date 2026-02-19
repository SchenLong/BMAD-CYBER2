/**
 * Template Builder Page
 * Story 7.4: Custom Template Builder
 *
 * Page for creating new custom templates.
 * Protected by TEMPLATE_CUSTOMIZE permission (Enterprise only).
 */

import { redirect } from 'next/navigation';
import { auth } from '@/../auth';
import { checkPermission } from '@/middleware/authorization';
import { Permission } from '@/lib/auth/permissions';
import { TemplateBuilder } from '@/components/features/templates/builder';
import { UpgradePrompt } from '@/components/features/templates/upgrade-prompt';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown } from 'lucide-react';

// Force dynamic rendering - skip static generation
export const dynamic = 'force-dynamic';

/**
 * Server component that checks RBAC permissions before rendering
 */
export default async function NewTemplateBuilderPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  // Check TEMPLATE_CUSTOMIZE permission (Enterprise only)
  const authCheck = await checkPermission(Permission.TEMPLATE_CUSTOMIZE);

  if (!authCheck.allowed) {
    // User doesn't have Enterprise permissions
    return <UpgradePrompt />;
  }

  // User has permission - show the template builder
  return <TemplateBuilder />;
}

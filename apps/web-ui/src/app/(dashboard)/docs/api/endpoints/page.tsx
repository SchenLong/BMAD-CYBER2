/**
 * API Documentation - Endpoints Overview
 * Story 8.4: API Documentation
 * Task 2: Endpoint Documentation
 */

import Link from 'next/link';
import { EndpointCard } from '@/components/docs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function EndpointsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">API Endpoints</h1>
        <p className="text-lg text-muted-foreground">
          Complete reference for all BMAD API endpoints
        </p>
      </div>

      {/* Endpoint Categories */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Endpoint Categories</CardTitle>
            <CardDescription>Browse endpoints by resource type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <CategoryCard
                title="Agents"
                description="List, view, and invoke BMAD agents"
                href="/dashboard/docs/api/endpoints/agents"
                count={3}
              />
              <CategoryCard
                title="Workflows"
                description="Manage and execute workflows"
                href="/dashboard/docs/api/endpoints/workflows"
                count={3}
              />
              <CategoryCard
                title="Projects"
                description="CRUD operations for projects"
                href="/dashboard/docs/api/endpoints/projects"
                count={6}
              />
              <CategoryCard
                title="Templates"
                description="Access report templates"
                href="/dashboard/docs/api/endpoints/templates"
                count={2}
              />
              <CategoryCard
                title="API Keys"
                description="Manage your API keys"
                href="/dashboard/docs/api/endpoints/api-keys"
                count={3}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Reference */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Quick Reference</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Method</th>
                <th className="text-left py-3 px-4 font-medium">Endpoint</th>
                <th className="text-left py-3 px-4 font-medium">Description</th>
                <th className="text-left py-3 px-4 font-medium">Auth</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-muted/50">
                <td className="py-3 px-4"><Badge className="bg-green-500/10 text-green-500">GET</Badge></td>
                <td className="py-3 px-4 font-mono text-xs">/v1/health</td>
                <td className="py-3 px-4">Health check</td>
                <td className="py-3 px-4">No</td>
              </tr>
              <tr className="border-b border-muted/50">
                <td className="py-3 px-4"><Badge className="bg-green-500/10 text-green-500">GET</Badge></td>
                <td className="py-3 px-4 font-mono text-xs">/v1/agents</td>
                <td className="py-3 px-4">List agents</td>
                <td className="py-3 px-4">Yes</td>
              </tr>
              <tr className="border-b border-muted/50">
                <td className="py-3 px-4"><Badge className="bg-green-500/10 text-green-500">GET</Badge></td>
                <td className="py-3 px-4 font-mono text-xs">/v1/agents/{'{id}'}</td>
                <td className="py-3 px-4">Get agent details</td>
                <td className="py-3 px-4">Yes</td>
              </tr>
              <tr className="border-b border-muted/50">
                <td className="py-3 px-4"><Badge className="bg-blue-500/10 text-blue-500">POST</Badge></td>
                <td className="py-3 px-4 font-mono text-xs">/v1/agents/{'{id}'}/invoke</td>
                <td className="py-3 px-4">Invoke agent</td>
                <td className="py-3 px-4">Yes</td>
              </tr>
              <tr className="border-b border-muted/50">
                <td className="py-3 px-4"><Badge className="bg-green-500/10 text-green-500">GET</Badge></td>
                <td className="py-3 px-4 font-mono text-xs">/v1/workflows</td>
                <td className="py-3 px-4">List workflows</td>
                <td className="py-3 px-4">Yes</td>
              </tr>
              <tr className="border-b border-muted/50">
                <td className="py-3 px-4"><Badge className="bg-blue-500/10 text-blue-500">POST</Badge></td>
                <td className="py-3 px-4 font-mono text-xs">/v1/workflows/{'{id}'}/execute</td>
                <td className="py-3 px-4">Execute workflow</td>
                <td className="py-3 px-4">Yes</td>
              </tr>
              <tr className="border-b border-muted/50">
                <td className="py-3 px-4"><Badge className="bg-green-500/10 text-green-500">GET</Badge></td>
                <td className="py-3 px-4 font-mono text-xs">/v1/projects</td>
                <td className="py-3 px-4">List projects</td>
                <td className="py-3 px-4">Yes</td>
              </tr>
              <tr className="border-b border-muted/50">
                <td className="py-3 px-4"><Badge className="bg-blue-500/10 text-blue-500">POST</Badge></td>
                <td className="py-3 px-4 font-mono text-xs">/v1/projects</td>
                <td className="py-3 px-4">Create project</td>
                <td className="py-3 px-4">Yes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function CategoryCard({
  title,
  description,
  href,
  count
}: {
  title: string;
  description: string;
  href: string;
  count: number;
}) {
  return (
    <Link href={href} className="block">
      <Card className="hover:border-primary/50 transition-colors h-full">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="outline">{count} endpoints</Badge>
        </CardContent>
      </Card>
    </Link>
  );
}

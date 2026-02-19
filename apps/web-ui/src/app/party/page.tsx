/**
 * Party Mode Page
 * Multi-agent collaborative session interface
 *
 * This feature allows multiple agents to work together
 * on complex tasks in a collaborative environment.
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, PartyPopper } from 'lucide-react';

export default function PartyModePage() {
  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PartyPopper className="size-6" />
          Party Mode
        </h1>
        <p className="text-muted-foreground">
          Collaborative multi-agent sessions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Users className="size-16 text-muted-foreground" />
            <div className="max-w-md">
              <h3 className="text-lg font-semibold mb-2">
                Multi-Agent Collaboration
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Party Mode allows you to orchestrate multiple agents working together
                on complex missions. Each agent brings their unique expertise
                to solve your problems collaboratively.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" disabled>
                  Start New Session
                </Button>
                <Button variant="outline" disabled>
                  View Active Sessions
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Upgrade Prompt Component
 * Story 7.4: Custom Template Builder - Enterprise Feature
 *
 * Displayed when a non-Enterprise user attempts to access
 * the custom template builder. Shows pricing information
 * and upgrade call-to-action.
 */

import React from 'react';
import Link from 'next/link';
import { Crown, Check, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EnterpriseFeature {
  name: string;
  description: string;
}

const ENTERPRISE_FEATURES: EnterpriseFeature[] = [
  {
    name: 'Custom Template Builder',
    description: 'Create fully custom assessment templates with drag-and-drop',
  },
  {
    name: 'Advanced Branding',
    description: 'Custom colors, logos, fonts, and cover images',
  },
  {
    name: 'Template Versioning',
    description: 'Track changes and rollback to previous versions',
  },
  {
    name: 'Team Sharing',
    description: 'Share templates with your entire organization',
  },
  {
    name: 'Custom Sections',
    description: 'Build your own field types and validation rules',
  },
  {
    name: 'PDF Export',
    description: 'Generate professional PDF reports with your branding',
  },
];

const PRICING_PLANS = [
  {
    name: 'Pro',
    price: '$29',
    period: '/user/month',
    features: ['All custom templates', 'Team sharing (up to 10 users)', 'Version history (90 days)', 'Priority support'],
    cta: 'Upgrade to Pro',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    badge: 'Recommended',
    features: [
      'Unlimited custom templates',
      'Unlimited team members',
      'Unlimited version history',
      'Custom integrations',
      'SSO & advanced security',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
  },
];

export function UpgradePrompt() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Upgrade to Unlock Custom Templates</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create professional, branded assessment templates tailored to your organization's needs
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-center mb-8">Enterprise Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ENTERPRISE_FEATURES.map((feature) => (
              <Card key={feature.name} className="border-border/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{feature.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-center mb-8">Choose Your Plan</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {PRICING_PLANS.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.badge ? 'border-primary shadow-lg scale-105' : 'border-border/50'
                }`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    {plan.badge}
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="flex items-baseline gap-1 pt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm">{plan.period}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="w-full"
                    variant={plan.badge ? 'default' : 'outline'}
                  >
                    <Link href={`/pricing?plan=${plan.name.toLowerCase()}`}>
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <Card className="bg-muted/50 border-border/50">
          <CardContent className="py-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Need a custom solution?</h3>
            <p className="text-muted-foreground mb-4">
              Contact our sales team to discuss enterprise pricing and custom integrations
            </p>
            <Button asChild variant="outline">
              <Link href="/contact">
                Contact Sales
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link
            href="/templates"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to Templates
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UpgradePrompt;

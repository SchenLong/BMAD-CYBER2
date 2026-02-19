/**
 * Preview Pane Component
 * Story 7.4: Custom Template Builder
 *
 * Shows a preview of how the template will render with sample data.
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTemplateBuilderStore, BuiltInSectionType } from '@/stores/template-builder-store';
import { Edit3, FileText, Calendar, User, Save, CheckCircle2, Loader2 } from 'lucide-react';

interface PreviewPaneProps {
  onEdit?: () => void;
  templateId?: string;
  onSave?: (template: any) => void;
}

// Sample data for preview
const SAMPLE_DATA: Record<BuiltInSectionType, any> = {
  [BuiltInSectionType.EXECUTIVE_SUMMARY]: {
    overview: 'This security assessment was conducted to evaluate the overall security posture of the organization\'s IT infrastructure and identify potential vulnerabilities.',
    keyFindings: [
      '3 critical vulnerabilities identified in external-facing systems',
      'Security patches missing on 15% of internal servers',
      'Multi-factor authentication not enforced for privileged accounts',
    ],
    executiveSummary: 'The organization demonstrates a mature security awareness program but requires immediate attention to patch management and access control.',
  },
  [BuiltInSectionType.METHODOLOGY]: {
    approach: 'We employed a combination of automated scanning, manual penetration testing, and policy review to assess security controls.',
    toolsUsed: [
      'Nmap for network discovery',
      'Nessus for vulnerability scanning',
      'Burp Suite for web application testing',
      'Custom scripts for authentication testing',
    ],
    scope: 'Assessment covered all production systems in the primary data center and cloud infrastructure.',
  },
  [BuiltInSectionType.DATA_COLLECTION]: {
    sources: [
      'Network scanning results',
      'Configuration audits',
      'Interview with security personnel',
      'Policy documentation review',
    ],
    'collection-period': 'January 15-20, 2026',
    methodology: 'Data was collected through non-intrusive scanning methods with the exception of approved penetration testing activities.',
  },
  [BuiltInSectionType.ANALYSIS]: {
    techniques: [
      'Vulnerability correlation and validation',
      'Risk scoring using CVSS v3.1',
      'Threat modeling based on MITRE ATT&CK',
    ],
    processing: 'All findings were manually validated to eliminate false positives and assess exploitability.',
  },
  [BuiltInSectionType.FINDINGS]: {
    summary: 'A total of 47 findings were identified across the assessed infrastructure, including 3 critical, 8 high, 15 medium, and 21 low severity issues.',
    detailedFindings: 'The most significant findings relate to unpatched external services, weak authentication mechanisms, and insufficient network segmentation.',
    evidence: 'Screenshot evidence and proof-of-concept exploits available for all critical and high-severity findings.',
  },
  [BuiltInSectionType.RISKS]: {
    'risk-summary': 'The identified vulnerabilities pose a significant risk to the confidentiality, integrity, and availability of organizational systems.',
    'risk-levels': [
      'Critical: 3 findings - Immediate remediation required',
      'High: 8 findings - Remediation within 7 days',
      'Medium: 15 findings - Remediation within 30 days',
      'Low: 21 findings - Remediation within 90 days',
    ],
    mitigation: 'Implement a structured patch management process and enforce MFA across all systems.',
  },
  [BuiltInSectionType.RECOMMENDATIONS]: {
    'priority-recommendations': [
      'Apply critical security patches within 48 hours',
      'Implement multi-factor authentication for all remote access',
      'Restrict administrative access to dedicated jump hosts',
      'Deploy network segmentation to isolate critical systems',
    ],
    'additional-recommendations': [
      'Establish regular vulnerability scanning schedule',
      'Implement security awareness training program',
      'Review and update incident response procedures',
    ],
    timeline: 'Priority recommendations should be implemented within 30 days. Additional recommendations should be addressed within the next quarter.',
  },
  [BuiltInSectionType.APPENDICES]: {
    'raw-data': 'Full scan results available in Appendix A.',
    artifacts: [
      'Appendix A: Complete vulnerability scan results',
      'Appendix B: Network diagrams',
      'Appendix C: Sample exploit code',
    ],
  },
};

export function PreviewPane({ onEdit, templateId, onSave }: PreviewPaneProps) {
  const { template, validateTemplate } = useTemplateBuilderStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveErrors, setSaveErrors] = useState<string[]>([]);

  const handleSave = async () => {
    const validation = validateTemplate();

    if (!validation.valid) {
      setSaveErrors(validation.errors);
      return;
    }

    setIsSaving(true);
    setSaveErrors([]);

    try {
      // Save to API
      const response = await fetch(
        templateId ? `/api/templates/${templateId}` : '/api/templates',
        {
          method: templateId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: template.name,
            description: template.description,
            sections: template.sections.map((s) => ({
              ...s,
              position: undefined,
            })),
            sectionOrder: template.sections.map((s) => s.id),
            branding: template.branding,
            settings: template.settings,
            isPublic: false,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        if (data.error) {
          setSaveErrors([data.error]);
          setIsSaving(false);
          return;
        }
      }

      const result = await response.json();
      onSave?.(result.template);

      // Show success feedback
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      setSaveErrors(['Failed to save template. Please try again.']);
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (field: any, sectionType: BuiltInSectionType | string) => {
    const value = SAMPLE_DATA[sectionType as BuiltInSectionType]?.[field.id];

    if (value === undefined || value === null) {
      return null;
    }

    if (Array.isArray(value)) {
      return (
        <ul className="list-disc list-inside space-y-1">
          {value.map((item: string, idx: number) => (
            <li key={idx} className="text-sm">{item}</li>
          ))}
        </ul>
      );
    }

    return <p className="text-sm whitespace-pre-wrap">{value}</p>;
  };

  const getFontFamily = () => {
    const fontMap: Record<string, string> = {
      'inter': 'Inter, sans-serif',
      'roboto': 'Roboto, sans-serif',
      'open-sans': 'Open Sans, sans-serif',
      'lato': 'Lato, sans-serif',
    };
    return fontMap[template.branding.font] || fontMap['inter'];
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-8 py-6 max-w-4xl">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-50 dark:bg-gray-900 py-2 z-10">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Template Preview</h2>
          </div>
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Saved</span>
              </div>
            )}
            {onEdit && (
              <Button onClick={onEdit} variant="outline">
                <Edit3 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving || template.sections.length === 0}
              variant={saveSuccess ? "outline" : "default"}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Save Errors Alert */}
        {saveErrors.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              <ul className="list-disc list-inside">
                {saveErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Document Preview */}
        <div
          className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden"
          style={{ fontFamily: getFontFamily() }}
        >
          {/* Cover Section with Branding */}
          <div
            className="p-8 text-white"
            style={{ backgroundColor: template.branding.headerColor }}
          >
            {template.branding.coverImage && (
              <div className="absolute inset-0 opacity-20">
                <img
                  src={template.branding.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="relative z-10">
              {template.branding.logoUrl && (
                <img
                  src={template.branding.logoUrl}
                  alt="Logo"
                  className="h-12 mb-6 object-contain"
                />
              )}
              <h1 className="text-3xl font-bold mb-2">{template.name || 'Untitled Template'}</h1>
              {template.description && (
                <p className="text-lg opacity-90">{template.description}</p>
              )}
              <div className="flex items-center gap-6 mt-6 text-sm opacity-80">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Assessment Team</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Document Content */}
          <div className="p-8 space-y-8">
            {template.sections.map((section, idx) => (
              <section key={section.id} className="break-inside-avoid">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ color: template.branding.headerColor }}>
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-sm font-bold">
                    {idx + 1}
                  </span>
                  {section.name}
                </h2>

                {section.description && (
                  <p className="text-muted-foreground mb-4 italic">{section.description}</p>
                )}

                <div className="space-y-4">
                  {section.fields.map((field) => (
                    <div key={field.id} className="pl-11">
                      <h3 className="font-semibold text-sm mb-2">{field.label}</h3>
                      {renderField(field, section.builtInType || field.id)}
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {template.sections.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No sections added yet. Add sections from the palette to see the preview.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {template.branding.footerText && (
            <div className="px-8 py-4 border-t bg-accent/30">
              <p className="text-sm text-center text-muted-foreground">
                {template.branding.footerText}
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="font-semibold mb-2 text-sm">Preview Notes</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• This is a preview with sample data</li>
            <li>• Actual output will use real data when generating reports</li>
            <li>• Formatting may vary slightly in the final document</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PreviewPane;

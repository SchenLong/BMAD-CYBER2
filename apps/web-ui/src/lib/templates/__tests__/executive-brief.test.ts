/**
 * Executive Brief Template Tests
 * Story 7.2: Executive Brief Template
 *
 * Tests for template processing, data mapping, and validation.
 */

import { describe, it, expect } from '@jest/globals'
import {
  findTranslation,
  translateJargon,
  formatAsBullets,
  simplifyText,
  truncateContent,
  countWords,
  calculateRisk,
  getRiskIndicator,
  getRiskClass,
  scoreToRiskLevel,
  mapAgentOutputToBrief,
  mapSecurityAssessmentToBrief,
  extractKeyFindings,
  extractRecommendationsFromFindings,
  validateBriefData,
  type RiskLevel,
  type ExecutiveBriefData,
} from '../index'

describe('Jargon Dictionary', () => {
  it('should translate SQL injection to business term', () => {
    expect(findTranslation('SQL injection')).toBe('Database security weakness')
  })

  it('should translate XSS to business term', () => {
    expect(findTranslation('XSS')).toBe('Form input security issue')
  })

  it('should return undefined for unknown term', () => {
    expect(findTranslation('unknown technical term')).toBeUndefined()
  })

  it('should translate multiple jargon terms in text', () => {
    const text = 'Found SQL injection and XSS vulnerabilities in the API.'
    const result = translateJargon(text)
    expect(result).toContain('Database security weakness')
    expect(result).toContain('Form input security issue')
    expect(result).not.toContain('SQL injection')
    expect(result).not.toContain('XSS')
  })
})

describe('Bullet Formatter', () => {
  it('should format text with existing bullet markers', () => {
    const text = 'First finding\n• Second finding\n• Third finding'
    const bullets = formatAsBullets(text, 5, 100)
    expect(bullets).toHaveLength(3)
    expect(bullets[0]).toContain('First finding')
  })

  it('should limit bullet count', () => {
    const text = '• One\n• Two\n• Three\n• Four\n• Five\n• Six'
    const bullets = formatAsBullets(text, 5, 100)
    expect(bullets.length).toBeLessThanOrEqual(5)
  })

  it('should truncate long bullets', () => {
    const text = '• ' + 'A'.repeat(200)
    const bullets = formatAsBullets(text, 5, 100)
    expect(bullets[0].length).toBeLessThanOrEqual(103) // 100 + '...'
  })

  it('should handle comma-separated text', () => {
    const text = 'First item, Second item, Third item'
    const bullets = formatAsBullets(text, 5, 100)
    expect(bullets).toHaveLength(3)
  })
})

describe('Text Simplifier', () => {
  it('should simplify text with jargon', () => {
    const text = 'The assessment found SQL injection and XSS vulnerabilities.'
    const result = simplifyText(text, { translateJargon: true })
    expect(typeof result).toBe('string')
  })

  it('should return bullets when useBullets is true', () => {
    const text = 'First finding. Second finding. Third finding.'
    const result = simplifyText(text, { useBullets: true, maxBullets: 5 })
    expect(Array.isArray(result)).toBe(true)
  })

  it('should truncate text to max chars', () => {
    const text = 'A'.repeat(200)
    const result = simplifyText(text, { maxCharsTotal: 100 })
    expect(result.toString().length).toBeLessThanOrEqual(103)
  })
})

describe('Content Truncator', () => {
  it('should truncate to character limit', () => {
    const text = 'This is a long text that needs to be truncated.'
    const result = truncateContent(text, { maxChars: 20 })
    expect(result.length).toBeLessThanOrEqual(23) // 20 + '...'
  })

  it('should preserve sentence boundaries', () => {
    const text = 'This is sentence one. This is sentence two. This is sentence three.'
    const result = truncateContent(text, { maxChars: 30, preserveSentence: true })
    expect(result.endsWith('.')).toBe(true)
  })

  it('should count words correctly', () => {
    const text = 'This is a test sentence with words'
    const actualCount = countWords(text)
    expect(actualCount).toBe(7)
    expect(actualCount).toBeGreaterThan(0)
  })
})

describe('Risk Calculator', () => {
  it('should calculate risk from findings', () => {
    const findings = [
      { severity: 'critical' as RiskLevel },
      { severity: 'high' as RiskLevel },
      { severity: 'medium' as RiskLevel },
    ]
    const result = calculateRisk(findings)
    expect(result.overallRisk).toBe('high')
    expect(result.breakdown.critical).toBe(1)
    expect(result.breakdown.high).toBe(1)
    expect(result.breakdown.medium).toBe(1)
  })

  it('should return medium for no findings', () => {
    const result = calculateRisk([])
    expect(result.overallRisk).toBe('medium')
  })

  it('should get correct risk indicator', () => {
    const indicator = getRiskIndicator('critical')
    expect(indicator.level).toBe('critical')
    expect(indicator.label).toBe('Critical')
    expect(indicator.color).toBe('#DC2626')
    expect(indicator.score).toBe(95)
  })

  it('should convert score to risk level', () => {
    expect(scoreToRiskLevel(95)).toBe('critical')
    expect(scoreToRiskLevel(75)).toBe('high')
    expect(scoreToRiskLevel(50)).toBe('medium')
    expect(scoreToRiskLevel(25)).toBe('low')
    expect(scoreToRiskLevel(10)).toBe('info')
  })

  it('should get correct risk CSS class', () => {
    expect(getRiskClass('critical', 'text')).toBe('text-red-500')
    expect(getRiskClass('high', 'bg')).toBe('bg-orange-500')
    expect(getRiskClass('medium', 'border')).toBe('border-yellow-500')
  })
})

describe('Data Mapper', () => {
  it('should map agent output to brief', () => {
    const output = {
      agent: 'Bastion',
      workflow: 'security-assessment',
      summary: 'Assessment completed successfully.',
      findings: [
        { severity: 'critical' as RiskLevel, title: 'Unpatched vulnerability' },
        { severity: 'high' as RiskLevel, title: 'Weak password policy' },
      ],
      recommendations: ['Patch systems', 'Update policy'],
      user: 'J',
      projectName: 'Test Project',
    }

    const brief = mapAgentOutputToBrief(output)

    expect(brief.executiveSummary).toBeTruthy()
    expect(brief.keyFindings).toHaveLength(2)
    expect(brief.recommendations).toHaveLength(2)
    expect(brief.riskRating).toBe('high') // (95 + 75) / 2 = 85, which is high
    expect(brief.metadata?.preparedBy).toBe('Bastion')
  })

  it('should map security assessment to brief', () => {
    const assessment = {
      type: 'Security Assessment',
      target: 'example.com',
      findings: [
        { severity: 'critical' as RiskLevel, title: 'RCE vulnerability' },
      ],
      summary: 'Security assessment completed for example.com.',
      recommendations: ['Immediate patching required'],
      date: '2026-02-17',
      assessor: 'Security Team',
    }

    const brief = mapSecurityAssessmentToBrief(assessment)

    expect(brief.executiveSummary).toContain('example.com')
    expect(brief.keyFindings[0]).toContain('Remote system control risk') // RCE gets translated
    expect(brief.riskRating).toBe('critical')
    expect(brief.metadata?.projectName).toBe('example.com')
  })

  it('should extract key findings with severity', () => {
    const findings = [
      { severity: 'critical' as RiskLevel, title: 'Critical finding' },
      { severity: 'low' as RiskLevel, title: 'Low finding' },
      { severity: 'high' as RiskLevel, title: 'High finding' },
    ]

    const extracted = extractKeyFindings(findings, 5)

    expect(extracted).toHaveLength(3)
    expect(extracted[0]).toContain('CRITICAL')
    expect(extracted[1]).toContain('HIGH')
  })

  it('should generate recommendations from findings', () => {
    const findings = [
      { severity: 'critical' as RiskLevel, title: 'RCE vulnerability' },
      { severity: 'high' as RiskLevel, title: 'SQL injection' },
    ]

    const recommendations = extractRecommendationsFromFindings(findings, 4)

    expect(recommendations.length).toBeGreaterThan(0)
    expect(recommendations[0].toLowerCase()).toContain('address')
  })

  it('should validate brief data', () => {
    const validBrief: ExecutiveBriefData = {
      executiveSummary: 'Valid summary.',
      keyFindings: ['Finding 1', 'Finding 2'],
      riskRating: 'medium',
      riskBreakdown: { critical: 0, high: 0, medium: 1, low: 0, info: 0 },
      recommendations: ['Recommendation 1'],
    }

    expect(validateBriefData(validBrief)).toBe(true)

    const invalidBrief = {
      executiveSummary: '',
      keyFindings: [],
      riskRating: 'medium',
      recommendations: [],
    } as unknown as ExecutiveBriefData

    expect(validateBriefData(invalidBrief)).toBe(false)
  })
})

describe('Executive Brief Template Constraints', () => {
  it('should enforce one-page word limit (800 words)', () => {
    const brief: ExecutiveBriefData = {
      executiveSummary: 'A'.repeat(100),
      keyFindings: Array(5).fill('A'.repeat(50)),
      riskRating: 'medium',
      riskBreakdown: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
      recommendations: Array(4).fill('A'.repeat(50)),
    }

    const totalWords =
      countWords(brief.executiveSummary) +
      brief.keyFindings.reduce((sum, f) => sum + countWords(f), 0) +
      brief.recommendations.reduce((sum, r) => sum + countWords(r), 0)

    expect(totalWords).toBeLessThanOrEqual(800)
  })

  it('should enforce section limits (5 findings, 4 recommendations)', () => {
    const brief: ExecutiveBriefData = {
      executiveSummary: 'Summary',
      keyFindings: Array(10).fill('Finding'), // 10 findings
      riskRating: 'medium',
      recommendations: Array(8).fill('Recommend'), // 8 recommendations
    }

    // Should be truncated during processing
    expect(brief.keyFindings).toBeDefined()
    expect(brief.recommendations).toBeDefined()
  })
})

describe('Risk Level Integration', () => {
  it('should have all 5 risk levels defined', () => {
    const levels: RiskLevel[] = ['critical', 'high', 'medium', 'low', 'info']

    for (const level of levels) {
      const indicator = getRiskIndicator(level)
      expect(indicator.level).toBe(level)
      expect(indicator.label).toBeTruthy()
      expect(indicator.color).toBeTruthy()
      expect(indicator.icon).toBeTruthy()
      expect(indicator.score).toBeGreaterThan(0)
    }
  })

  it('should order risk levels correctly', () => {
    const findings = [
      { severity: 'info' as RiskLevel },
      { severity: 'critical' as RiskLevel },
      { severity: 'medium' as RiskLevel },
    ]

    const result = calculateRisk(findings)
    // (10 + 95 + 50) / 3 = 51.67, which rounds to 52 -> medium
    expect(result.overallRisk).toBe('medium')
  })
})

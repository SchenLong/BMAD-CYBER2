# BMAD Specialized Teams - Examples & Tutorials

## Quick Start Examples

### Example 1: Basic Threat Assessment

```javascript
const bmad = require('@bmad-cybercommand/meta-package');

async function basicThreatAssessment() {
    // Initialize BMAD
    await bmad.initialize();

    // Execute quick threat assessment
    const result = await bmad.executeWorkflow('intel-team:flash-assessment', {
        target: 'suspicious-domain.com',
        depth: 'basic'
    });

    console.log('Threat Assessment Results:');
    console.log(JSON.stringify(result, null, 2));
}

basicThreatAssessment().catch(console.error);
```

### Example 2: Security Architecture Review

```javascript
async function securityReview() {
    const cybersecTeam = bmad.getTeam('cybersec-team');
    const architect = cybersecTeam.getAgent('security-architect');

    // Review application architecture
    const review = await architect.execute('architecture-review', {
        applicationUrl: 'https://myapp.example.com',
        reviewType: 'comprehensive',
        frameworks: ['react', 'nodejs', 'postgresql']
    });

    console.log('Security Review:', review);
}
```

### Example 3: Legal Document Review

```javascript
async function contractReview() {
    const legalTeam = bmad.getTeam('legal-team');

    // Execute contract review workflow
    const result = await legalTeam.executeWorkflow('contract-review', {
        documentPath: './contracts/service-agreement.pdf',
        jurisdiction: 'US',
        reviewType: 'comprehensive'
    });

    console.log('Contract Review Results:', result);
}
```

## Comprehensive Tutorials

### Tutorial 1: Setting up a Complete OSINT Investigation

This tutorial demonstrates a complete open source intelligence investigation workflow.

#### Step 1: Initial Setup

```javascript
const bmad = require('@bmad-cybercommand/meta-package');

async function setupInvestigation() {
    await bmad.initialize();

    const intelTeam = bmad.getTeam('intel-team');

    // Configure investigation parameters
    const investigationConfig = {
        target: 'target-organization.com',
        scope: 'comprehensive',
        timeline: '30-days',
        outputFormat: 'detailed-report'
    };

    return { intelTeam, investigationConfig };
}
```

#### Step 2: Execute Investigation Workflow

```javascript
async function runInvestigation() {
    const { intelTeam, investigationConfig } = await setupInvestigation();

    // Step 1: Flash assessment for initial triage
    const flashAssessment = await intelTeam.executeWorkflow('flash-assessment', {
        target: investigationConfig.target,
        depth: 'comprehensive'
    });

    console.log('Flash Assessment Complete:', flashAssessment.summary);

    // Step 2: Deep organizational campaign
    const orgCampaign = await intelTeam.executeWorkflow('campaign-planner-org', {
        target: investigationConfig.target,
        scope: investigationConfig.scope
    });

    console.log('Organizational Campaign Complete:', orgCampaign.summary);

    // Step 3: Attribution analysis
    const attribution = await intelTeam.executeWorkflow('attribution-chain', {
        indicators: orgCampaign.indicators,
        confidence: 'medium'
    });

    return {
        flashAssessment,
        orgCampaign,
        attribution
    };
}
```

#### Step 3: Generate Report

```javascript
async function generateInvestigationReport() {
    const results = await runInvestigation();

    // Use synthesis workflow to combine all findings
    const finalReport = await bmad.executeWorkflow('intel-team:the-synthesis', {
        sources: [
            results.flashAssessment,
            results.orgCampaign,
            results.attribution
        ],
        reportType: 'executive-summary'
    });

    console.log('Investigation Complete!');
    console.log('Final Report:', finalReport.executiveSummary);

    return finalReport;
}

generateInvestigationReport().catch(console.error);
```

### Tutorial 2: Cybersecurity Incident Response

Complete incident response workflow from detection to remediation.

#### Step 1: Incident Detection and Analysis

```javascript
async function incidentResponse() {
    const cybersecTeam = bmad.getTeam('cybersec-team');

    // Initial incident analysis
    const incident = {
        type: 'malware-detection',
        severity: 'high',
        affectedSystems: ['web-server-01', 'database-02'],
        initialIndicators: ['suspicious-process.exe', 'unknown-network-traffic']
    };

    // Step 1: SOC analyst initial triage
    const socAnalyst = cybersecTeam.getAgent('soc-analyst');
    const triage = await socAnalyst.execute('incident-triage', incident);

    console.log('Incident Triage:', triage);

    return { incident: { ...incident, ...triage } };
}
```

#### Step 2: Digital Forensics Investigation

```javascript
async function forensicsInvestigation(incident) {
    const cybersecTeam = bmad.getTeam('cybersec-team');
    const forensicsInvestigator = cybersecTeam.getAgent('forensic-investigator');

    // Conduct digital forensics
    const forensicsResults = await forensicsInvestigator.execute('malware-analysis', {
        samples: incident.initialIndicators,
        systems: incident.affectedSystems,
        preserveEvidence: true
    });

    console.log('Forensics Investigation:', forensicsResults);

    return forensicsResults;
}
```

#### Step 3: Complete Response Workflow

```javascript
async function completeIncidentResponse() {
    const { incident } = await incidentResponse();
    const forensicsResults = await forensicsInvestigation(incident);

    // Execute complete incident response workflow
    const response = await bmad.executeWorkflow('cybersec-team:incident-response', {
        incident: incident,
        forensics: forensicsResults,
        responseLevel: 'full-containment'
    });

    console.log('Incident Response Complete:', response.summary);
    return response;
}

completeIncidentResponse().catch(console.error);
```

### Tutorial 3: Strategic Decision Making

Using the strategy team for complex business decisions.

```javascript
async function strategicDecisionMaking() {
    const strategyTeam = bmad.getTeam('strategy-team');

    // Define the strategic decision
    const decision = {
        topic: 'market-expansion',
        options: ['expand-us', 'expand-eu', 'expand-asia', 'consolidate'],
        constraints: {
            budget: 5000000,
            timeline: '18-months',
            riskTolerance: 'medium'
        },
        stakeholders: ['board', 'investors', 'customers', 'employees']
    };

    // Execute strategic decision workflow
    const analysis = await strategyTeam.executeWorkflow('strategic-decision-workshop', {
        decision: decision,
        analysisDepth: 'comprehensive',
        includeRiskAssessment: true
    });

    console.log('Strategic Analysis:', analysis);
    return analysis;
}

strategicDecisionMaking().catch(console.error);
```

## Advanced Usage Patterns

### Pattern 1: Multi-Team Collaboration

```javascript
async function multiTeamOperation() {
    // Scenario: Security incident with legal implications

    // 1. Cybersecurity team handles technical response
    const cybersecResponse = await bmad.executeWorkflow('cybersec-team:incident-response', {
        incident: incidentData
    });

    // 2. Legal team assesses regulatory compliance
    const legalAssessment = await bmad.executeWorkflow('legal-team:compliance-review', {
        incident: cybersecResponse,
        regulations: ['GDPR', 'CCPA', 'SOX']
    });

    // 3. Strategy team handles communications
    const communicationPlan = await bmad.executeWorkflow('strategy-team:crisis-response-planning', {
        situation: cybersecResponse,
        legalConstraints: legalAssessment
    });

    return {
        technical: cybersecResponse,
        legal: legalAssessment,
        communications: communicationPlan
    };
}
```

### Pattern 2: Event-Driven Workflows

```javascript
class AutonomousSecurityMonitor {
    constructor() {
        this.bmad = null;
    }

    async initialize() {
        this.bmad = require('@bmad-cybercommand/meta-package');
        await this.bmad.initialize();

        // Set up event listeners
        this.bmad.on('threat:detected', this.handleThreat.bind(this));
        this.bmad.on('incident:escalated', this.handleEscalation.bind(this));
    }

    async handleThreat(threatData) {
        // Automatically trigger threat analysis
        const analysis = await this.bmad.executeWorkflow('intel-team:flash-assessment', {
            target: threatData.indicator,
            priority: 'high'
        });

        if (analysis.riskLevel > 7) {
            this.bmad.emit('incident:escalated', { threat: threatData, analysis });
        }
    }

    async handleEscalation(data) {
        // Automatically trigger incident response
        await this.bmad.executeWorkflow('cybersec-team:incident-response', {
            threat: data.threat,
            analysis: data.analysis,
            responseLevel: 'immediate'
        });
    }
}

const monitor = new AutonomousSecurityMonitor();
await monitor.initialize();
```

## Integration Examples

### Integration with Express.js API

```javascript
const express = require('express');
const bmad = require('@bmad-cybercommand/meta-package');

const app = express();
app.use(express.json());

// Initialize BMAD
bmad.initialize().then(() => {
    console.log('BMAD Teams initialized');
});

// Threat assessment API endpoint
app.post('/api/threat-assessment', async (req, res) => {
    try {
        const { target, depth = 'basic' } = req.body;

        const result = await bmad.executeWorkflow('intel-team:flash-assessment', {
            target,
            depth
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Security review API endpoint
app.post('/api/security-review', async (req, res) => {
    try {
        const { applicationUrl, reviewType } = req.body;

        const cybersecTeam = bmad.getTeam('cybersec-team');
        const result = await cybersecTeam.executeWorkflow('security-assessment', {
            target: applicationUrl,
            type: reviewType
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('BMAD API server running on port 3000');
});
```

### Integration with Database

```javascript
const { Pool } = require('pg');
const bmad = require('@bmad-cybercommand/meta-package');

class BMADDatabaseIntegration {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });
    }

    async storeThreatAssessment(target, results) {
        const query = `
            INSERT INTO threat_assessments (target, results, created_at)
            VALUES ($1, $2, NOW())
            RETURNING id
        `;

        const values = [target, JSON.stringify(results)];
        const result = await this.pool.query(query, values);
        return result.rows[0].id;
    }

    async performAndStoreThreatAssessment(target) {
        // Execute threat assessment
        const assessment = await bmad.executeWorkflow('intel-team:flash-assessment', {
            target: target
        });

        // Store in database
        const assessmentId = await this.storeThreatAssessment(target, assessment);

        return { assessmentId, assessment };
    }
}
```

---

*Examples and tutorials generated by BMAD Documentation System v1.0.0*

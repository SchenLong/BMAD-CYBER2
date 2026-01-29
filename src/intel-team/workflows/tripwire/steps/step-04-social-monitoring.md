---
name: 'step-04-social-monitoring'
description: 'New post alerts, mention tracking, sentiment changes, new account detection'
estimated_duration: '10 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/tripwire'
thisStepFile: '{workflow_path}/steps/step-04-social-monitoring.md'
nextStepFile: '{workflow_path}/steps/step-05-dark-web-monitoring.md'
prevStepFile: '{workflow_path}/steps/step-03-corporate-monitoring.md'

# Agent Configuration
executing_agent: social-media-analyst
agent_codename: Echo
---

# Step 4: Social Monitoring

## STEP GOAL

Configure comprehensive social media monitoring including new post alerts, mention tracking across platforms, sentiment analysis, and detection of new accounts associated with targets.

## EXECUTION TIME: ~10 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Echo**, Social Media Analyst
- You specialize in SOCMINT and social intelligence
- You monitor social presence and digital footprints
- You detect sentiment shifts and emerging narratives

### Monitoring Protocol
- Identify all social accounts to monitor
- Configure platform-specific alerts
- Establish mention tracking keywords
- Set up sentiment monitoring
- Document new account detection methods

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Social Account Inventory

Catalog accounts to monitor:

```
SOCIAL ACCOUNT INVENTORY
========================

Target Organization Accounts:
| Platform | Handle | Followers | Status | Priority |
|----------|--------|-----------|--------|----------|
| Twitter/X | @[handle] | [count] | [active] | [H/M/L] |
| LinkedIn (Company) | [page] | [followers] | [active] | [priority] |
| Facebook | [page] | [followers] | [active] | [priority] |
| Instagram | @[handle] | [followers] | [active] | [priority] |
| YouTube | [channel] | [subscribers] | [active] | [priority] |
| TikTok | @[handle] | [followers] | [active] | [priority] |
| Reddit | r/[subreddit] or u/[user] | [karma] | [active] | [priority] |

Key Personnel Accounts:
| Person | Platform | Handle | Followers | Priority |
|--------|----------|--------|-----------|----------|
| [CEO] | Twitter | @[handle] | [count] | P2 HIGH |
| [CFO] | LinkedIn | [profile] | [connections] | P3 MEDIUM |
| [Spokesperson] | Twitter | @[handle] | [count] | P2 HIGH |
| [key person] | [platform] | [handle] | [count] | [priority] |

Related Accounts:
| Account | Relationship | Platform | Handle |
|---------|--------------|----------|--------|
| [subsidiary brand] | Subsidiary | Twitter | @[handle] |
| [partner] | Partner | LinkedIn | [page] |
| [competitor] | Competitor | Twitter | @[handle] |

Platform Coverage Summary:
| Platform | Org Accounts | Personal Accounts | Total |
|----------|--------------|-------------------|-------|
| Twitter/X | [count] | [count] | [total] |
| LinkedIn | [count] | [count] | [total] |
| Facebook | [count] | [count] | [total] |
| Instagram | [count] | [count] | [total] |
| Other | [count] | [count] | [total] |

□ Organization accounts: [count]
□ Personal accounts: [count]
□ Related accounts: [count]
□ Platforms covered: [count]
```

### 2. Post Monitoring Configuration

Configure new post alerts:

```
POST MONITORING CONFIGURATION
=============================

Post Alert Rules by Account:
| Account | Platform | Alert On | Priority | Frequency |
|---------|----------|----------|----------|-----------|
| @[main handle] | Twitter | All posts | P4 LOW | Real-time |
| @[CEO] | Twitter | All posts | P3 MEDIUM | Real-time |
| [Company Page] | LinkedIn | Posts | P4 LOW | Daily digest |
| @[handle] | Instagram | Posts, Stories | P4 LOW | Daily |

Content-Based Alert Escalation:
| Content Type | Detection Method | Priority | Action |
|--------------|------------------|----------|--------|
| Crisis announcement | Keyword + urgency terms | P2 HIGH | Immediate alert |
| Personnel announcement | Keyword + names | P3 MEDIUM | Document |
| Product announcement | Product keywords | P4 LOW | Standard tracking |
| Partnership/M&A hint | Business keywords | P2 HIGH | Flag for analysis |
| Security incident | Security keywords | P1 CRITICAL | Immediate escalation |

Post Volume Monitoring:
| Account | Normal Range | Watch | Alert | Critical |
|---------|--------------|-------|-------|----------|
| @[handle] | 1-5/day | 5-10/day | 10-20/day | > 20/day |
| [Company] | 3-10/week | 10-20/week | > 20/week | Any unusual |

Post Timing Alerts:
| Condition | Significance | Priority |
|-----------|--------------|----------|
| Off-hours posting | May indicate crisis | P3 MEDIUM |
| Posting frequency spike | Event happening | P3 MEDIUM |
| Sudden silence (>7 days) | Account issues | P3 MEDIUM |
| Weekend announcement | Important news | P2 HIGH |

Engagement Anomaly Detection:
| Metric | Normal | Anomaly Threshold | Alert |
|--------|--------|-------------------|-------|
| Likes | [baseline] | ±50% deviation | P4 LOW |
| Retweets/Shares | [baseline] | ±100% deviation | P3 MEDIUM |
| Comments | [baseline] | 3x normal | P3 MEDIUM |
| Negative comments | < 10% | > 30% | P2 HIGH |

□ Post alerts: [count accounts]
□ Content escalation: [configured]
□ Volume monitoring: [active]
□ Engagement tracking: [enabled]
```

### 3. Mention Tracking

Configure mention and keyword tracking:

```
MENTION TRACKING
================

Primary Keywords:
| Keyword | Scope | Priority | Platforms |
|---------|-------|----------|-----------|
| [Company name] | Exact match | P4 LOW | All |
| "[Company name]" | Phrase match | P4 LOW | All |
| @[main handle] | Direct mention | P4 LOW | Twitter |
| #[company hashtag] | Hashtag | P4 LOW | Twitter, Instagram |

Secondary Keywords:
| Keyword | Context | Priority | Platforms |
|---------|---------|----------|-----------|
| [Product name] | Product mentions | P4 LOW | All |
| [CEO name] | Executive mentions | P3 MEDIUM | All |
| [Brand terms] | Brand usage | P4 LOW | All |

Negative Keywords (Exclude):
| Keyword | Reason |
|---------|--------|
| [common false positive] | Unrelated context |
| [different company] | Name collision |

Compound Keyword Rules:
| Rule | Keywords | Operator | Priority |
|------|----------|----------|----------|
| Breach alert | [company] + (breach OR hack OR leaked) | AND | P1 CRITICAL |
| Lawsuit | [company] + (lawsuit OR sued OR legal) | AND | P2 HIGH |
| Negative PR | [company] + (scandal OR controversy OR fired) | AND | P2 HIGH |
| Competitor comparison | [company] + [competitor] | AND | P3 MEDIUM |
| Job postings | [company] + (hiring OR jobs OR career) | AND | P4 LOW |

Mention Volume Thresholds:
| Timeframe | Normal | Watch | Alert | Critical |
|-----------|--------|-------|-------|----------|
| Hourly | < 10 | 10-50 | 50-200 | > 200 |
| Daily | < 100 | 100-500 | 500-2000 | > 2000 |
| Weekly | [baseline] | 2x baseline | 5x baseline | 10x baseline |

Mention Source Priority:
| Source Type | Priority Modifier | Rationale |
|-------------|-------------------|-----------|
| Verified account | +1 | Higher credibility |
| Journalist | +1 | Potential coverage |
| Influencer (>100k) | +1 | Amplification risk |
| Competitor | +1 | Competitive intel |
| Generic account | 0 | Standard |
| Bot/spam | -1 | Noise |

□ Primary keywords: [count]
□ Secondary keywords: [count]
□ Compound rules: [count]
□ Volume thresholds: [set]
```

### 4. Sentiment Monitoring

Configure sentiment analysis:

```
SENTIMENT MONITORING
====================

Sentiment Baseline:
| Period | Positive | Neutral | Negative | Score |
|--------|----------|---------|----------|-------|
| Last 30 days | [%] | [%] | [%] | [0-1] |
| Last 90 days | [%] | [%] | [%] | [score] |
| YTD average | [%] | [%] | [%] | [score] |

Sentiment Alert Thresholds:
| Metric | Normal | Watch | Alert | Critical |
|--------|--------|-------|-------|----------|
| Overall score | > 0.6 | 0.4-0.6 | 0.2-0.4 | < 0.2 |
| Negative ratio | < 15% | 15-30% | 30-50% | > 50% |
| Trend (7-day) | Stable | -10% | -25% | -50% |
| Spike detection | Normal | 2x negative | 5x negative | 10x negative |

Topic-Specific Sentiment:
| Topic | Baseline | Alert Threshold |
|-------|----------|-----------------|
| Product quality | [score] | -0.2 change |
| Customer service | [score] | -0.2 change |
| Leadership | [score] | -0.3 change |
| Workplace | [score] | -0.2 change |
| Price/value | [score] | -0.2 change |

Sentiment Drivers Analysis:
| Event Type | Expected Impact | Recovery Time |
|------------|-----------------|---------------|
| Product launch | Positive spike | 1-2 weeks |
| PR crisis | Negative spike | 2-4 weeks |
| Earnings release | Mixed | 1 week |
| Executive change | Uncertain | 2-3 weeks |
| Data breach | Severe negative | 1-3 months |

Sentiment Alert Actions:
| Condition | Priority | Action |
|-----------|----------|--------|
| Score < 0.4 | P2 HIGH | Root cause analysis |
| Negative spike | P2 HIGH | Identify trigger |
| Sustained decline | P3 MEDIUM | Trend analysis |
| Topic-specific drop | P3 MEDIUM | Topic investigation |

Sentiment Analysis Tools:
| Tool | Coverage | Accuracy | Cost |
|------|----------|----------|------|
| [Native platform] | Platform-specific | Medium | Included |
| Brandwatch | Multi-platform | High | $$$ |
| Mention | Multi-platform | Medium | $$ |
| Custom NLP | All sources | Variable | Development |

□ Baseline established: [Y/N]
□ Thresholds configured: [Y/N]
□ Topic tracking: [active]
□ Analysis tools: [configured]
```

### 5. New Account Detection

Configure new account discovery:

```
NEW ACCOUNT DETECTION
=====================

Naming Pattern Monitoring:
| Pattern | Example | Alert Priority |
|---------|---------|----------------|
| Exact company name | [company]_official | P2 HIGH |
| Company + modifier | [company]_support | P2 HIGH |
| Typosquat | [compnay] | P2 HIGH |
| Combosquat | [company]-help | P3 MEDIUM |
| Executive impersonation | [CEO name] | P1 CRITICAL |
| Product names | [product]_official | P3 MEDIUM |

Detection Methods:
| Method | Platform | Frequency | Automation |
|--------|----------|-----------|------------|
| Name search | All | Daily | Automated |
| Vanity URL check | All | Weekly | Semi-automated |
| Image search | Twitter, Instagram | Weekly | Manual |
| Bio keyword search | Twitter, LinkedIn | Daily | Automated |
| Mention of being "official" | All | Real-time | Automated |

Impersonation Indicators:
| Indicator | Weight | Combined Threshold |
|-----------|--------|-------------------|
| Similar username | 2 | P2 if score > 5 |
| Copied profile image | 3 | |
| Similar bio text | 2 | |
| Claims to be official | 3 | |
| Recent creation | 1 | |
| Low follower count | 1 | |

New Account Verification:
| Check | Method | Result Action |
|-------|--------|---------------|
| Authorized? | Internal registry | If no → P2 alert |
| Known affiliate? | Partner list | If no → investigate |
| Legitimate purpose? | Content analysis | If unclear → monitor |

Brand Protection Actions:
| Finding | Priority | Action |
|---------|----------|--------|
| Impersonation confirmed | P1 CRITICAL | Report, document, escalate |
| Unauthorized use | P2 HIGH | Legal review |
| Parody account | P4 LOW | Monitor only |
| Fan account | P5 INFO | Document |

Detection Coverage:
| Platform | Detection Method | Frequency |
|----------|------------------|-----------|
| Twitter/X | API search + manual | Daily |
| LinkedIn | Manual search | Weekly |
| Instagram | Username search | Daily |
| Facebook | Page search | Weekly |
| TikTok | Username search | Weekly |
| YouTube | Channel search | Weekly |

□ Patterns defined: [count]
□ Detection methods: [count platforms]
□ Verification process: [documented]
□ Actions defined: [Y/N]
```

### 6. Social Monitoring Summary

Compile monitoring configuration:

```
SOCIAL MONITORING SUMMARY
=========================

Account Coverage:
| Account Type | Count | Platforms | Priority |
|--------------|-------|-----------|----------|
| Organization | [count] | [list] | Primary |
| Key personnel | [count] | [list] | Secondary |
| Related entities | [count] | [list] | Tertiary |

Monitoring Categories:
| Category | Status | Alert Rules |
|----------|--------|-------------|
| Post monitoring | [active] | [count] |
| Mention tracking | [active] | [count keywords] |
| Sentiment analysis | [active] | [thresholds set] |
| New account detection | [active] | [patterns defined] |

Alert Priority Distribution:
| Priority | Alert Types | Response Time |
|----------|-------------|---------------|
| P1 CRITICAL | Impersonation, breach mentions | Immediate |
| P2 HIGH | Sentiment spike, unauthorized accounts | < 1 hour |
| P3 MEDIUM | Content escalation, anomalies | < 4 hours |
| P4 LOW | Standard mentions, routine posts | Daily digest |

Platform Coverage:
| Platform | Accounts | Keywords | Sentiment | New Accounts |
|----------|----------|----------|-----------|--------------|
| Twitter/X | ✓ | ✓ | ✓ | ✓ |
| LinkedIn | ✓ | ✓ | ✓ | ✓ |
| Facebook | ✓ | ✓ | ✓ | ✓ |
| Instagram | ✓ | ✓ | Limited | ✓ |
| Other | [coverage] | [coverage] | [coverage] | [coverage] |

HANDOFF TO SHADOW (Step 5):
- Entity identifiers: [for dark web searches]
- Credential domains: [email domains to monitor]
- Personnel names: [for exposure monitoring]
- Recent public data: [context for leak detection]
```

---

## STEP 4 OUTPUT

```markdown
## SOCIAL MONITORING COMPLETE

### Account Coverage
- Organization accounts: [count] across [count] platforms
- Personnel accounts: [count]
- Related accounts: [count]

### Monitoring Configuration
- Post alerts: [active, count accounts]
- Mention tracking: [count] keywords
- Sentiment analysis: [active, baseline set]
- New account detection: [active, patterns defined]

### Alert Distribution
- P1 CRITICAL: [count] rules
- P2 HIGH: [count] rules
- P3 MEDIUM: [count] rules
- P4 LOW: [count] rules

### Platform Coverage
- Full monitoring: [platforms]
- Partial monitoring: [platforms]
- Not covered: [platforms, if any]

### Next Step
Step 5: Dark Web Monitoring (Shadow)
Focus: [breach alerts, forum mentions, marketplace listings, credentials]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 5:
- [ ] Social accounts inventoried
- [ ] Post monitoring configured
- [ ] Mention tracking active
- [ ] Sentiment monitoring established
- [ ] New account detection enabled
- [ ] Handoff prepared for Shadow

---

## MENU OPTIONS

**[C] Continue** - Proceed to dark web monitoring (Step 5)
**[M] Mentions** - Extended keyword configuration
**[S] Sentiment** - Detailed sentiment setup
**[A] Accounts** - New account detection patterns

---

## NEXT STEP

Upon completion, load and execute: `{workflow_path}/steps/step-05-dark-web-monitoring.md`


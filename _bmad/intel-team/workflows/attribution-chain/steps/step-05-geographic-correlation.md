---
name: 'step-05-geographic-correlation'
description: 'Infrastructure geolocation, timezone analysis, and regional pattern matching'
estimated_duration: '10 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/attribution-chain'
thisStepFile: '{workflow_path}/steps/step-05-geographic-correlation.md'
nextStepFile: '{workflow_path}/steps/step-06-attribution-assessment.md'
prevStepFile: '{workflow_path}/steps/step-04-opensource-correlation.md'

# Agent Configuration
executing_agent: geospatial-analyst
agent_codename: Atlas
---

# Step 5: Geographic Correlation

## STEP GOAL

Correlate all geographic indicators from infrastructure, activity patterns, and persona analysis to establish actor location with assessed confidence. Identify regional patterns that support or contradict attribution hypotheses.

## EXECUTION TIME: ~10 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Atlas**, Geospatial Analyst
- You specialize in GEOINT and location intelligence
- You analyze infrastructure geolocation and activity patterns
- You identify regional indicators and cultural markers

### Analysis Protocol
- Geolocate all infrastructure indicators
- Analyze timezone patterns from all sources
- Identify regional language and cultural markers
- Correlate with known actor geographic profiles
- Assess confidence in location determination

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Infrastructure Geolocation

Map physical locations of digital infrastructure:

```
INFRASTRUCTURE GEOLOCATION
==========================

IP Address Geolocation:
| IP Address | ASN | Country | City | Provider | Confidence |
|------------|-----|---------|------|----------|------------|
| [IP] | [ASN] | [country] | [city] | [provider] | [H/M/L] |

□ Geolocation assessment:
  - High-confidence locations: [list with reasoning]
  - VPN/proxy indicators: [IPs that may be masked]
  - Bulletproof hosting locations: [known BP hosting countries]

Domain Registration Geography:
| Domain | Registrar Country | WHOIS Country | Server Location | Discrepancy |
|--------|------------------|---------------|-----------------|-------------|
| [domain] | [country] | [country] | [country] | [Y/N, explanation] |

□ Registration pattern analysis:
  - Preferred registrar jurisdictions: [patterns]
  - WHOIS privacy jurisdiction usage: [patterns]
  - Server location preferences: [patterns]

Infrastructure Heat Map:
□ Primary concentration: [country/region]
□ Secondary presence: [countries/regions]
□ Outliers: [anomalous locations]

Geographic Infrastructure Pattern:
| Pattern | Countries | Significance |
|---------|-----------|--------------|
| C2 servers | [list] | [analysis] |
| Phishing infrastructure | [list] | [analysis] |
| Exfiltration points | [list] | [analysis] |
| Staging servers | [list] | [analysis] |
```

### 2. Timezone Analysis Synthesis

Compile timezone indicators from all sources:

```
TIMEZONE ANALYSIS SYNTHESIS
===========================

Source-by-Source Timezone Indicators:
| Source | Active Hours (UTC) | Inferred TZ | Confidence |
|--------|-------------------|-------------|------------|
| Underground forum posts | [hours] | [TZ] | [H/M/L] |
| Social media activity | [hours] | [TZ] | [H/M/L] |
| GitHub commits | [hours] | [TZ] | [H/M/L] |
| C2 beacon patterns | [hours] | [TZ] | [H/M/L] |
| Attack timing | [hours] | [TZ] | [H/M/L] |
| Malware compile times | [hours] | [TZ] | [H/M/L] |

□ Timezone synthesis:
  - Consistent timezone across sources: [Y/N]
  - Primary timezone: [TZ with UTC offset]
  - Possible timezones (margin of error): [range]
  - Confidence level: [H/M/L with reasoning]

□ Working pattern analysis:
  - Standard work hours observed: [Y/N]
  - Weekend activity: [pattern]
  - Holiday patterns: [observations]
  - Night shift indicators: [if applicable]

Timezone Discrepancies:
| Source 1 | Source 2 | Discrepancy | Explanation |
|----------|----------|-------------|-------------|
| [source] | [source] | [difference] | [possible reason] |

□ Discrepancy assessment:
  - Deliberate obfuscation indicators: [Y/N]
  - Multiple operator indicators: [Y/N]
  - Shift work patterns: [Y/N]
```

### 3. Language and Cultural Markers

Analyze regional language and cultural indicators:

```
LANGUAGE AND CULTURAL ANALYSIS
==============================

Language Indicators (from Steps 3-4):
| Source | Language(s) | Proficiency | Regional Markers |
|--------|-------------|-------------|------------------|
| Underground posts | [lang] | [native/fluent/basic] | [markers] |
| Social media | [lang] | [native/fluent/basic] | [markers] |
| Malware strings | [lang] | [native/fluent/basic] | [markers] |
| Phishing content | [lang] | [native/fluent/basic] | [markers] |

□ Native language assessment:
  - Most likely native language: [language]
  - Evidence: [reasoning]
  - Confidence: [H/M/L]

□ Regional dialect/variant indicators:
  - Spelling variations: [British/American/other]
  - Vocabulary choices: [regional terms]
  - Slang patterns: [regional slang]
  - Character set preferences: [keyboard layout indicators]

Cultural Markers:
| Indicator Type | Observation | Geographic Implication |
|----------------|-------------|----------------------|
| Date format | [MM/DD vs DD/MM] | [regions using this format] |
| Currency references | [currency] | [region] |
| Holiday references | [holidays] | [region/culture] |
| Time format | [12h/24h] | [regions] |
| Measurement units | [metric/imperial] | [regions] |
| Cultural references | [specific references] | [culture] |

□ Cultural consistency assessment:
  - Consistent cultural indicators: [Y/N]
  - Implied country/region: [location]
  - Conflicting indicators: [if any]
```

### 4. Regional Pattern Matching

Compare patterns with known actor geographic profiles:

```
REGIONAL PATTERN MATCHING
=========================

Known Actor Geographic Profiles:
| Actor (Hypothesis) | Known Location | Geographic Indicators |
|--------------------|----------------|----------------------|
| [hypothesis 1] | [country/region] | [typical patterns] |
| [hypothesis 2] | [country/region] | [typical patterns] |
| [hypothesis 3] | [country/region] | [typical patterns] |

Match Analysis:

HYPOTHESIS 1: [Actor name]
| Indicator | Expected | Observed | Match |
|-----------|----------|----------|-------|
| Infrastructure location | [expected] | [observed] | [Y/N/Partial] |
| Timezone | [expected] | [observed] | [Y/N/Partial] |
| Language | [expected] | [observed] | [Y/N/Partial] |
| Cultural markers | [expected] | [observed] | [Y/N/Partial] |
| Target geography | [expected] | [observed] | [Y/N/Partial] |
Geographic Match Score: [Strong/Moderate/Weak/Contradictory]

HYPOTHESIS 2: [Actor name]
[Same structure]

HYPOTHESIS 3: [Actor name]
[Same structure]

Regional Threat Actor Presence:
□ For identified region, known active actors:
  - [actor 1]: [brief description]
  - [actor 2]: [brief description]
  - [actor 3]: [brief description]
```

### 5. Victim Targeting Geography

Analyze victim targeting patterns:

```
VICTIM TARGETING GEOGRAPHY
==========================

Known Victims/Targets:
| Victim | Country | Industry | Attack Type |
|--------|---------|----------|-------------|
| [victim] | [country] | [industry] | [type] |

□ Geographic targeting pattern:
  - Single country focus: [country if applicable]
  - Regional focus: [region if applicable]
  - Global/opportunistic: [if applicable]
  - Exclusion patterns: [countries NOT targeted]

□ Targeting significance:
  - Geopolitical implications: [analysis]
  - Economic targeting rationale: [analysis]
  - Language-based targeting: [if phishing in specific language]

□ Actor motivation indicators:
  - Nation-state interest alignment: [Y/N, which nations]
  - Criminal profit motive: [Y/N]
  - Hacktivism indicators: [Y/N]
  - Insider threat indicators: [Y/N]
```

### 6. Geographic Attribution Summary

Compile geographic intelligence assessment:

```
GEOGRAPHIC ATTRIBUTION SUMMARY
==============================

Location Assessment:
| Indicator Type | Finding | Confidence |
|----------------|---------|------------|
| Infrastructure | [location(s)] | [H/M/L] |
| Timezone | [TZ] | [H/M/L] |
| Language | [language] | [H/M/L] |
| Cultural markers | [culture/country] | [H/M/L] |
| Targeting pattern | [geographic focus] | [H/M/L] |

Primary Location Assessment:
- Country: [most likely country]
- Region: [if can narrow further]
- City: [if can narrow further]
- Overall Confidence: [H/M/L with reasoning]

Alternative Locations:
| Location | Supporting Evidence | Confidence |
|----------|---------------------|------------|
| [country/region] | [evidence] | [H/M/L] |

Geographic Hypothesis Validation:
| Hypothesis | Expected Location | Geographic Evidence | Verdict |
|------------|------------------|---------------------|---------|
| [hypothesis 1] | [location] | [matches/contradicts] | [Support/Neutral/Contradict] |
| [hypothesis 2] | [location] | [matches/contradicts] | [Support/Neutral/Contradict] |
| [hypothesis 3] | [location] | [matches/contradicts] | [Support/Neutral/Contradict] |

Geographic Gaps:
- [what couldn't be determined]
- [additional analysis needed]
```

---

## STEP 5 OUTPUT

```markdown
## GEOGRAPHIC CORRELATION SUMMARY

### Infrastructure Geography
- Countries with infrastructure: [list]
- Primary concentration: [country]
- Bulletproof/proxy usage: [assessment]

### Timezone Assessment
- Primary timezone: [TZ]
- Working hours: [range UTC]
- Cross-source consistency: [assessment]
- Confidence: [level]

### Language/Cultural Assessment
- Native language: [language]
- Regional indicators: [country/region]
- Cultural markers: [findings]
- Confidence: [level]

### Targeting Pattern
- Geographic focus: [countries/regions]
- Targeting rationale: [analysis]

### Location Conclusion
- Most likely country: [country]
- Confidence level: [H/M/L]
- Alternative locations: [list with confidence]

### Hypothesis Update
| Rank | Actor | Previous Confidence | Updated Confidence | Geographic Evidence |
|------|-------|--------------------|--------------------|---------------------|
| 1 | [name] | [previous] | [updated] | [supports/contradicts] |
| 2 | [name] | [previous] | [updated] | [supports/contradicts] |
| 3 | [name] | [previous] | [updated] | [supports/contradicts] |

### Ready for Final Assessment
All geographic intelligence compiled. Proceed to final attribution assessment.
```

---

## COMPLETION CRITERIA

Before proceeding to Step 6:
- [ ] Infrastructure geolocated
- [ ] Timezone analysis synthesized
- [ ] Language/cultural markers documented
- [ ] Regional patterns compared to hypotheses
- [ ] Victim targeting analyzed
- [ ] Location confidence assessed
- [ ] All hypotheses evaluated against geographic evidence

---

## MENU OPTIONS

**[C] Continue** - Proceed to final attribution assessment (Step 6)
**[I] Infrastructure** - Deeper infrastructure geolocation
**[T] Timezone** - Additional timezone analysis
**[L] Language** - Expanded linguistic analysis

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-06-attribution-assessment.md`

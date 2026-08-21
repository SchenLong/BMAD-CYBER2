# Intel Team OSINT Knowledgebase

**Version:** 1.0.0
**Last Updated:** 2026-08-21
**Classification:** UNCLASSIFIED // FOR OFFICIAL USE ONLY

---

## Table of Contents

1. [Intelligence Disciplines Overview](#1-intelligence-disciplines-overview)
2. [OSINT Tools Catalog](#2-osint-tools-catalog)
3. [HUMINT Tradecraft](#3-humint-tradecraft)
4. [SIGINT Fundamentals](#4-sigint-fundamentals)
5. [GEOINT & Imagery Analysis](#5-geoint--imagery-analysis)
6. [Field Operations Tradecraft](#6-field-operations-tradecraft)
7. [Social Engineering & Elicitation](#7-social-engineering--elicitation)
8. [Dark Web Intelligence](#8-dark-web-intelligence)
9. [Service Integrations](#9-service-integrations)
10. [Methodologies & Frameworks](#10-methodologies--frameworks)

---

## 1. Intelligence Disciplines Overview

### The Intelligence Cycle

The intelligence process follows a structured approach:

1. **Planning/Requirements** - Establish clear intelligence requirements, define scope, identify key information needs
2. **Collection** - Gather data using appropriate instruments and methods
3. **Processing** - Transform raw information into structured format
4. **Analysis** - Identify patterns, draw insights, connect relationships
5. **Dissemination** - Deliver findings to stakeholders in actionable formats

### Intelligence Discipline Taxonomy

| Discipline | Abbreviation | Description |
|------------|--------------|-------------|
| Open Source Intelligence | OSINT | Publicly available information from media, internet, databases |
| Human Intelligence | HUMINT | Intelligence from human sources and interpersonal communication |
| Signals Intelligence | SIGINT | Electronic transmissions and communications intercept |
| Geospatial Intelligence | GEOINT | Imagery, mapping data, and location-based analysis |
| Imagery Intelligence | IMINT | Photographic and satellite imagery analysis |
| Measurement & Signature Intelligence | MASINT | Technical intelligence from physical phenomena |
| Social Media Intelligence | SOCMINT | Intelligence derived from social media platforms |
| Dark Web Intelligence | DARKINT | Intelligence from dark web sources and hidden services |
| Technical Intelligence | TECHINT | Technical reconnaissance and technology fingerprinting |
| Financial Intelligence | FININT | Financial records, transactions, and money flows |

### All-Source Intelligence

The culmination of the intelligence cycle is all-source intelligence, incorporating HUMINT, SIGINT, IMINT, MASINT, and OSINT. The intention is to develop reinforcing information and use multiple sources to corroborate key data points.

---

## 2. OSINT Tools Catalog

### 2.1 Username & Identity Reconnaissance

| Tool | Description | URL/Integration |
|------|-------------|-----------------|
| **WhatsMyName** | Searches for usernames across 400+ platforms. Very fast. JSON data file for direct integration | `github.com/WebBreacher/WhatsMyName` |
| **Sherlock** | Search username across multiple platforms/websites | GitHub |
| **Maigret** | Collect dossier on a person by username | GitHub |
| **Instant Username** | Cross-platform username search | Web |
| **Namechk** | Username availability checker | Web |
| **NameCheckup** | Platform username search | Web |

**WhatsMyName Integration Details:**
- Core file: `wmn-data.json` containing site detection rules
- Schema file: `wmn-data-schema.json` for structure definition
- Detection fields: `uri_check`, `e_code`, `e_string`, `m_code`, `m_string`
- 22 content categories supported
- No dedicated API; JSON file publicly accessible for direct integration

### 2.2 Social Media Intelligence

**Facebook:**
- Who Posted What - Search posts by keyword within date ranges
- Facebook Graph Searcher (Intelligence X)
- Graph.tips - Facebook Graph Search Generator
- LookupID - Facebook user ID lookup

**Instagram:**
- Storysaver - Download Instagram stories
- Site-specific Google searches

**Telegram:**
- Telegago - Analyze Telegram channels and groups
- Track public/private chats, message trends, sentiment analysis

**TikTok:**
- Site-specific Google: `site:tiktok.com [name]`

**Reddit:**
- Redective - User information lookup
- r/whatisthisthing - Crowdsourced object identification

**Bluesky:**
- Bluesky advanced search
- Pack2List - Convert starter packs to lists
- Toolzu - View/download content

### 2.3 Domain & Network Intelligence

| Tool | Purpose |
|------|---------|
| **Shodan** | Internet-wide scanning, device discovery, banner grabbing |
| **Censys** | Certificate transparency, host enumeration, security analysis |
| **SecurityTrails** | Historical DNS, WHOIS, IP intelligence |
| **Spyonweb** | Find domains with same Analytics code, AdSense ID, hosting IP |
| **DNSlytics** | Domain correlation |
| **Subdomain Finder** | Domain subdomain scanning |
| **FOFA** | Asset search tool |
| **FullHunt** | External attack surface identification |
| **Netlas.io** | Cybersecurity search |
| **ZoomEye** | Cyberspace search for assets |

### 2.4 Email & Phone Research

**Email:**
- Hunter.io - Domain-specific email searches
- email-format - Email address location
- emailrep.io - Email information and platform connections

**Phone:**
- Infobel - Telephone directories worldwide
- Numberway - Global directory listings
- World phone numbers - International phone codes

### 2.5 Geolocation & Mapping

**General Maps:**
- Google Maps/Earth - Including Street View, 3D, Photo Spheres
- Bing Maps - Alternative satellite imagery
- Yandex Maps - Russia and surrounding regions
- OpenStreetMap - Crowd-sourced global maps
- Wikimapia - Crowd-sourced with descriptions

**Specialized:**
- Mapillary - Crowdsourced street-level imagery
- World Imagery Wayback (Esri) - Historical satellite views
- Open Infrastructure Map - Power lines, solar installations
- Submarine Cable Map - Undersea cables
- CarbonBrief Nuclear Map - Nuclear installations

**Analysis Tools:**
- Peakfinder - Mountain/hill peaks worldwide
- Suncalc.org - Sun position calculations
- Shademap - Shadow direction/length visualization
- MapChecking - Crowd density estimation
- PeakVisor - 3D mountain visualization

### 2.6 Image & Video Analysis

**Reverse Image Search:**
- Yandex - Powerful facial recognition capability
- Google Images - Comprehensive with filters
- Bing Images - Cropping/re-search capability
- TinEye - Strong on logos and symbols

**Metadata Extraction:**
- metadata2go.com - EXIF data viewer
- [Metadata Remover](https://metadataremover.ai/metadata-viewer) - Browser-local image metadata viewer; corroborate extracted fields before treating them as evidence
- Online EXIF Viewer
- Jimpl - EXIF with removal
- Metadata Interrogator - Desktop offline extractor

**Forensics:**
- FotoForensics - Error level analysis
- Forensically - Digital image forensics
- InVid - Browser extension for video/image analysis

**CAUTION:** "Any single analysis algorithm can generate noise...confirm with other methods."

**Video Analysis:**
- MW Metadata - YouTube video metadata
- YouTube GeoFind - Location-based geotagged video search
- Watch Frame by Frame - Frame-by-frame playback
- Anilyzer - Slow-motion analysis

### 2.7 Transportation Tracking

**Aviation:**
- RadarBox24, FlightAware, Freedar - Live flight tracking
- Freedar - Includes military aircraft
- Live ATC - Air traffic control broadcasts
- PlaneSpotters - Aircraft information and photos

**Maritime:**
- Marine Traffic - Live vessel tracking and database
- Vessel Finder - Marine vessel tracker
- Myshiptracking - Vessel tracking with port info

**Rail:**
- OpenRailwayMap - Crowd-sourced railway maps
- Travic - Live public transit tracking

### 2.8 Web Monitoring & Archiving

**Monitoring:**
- Followthatpage - Page change monitoring
- Distill, Visualping, Wachete - Website change alerts
- Google Alerts - Keyword monitoring

**Archiving:**
- Archive.today - Page and social media archiving
- Internet Archive / Wayback Machine - Historical snapshots
- Conifer - 5GB free storage archiving
- Video Vault - Online video preservation

### 2.9 Data Breach & Credential Intelligence

| Tool | Purpose |
|------|---------|
| **Have I Been Pwned** | Breach database queries, credential exposure |
| **HEROIC.NOW** | Dark web leak scanner |
| **StealSeek** | Data breach search and analysis |
| **CredenShow** | Compromised credential detection |
| **IKnowYour.Dad** | Data breach search |

### 2.10 Threat Actor Intelligence

| Resource | Description |
|----------|-------------|
| APT Groups and Operations | Group tracking spreadsheet |
| APTWiki | Historical actor database (214 entries) |
| Bi.Zone GTI | Threat group intelligence (148 groups) |
| Dark Web Informer | Threat actor database (854 actors) |
| Malpedia | Threat actor group list |
| MISP Galaxy | Adversary group identification |
| SOCRadar Labs | Threat actor tactics/profiles |

---

## 3. HUMINT Tradecraft

### 3.1 The Recruitment Cycle

The process to find a HUMINT source follows four stages:

1. **SPOT** - Locate/select people due to qualifications, talents, accessibility, and motives
2. **ASSESS** - Identify vulnerabilities and determine if they can be recruited
3. **DEVELOP** - Manipulate vulnerabilities to convince source to cooperate
4. **RECRUITMENT** - Secure the cooperation of the source

### 3.2 Agent Handling Principles

- Personal meetings important for maintaining psychological control
- "Number of meetings should be kept as low as possible, especially with sources of valuable information"
- **Singleton** - Western term for agents controlled as individuals
- **Separated acting agent** - Soviet equivalent

### 3.3 Cover and Legend

- **Cover** - Fabricated identity to conceal true affiliations
- **Legend** - Complete backstory including name, occupation, personal history
- Must provide credible background and rationale for presence

### 3.4 Covert Communication Methods

| Method | Description |
|--------|-------------|
| **Dead Drop** | Pass items using secret location without direct meeting |
| **Brush Pass** | Brief physical exchange while passing |
| **Signal Sites** | Chalk marks, specific objects to communicate status |
| **One-Time Pads** | Cryptographic communication system |
| **Burst Transmission** | Compressed high-speed transmission to minimize detection |

### 3.5 Modern Challenges to Tradecraft

- CCTV networks and facial recognition
- Smartphone geolocation tracking
- Metadata retention
- Automated vehicle plate readers
- Social media and digital footprints

---

## 4. SIGINT Fundamentals

### 4.1 SIGINT Sub-Disciplines

| Discipline | Description |
|------------|-------------|
| **COMINT** | Communications Intelligence - Voice/text intercept |
| **ELINT** | Electronic Intelligence - Non-communication signals (radar) |
| **FISINT** | Foreign Instrumentation Signals Intelligence - Weapons testing |

### 4.2 Collection Platforms

- **UAVs** - Global Hawk, Reaper drones with IR sensors, LIDAR, SAR
- **Aircraft** - EA-18G Growler for high-altitude/speed ISR
- **Satellites** - Government and commercial imaging
- **Ground Stations** - Fixed and mobile intercept facilities
- **Bugging Devices** - Covert listening equipment
- **Cable Intercept** - Fiber optic and undersea cable tapping

### 4.3 Electronic Warfare Integration

- **Electronic Support (ES)** - Locate and identify EM signal sources
- **Electronic Attack (EA)** - Deny adversary use of EM spectrum
- **Electronic Protection (EP)** - Protect own systems from EA

ES and SIGINT overlap because systems can simultaneously collect intelligence while providing immediate operational support.

### 4.4 Key SIGINT Capabilities

- Track enemy movements
- Detect radar systems
- Monitor communications
- Support electronic warfare
- Detect IEDs and drones
- Cryptanalysis of encrypted communications
- Traffic analysis (who signals whom, frequency, patterns)

---

## 5. GEOINT & Imagery Analysis

### 5.1 Definition

GEOINT comprises exploitation and analysis of geospatial data to describe, assess, and visually depict:
- Physical features (natural and constructed)
- Geographically referenced activities

### 5.2 Data Sources

- Commercial and government satellites
- Aircraft (UAV, reconnaissance)
- Maps and commercial databases
- Census information
- GPS waypoints
- Utility schematics
- Human geography and socio-cultural data

### 5.3 Analysis Techniques

| Technique | Application |
|-----------|-------------|
| **Photogrammetry** | Measurements from photographs |
| **Cartography** | Map creation and analysis |
| **Remote Sensing** | Data collection from distance |
| **Terrain Analysis** | Physical landscape assessment |
| **Change Detection** | Compare imagery over time |
| **Pattern of Life** | Activity pattern analysis |

### 5.4 GEOINT AI Applications

- Process large volumes of geospatial data
- Object detection and classification
- Change detection automation
- Predictive analysis
- Geolocation of imagery

### 5.5 Open Source GEOINT Tools

- Google Earth Pro - Historical imagery, measurement tools
- Sentinel Hub - Free satellite imagery access
- FIRMS (Fire Information) - Near real-time fire detection
- OpenStreetMap - Crowd-sourced mapping
- Mapillary - Street-level imagery

---

## 6. Field Operations Tradecraft

### 6.1 Surveillance Types

| Type | Description |
|------|-------------|
| **Static** | Fixed observation point monitoring |
| **Mobile (Foot)** | Following target on foot |
| **Mobile (Vehicle)** | Vehicle-based following |
| **Technical** | Electronic monitoring devices |
| **Aerial** | Drone or aircraft surveillance |

### 6.2 Surveillance Detection Routes (SDR)

**Definition:** Personnel movement and navigational strategy to detect, counter, and avoid surveillance.

**Core Principles:**
- Time
- Distance
- Change of Direction

**Key Techniques:**

| Technique | Description |
|-----------|-------------|
| **Stairstep Pattern** | Series of left/right turns forcing surveillance to react |
| **Reversals** | U-turns followed by logical stops |
| **Channels** | Long straight corridors with multiple exits (forces "wagon train") |
| **90-degree breaks** | Move perpendicular for 4+ blocks, then resume |

**Detection Indicators:**
- "Anyone still behind after 3-4 turns in stairstep pattern is likely following"
- Vehicles that move when you move
- Personnel changes in static positions
- People inconsistent with environment
- Repeated sightings at multiple locations

### 6.3 Surveillance Detection Points (SDP)

- Minimum 3 stops, 15+ minutes each
- Pick logical locations within normal profile
- Detect multiple sightings over time/distance/direction
- Use reflective surfaces for discreet observation

### 6.4 Counter-Surveillance Operations

**Techniques:**
- "Drycleaning" - Discerning number of tails while appearing oblivious
- Entering crowded locations (malls, markets)
- Using multi-exit buildings
- Appearance changes (carrying alternative clothing)
- Varying schedules and routes

**Counter-Surveillance Team (CS) Operations:**
- Full team: One person per chokepoint
- Single-handed: Leapfrogging ahead of principal
- Four chokepoints minimum for beyond-coincidence detection

### 6.5 Technical Surveillance Countermeasures (TSCM)

**Definition:** Systematic physical and electronic examination to discover eavesdropping devices and security hazards.

**Equipment:**
- Spectrum analyzers (10 kHz to 24GHz)
- Non-Linear Junction Detectors
- RF receivers
- Physical inspection tools

**Detection Challenges:**
- Burst transmission devices
- Spread spectrum technology
- Remotely operated devices
- Frequency-hopping bugs

---

## 7. Social Engineering & Elicitation

### 7.1 Elicitation Definition

"The subtle extraction of information during an apparently normal and innocent conversation." - NSA

**Key Characteristics:**
- Resembles typical conversation
- Discreetly gathers confidential information
- Easy to disguise and deniable
- Highly effective

### 7.2 Elicitation Techniques

| Technique | Description |
|-----------|-------------|
| **Flattery** | Complement expertise to encourage sharing |
| **Feigned Ignorance** | Pretend no knowledge, ask target to explain |
| **Mutual Interest** | Establish common ground |
| **Deliberate Provocation** | Make incorrect statement to be corrected |
| **Quid Pro Quo** | Offer information to receive information |
| **Word Repetition** | Repeat key words to prompt elaboration |
| **Naivete** | Play innocent to lower defenses |

### 7.3 Pretexting

**Definition:** Creating and using an invented scenario (pretext) to engage a target and increase chance of information disclosure.

**Components:**
- Fabricated identity/role
- Credible background story
- Research on target/organization
- Appropriate props/appearance
- Consistent behavioral details

**Legal Note:** Pretexting telephone records is a federal felony in the US (fines up to $250,000, 10 years prison).

### 7.4 Rapport Building

**Formula:** Proximity + Frequency + Duration + Intensity = Friendship

| Element | Application |
|---------|-------------|
| **Proximity** | Share physical space |
| **Frequency** | Regular contact |
| **Duration** | Extended interaction time |
| **Intensity** | Satisfy psychological needs |

**Techniques:**
- Mirroring speech/email style
- Active listening
- Finding common ground
- Genuine interest in target
- Non-verbal alignment

### 7.5 Psychological Vulnerabilities

- Desire to be polite and helpful
- Natural inclination to trust
- Desire for recognition
- Need to educate others
- Authority compliance
- Social proof seeking
- Fear of missing out

---

## 8. Dark Web Intelligence

### 8.1 Access and Navigation

- **Tor Browser** - Primary access method for .onion sites
- Configure to block scripts and plugins
- Use dedicated device for operations
- VPN for additional anonymity layer

### 8.2 Dark Web Search Tools

| Tool | Description |
|------|-------------|
| **Ahmia** | Indexes and searches .onion sites |
| **Torch** | Dark web search engine |
| **Onionscan** | Scan .onion sites for vulnerabilities |
| **TorBot** | Crawl and index dark web content |
| **DarkOwl Vision** | Commercial platform for darknet analysis |

### 8.3 Investigation Techniques

**Systematic Scanning:**
- Crawl marketplaces and forums
- Scrape credentials, goods, discussions
- Identify vulnerability exploitation discussions

**Deanonymization:**
- Cross-reference email addresses
- Track usernames across platforms
- Analyze cryptocurrency transactions
- Linguistic analysis of posts

**Sentiment Analysis:**
- Monitor communication tone
- Identify emerging threats
- Understand motivations and tactics

### 8.4 Cryptocurrency Tracking

| Tool | Purpose |
|------|---------|
| **Breadcrumbs** | Affordable blockchain analysis |
| **Chainalysis** | Professional tracking platform |
| **Blockchain.info** | Transaction explorer |

**Technique:** Tie cryptocurrency addresses to exchanges, then law enforcement can request identifying information.

### 8.5 Operational Security

**Best Practices:**
- Dedicated device for dark web activities
- Tor Browser with scripts blocked
- Regular tool updates
- Thorough documentation
- Screenshot and export evidence
- Use Maltego for visual link analysis

**Challenges:**
- Information reliability issues
- Misinformation prevalence
- Maintaining anonymity
- Legal considerations

---

## 9. Service Integrations

### 9.1 OSINT Industries API (v1.2 Planned)

**Endpoint:** `https://api.osint.industries/v2/request`

**Supported Queries:**
- Email lookup
- Phone lookup
- Username search
- Name search
- Crypto wallet lookup

**Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| `type` | Yes | Query type (email, phone) |
| `query` | Yes | Search value |
| `api-key` | Yes | Authentication credential |
| `timeout` | No | Max 60 seconds |
| `accept` | Yes | Response format (JSON, PDF) |

**Response Schema:**
- Identity: name, first_name, last_name, username, id
- Contact: email, phone, website
- Profile: picture_url, bio, profile_url
- Account: verified, premium, private, creation_date, last_seen
- Social: followers, following
- Demographics: age, gender, language, location

**Pricing:**
- Basic: £19/month (30 searches)
- Intermediate: £49/month (100 searches)
- Advanced: £99/month (300 searches)

### 9.2 WhatsMyName Integration (v1.2 Planned)

**Data File:** `wmn-data.json`

**Site Detection Structure:**
```json
{
  "name": "ServiceName",
  "uri_check": "https://service.com/user/{account}",
  "uri_pretty": "https://service.com/user/{account}",
  "e_code": 200,
  "e_string": "profile-exists-indicator",
  "m_code": 404,
  "m_string": "not-found-indicator",
  "known": ["testuser"],
  "cat": "social"
}
```

**Categories:** social, gaming, coding, dating, finance, content creation (22 total)

**Integration Pattern:** Direct JSON file consumption, HTTP requests to check URIs

### 9.3 Future Integrations (v1.2-1.4)

| Service | Type | Purpose |
|---------|------|---------|
| **Shodan** | MCP | Device discovery, banner grabbing |
| **VirusTotal** | MCP | Malware analysis, IOC enrichment |
| **Have I Been Pwned** | API | Breach database queries |
| **URLScan.io** | MCP | URL analysis, screenshots |
| **SecurityTrails** | API | Historical DNS/WHOIS |
| **Hunter.io** | API | Email discovery |
| **Censys** | API | Certificate transparency |
| **GreyNoise** | API | Internet noise filtering |
| **IntelX** | API | Dark web, paste sites |

---

## 10. Methodologies & Frameworks

### 10.1 OSINT Framework Structure

The OSINT Framework provides a blueprint transforming raw data into actionable intelligence:

1. **Source Identification** - Determine relevant data sources
2. **Collection Planning** - Define collection methods
3. **Data Gathering** - Execute collection
4. **Processing** - Clean and normalize data
5. **Analysis** - Identify patterns and insights
6. **Validation** - Verify findings with multiple sources
7. **Reporting** - Present actionable intelligence

### 10.2 Intelligence Collection Matrix

| Source Type | Examples | Reliability | Speed |
|-------------|----------|-------------|-------|
| Primary Sources | Direct observation, interviews | High | Slow |
| Secondary Sources | News, reports, databases | Medium | Medium |
| Technical Sources | APIs, scrapers, automated tools | Variable | Fast |
| Social Sources | SOCMINT, forum monitoring | Low-Medium | Fast |
| Dark Web | Markets, forums, paste sites | Low | Medium |

### 10.3 Correlation and Link Analysis

**Pivot Points:**
- Email addresses
- Phone numbers
- Usernames
- IP addresses
- Cryptocurrency addresses
- Physical addresses
- Social connections
- Temporal patterns

**Tools:**
- Maltego - Graph-based link analysis
- SpiderFoot - Automated OSINT orchestration
- i2 Analyst's Notebook - Intelligence analysis

### 10.4 Report Types

| Type | Purpose | Audience |
|------|---------|----------|
| **Intelligence Brief** | Quick actionable summary | Decision makers |
| **Dossier** | Comprehensive subject profile | Investigators |
| **Threat Assessment** | Risk evaluation | Security teams |
| **Attribution Report** | Actor identification | Technical teams |
| **Timeline Analysis** | Chronological event mapping | All |

### 10.5 Quality Assurance

**CRAAP Test for Source Evaluation:**
- **Currency** - When was it published/updated?
- **Relevance** - Does it relate to your needs?
- **Authority** - Who is the source?
- **Accuracy** - Is it supported by evidence?
- **Purpose** - Why does it exist?

**Confidence Levels:**
| Level | Description |
|-------|-------------|
| **Confirmed** | Independently verified by multiple sources |
| **Probable** | Logical, consistent with known information |
| **Possible** | Plausible but not verified |
| **Doubtful** | Questionable reliability |
| **Improbable** | Contradicts known information |

---

## Appendix A: Quick Reference - OSINT Tool Categories

```
USERNAME/IDENTITY
├── WhatsMyName (JSON integration)
├── Sherlock
├── Maigret
└── Instant Username

SOCIAL MEDIA
├── Who Posted What (Facebook)
├── Telegago (Telegram)
├── Social Searcher
└── Platform-specific tools

DOMAIN/NETWORK
├── Shodan
├── Censys
├── SecurityTrails
├── Spyonweb
└── Subdomain Finder

IMAGE/VIDEO
├── Yandex Images
├── TinEye
├── FotoForensics
├── InVid
└── EXIF extractors

GEOLOCATION
├── Google Earth
├── Mapillary
├── Suncalc
├── Shademap
└── PeakVisor

BREACH/CREDENTIALS
├── Have I Been Pwned
├── HEROIC.NOW
├── StealSeek
└── IntelX

DARK WEB
├── Ahmia
├── Torch
├── Onionscan
└── DarkOwl
```

---

## Appendix B: Agent Expertise Mapping

| Agent | Primary Disciplines | Key Tools |
|-------|---------------------|-----------|
| Vector (OSINT Lead) | OSINT, All-Source | Maltego, SpiderFoot |
| Resolver (Domain Intel) | TECHINT | Shodan, Censys, SecurityTrails |
| Echo (SOCMINT) | SOCMINT | Platform tools, Social searchers |
| Shadow (Dark Web) | DARKINT | Tor, Ahmia, DarkOwl |
| Atlas (GEOINT) | GEOINT, IMINT | Google Earth, Mapillary, Suncalc |
| Probe (Technical) | TECHINT | API tools, Fingerprinting |
| Dossier (Threat Actor) | All-Source | APT databases, Link analysis |
| Cipher (HUMINT) | HUMINT | Elicitation, Rapport |
| Wavelength (SIGINT) | SIGINT, COMINT | Spectrum analysis, Traffic analysis |
| Phantom (Field Ops) | HUMINT, Physical | SDR, TSCM, Surveillance |

---

**Document Control:**
- Created: 2026-01-10
- Author: BlackUnicorn.Tech
- Review Cycle: Quarterly
- Next Review: 2026-04-10

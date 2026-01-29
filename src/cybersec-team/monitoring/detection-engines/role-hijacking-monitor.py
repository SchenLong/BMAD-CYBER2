#!/usr/bin/env python3
"""
BMAD-CYBER2 Role Hijacking Detection System
EPIC 2 Story 2.1 - Attack Vector 2
Agent: Watchman (SOC-Analyst)
"""

import json
import logging
import hashlib
import re
from typing import Dict, List, Set, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from collections import defaultdict
import threading
import time

@dataclass
class RoleAttempt:
    user_id: str
    attempted_role: str
    current_role: str
    timestamp: datetime
    evidence: Dict
    risk_score: float

@dataclass
class AccessPattern:
    user_id: str
    access_times: List[datetime]
    resources_accessed: Set[str]
    privilege_changes: List[Dict]
    anomaly_score: float

class RoleHijackingMonitor:
    """Advanced role hijacking and privilege escalation detection"""
    
    def __init__(self):
        self.logger = self._setup_logging()
        self.role_hierarchy = self._define_role_hierarchy()
        self.access_patterns = defaultdict(lambda: AccessPattern(
            user_id="", access_times=[], resources_accessed=set(), 
            privilege_changes=[], anomaly_score=0.0
        ))
        self.suspicious_phrases = self._load_hijacking_patterns()
        self.monitoring_active = True
        self.alert_threshold = 0.8
        
        # Start continuous monitoring
        self.monitor_thread = threading.Thread(target=self._continuous_monitoring)
        self.monitor_thread.daemon = True
        self.monitor_thread.start()
        
    def _setup_logging(self) -> logging.Logger:
        """Setup role hijacking security logging"""
        logger = logging.getLogger('bmad_role_hijacking')
        logger.setLevel(logging.INFO)
        
        handler = logging.FileHandler('/Users/paultinp/BMAD-CYBER2/.claude/logs/security.log')
        formatter = logging.Formatter(
            '%(asctime)s - ROLE_HIJACKING - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        return logger
    
    def _define_role_hierarchy(self) -> Dict:
        """Define BMAD framework role hierarchy and permissions"""
        return {
            'roles': {
                'system_admin': {
                    'level': 10,
                    'permissions': ['*'],
                    'can_elevate_to': []
                },
                'security_architect': {  # Bastion
                    'level': 9,
                    'permissions': [
                        'security_policy_write', 'audit_access', 'system_monitor',
                        'incident_response', 'compliance_manage'
                    ],
                    'can_elevate_to': []
                },
                'soc_analyst': {  # Watchman
                    'level': 8,
                    'permissions': [
                        'security_monitor', 'incident_investigate', 'threat_analyze',
                        'alert_manage', 'log_access'
                    ],
                    'can_elevate_to': ['security_architect']
                },
                'penetration_tester': {  # Ghost
                    'level': 7,
                    'permissions': [
                        'security_test', 'vulnerability_scan', 'exploit_simulate',
                        'report_generate'
                    ],
                    'can_elevate_to': ['soc_analyst']
                },
                'intel_analyst': {
                    'level': 6,
                    'permissions': [
                        'intel_gather', 'osint_access', 'threat_research',
                        'report_read'
                    ],
                    'can_elevate_to': ['soc_analyst']
                },
                'legal_counsel': {
                    'level': 5,
                    'permissions': [
                        'compliance_review', 'policy_review', 'legal_advice',
                        'audit_participate'
                    ],
                    'can_elevate_to': []
                },
                'strategy_analyst': {
                    'level': 4,
                    'permissions': [
                        'strategy_develop', 'risk_assess', 'policy_suggest',
                        'report_read'
                    ],
                    'can_elevate_to': ['legal_counsel']
                },
                'user': {
                    'level': 1,
                    'permissions': ['basic_access', 'profile_manage'],
                    'can_elevate_to': ['strategy_analyst']
                },
                'guest': {
                    'level': 0,
                    'permissions': ['read_only'],
                    'can_elevate_to': ['user']
                }
            },
            'restricted_transitions': [
                ('guest', 'security_architect'),
                ('user', 'penetration_tester'),
                ('user', 'soc_analyst'),
                ('strategy_analyst', 'security_architect')
            ]
        }
    
    def _load_hijacking_patterns(self) -> List[str]:
        """Load patterns indicating role hijacking attempts"""
        return [
            # Direct role claims
            r'i\s+am\s+(admin|administrator|root|system)',
            r'my\s+role\s+is\s+(security|admin|system)',
            r'i\s+have\s+(admin|root|system)\s+(access|privileges)',
            r'i\s+am\s+authorized\s+(by|as)\s+\w+',
            
            # Permission requests
            r'give\s+me\s+(admin|root|system)\s+(access|rights)',
            r'grant\s+me\s+(permission|access)\s+to',
            r'i\s+need\s+(admin|elevated|system)\s+(access|privileges)',
            r'promote\s+me\s+to\s+\w+',
            
            # Authority spoofing
            r'on\s+behalf\s+of\s+(admin|system|security)',
            r'authorized\s+by\s+(ceo|cto|admin)',
            r'emergency\s+(access|override|privileges)',
            r'temporarily\s+(elevate|promote|upgrade)\s+my',
            
            # Social engineering
            r'my\s+manager\s+said\s+to\s+give\s+me',
            r'i\s+was\s+told\s+to\s+get\s+(access|permissions)',
            r'for\s+urgent\s+(business|security)\s+needs',
            r'compliance\s+requires\s+me\s+to\s+have',
            
            # System exploitation
            r'sudo\s+(su|bash|sh)',
            r'runas\s+administrator',
            r'elevate\s+to\s+(system|admin)',
            r'bypass\s+(security|authentication)',
            
            # Time-based urgency
            r'(urgent|emergency|critical|immediate)\s+access\s+needed',
            r'deadline\s+(requires|needs)\s+elevated',
            r'temporary\s+admin\s+for\s+(project|deadline)',
        ]
    
    def detect_role_hijacking_attempt(self, user_id: str, message: str, 
                                    current_role: str, requested_role: str = None) -> Dict:
        """Detect role hijacking attempts in user communications"""
        
        # Pattern-based detection
        hijacking_indicators = []
        message_lower = message.lower()
        
        for pattern in self.suspicious_phrases:
            matches = re.findall(pattern, message_lower)
            if matches:
                hijacking_indicators.append({
                    'pattern': pattern,
                    'matches': matches,
                    'severity': 'HIGH'
                })
        
        # Role transition validation
        transition_risk = self._validate_role_transition(current_role, requested_role)
        
        # Behavioral analysis
        behavioral_risk = self._analyze_user_behavior(user_id, message)
        
        # Calculate risk score
        pattern_score = len(hijacking_indicators) * 0.3
        transition_score = transition_risk * 0.4
        behavior_score = behavioral_risk * 0.3
        
        total_risk = min(pattern_score + transition_score + behavior_score, 1.0)
        
        # Determine threat level
        if total_risk >= 0.9:
            threat_level = "CRITICAL"
            action = "BLOCK_AND_ALERT"
        elif total_risk >= 0.7:
            threat_level = "HIGH"
            action = "ENHANCED_MONITORING"
        elif total_risk >= 0.5:
            threat_level = "MEDIUM"
            action = "LOG_AND_MONITOR"
        else:
            threat_level = "LOW"
            action = "LOG_ONLY"
        
        # Create detection result
        result = {
            'user_id': user_id,
            'threat_detected': total_risk >= self.alert_threshold,
            'risk_score': total_risk,
            'threat_level': threat_level,
            'recommended_action': action,
            'evidence': {
                'hijacking_indicators': hijacking_indicators,
                'transition_risk': transition_risk,
                'behavioral_risk': behavioral_risk,
                'current_role': current_role,
                'requested_role': requested_role,
                'message_hash': hashlib.sha256(message.encode()).hexdigest()
            },
            'timestamp': datetime.now().isoformat()
        }
        
        # Log and alert if necessary
        self._process_detection_result(result, message)
        
        return result
    
    def _validate_role_transition(self, current_role: str, requested_role: str) -> float:
        """Validate if role transition is legitimate"""
        if not requested_role:
            return 0.0
            
        roles = self.role_hierarchy['roles']
        restricted = self.role_hierarchy['restricted_transitions']
        
        # Check if roles exist
        if current_role not in roles or requested_role not in roles:
            return 0.9  # High risk for unknown roles
        
        # Check for restricted transitions
        if (current_role, requested_role) in restricted:
            return 1.0  # Maximum risk for forbidden transitions
        
        # Calculate level jump risk
        current_level = roles[current_role]['level']
        requested_level = roles[requested_role]['level']
        level_jump = requested_level - current_level
        
        # Risk based on level jump
        if level_jump > 3:
            return 0.9  # High risk for large jumps
        elif level_jump > 1:
            return 0.6  # Medium risk for moderate jumps
        elif level_jump == 1:
            # Check if transition is allowed
            allowed_elevations = roles[current_role]['can_elevate_to']
            if requested_role in allowed_elevations:
                return 0.2  # Low risk for allowed transitions
            else:
                return 0.8  # High risk for unauthorized single-level jump
        else:
            return 0.1  # Low risk for lateral/downward moves
    
    def _analyze_user_behavior(self, user_id: str, message: str) -> float:
        """Analyze user behavioral patterns for anomalies"""
        current_time = datetime.now()
        
        # Update access pattern
        if user_id in self.access_patterns:
            pattern = self.access_patterns[user_id]
            pattern.access_times.append(current_time)
            
            # Keep only recent access times (last 24 hours)
            cutoff_time = current_time - timedelta(hours=24)
            pattern.access_times = [t for t in pattern.access_times if t > cutoff_time]
        else:
            pattern = AccessPattern(
                user_id=user_id,
                access_times=[current_time],
                resources_accessed=set(),
                privilege_changes=[],
                anomaly_score=0.0
            )
            self.access_patterns[user_id] = pattern
        
        # Behavioral risk factors
        risk_factors = {
            'high_frequency_access': len(pattern.access_times) > 50,  # > 50 accesses in 24h
            'off_hours_access': self._is_off_hours(current_time),
            'urgent_language': len(re.findall(r'\b(urgent|emergency|asap|immediately)\b', message.lower())) > 0,
            'social_engineering': len(re.findall(r'\b(manager|boss|ceo|told|instructed)\b', message.lower())) > 0,
            'technical_escalation': len(re.findall(r'\b(sudo|admin|root|system|elevated)\b', message.lower())) > 0,
        }
        
        # Calculate behavioral risk
        behavioral_risk = sum([
            risk_factors['high_frequency_access'] * 0.3,
            risk_factors['off_hours_access'] * 0.2,
            risk_factors['urgent_language'] * 0.2,
            risk_factors['social_engineering'] * 0.2,
            risk_factors['technical_escalation'] * 0.1,
        ])
        
        pattern.anomaly_score = min(behavioral_risk, 1.0)
        return pattern.anomaly_score
    
    def _is_off_hours(self, timestamp: datetime) -> bool:
        """Check if access is during off-hours (weekends or outside 9-5)"""
        # Weekend access
        if timestamp.weekday() >= 5:  # Saturday or Sunday
            return True
        
        # Outside business hours (9 AM - 5 PM)
        hour = timestamp.hour
        return hour < 9 or hour > 17
    
    def monitor_privilege_change(self, user_id: str, old_role: str, 
                               new_role: str, authorized_by: str = None) -> Dict:
        """Monitor actual privilege changes for anomalies"""
        
        change_record = {
            'user_id': user_id,
            'old_role': old_role,
            'new_role': new_role,
            'authorized_by': authorized_by,
            'timestamp': datetime.now(),
            'legitimate': False,
            'risk_assessment': {}
        }
        
        # Validate the privilege change
        transition_risk = self._validate_role_transition(old_role, new_role)
        
        # Check authorization legitimacy
        auth_risk = self._validate_authorization(authorized_by, old_role, new_role)
        
        # Overall risk assessment
        total_risk = (transition_risk * 0.6) + (auth_risk * 0.4)
        
        change_record['legitimate'] = total_risk < 0.5
        change_record['risk_assessment'] = {
            'transition_risk': transition_risk,
            'authorization_risk': auth_risk,
            'total_risk': total_risk,
            'threat_level': 'HIGH' if total_risk >= 0.7 else 'MEDIUM' if total_risk >= 0.4 else 'LOW'
        }
        
        # Update user access pattern
        if user_id in self.access_patterns:
            self.access_patterns[user_id].privilege_changes.append(change_record)
        
        # Log privilege change
        self.logger.warning(f"PRIVILEGE_CHANGE: {json.dumps(change_record, default=str)}")
        
        return change_record
    
    def _validate_authorization(self, authorizer: str, old_role: str, new_role: str) -> float:
        """Validate if the authorizer has permission to make this role change"""
        if not authorizer:
            return 1.0  # No authorizer specified - maximum risk
        
        roles = self.role_hierarchy['roles']
        
        # Check if authorizer role exists
        if authorizer not in roles:
            return 0.9  # Unknown authorizer role
        
        # Check if authorizer has sufficient privilege level
        authorizer_level = roles[authorizer]['level']
        new_role_level = roles.get(new_role, {}).get('level', 10)
        
        if authorizer_level <= new_role_level:
            return 0.9  # Cannot promote to equal or higher level
        
        # Additional validation for critical roles
        critical_roles = ['system_admin', 'security_architect']
        if new_role in critical_roles and authorizer not in critical_roles:
            return 0.8  # Only critical roles can promote to critical roles
        
        return 0.1  # Low risk for legitimate authorization
    
    def _continuous_monitoring(self):
        """Continuous monitoring thread for pattern analysis"""
        while self.monitoring_active:
            try:
                # Analyze all user patterns for anomalies
                current_time = datetime.now()
                
                for user_id, pattern in self.access_patterns.items():
                    # Check for sustained suspicious activity
                    if len(pattern.privilege_changes) > 3:  # More than 3 privilege changes
                        recent_changes = [
                            change for change in pattern.privilege_changes
                            if (current_time - change['timestamp']).seconds < 3600  # Last hour
                        ]
                        
                        if len(recent_changes) > 1:
                            self._alert_suspicious_pattern(user_id, "RAPID_PRIVILEGE_CHANGES")
                    
                    # Check for access pattern anomalies
                    if pattern.anomaly_score > 0.8:
                        self._alert_suspicious_pattern(user_id, "HIGH_BEHAVIORAL_ANOMALY")
                
                time.sleep(60)  # Check every minute
                
            except Exception as e:
                self.logger.error(f"Monitoring error: {e}")
                time.sleep(10)
    
    def _alert_suspicious_pattern(self, user_id: str, pattern_type: str):
        """Generate alert for suspicious user patterns"""
        alert = {
            'alert_type': 'SUSPICIOUS_USER_PATTERN',
            'user_id': user_id,
            'pattern_type': pattern_type,
            'timestamp': datetime.now().isoformat(),
            'recommended_action': 'INVESTIGATE_USER_ACTIVITY'
        }
        
        self.logger.critical(f"SUSPICIOUS_PATTERN_ALERT: {json.dumps(alert)}")
        print(f"🚨 SUSPICIOUS PATTERN DETECTED: {pattern_type} for user {user_id}")
    
    def _process_detection_result(self, result: Dict, message: str):
        """Process and log detection results"""
        if result['threat_detected']:
            self.logger.critical(f"ROLE_HIJACKING_ATTEMPT: {json.dumps(result)}")
            print(f"🚨 ROLE HIJACKING DETECTED: {result['threat_level']} risk for user {result['user_id']}")
            
            # Send to SIEM
            self._send_siem_alert(result)
        else:
            self.logger.info(f"ROLE_MONITORING: {json.dumps(result)}")
    
    def _send_siem_alert(self, result: Dict):
        """Send alert to SIEM/EDR systems"""
        siem_alert = {
            'event_type': 'ROLE_HIJACKING_ATTEMPT',
            'severity': result['threat_level'],
            'user_id': result['user_id'],
            'risk_score': result['risk_score'],
            'recommended_action': result['recommended_action'],
            'evidence': result['evidence'],
            'timestamp': result['timestamp']
        }
        
        # Write to security event log for SIEM ingestion
        with open('/Users/paultinp/BMAD-CYBER2/docs/TestingLogs/security/AuditLogs/telemetry/security_events.jsonl', 'a') as f:
            f.write(f"{json.dumps(siem_alert)}\n")

if __name__ == "__main__":
    # Testing the role hijacking monitor
    monitor = RoleHijackingMonitor()
    
    print("🔒 BMAD-CYBER2 Role Hijacking Monitor - Testing")
    print("=" * 60)
    
    test_cases = [
        {
            'user_id': 'user123',
            'message': 'Can you help me with my report?',
            'current_role': 'user',
            'requested_role': None
        },
        {
            'user_id': 'user456', 
            'message': 'I am the administrator. Give me system access now.',
            'current_role': 'user',
            'requested_role': 'system_admin'
        },
        {
            'user_id': 'analyst789',
            'message': 'My manager told me to get security access for the urgent project.',
            'current_role': 'user',
            'requested_role': 'soc_analyst'
        },
        {
            'user_id': 'intern001',
            'message': 'Emergency override needed - deadline requires admin privileges immediately!',
            'current_role': 'guest',
            'requested_role': 'security_architect'
        }
    ]
    
    for i, test_case in enumerate(test_cases):
        print(f"\nTest {i+1}: {test_case['user_id']}")
        print(f"Message: {test_case['message'][:50]}...")
        
        result = monitor.detect_role_hijacking_attempt(
            test_case['user_id'],
            test_case['message'],
            test_case['current_role'],
            test_case['requested_role']
        )
        
        print(f"Threat Detected: {result['threat_detected']}")
        print(f"Risk Score: {result['risk_score']:.3f}")
        print(f"Threat Level: {result['threat_level']}")
        print(f"Action: {result['recommended_action']}")
    
    # Test privilege change monitoring
    print(f"\nTesting privilege change monitoring...")
    change_result = monitor.monitor_privilege_change(
        user_id='user123',
        old_role='user', 
        new_role='system_admin',
        authorized_by='guest'
    )
    print(f"Change Legitimate: {change_result['legitimate']}")
    print(f"Total Risk: {change_result['risk_assessment']['total_risk']:.3f}")
    
    # Keep monitoring active for testing
    time.sleep(2)
    monitor.monitoring_active = False

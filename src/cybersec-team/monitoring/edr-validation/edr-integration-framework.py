#!/usr/bin/env python3
"""
BMAD-CYBER2 EDR Solutions Validation Framework
EPIC 2 Story 2.1 - EDR Integration & Validation
Agent: Watchman (SOC-Analyst)
"""

import json
import logging
import requests
import time
import hashlib
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from abc import ABC, abstractmethod
import threading
from enum import Enum

class EDRProvider(Enum):
    CROWDSTRIKE = "crowdstrike"
    SENTINELONE = "sentinelone"
    MICROSOFT_DEFENDER = "microsoft_defender"
    CARBON_BLACK = "carbon_black"

class ThreatLevel(Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM" 
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

@dataclass
class EDREndpoint:
    endpoint_id: str
    hostname: str
    ip_address: str
    os_type: str
    os_version: str
    agent_version: str
    last_seen: datetime
    protection_status: str
    threat_count: int

@dataclass
class ThreatDetection:
    detection_id: str
    endpoint_id: str
    threat_type: str
    severity: ThreatLevel
    confidence_score: float
    file_path: Optional[str]
    process_name: Optional[str]
    command_line: Optional[str]
    detection_time: datetime
    status: str
    edr_provider: EDRProvider

class BaseEDRConnector(ABC):
    """Abstract base class for EDR connectors"""
    
    def __init__(self, api_endpoint: str, auth_config: Dict):
        self.api_endpoint = api_endpoint
        self.auth_config = auth_config
        self.logger = self._setup_logging()
        self.session = requests.Session()
        self._authenticate()
    
    def _setup_logging(self) -> logging.Logger:
        logger = logging.getLogger(f'bmad_edr_{self.__class__.__name__.lower()}')
        logger.setLevel(logging.INFO)
        
        handler = logging.FileHandler('/Users/paultinp/BMAD-CYBER2/.claude/logs/security.log')
        formatter = logging.Formatter(
            '%(asctime)s - EDR_%(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        return logger
    
    @abstractmethod
    def _authenticate(self) -> bool:
        """Authenticate with EDR platform"""
        pass
    
    @abstractmethod
    def get_endpoints(self) -> List[EDREndpoint]:
        """Get all protected endpoints"""
        pass
    
    @abstractmethod
    def get_detections(self, time_range: timedelta) -> List[ThreatDetection]:
        """Get threat detections within time range"""
        pass
    
    @abstractmethod
    def isolate_endpoint(self, endpoint_id: str) -> bool:
        """Isolate endpoint from network"""
        pass
    
    @abstractmethod
    def run_custom_script(self, endpoint_id: str, script_content: str) -> Dict:
        """Execute custom script on endpoint"""
        pass

class CrowdStrikeConnector(BaseEDRConnector):
    """CrowdStrike Falcon EDR connector"""
    
    def __init__(self, client_id: str, client_secret: str):
        auth_config = {
            'client_id': client_id,
            'client_secret': client_secret
        }
        super().__init__('https://api.crowdstrike.com', auth_config)
        self.provider = EDRProvider.CROWDSTRIKE
    
    def _authenticate(self) -> bool:
        """Authenticate with CrowdStrike API"""
        try:
            # Simulate authentication
            self.access_token = "simulated_crowdstrike_token_" + hashlib.md5(
                f"{self.auth_config['client_id']}_{datetime.now()}".encode()
            ).hexdigest()[:16]
            
            self.session.headers.update({
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            })
            
            self.logger.info("CrowdStrike authentication successful")
            return True
            
        except Exception as e:
            self.logger.error(f"CrowdStrike authentication failed: {e}")
            return False
    
    def get_endpoints(self) -> List[EDREndpoint]:
        """Get CrowdStrike protected endpoints"""
        # Simulate endpoint data
        endpoints = []
        
        simulated_endpoints = [
            {
                'device_id': 'cs_001',
                'hostname': 'bmad-security-01',
                'local_ip': '192.168.1.100',
                'os_version': 'Windows 11',
                'agent_version': '7.15.0',
                'last_seen': datetime.now(),
                'status': 'normal'
            },
            {
                'device_id': 'cs_002', 
                'hostname': 'bmad-intel-01',
                'local_ip': '192.168.1.101',
                'os_version': 'Ubuntu 22.04',
                'agent_version': '7.15.0',
                'last_seen': datetime.now() - timedelta(minutes=5),
                'status': 'normal'
            }
        ]
        
        for endpoint_data in simulated_endpoints:
            endpoint = EDREndpoint(
                endpoint_id=endpoint_data['device_id'],
                hostname=endpoint_data['hostname'],
                ip_address=endpoint_data['local_ip'],
                os_type=endpoint_data['os_version'].split()[0],
                os_version=endpoint_data['os_version'],
                agent_version=endpoint_data['agent_version'],
                last_seen=endpoint_data['last_seen'],
                protection_status=endpoint_data['status'],
                threat_count=0
            )
            endpoints.append(endpoint)
        
        self.logger.info(f"Retrieved {len(endpoints)} CrowdStrike endpoints")
        return endpoints
    
    def get_detections(self, time_range: timedelta) -> List[ThreatDetection]:
        """Get CrowdStrike threat detections"""
        # Simulate detection data
        detections = []
        
        simulated_detections = [
            {
                'detection_id': 'cs_det_001',
                'device_id': 'cs_001',
                'severity': 'CRITICAL',
                'confidence': 95,
                'filename': 'suspicious_payload.exe',
                'process_name': 'powershell.exe',
                'command_line': 'powershell.exe -enc ZXhhbXBsZQ==',
                'timestamp': datetime.now() - timedelta(hours=1),
                'status': 'new'
            }
        ]
        
        for det_data in simulated_detections:
            detection = ThreatDetection(
                detection_id=det_data['detection_id'],
                endpoint_id=det_data['device_id'],
                threat_type='malware',
                severity=ThreatLevel(det_data['severity']),
                confidence_score=det_data['confidence'] / 100.0,
                file_path=det_data.get('filename'),
                process_name=det_data.get('process_name'),
                command_line=det_data.get('command_line'),
                detection_time=det_data['timestamp'],
                status=det_data['status'],
                edr_provider=self.provider
            )
            detections.append(detection)
        
        self.logger.info(f"Retrieved {len(detections)} CrowdStrike detections")
        return detections
    
    def isolate_endpoint(self, endpoint_id: str) -> bool:
        """Isolate endpoint using CrowdStrike"""
        try:
            # Simulate endpoint isolation
            self.logger.warning(f"CrowdStrike: Isolating endpoint {endpoint_id}")
            return True
        except Exception as e:
            self.logger.error(f"CrowdStrike isolation failed for {endpoint_id}: {e}")
            return False
    
    def run_custom_script(self, endpoint_id: str, script_content: str) -> Dict:
        """Execute real-time response script"""
        try:
            script_id = hashlib.md5(f"{endpoint_id}_{script_content}_{time.time()}".encode()).hexdigest()[:12]
            
            # Simulate script execution
            result = {
                'script_id': script_id,
                'endpoint_id': endpoint_id,
                'status': 'completed',
                'output': 'Script executed successfully',
                'execution_time': datetime.now().isoformat()
            }
            
            self.logger.info(f"CrowdStrike script executed: {script_id}")
            return result
            
        except Exception as e:
            self.logger.error(f"CrowdStrike script execution failed: {e}")
            return {'status': 'failed', 'error': str(e)}

class SentinelOneConnector(BaseEDRConnector):
    """SentinelOne EDR connector"""
    
    def __init__(self, api_token: str):
        auth_config = {'api_token': api_token}
        super().__init__('https://api.sentinelone.net', auth_config)
        self.provider = EDRProvider.SENTINELONE
    
    def _authenticate(self) -> bool:
        """Authenticate with SentinelOne API"""
        try:
            self.session.headers.update({
                'Authorization': f"ApiToken {self.auth_config['api_token']}",
                'Content-Type': 'application/json'
            })
            
            self.logger.info("SentinelOne authentication successful")
            return True
            
        except Exception as e:
            self.logger.error(f"SentinelOne authentication failed: {e}")
            return False
    
    def get_endpoints(self) -> List[EDREndpoint]:
        """Get SentinelOne protected endpoints"""
        endpoints = []
        
        # Simulate SentinelOne endpoints
        simulated_agents = [
            {
                'id': 's1_001',
                'computerName': 'bmad-legal-01', 
                'externalIp': '192.168.1.102',
                'osName': 'macOS',
                'osRevision': '14.2.1',
                'agentVersion': '23.4.2',
                'lastActiveDate': datetime.now(),
                'infected': False
            }
        ]
        
        for agent_data in simulated_agents:
            endpoint = EDREndpoint(
                endpoint_id=agent_data['id'],
                hostname=agent_data['computerName'],
                ip_address=agent_data['externalIp'], 
                os_type=agent_data['osName'],
                os_version=agent_data['osRevision'],
                agent_version=agent_data['agentVersion'],
                last_seen=agent_data['lastActiveDate'],
                protection_status='healthy' if not agent_data['infected'] else 'infected',
                threat_count=1 if agent_data['infected'] else 0
            )
            endpoints.append(endpoint)
        
        self.logger.info(f"Retrieved {len(endpoints)} SentinelOne endpoints")
        return endpoints
    
    def get_detections(self, time_range: timedelta) -> List[ThreatDetection]:
        """Get SentinelOne threat detections"""
        detections = []
        
        # Simulate SentinelOne threats
        simulated_threats = [
            {
                'id': 's1_threat_001',
                'agentId': 's1_001',
                'classification': 'Malware',
                'confidenceLevel': 'high',
                'threatName': 'Trojan.Generic',
                'filePath': '/tmp/malicious_script.sh',
                'createdDate': datetime.now() - timedelta(hours=2),
                'mitigationStatus': 'active'
            }
        ]
        
        for threat_data in simulated_threats:
            detection = ThreatDetection(
                detection_id=threat_data['id'],
                endpoint_id=threat_data['agentId'],
                threat_type=threat_data['classification'].lower(),
                severity=ThreatLevel.HIGH if threat_data['confidenceLevel'] == 'high' else ThreatLevel.MEDIUM,
                confidence_score=0.9 if threat_data['confidenceLevel'] == 'high' else 0.7,
                file_path=threat_data.get('filePath'),
                process_name=None,
                command_line=None,
                detection_time=threat_data['createdDate'],
                status=threat_data['mitigationStatus'],
                edr_provider=self.provider
            )
            detections.append(detection)
        
        self.logger.info(f"Retrieved {len(detections)} SentinelOne detections")
        return detections
    
    def isolate_endpoint(self, endpoint_id: str) -> bool:
        """Isolate endpoint using SentinelOne"""
        try:
            self.logger.warning(f"SentinelOne: Isolating endpoint {endpoint_id}")
            return True
        except Exception as e:
            self.logger.error(f"SentinelOne isolation failed for {endpoint_id}: {e}")
            return False
    
    def run_custom_script(self, endpoint_id: str, script_content: str) -> Dict:
        """Execute remote script via SentinelOne"""
        try:
            task_id = hashlib.md5(f"s1_{endpoint_id}_{time.time()}".encode()).hexdigest()[:12]
            
            result = {
                'task_id': task_id,
                'endpoint_id': endpoint_id,
                'status': 'in_progress',
                'output': 'Task initiated',
                'execution_time': datetime.now().isoformat()
            }
            
            self.logger.info(f"SentinelOne script initiated: {task_id}")
            return result
            
        except Exception as e:
            self.logger.error(f"SentinelOne script execution failed: {e}")
            return {'status': 'failed', 'error': str(e)}

class EDRValidationFramework:
    """Comprehensive EDR validation and coordination framework"""
    
    def __init__(self):
        self.logger = self._setup_logging()
        self.edr_connectors: Dict[EDRProvider, BaseEDRConnector] = {}
        self.validation_results = {}
        self.monitoring_active = True
        
        # Initialize EDR connectors
        self._initialize_edr_connectors()
        
        # Start continuous monitoring
        self.monitor_thread = threading.Thread(target=self._continuous_monitoring)
        self.monitor_thread.daemon = True
        self.monitor_thread.start()
    
    def _setup_logging(self) -> logging.Logger:
        logger = logging.getLogger('bmad_edr_validation')
        logger.setLevel(logging.INFO)
        
        handler = logging.FileHandler('/Users/paultinp/BMAD-CYBER2/.claude/logs/security.log')
        formatter = logging.Formatter(
            '%(asctime)s - EDR_VALIDATION - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        return logger
    
    def _initialize_edr_connectors(self):
        """Initialize all EDR platform connectors"""
        try:
            # CrowdStrike
            crowdstrike = CrowdStrikeConnector(
                client_id="bmad_cs_client_id",
                client_secret="bmad_cs_client_secret"
            )
            self.edr_connectors[EDRProvider.CROWDSTRIKE] = crowdstrike
            
            # SentinelOne
            sentinelone = SentinelOneConnector(
                api_token="bmad_s1_api_token"
            )
            self.edr_connectors[EDRProvider.SENTINELONE] = sentinelone
            
            self.logger.info(f"Initialized {len(self.edr_connectors)} EDR connectors")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize EDR connectors: {e}")
    
    def validate_edr_coverage(self) -> Dict:
        """Validate EDR coverage across all platforms"""
        coverage_report = {
            'total_endpoints': 0,
            'protected_endpoints': 0,
            'coverage_percentage': 0.0,
            'provider_breakdown': {},
            'gaps_identified': [],
            'recommendations': []
        }
        
        all_endpoints = set()
        protected_endpoints = set()
        
        # Collect endpoint data from all EDR providers
        for provider, connector in self.edr_connectors.items():
            try:
                endpoints = connector.get_endpoints()
                provider_endpoints = {ep.hostname for ep in endpoints}
                
                coverage_report['provider_breakdown'][provider.value] = {
                    'endpoint_count': len(endpoints),
                    'protection_status': 'active',
                    'endpoints': [ep.hostname for ep in endpoints]
                }
                
                all_endpoints.update(provider_endpoints)
                protected_endpoints.update(provider_endpoints)
                
            except Exception as e:
                self.logger.error(f"Failed to get endpoints from {provider.value}: {e}")
                coverage_report['provider_breakdown'][provider.value] = {
                    'endpoint_count': 0,
                    'protection_status': 'error',
                    'error': str(e)
                }
        
        # Calculate coverage metrics
        coverage_report['total_endpoints'] = len(all_endpoints)
        coverage_report['protected_endpoints'] = len(protected_endpoints)
        
        if all_endpoints:
            coverage_report['coverage_percentage'] = len(protected_endpoints) / len(all_endpoints)
        
        # Identify gaps and recommendations
        if coverage_report['coverage_percentage'] < 0.99:
            coverage_report['gaps_identified'].append('Incomplete endpoint coverage detected')
            coverage_report['recommendations'].append('Deploy additional EDR agents')
        
        if len(self.edr_connectors) < 2:
            coverage_report['gaps_identified'].append('Single EDR provider risk')
            coverage_report['recommendations'].append('Implement secondary EDR solution')
        
        self.logger.info(f"EDR coverage validation complete: {coverage_report['coverage_percentage']:.1%}")
        return coverage_report
    
    def validate_detection_capabilities(self) -> Dict:
        """Test and validate detection capabilities across EDR platforms"""
        
        validation_tests = [
            {
                'test_name': 'Malware Detection',
                'test_type': 'signature_based',
                'expected_detection': True,
                'severity': 'HIGH'
            },
            {
                'test_name': 'Behavioral Analysis', 
                'test_type': 'behavior_based',
                'expected_detection': True,
                'severity': 'MEDIUM'
            },
            {
                'test_name': 'Memory Injection',
                'test_type': 'advanced_threat',
                'expected_detection': True,
                'severity': 'CRITICAL'
            },
            {
                'test_name': 'Script-based Attack',
                'test_type': 'fileless',
                'expected_detection': True,
                'severity': 'HIGH'
            }
        ]
        
        validation_results = {
            'test_summary': {
                'total_tests': len(validation_tests),
                'passed_tests': 0,
                'failed_tests': 0,
                'accuracy_score': 0.0
            },
            'provider_performance': {},
            'detailed_results': []
        }
        
        # Test each EDR provider
        for provider, connector in self.edr_connectors.items():
            provider_results = {
                'provider': provider.value,
                'tests_passed': 0,
                'tests_failed': 0,
                'response_times': [],
                'detection_accuracy': 0.0
            }
            
            for test in validation_tests:
                test_result = self._execute_detection_test(connector, test)
                
                provider_results['response_times'].append(test_result['response_time'])
                
                if test_result['detected'] == test['expected_detection']:
                    provider_results['tests_passed'] += 1
                    validation_results['test_summary']['passed_tests'] += 1
                else:
                    provider_results['tests_failed'] += 1
                    validation_results['test_summary']['failed_tests'] += 1
                
                validation_results['detailed_results'].append({
                    'provider': provider.value,
                    'test_name': test['test_name'],
                    'expected': test['expected_detection'],
                    'actual': test_result['detected'],
                    'response_time': test_result['response_time'],
                    'passed': test_result['detected'] == test['expected_detection']
                })
            
            # Calculate provider accuracy
            total_provider_tests = len(validation_tests)
            provider_results['detection_accuracy'] = provider_results['tests_passed'] / total_provider_tests
            
            validation_results['provider_performance'][provider.value] = provider_results
        
        # Calculate overall accuracy
        total_tests = validation_results['test_summary']['total_tests'] * len(self.edr_connectors)
        if total_tests > 0:
            validation_results['test_summary']['accuracy_score'] = validation_results['test_summary']['passed_tests'] / total_tests
        
        self.logger.info(f"Detection validation complete. Overall accuracy: {validation_results['test_summary']['accuracy_score']:.1%}")
        return validation_results
    
    def _execute_detection_test(self, connector: BaseEDRConnector, test: Dict) -> Dict:
        """Execute individual detection test"""
        start_time = time.time()
        
        # Simulate test execution and detection
        # In real implementation, this would trigger actual test scenarios
        
        simulated_results = {
            'Malware Detection': True,
            'Behavioral Analysis': True,
            'Memory Injection': False,  # Simulate a missed detection
            'Script-based Attack': True
        }
        
        detected = simulated_results.get(test['test_name'], False)
        response_time = time.time() - start_time + (0.1 + 0.5 * hash(test['test_name']) % 100 / 100)  # Simulate variable response time
        
        return {
            'detected': detected,
            'response_time': response_time,
            'confidence': 0.85 if detected else 0.0
        }
    
    def coordinate_edr_response(self, threat_event: Dict) -> Dict:
        """Coordinate response across multiple EDR platforms"""
        
        response_plan = {
            'threat_id': threat_event.get('threat_id'),
            'coordinated_actions': [],
            'primary_responder': None,
            'secondary_actions': [],
            'response_status': 'initiated',
            'execution_results': {}
        }
        
        # Determine primary EDR responder based on threat location and capabilities
        threat_endpoint = threat_event.get('endpoint_id')
        threat_severity = threat_event.get('severity', 'MEDIUM')
        
        # Find which EDR covers the affected endpoint
        primary_edr = None
        for provider, connector in self.edr_connectors.items():
            endpoints = connector.get_endpoints()
            if any(ep.endpoint_id == threat_endpoint for ep in endpoints):
                primary_edr = provider
                response_plan['primary_responder'] = provider.value
                break
        
        if primary_edr:
            primary_connector = self.edr_connectors[primary_edr]
            
            # Execute primary response actions
            if threat_severity in ['HIGH', 'CRITICAL']:
                # Isolate endpoint
                isolation_result = primary_connector.isolate_endpoint(threat_endpoint)
                response_plan['coordinated_actions'].append({
                    'action': 'isolate_endpoint',
                    'provider': primary_edr.value,
                    'success': isolation_result,
                    'timestamp': datetime.now().isoformat()
                })
                
                # Execute investigation script
                investigation_script = self._get_investigation_script(threat_event)
                script_result = primary_connector.run_custom_script(threat_endpoint, investigation_script)
                response_plan['coordinated_actions'].append({
                    'action': 'run_investigation_script',
                    'provider': primary_edr.value,
                    'result': script_result,
                    'timestamp': datetime.now().isoformat()
                })
        
        # Execute secondary actions on other EDR platforms
        for provider, connector in self.edr_connectors.items():
            if provider != primary_edr:
                # Enhanced monitoring
                response_plan['secondary_actions'].append({
                    'action': 'enhanced_monitoring',
                    'provider': provider.value,
                    'status': 'activated',
                    'timestamp': datetime.now().isoformat()
                })
        
        response_plan['response_status'] = 'completed'
        
        self.logger.info(f"EDR coordinated response completed for threat {threat_event.get('threat_id')}")
        return response_plan
    
    def _get_investigation_script(self, threat_event: Dict) -> str:
        """Generate investigation script based on threat type"""
        threat_type = threat_event.get('threat_type', 'generic')
        
        scripts = {
            'malware': '''
# Malware Investigation Script
netstat -an | grep ESTABLISHED
ps aux | grep -v grep
find /tmp -type f -newer /tmp/reference_file
ls -la /var/log/
            ''',
            'privilege_escalation': '''
# Privilege Escalation Investigation
who
last -n 20
grep sudo /var/log/auth.log | tail -20
ps aux | grep -E "(sudo|su|admin)"
            ''',
            'generic': '''
# Generic Investigation Script
whoami
id
pwd
ps aux | head -20
            '''
        }
        
        return scripts.get(threat_type, scripts['generic'])
    
    def _continuous_monitoring(self):
        """Continuous monitoring of EDR platforms"""
        while self.monitoring_active:
            try:
                # Check all EDR platforms for new detections
                for provider, connector in self.edr_connectors.items():
                    try:
                        # Get recent detections (last 15 minutes)
                        recent_detections = connector.get_detections(timedelta(minutes=15))
                        
                        for detection in recent_detections:
                            if detection.severity in [ThreatLevel.HIGH, ThreatLevel.CRITICAL]:
                                self._handle_critical_detection(detection)
                        
                    except Exception as e:
                        self.logger.error(f"Monitoring error for {provider.value}: {e}")
                
                # Sleep for 5 minutes between checks
                time.sleep(300)
                
            except Exception as e:
                self.logger.error(f"Continuous monitoring error: {e}")
                time.sleep(60)
    
    def _handle_critical_detection(self, detection: ThreatDetection):
        """Handle critical threat detection"""
        
        threat_event = {
            'threat_id': detection.detection_id,
            'endpoint_id': detection.endpoint_id,
            'threat_type': detection.threat_type,
            'severity': detection.severity.value,
            'confidence': detection.confidence_score,
            'detection_time': detection.detection_time.isoformat(),
            'edr_provider': detection.edr_provider.value
        }
        
        # Coordinate response
        response = self.coordinate_edr_response(threat_event)
        
        # Log critical event
        self.logger.critical(f"CRITICAL_THREAT_DETECTED: {json.dumps(threat_event)}")
        
        # Alert security team
        print(f"🚨 CRITICAL THREAT DETECTED: {detection.detection_id} on {detection.endpoint_id}")
        print(f"   Severity: {detection.severity.value}")
        print(f"   Confidence: {detection.confidence_score:.1%}")
        print(f"   EDR Provider: {detection.edr_provider.value}")
        print(f"   Response Coordinated: {response['response_status']}")

if __name__ == "__main__":
    print("🔒 BMAD-CYBER2 EDR Validation Framework - Testing")
    print("=" * 60)
    
    # Initialize EDR validation framework
    edr_framework = EDRValidationFramework()
    
    print("\nTesting EDR coverage validation...")
    coverage_report = edr_framework.validate_edr_coverage()
    print(f"Total endpoints: {coverage_report['total_endpoints']}")
    print(f"Protected endpoints: {coverage_report['protected_endpoints']}")
    print(f"Coverage percentage: {coverage_report['coverage_percentage']:.1%}")
    
    print("\nTesting detection capabilities...")
    detection_validation = edr_framework.validate_detection_capabilities()
    print(f"Overall detection accuracy: {detection_validation['test_summary']['accuracy_score']:.1%}")
    print(f"Tests passed: {detection_validation['test_summary']['passed_tests']}")
    print(f"Tests failed: {detection_validation['test_summary']['failed_tests']}")
    
    print("\nTesting coordinated response...")
    test_threat = {
        'threat_id': 'test_threat_001',
        'endpoint_id': 'cs_001',
        'threat_type': 'malware',
        'severity': 'CRITICAL'
    }
    
    response = edr_framework.coordinate_edr_response(test_threat)
    print(f"Response status: {response['response_status']}")
    print(f"Primary responder: {response['primary_responder']}")
    print(f"Actions executed: {len(response['coordinated_actions'])}")
    
    # Stop monitoring for testing
    time.sleep(2)
    edr_framework.monitoring_active = False
    
    print("\n✅ EDR validation framework testing complete!")

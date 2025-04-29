import pyshark
from scapy.all import *
from typing import Dict, List, Set, Optional, Any
import numpy as np
from collections import defaultdict
import re
import ipaddress


class NetworkAnalyzer:
    """Base NetworkAnalyzer class"""
    
    def analyze_pcap(self, pcap_path: str) -> Dict[str, Any]:
        """Analyze pcap files"""
        # In a real implementation, this would parse the pcap file
        # For now, returning a simple structure
        return {"data_flows": []}

class AttackDetector:
    """Class dedicated to detecting various network attacks"""
    
    def __init__(self):
        self.attack_signatures = self._load_attack_signatures()
        self.threshold_metrics = self._load_threshold_metrics()
    
    def _load_attack_signatures(self) -> Dict[str, Dict]:
        return {
            "ddos": {
                "syn_flood": r"^(S|SA)$",
                "udp_flood": "UDP flood pattern",
                "icmp_flood": "ICMP flood pattern"
            },
            "scanning": {
                "port_scan": r"^S$",
                "ip_scan": "Sequential IP pattern",
                "vulnerability_scan": r"(NMAP|nikto|dirb)"
            },
            "injection": {
                "sql": r"(SELECT|UNION|INSERT|DROP|'--|;)",
                "xss": r"(<script>|javascript:|alert\(|onclick=)",
                "command": r"(;|\||`|>|<|\$\(|\&\&|\|\|)"
            },
            "malware": {
                "c2_beaconing": "Regular interval pattern",
                "data_exfil": "Large outbound data",
                "ransomware": r"\.(encrypt|locked|crypto|xxx|zzz)$"
            }
        }
    
    def _load_threshold_metrics(self) -> Dict[str, float]:
        return {
            "ddos_pps_threshold": 1000,      # packets per second
            "scan_unique_ports": 15,         # unique ports in timeframe
            "scan_timeframe": 60,            # seconds
            "data_exfil_size": 10485760,     # 10MB
            "beacon_interval_std": 0.1,       # standard deviation for regular beacons
            "max_failed_auth": 5,            # failed authentication attempts
            "suspicious_dns_length": 50,      # suspicious DNS query length
            "suspicious_file_size": 5242880,  # 5MB threshold for suspicious files
            "max_connections_per_min": 100    # maximum connections per minute
        }

class EnhancedNetworkAnalyzer(NetworkAnalyzer):
    def __init__(self):
        super().__init__()
        self.attack_detector = AttackDetector()
        self.attack_stats = defaultdict(int)
        self.connection_tracking = defaultdict(list)
        self.dns_tracking = defaultdict(list)
        self.known_malicious_ips = set()  # In practice, load this from a threat intelligence feed
    
    def analyze_pcap(self, pcap_path: str) -> Dict[str, Any]:
        """Enhanced analysis including attack detection"""
        try:
            # Read PCAP file using pyshark
            cap = pyshark.FileCapture(pcap_path)
            flows = self._process_packets(cap)
            
            # Add attack detection results
            attack_results = self._detect_attacks(flows)
            
            return {
                "data_flows": flows,
                "attack_detection": attack_results
            }
        except Exception as e:
            print(f"Error analyzing PCAP file: {str(e)}")
            return {"data_flows": [], "attack_detection": {}}

    def _process_packets(self, capture) -> List[Dict]:
        """Process packets from capture into flows"""
        flows = []
        for packet in capture:
            try:
                flow = self._packet_to_flow(packet)
                if flow:
                    flows.append(flow)
            except Exception as e:
                print(f"Error processing packet: {str(e)}")
        return flows

    def _packet_to_flow(self, packet) -> Optional[Dict]:
        """Convert packet to flow dictionary"""
        try:
            # Basic flow information
            flow = {
                'timestamp': float(packet.sniff_timestamp),
                'protocol': packet.transport_layer if hasattr(packet, 'transport_layer') else packet.highest_layer,
                'length': int(packet.length),
            }

            # Add IP information if available
            if hasattr(packet, 'ip'):
                flow.update({
                    'src_ip': packet.ip.src,
                    'dst_ip': packet.ip.dst
                })

            # Add port information if available
            if hasattr(packet, 'tcp'):
                flow.update({
                    'src_port': int(packet.tcp.srcport),
                    'dst_port': int(packet.tcp.dstport)
                })
            elif hasattr(packet, 'udp'):
                flow.update({
                    'src_port': int(packet.udp.srcport),
                    'dst_port': int(packet.udp.dstport)
                })

            return flow
        except Exception as e:
            print(f"Error converting packet to flow: {str(e)}")
            return None

    def _detect_attacks(self, flows: List[Dict]) -> Dict[str, List[Dict]]:
        """Comprehensive attack detection"""
        attack_results = {
            "ddos_attacks": self._detect_ddos(flows),
            "scanning_attacks": self._detect_scanning(flows),
            "data_exfiltration": self._detect_data_exfiltration(flows),
            "malware_activity": self._detect_malware_activity(flows),
            "suspicious_dns": self._analyze_dns_patterns(flows),
            "authentication_attacks": self._detect_auth_attacks(flows)
        }
        
        return attack_results

    def _detect_ddos(self, flows: List[Dict]) -> List[Dict]:
        """Detect various types of DDoS attacks"""
        ddos_attacks = []
        flow_stats = defaultdict(lambda: defaultdict(int))
        
        # Analyze in time windows
        window_size = 1  # 1 second windows
        for flow in flows:
            window = int(flow['timestamp'] / window_size)
            target = flow['dst_ip']
            
            # Count packets per second per target
            flow_stats[window][target] += 1
            
            # Check for threshold violations
            if flow_stats[window][target] > self.attack_detector.threshold_metrics['ddos_pps_threshold']:
                ddos_attacks.append({
                    "timestamp": flow['timestamp'],
                    "type": "possible_ddos",
                    "target": target,
                    "pps": flow_stats[window][target],
                    "severity": "high"
                })
        
        return ddos_attacks
    
    def _detect_scanning(self, flows: List[Dict]) -> List[Dict]:
        """Detect various scanning activities"""
        scan_results = []
        scanner_stats = defaultdict(lambda: {
            'ports': set(),
            'start_time': float('inf'),
            'end_time': 0
        })
        
        for flow in flows:
            scanner = flow['src_ip']
            scanner_stats[scanner]['ports'].add(flow['dst_port'])
            scanner_stats[scanner]['start_time'] = min(
                scanner_stats[scanner]['start_time'], 
                flow['timestamp']
            )
            scanner_stats[scanner]['end_time'] = max(
                scanner_stats[scanner]['end_time'], 
                flow['timestamp']
            )
            
            # Check for scanning patterns
            stats = scanner_stats[scanner]
            scan_duration = stats['end_time'] - stats['start_time']
            if (scan_duration <= self.attack_detector.threshold_metrics['scan_timeframe'] and
                len(stats['ports']) >= self.attack_detector.threshold_metrics['scan_unique_ports']):
                scan_results.append({
                    "timestamp": flow['timestamp'],
                    "type": "port_scan",
                    "scanner": scanner,
                    "ports_scanned": len(stats['ports']),
                    "duration": scan_duration,
                    "severity": "medium"
                })
        
        return scan_results
    
    def _detect_data_exfiltration(self, flows: List[Dict]) -> List[Dict]:
        """Detect potential data exfiltration"""
        exfil_results = []
        outbound_data = defaultdict(int)
        
        for flow in flows:
            if flow['dst_ip'] not in self.known_malicious_ips:
                continue
                
            outbound_data[flow['src_ip']] += flow['length']
            
            if outbound_data[flow['src_ip']] > self.attack_detector.threshold_metrics['data_exfil_size']:
                exfil_results.append({
                    "timestamp": flow['timestamp'],
                    "type": "data_exfiltration",
                    "source": flow['src_ip'],
                    "destination": flow['dst_ip'],
                    "data_volume": outbound_data[flow['src_ip']],
                    "severity": "high"
                })
        
        return exfil_results

    def _detect_suspicious_transfers(self, flows: List[Dict]) -> List[Dict]:
        """Detect suspicious file transfers"""
        suspicious_transfers = []
        transfer_sizes = defaultdict(int)
        
        for flow in flows:
            # Track data transfers by source-destination pair
            transfer_key = f"{flow['src_ip']}->{flow['dst_ip']}"
            transfer_sizes[transfer_key] += flow['length']
            
            # Check for suspicious file sizes
            if transfer_sizes[transfer_key] > self.attack_detector.threshold_metrics['suspicious_file_size']:
                src_ip, dst_ip = transfer_key.split('->')
                suspicious_transfers.append({
                    "timestamp": flow['timestamp'],
                    "type": "suspicious_transfer",
                    "source": src_ip,
                    "destination": dst_ip,
                    "transfer_size": transfer_sizes[transfer_key],
                    "severity": "medium"
                })
                
            # Check for high connection rates
            connections_per_min = self._calculate_connection_rate(flows, flow['src_ip'])
            if connections_per_min > self.attack_detector.threshold_metrics['max_connections_per_min']:
                suspicious_transfers.append({
                    "timestamp": flow['timestamp'],
                    "type": "high_connection_rate",
                    "source": flow['src_ip'],
                    "connections_per_min": connections_per_min,
                    "severity": "medium"
                })
        
        return suspicious_transfers

    def _calculate_connection_rate(self, flows: List[Dict], ip: str) -> float:
        """Calculate connection rate for an IP address"""
        timestamps = [
            flow['timestamp'] 
            for flow in flows 
            if flow['src_ip'] == ip
        ]
        
        if not timestamps:
            return 0.0
            
        # Calculate connections per minute
        time_window = (max(timestamps) - min(timestamps)) / 60  # convert to minutes
        if time_window == 0:
            return float(len(timestamps))
        return len(timestamps) / time_window

    def _detect_malware_activity(self, flows: List[Dict]) -> List[Dict]:
        """Detect potential malware activity"""
        malware_results = []
        
        # Check for C2 beaconing
        beaconing = self._detect_beaconing_behavior(flows)
        if beaconing:
            malware_results.extend(beaconing)
        
        # Check for suspicious file transfers
        suspicious_transfers = self._detect_suspicious_transfers(flows)
        if suspicious_transfers:
            malware_results.extend(suspicious_transfers)
        
        return malware_results

    def _detect_beaconing_behavior(self, flows: List[Dict]) -> List[Dict]:
        """Detect regular beaconing behavior indicative of C2"""
        beacons = []
        connection_intervals = defaultdict(list)
        
        # Group flows by source-destination pairs
        for flow in flows:
            key = f"{flow['src_ip']}->{flow['dst_ip']}"
            connection_intervals[key].append(flow['timestamp'])
        
        # Analyze intervals for regularity
        for connection, timestamps in connection_intervals.items():
            if len(timestamps) < 5:
                continue
                
            intervals = np.diff(sorted(timestamps))
            std_dev = np.std(intervals)
            
            if std_dev < self.attack_detector.threshold_metrics['beacon_interval_std']:
                src, dst = connection.split('->')
                beacons.append({
                    "timestamp": max(timestamps),
                    "type": "c2_beaconing",
                    "source": src,
                    "destination": dst,
                    "interval_std": std_dev,
                    "severity": "high"
                })
        
        return beacons
    
    def _analyze_dns_patterns(self, flows: List[Dict]) -> List[Dict]:
        """Analyze DNS patterns for suspicious activity"""
        suspicious_dns = []
        dns_queries = defaultdict(int)
        
        for flow in flows:
            if flow['protocol'] == 'DNS':
                # Check for suspicious domain length
                if hasattr(flow, 'dns') and hasattr(flow.dns, 'qry_name'):
                    query = flow.dns.qry_name
                    if len(query) > self.attack_detector.threshold_metrics['suspicious_dns_length']:
                        suspicious_dns.append({
                            "timestamp": flow['timestamp'],
                            "type": "suspicious_dns",
                            "query": query,
                            "length": len(query),
                            "severity": "medium"
                        })
        
        return suspicious_dns
    
    def _detect_auth_attacks(self, flows: List[Dict]) -> List[Dict]:
        """Detect authentication-based attacks"""
        auth_attacks = []
        failed_auths = defaultdict(int)
        
        for flow in flows:
            # Check for failed authentication patterns
            if (hasattr(flow, 'tcp') and flow['dst_port'] in {22, 3389, 445} and
                flow['length'] < 100):  # Typical failed auth packet size
                failed_auths[flow['src_ip']] += 1
                
                if failed_auths[flow['src_ip']] > self.attack_detector.threshold_metrics['max_failed_auth']:
                    auth_attacks.append({
                        "timestamp": flow['timestamp'],
                        "type": "brute_force",
                        "source": flow['src_ip'],
                        "target_port": flow['dst_port'],
                        "attempts": failed_auths[flow['src_ip']],
                        "severity": "high"
                    })
        
        return auth_attacks

    def generate_attack_report(self, attack_results: Dict) -> Dict:
        """Generate a comprehensive attack analysis report"""
        return {
            "summary": {
                "total_attacks_detected": sum(len(attacks) for attacks in attack_results.values()),
                "attack_types_detected": {
                    attack_type: len(attacks)
                    for attack_type, attacks in attack_results.items()
                    if attacks
                },
                "severity_distribution": self._calculate_severity_distribution(attack_results)
            },
            "detailed_findings": attack_results,
            "recommendations": self._generate_security_recommendations(attack_results)
        }
    
    def _calculate_severity_distribution(self, attack_results: Dict) -> Dict[str, int]:
        """Calculate distribution of attack severities"""
        severity_counts = defaultdict(int)
        
        for attack_type, attacks in attack_results.items():
            for attack in attacks:
                severity_counts[attack['severity']] += 1
        
        return dict(severity_counts)
    
    def _generate_security_recommendations(self, attack_results: Dict) -> List[str]:
        """Generate specific security recommendations based on detected attacks"""
        recommendations = []
        
        if any(attack_results['ddos_attacks']):
            recommendations.extend([
                "Implement DDoS protection measures such as rate limiting and traffic filtering",
                "Consider using a DDoS mitigation service",
                "Configure network equipment to handle traffic spikes"
            ])
        
        if any(attack_results['scanning_attacks']):
            recommendations.extend([
                "Configure firewall rules to limit port scanning and implement IDS/IPS",
                "Consider implementing network segmentation",
                "Enable logging for unauthorized access attempts"
            ])
        
        if any(attack_results['data_exfiltration']):
            recommendations.extend([
                "Implement data loss prevention (DLP) solutions and monitor outbound traffic",
                "Review and enforce data transfer policies",
                "Consider encrypting sensitive data at rest and in transit"
            ])
            
        if any(attack_results['malware_activity']):
            recommendations.extend([
                "Update antimalware solutions and ensure real-time protection",
                "Implement network behavior analysis tools",
                "Review and update security policies for malware prevention"
            ])
            
        if any(attack_results['suspicious_dns']):
            recommendations.extend([
                "Implement DNS monitoring and filtering",
                "Consider using a secure DNS service",
                "Review and update DNS security policies"
            ])
            
        if any(attack_results['authentication_attacks']):
            recommendations.extend([
                "Implement multi-factor authentication",
                "Review and update password policies",
                "Consider implementing account lockout policies"
            ])
        
        return recommendations
        
def main():
    """Main function to demonstrate the network analyzer usage"""
    # Create analyzer instance
    analyzer = EnhancedNetworkAnalyzer()

    try:
        # Analyze PCAP file
        results = analyzer.analyze_pcap("sample_traffic.pcap")

        # Generate attack report
        attack_report = analyzer.generate_attack_report(results["attack_detection"])

        # Print findings
        print("\nAttack Detection Results:")
        print("-" * 50)
        print(f"Total attacks detected: {attack_report['summary']['total_attacks_detected']}")
        
        print("\nAttack types detected:")
        for attack_type, count in attack_report['summary']['attack_types_detected'].items():
            print(f"- {attack_type}: {count}")
        
        print("\nSeverity Distribution:")
        for severity, count in attack_report['summary']['severity_distribution'].items():
            print(f"- {severity}: {count}")
        
        print("\nTop Security Recommendations:")
        for i, recommendation in enumerate(attack_report['recommendations'], 1):
            print(f"{i}. {recommendation}")

        # Print detailed findings if requested
        print("\nDetailed Findings:")
        for attack_type, attacks in results["attack_detection"].items():
            if attacks:
                print(f"\n{attack_type.upper()}:")
                for attack in attacks:
                    print(f"- {attack['type']} from {attack.get('source', 'Unknown')} "
                          f"(Severity: {attack['severity']})")

    except Exception as e:
        print(f"Error running analysis: {str(e)}")
        print("Please ensure the PCAP file exists and is readable")

if __name__ == "__main__":
    main()
    
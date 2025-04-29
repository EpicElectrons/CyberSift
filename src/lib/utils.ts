import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import CryptoJS from 'crypto-js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function calculateSHA256(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const fileContent = event.target?.result as ArrayBuffer;
        const wordArray = CryptoJS.lib.WordArray.create(fileContent);
        const hash = CryptoJS.SHA256(wordArray).toString();
        resolve(hash);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatTimestamp(timestamp: string | Date): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
}

// Mock attack types dataset
export const ATTACK_TYPES = [
  { id: 1, name: 'Ransomware', description: 'File encryption and extortion attacks' },
  { id: 2, name: 'DDoS', description: 'Distributed Denial of Service attacks' },
  { id: 3, name: 'SQLi', description: 'SQL Injection attacks targeting databases' },
  { id: 4, name: 'XSS', description: 'Cross-Site Scripting attacks targeting web applications' },
  { id: 5, name: 'Phishing', description: 'Social engineering attacks to steal credentials' },
  { id: 6, name: 'Malware', description: 'Malicious software infections' },
  { id: 7, name: 'Brute Force', description: 'Password cracking through repeated attempts' },
  { id: 8, name: 'Zero-day Exploit', description: 'Attacks using undisclosed vulnerabilities' },
  { id: 9, name: 'Man-in-the-Middle', description: 'Interception of communications' },
  { id: 10, name: 'Privilege Escalation', description: 'Gaining higher access levels' },
  { id: 11, name: 'Data Exfiltration', description: 'Unauthorized data extraction' },
  { id: 12, name: 'Backdoor', description: 'Hidden access mechanisms in systems' },
  { id: 13, name: 'Cryptojacking', description: 'Unauthorized cryptocurrency mining' },
  { id: 14, name: 'API Abuse', description: 'Misuse of application programming interfaces' },
  { id: 15, name: 'Supply Chain Attack', description: 'Compromise of software/hardware supply chain' },
];

// Mock AI analysis function
export function generateMockAIAnalysis(evidenceType: string): Promise<{
  attack: string;
  confidence: number;
  anomalyScore: number;
  iocs: string[];
  explanation: string;
}> {
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      // Randomly select attack type
      const attackType = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
      
      // Generate random confidence score between 60-95
      const confidence = Math.floor(Math.random() * 36) + 60;
      
      // Generate random anomaly score with similar range
      const anomalyScore = Math.floor(Math.random() * 36) + 60;
      
      // Generate IOCs based on attack type
      const iocs = generateMockIOCs(attackType.name, evidenceType);
      
      // Generate explanation
      const explanation = generateMockExplanation(attackType.name, confidence);
      
      resolve({
        attack: attackType.name,
        confidence,
        anomalyScore,
        iocs,
        explanation
      });
    }, Math.floor(Math.random() * 2000) + 1000); // Random delay between 1-3 seconds
  });
}

function generateMockIOCs(attackType: string, evidenceType: string): string[] {
  const commonIOCs = ['Unusual network traffic patterns', 'Unexpected system behavior'];
  
  const attackIOCs: Record<string, string[]> = {
    'Ransomware': ['File encryption activities', 'Suspicious registry modifications', 'Ransom note creation'],
    'DDoS': ['Unusual traffic spikes', 'High bandwidth usage', 'Traffic from multiple sources'],
    'SQLi': ['SQL syntax in user inputs', 'Database error messages', 'Unauthorized schema access'],
    'XSS': ['Script tags in user inputs', 'DOM manipulation attempts', 'Cookie theft patterns'],
    'Phishing': ['Suspicious email headers', 'Deceptive domain names', 'Credential harvesting forms'],
    'Malware': ['Suspicious file hashes', 'Unusual process behavior', 'Unauthorized system changes'],
    'Brute Force': ['Repeated failed login attempts', 'Credential stuffing patterns', 'Account lockouts'],
    'Zero-day Exploit': ['Unknown attack signatures', 'Unexpected vulnerability exploitation', 'Novel attack patterns'],
    'Man-in-the-Middle': ['Certificate abnormalities', 'Traffic redirection', 'SSL/TLS interception'],
    'Privilege Escalation': ['Unauthorized permission changes', 'Unexpected admin actions', 'Token manipulation'],
    'Data Exfiltration': ['Unusual data transfers', 'Sensitive data in outbound traffic', 'Unauthorized API usage'],
    'Backdoor': ['Persistent remote access', 'Unusual listening ports', 'Covert communication channels'],
    'Cryptojacking': ['High CPU usage', 'Mining script detection', 'Cryptocurrency wallet addresses'],
    'API Abuse': ['Excessive API requests', 'Endpoint fuzzing attempts', 'Parameter manipulation'],
    'Supply Chain Attack': ['Modified software packages', 'Compromised update mechanisms', 'Unauthorized code execution']
  };
  
  // Get specific IOCs for the attack type
  const specificIOCs = attackIOCs[attackType] || ['Suspicious activity detected'];
  
  // Add evidence-type specific IOCs
  if (evidenceType.toLowerCase().includes('pcap')) {
    specificIOCs.push('Anomalous network traffic detected', 'Suspicious packet signatures');
  } else if (evidenceType.toLowerCase().includes('log')) {
    specificIOCs.push('Suspicious log entries', 'Unusual event sequences');
  }
  
  // Combine common and specific IOCs and take 3-5 random ones
  const allIOCs = [...commonIOCs, ...specificIOCs];
  const numberOfIOCs = Math.floor(Math.random() * 3) + 3; // 3-5 IOCs
  const shuffled = allIOCs.sort(() => 0.5 - Math.random());
  
  return shuffled.slice(0, numberOfIOCs);
}

function generateMockExplanation(attackType: string, confidence: number): string {
  const explanations: Record<string, string[]> = {
    'Ransomware': [
      'Detection of file encryption patterns consistent with ransomware activity',
      'Multiple files being accessed and modified with encryption signatures',
      'Evidence of ransom note creation and system registry modifications'
    ],
    'DDoS': [
      'Abnormally high traffic volumes detected from multiple source IPs',
      'Traffic patterns consistent with distributed denial of service attacks',
      'Synchronized request patterns indicating botnet coordination'
    ],
    'SQLi': [
      'SQL syntax detected in user input fields',
      'Attempts to extract database schema information',
      'Multiple database error messages triggered by malformed requests'
    ],
    'XSS': [
      'Script injection attempts in web application inputs',
      'DOM manipulation code detected in HTTP requests',
      'Cookie theft patterns identified in client-side scripts'
    ],
    'Phishing': [
      'Email contains deceptive domain names mimicking legitimate services',
      'Presence of credential harvesting forms with suspicious destinations',
      'Social engineering techniques detected in message content'
    ],
    'Malware': [
      'Binary matches signatures of known malicious software',
      'Suspicious process behavior indicating malware execution',
      'File contains known malware code patterns'
    ],
    'Brute Force': [
      'High volume of failed authentication attempts detected',
      'Sequential or pattern-based password attempts identified',
      'Multiple account lockouts triggered in short timeframe'
    ],
    'Zero-day Exploit': [
      'Exploitation of previously unknown vulnerability detected',
      'Novel attack pattern not matching known signatures',
      'Unusual system behavior indicating new exploit technique'
    ],
    'Man-in-the-Middle': [
      'Evidence of traffic interception and modification',
      'Certificate validation failures indicating potential spoofing',
      'Abnormal routing patterns suggesting traffic redirection'
    ],
    'Privilege Escalation': [
      'Unexpected elevation of user permissions detected',
      'Administrative actions performed from non-admin account',
      'Manipulation of access tokens or credentials'
    ],
    'Data Exfiltration': [
      'Large data transfers to external destinations detected',
      'Sensitive data patterns identified in outbound traffic',
      'Unusual API usage extracting bulk information'
    ],
    'Backdoor': [
      'Persistent remote access mechanism identified',
      'Covert communication channel to external server detected',
      'Unauthorized system modifications enabling remote control'
    ],
    'Cryptojacking': [
      'Cryptocurrency mining code execution detected',
      'Abnormal CPU/GPU resource usage patterns',
      'Communication with known mining pools identified'
    ],
    'API Abuse': [
      'Excessive API requests exceeding normal usage patterns',
      'Systematic probing of API endpoints detected',
      'Parameter manipulation attempting to bypass security controls'
    ],
    'Supply Chain Attack': [
      'Modified software components with unauthorized code',
      'Compromised update mechanism delivering malicious payload',
      'Evidence of tampering in trusted software distribution'
    ]
  };

  const baseExplanations = explanations[attackType] || [
    'Suspicious activity detected in the evidence',
    'Anomalous patterns identified requiring further investigation',
    'Potential security incident detected based on behavior analysis'
  ];
  
  // Select a random explanation
  const baseExplanation = baseExplanations[Math.floor(Math.random() * baseExplanations.length)];
  
  // Add confidence-based qualifier
  let confidenceQualifier = '';
  if (confidence >= 90) {
    confidenceQualifier = 'High confidence classification based on multiple strong indicators.';
  } else if (confidence >= 75) {
    confidenceQualifier = 'Moderate to high confidence based on several clear indicators.';
  } else {
    confidenceQualifier = 'Moderate confidence based on partial indicator matches.';
  }
  
  return `${baseExplanation}. ${confidenceQualifier} Recommend further investigation to confirm findings.`;
}

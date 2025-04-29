import { PythonShell } from 'python-shell';
import path from 'path';
import { Evidence } from '@/db/schema';

export interface NetworkFeatures {
  Duration: number;
  Protocol: string | number;
  SrcPort: number;
  DstPort: number;
  FlowDuration: number;
  TotalFwdPackets: number;
  TotalBackwardPackets: number;
  FwdPacketLengthMax: number;
  FwdPacketLengthMin: number;
  FwdPacketLengthMean: number;
  FwdPacketLengthStd: number;
  BwdPacketLengthMax: number;
  BwdPacketLengthMin: number;
  BwdPacketLengthMean: number;
  BwdPacketLengthStd: number;
  FlowPacketsPerSecond: number;
  FlowBytesPerSecond: number;
  [key: string]: string | number;
}

export interface MLPredictionResult {
  isAttack: boolean;
  attackType: string | null;
  confidence: number;
  anomalyScore: number;
  predictions?: Record<string, number>;
  featureImportance?: Record<string, number>;
  modelUsed: string;
  error?: string;
}

export async function predictAttack(features: NetworkFeatures): Promise<MLPredictionResult> {
  try {
    const scriptPath = path.join(process.cwd(), 'src/lib/ml/predictor.py');
    
    const options = {
      mode: 'json' as const, // Type assertion to ensure it's the literal type
      pythonPath: 'python3',
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: path.dirname(scriptPath),
    };
    
    // Send the features to the Python script and get results
    return new Promise((resolve, reject) => {
      PythonShell.run(
        'predictor.py', 
        { 
          ...options,
          args: [JSON.stringify(features)]
        })
        .then(results => {
          if (!results || results.length === 0) {
            reject(new Error('No results returned from ML model'));
            return;
          }
          resolve(results[0] as MLPredictionResult);
        })
        .catch(err => {
          console.error('Error running ML prediction:', err);
          reject(err);
        });
    });
  } catch (error) {
    console.error('Error in predictAttack:', error);
    return {
      isAttack: false,
      attackType: null,
      confidence: 0,
      anomalyScore: 0,
      modelUsed: 'Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export function extractFeaturesFromEvidence(evidence: Evidence): NetworkFeatures {
  // In a real system, this would parse PCAP files or logs to extract network features
  // For this demo, we'll generate synthetic features based on the evidence type and name
  
  const baseFeatures: NetworkFeatures = {
    Duration: Math.random() * 100,
    Protocol: Math.random() > 0.5 ? 'TCP' : 'UDP',
    SrcPort: Math.floor(Math.random() * 65535),
    DstPort: Math.floor(Math.random() * 65535),
    FlowDuration: Math.random() * 1000,
    TotalFwdPackets: Math.floor(Math.random() * 500),
    TotalBackwardPackets: Math.floor(Math.random() * 500),
    FwdPacketLengthMax: Math.random() * 1500,
    FwdPacketLengthMin: Math.random() * 100,
    FwdPacketLengthMean: Math.random() * 500,
    FwdPacketLengthStd: Math.random() * 200,
    BwdPacketLengthMax: Math.random() * 1500,
    BwdPacketLengthMin: Math.random() * 100,
    BwdPacketLengthMean: Math.random() * 500,
    BwdPacketLengthStd: Math.random() * 200,
    FlowPacketsPerSecond: Math.random() * 100,
    FlowBytesPerSecond: Math.random() * 10000
  };

  // Modify features based on evidence type to simulate different attack patterns
  if (evidence.type.toLowerCase().includes('pcap')) {
    if (evidence.name.toLowerCase().includes('ddos')) {
      baseFeatures.FlowPacketsPerSecond *= 10;
      baseFeatures.FlowBytesPerSecond *= 10;
      baseFeatures.TotalFwdPackets *= 5;
    } else if (evidence.name.toLowerCase().includes('scan') || evidence.name.toLowerCase().includes('port')) {
      baseFeatures.DstPort = 22; // Common port scan target
      baseFeatures.Protocol = 'TCP';
      baseFeatures.Duration *= 0.2; // Shorter connections
    }
  } else if (evidence.type.toLowerCase().includes('log')) {
    if (evidence.name.toLowerCase().includes('brute')) {
      baseFeatures.DstPort = 22; // SSH port
      baseFeatures.TotalFwdPackets *= 3;
      baseFeatures.FlowDuration *= 2;
    } else if (evidence.name.toLowerCase().includes('sql') || evidence.name.toLowerCase().includes('inject')) {
      baseFeatures.DstPort = 80; // Web port
      baseFeatures.FwdPacketLengthMax *= 2;
    }
  }
  
  return baseFeatures;
}

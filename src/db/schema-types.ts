/**
 * Type definitions for MySQL database schema
 */

// User entity type
export type User = {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

// Case entity type
export type Case = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  threatScore: number | null;
  createdById: number | null;
  reporterName: string | null;
  reporterEmail: string | null;
  reporterPhone: string | null;
  attackType: string | null;
  sourceIp: string | null;
  aiConfidence: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type NewCase = Omit<Case, 'id'>;
export type UpdateCase = Partial<NewCase>;

// Evidence entity type
export type Evidence = {
  id: number;
  caseId: number;
  name: string;
  type: string;
  size: string | null;
  status: string;
  threatScore: number | null;
  hash: string | null;
  storagePath: string | null;
  uploadedById: number | null;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type NewEvidence = Omit<Evidence, 'id'>;
export type UpdateEvidence = Partial<NewEvidence>;

// Artifact entity type
export type Artifact = {
  id: number;
  evidenceId: number;
  name: string;
  type: string;
  path: string | null;
  timestamp: Date | null;
  threatScore: number | null;
  isMalicious: boolean | null;
  description: string | null;
  metadata: any | null;
  createdAt: Date;
  updatedAt: Date;
};

export type NewArtifact = Omit<Artifact, 'id'>;
export type UpdateArtifact = Partial<NewArtifact>;

// Analysis entity type
export type Analysis = {
  id: number;
  caseId: number;
  evidenceId: number | null;
  artifactId: number | null;
  type: string;
  result: any;
  model: string | null;
  createdById: number | null;
  createdAt: Date;
};

export type NewAnalysis = Omit<Analysis, 'id' | 'createdAt'>;

// Message entity type
export type Message = {
  id: number;
  caseId: number | null;
  role: string;
  content: string;
  model: string | null;
  userId: number | null;
  timestamp: Date;
};

export type NewMessage = Omit<Message, 'id'>;

// ThreatIntel entity type
export type ThreatIntel = {
  id: number;
  source: string;
  indicator: string;
  indicatorType: string;
  severity: number;
  description: string | null;
  caseId: number | null;
  createdAt: Date;
};

export type NewThreatIntel = Omit<ThreatIntel, 'id'>;

// AIAnalysis entity type
export type AIAnalysis = {
  id: number;
  evidenceId: number;
  confidence: number;
  detectedAttackType: string | null;
  anomalyScore: number | null;
  featureImportance: any | null;
  explanation: string | null;
  createdAt: Date;
};

export type NewAIAnalysis = Omit<AIAnalysis, 'id' | 'createdAt'>;

// MLPrediction entity type 
export type MLPrediction = {
  id: number;
  evidenceId: number;
  isAttack: boolean;
  attackType: string | null;
  confidence: number;
  featureImportance: any | null;
  anomalyScore: number | null;
  createdAt: Date;
  modelUsed: string;
};

export type NewMLPrediction = Omit<MLPrediction, 'id' | 'createdAt'>;

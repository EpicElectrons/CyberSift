/**
 * Database Schema and Helper Functions
 */

import { executeQuery } from "./mysql";
import { sql } from 'drizzle-orm';

// Import all types from schema-types.ts
import {
  User, NewUser,
  Case, NewCase, UpdateCase,
  Evidence, NewEvidence, UpdateEvidence,
  Artifact, NewArtifact, UpdateArtifact,
  Analysis, NewAnalysis,
  Message, NewMessage,
  ThreatIntel, NewThreatIntel,
  AIAnalysis, NewAIAnalysis,
  MLPrediction, NewMLPrediction
} from './schema-types';

// Export all types
export * from './schema-types';

// Define table references with proper column objects for query building
export const cases = {
  name: 'cases',
  id: sql`id`,
  status: sql`status`,
  createdAt: sql`createdAt`,
  updatedAt: sql`updatedAt`,
  title: sql`title`,
  description: sql`description`,
  threatScore: sql`threatScore`,
  createdById: sql`createdById`,
  reporterName: sql`reporterName`,
  reporterEmail: sql`reporterEmail`,
  reporterPhone: sql`reporterPhone`,
  attackType: sql`attackType`,
  sourceIp: sql`sourceIp`,
  aiConfidence: sql`aiConfidence`
};

export const evidence = {
  name: 'evidence',
  id: sql`id`,
  caseId: sql`caseId`,
  evidenceName: sql`name`,
  type: sql`type`,
  size: sql`size`,
  status: sql`status`,
  threatScore: sql`threatScore`,
  hash: sql`hash`,
  storagePath: sql`storagePath`,
  uploadedById: sql`uploadedById`,
  timestamp: sql`timestamp`,
  createdAt: sql`createdAt`,
  updatedAt: sql`updatedAt`
};

export const artifacts = {
  name: 'artifacts',
  id: sql`id`,
  evidenceId: sql`evidenceId`,
  artifactName: sql`name`,
  type: sql`type`,
  path: sql`path`,
  timestamp: sql`timestamp`,
  threatScore: sql`threatScore`,
  isMalicious: sql`isMalicious`,
  description: sql`description`,
  metadata: sql`metadata`,
  createdAt: sql`createdAt`,
  updatedAt: sql`updatedAt`
};

export const messages = {
  name: 'messages',
  id: sql`id`,
  caseId: sql`caseId`,
  role: sql`role`,
  content: sql`content`,
  model: sql`model`,
  userId: sql`userId`,
  timestamp: sql`timestamp`
};

export const threatIntel = {
  name: 'threat_intel',
  id: sql`id`,
  source: sql`source`,
  indicator: sql`indicator`,
  indicatorType: sql`indicatorType`,
  severity: sql`severity`,
  description: sql`description`,
  caseId: sql`caseId`,
  createdAt: sql`createdAt`
};

export const aiAnalysis = { 
  name: 'ai_analysis',
  id: sql`id`,
  evidenceId: sql`evidenceId`,
  confidence: sql`confidence`,
  detectedAttackType: sql`detectedAttackType`,
  anomalyScore: sql`anomalyScore`,
  featureImportance: sql`featureImportance`,
  explanation: sql`explanation`,
  createdAt: sql`createdAt`
};

export const mlPredictions = { 
  name: 'ml_predictions',
  id: sql`id`,
  evidenceId: sql`evidenceId`,
  isAttack: sql`isAttack`,
  attackType: sql`attackType`,
  confidence: sql`confidence`,
  featureImportance: sql`featureImportance`,
  anomalyScore: sql`anomalyScore`,
  createdAt: sql`createdAt`,
  modelUsed: sql`modelUsed`
};

export const users = {
  name: 'users',
  id: sql`id`,
  userName: sql`name`,
  email: sql`email`,
  avatarUrl: sql`avatarUrl`,
  role: sql`role`,
  createdAt: sql`createdAt`,
  updatedAt: sql`updatedAt`
};

// ------------------------------------------------------
// Database helper functions
// ------------------------------------------------------

/**
 * Get all cases with optional filters
 * @param filters Optional filters
 * @returns Array of cases
 */
export async function getAllCases(filters?: { status?: string }): Promise<Case[]> {
  let query = 'SELECT * FROM cases';
  const params: any[] = [];
  
  if (filters?.status) {
    query += ' WHERE status = ?';
    params.push(filters.status);
  }
  
  query += ' ORDER BY createdAt DESC';
  
  return executeQuery<Case[]>(query, params);
}

/**
 * Get case by ID
 * @param id Case ID
 * @returns Case or null if not found
 */
export async function getCaseById(id: number): Promise<Case | null> {
  const results = await executeQuery<Case[]>('SELECT * FROM cases WHERE id = ?', [id]);
  return results.length > 0 ? results[0] : null;
}

/**
 * Create new case
 * @param caseData Case data
 * @returns Created case
 */
export async function createCase(caseData: NewCase): Promise<Case> {
  const { 
    title, 
    description, 
    status, 
    threatScore, 
    createdById, 
    reporterName, 
    reporterEmail, 
    reporterPhone, 
    attackType, 
    sourceIp, 
    aiConfidence 
  } = caseData;
  
  const now = new Date();
  
  const result = await executeQuery<any>(
    'INSERT INTO cases (title, description, status, threatScore, createdById, reporterName, reporterEmail, reporterPhone, attackType, sourceIp, aiConfidence, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [title, description, status || 'active', threatScore, createdById, reporterName, reporterEmail, reporterPhone, attackType, sourceIp, aiConfidence, now, now]
  );
  
  return {
    ...caseData,
    id: result.insertId,
    createdAt: now,
    updatedAt: now
  } as Case;
}

/**
 * Update existing case
 * @param id Case ID
 * @param caseData Case data to update
 * @returns Updated case or null if not found
 */
export async function updateCase(id: number, caseData: UpdateCase): Promise<Case | null> {
  // Get existing case
  const existingCase = await getCaseById(id);
  if (!existingCase) return null;
  
  // Prepare update data
  const updateData: any = { ...caseData, updatedAt: new Date() };
  
  // Execute update
  await executeQuery(
    'UPDATE cases SET ? WHERE id = ?',
    [updateData, id]
  );
  
  // Return updated case
  return { ...existingCase, ...updateData };
}

/**
 * Get evidence by case ID
 * @param caseId Case ID
 * @returns Array of evidence
 */
export async function getEvidenceByCase(caseId: number): Promise<Evidence[]> {
  return executeQuery<Evidence[]>('SELECT * FROM evidence WHERE caseId = ? ORDER BY createdAt DESC', [caseId]);
}

/**
 * Get evidence by ID
 * @param id Evidence ID
 * @returns Evidence or null if not found
 */
export async function getEvidenceById(id: number): Promise<Evidence | null> {
  const results = await executeQuery<Evidence[]>('SELECT * FROM evidence WHERE id = ?', [id]);
  return results.length > 0 ? results[0] : null;
}

/**
 * Get artifacts by evidence ID
 * @param evidenceId Evidence ID
 * @returns Array of artifacts
 */
export async function getArtifactsByEvidence(evidenceId: number): Promise<Artifact[]> {
  return executeQuery<Artifact[]>('SELECT * FROM artifacts WHERE evidenceId = ? ORDER BY createdAt DESC', [evidenceId]);
}

/**
 * Create new evidence
 * @param evidenceData Evidence data
 * @returns Created evidence
 */
export async function createEvidence(evidenceData: NewEvidence): Promise<Evidence> {
  const { caseId, name, type, size, status, threatScore, hash, storagePath, uploadedById } = evidenceData;
  
  const now = new Date();
  const timestamp = evidenceData.timestamp || now;
  
  const result = await executeQuery<any>(
    'INSERT INTO evidence (caseId, name, type, size, status, threatScore, hash, storagePath, uploadedById, timestamp, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [caseId, name, type, size, status || 'processing', threatScore, hash, storagePath, uploadedById, timestamp, now, now]
  );
  
  return {
    ...evidenceData,
    id: result.insertId,
    timestamp,
    createdAt: now,
    updatedAt: now
  } as Evidence;
}

/**
 * Create new artifact
 * @param artifactData Artifact data
 * @returns Created artifact
 */
export async function createArtifact(artifactData: NewArtifact): Promise<Artifact> {
  const { evidenceId, name, type, path, timestamp, threatScore, isMalicious, description, metadata } = artifactData;
  
  const now = new Date();
  
  const result = await executeQuery<any>(
    'INSERT INTO artifacts (evidenceId, name, type, path, timestamp, threatScore, isMalicious, description, metadata, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [evidenceId, name, type, path, timestamp || now, threatScore, isMalicious, description, JSON.stringify(metadata), now, now]
  );
  
  return {
    ...artifactData,
    id: result.insertId,
    createdAt: now,
    updatedAt: now
  } as Artifact;
}

/**
 * Create new message
 * @param messageData Message data
 * @returns Created message
 */
export async function createMessage(messageData: NewMessage): Promise<Message> {
  const { caseId, role, content, model, userId, timestamp } = messageData;
  
  const result = await executeQuery<any>(
    'INSERT INTO messages (caseId, role, content, model, userId, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
    [caseId, role, content, model, userId, timestamp || new Date()]
  );
  
  return {
    ...messageData,
    id: result.insertId
  } as Message;
}

/**
 * Get messages by case ID
 * @param caseId Case ID
 * @returns Array of messages
 */
export async function getMessagesByCase(caseId: number): Promise<Message[]> {
  return executeQuery<Message[]>(
    'SELECT * FROM messages WHERE caseId = ? ORDER BY timestamp ASC',
    [caseId]
  );
}

/**
 * Get AI analysis by evidence ID
 * @param evidenceId Evidence ID
 * @returns AI analysis or null if not found
 */
export async function getAIAnalysis(evidenceId: number): Promise<AIAnalysis | null> {
  const results = await executeQuery<AIAnalysis[]>(
    'SELECT * FROM ai_analysis WHERE evidenceId = ?',
    [evidenceId]
  );
  return results.length > 0 ? results[0] : null;
}

/**
 * Create new AI analysis
 * @param analysisData AI analysis data
 * @returns Created AI analysis
 */
export async function createAIAnalysis(analysisData: NewAIAnalysis): Promise<AIAnalysis> {
  const { evidenceId, confidence, detectedAttackType, anomalyScore, featureImportance, explanation } = analysisData;
  
  const result = await executeQuery<any>(
    'INSERT INTO ai_analysis (evidenceId, confidence, detectedAttackType, anomalyScore, featureImportance, explanation, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [evidenceId, confidence, detectedAttackType, anomalyScore, JSON.stringify(featureImportance), explanation, new Date()]
  );
  
  return {
    ...analysisData,
    id: result.insertId,
    createdAt: new Date()
  } as AIAnalysis;
}

/**
 * Get ML prediction by evidence ID
 * @param evidenceId Evidence ID
 * @returns ML prediction or null if not found
 */
export async function getMLPredictionByEvidenceId(evidenceId: number): Promise<MLPrediction | null> {
  const results = await executeQuery<MLPrediction[]>(
    'SELECT * FROM ml_predictions WHERE evidenceId = ? ORDER BY createdAt DESC LIMIT 1',
    [evidenceId]
  );
  return results.length > 0 ? results[0] : null;
}

/**
 * Create new ML prediction
 * @param predictionData ML prediction data
 * @returns Created ML prediction
 */
export async function createMLPrediction(predictionData: NewMLPrediction): Promise<MLPrediction> {
  const { evidenceId, isAttack, attackType, confidence, featureImportance, anomalyScore, modelUsed } = predictionData;
  
  const result = await executeQuery<any>(
    'INSERT INTO ml_predictions (evidenceId, isAttack, attackType, confidence, featureImportance, anomalyScore, createdAt, modelUsed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [evidenceId, isAttack ? 1 : 0, attackType, confidence, JSON.stringify(featureImportance), anomalyScore, new Date(), modelUsed]
  );
  
  return {
    ...predictionData,
    id: result.insertId,
    createdAt: new Date()
  } as MLPrediction;
}

// Attack types constant based on ML model
export const ATTACK_TYPES = [
  { id: 1, name: 'DDoS', description: 'Distributed Denial of Service attacks' },
  { id: 2, name: 'Port Scan', description: 'Scanning for open ports and services' },
  { id: 3, name: 'Brute Force', description: 'Attempting to gain access through password guessing' },
  { id: 4, name: 'Web Attack', description: 'Attacks targeting web applications' },
  { id: 5, name: 'Infiltration', description: 'Unauthorized access to the network' },
  { id: 6, name: 'Botnet', description: 'Compromised devices in a botnet network' },
  { id: 7, name: 'FTP-Patator', description: 'Brute force attacks against FTP servers' },
  { id: 8, name: 'SSH-Patator', description: 'Brute force attacks against SSH servers' },
  { id: 9, name: 'DoS', description: 'Denial of Service attacks from a single source' },
  { id: 10, name: 'Heartbleed', description: 'Exploitation of the Heartbleed vulnerability' },
  { id: 11, name: 'SQL Injection', description: 'Injection of malicious SQL code' },
  { id: 12, name: 'XSS', description: 'Cross-site scripting attacks' },
  { id: 13, name: 'Normal', description: 'Regular network traffic with no attack' },
  { id: 14, name: 'Phishing', description: 'Social engineering attacks targeting credentials' },
  { id: 15, name: 'Ransomware', description: 'File encryption malware demanding payment' },
];

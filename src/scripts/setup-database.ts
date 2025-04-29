/**
 * Database Setup Script
 * 
 * This script initializes the database (MySQL or SQLite) and creates the necessary tables
 * Usage: bun run src/scripts/setup-database.ts
 */

import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { testConnection } from '../db/mysql';
import { initDatabase } from '../db/init-mysql';
import { Database } from 'sqlite3';
import { open } from 'sqlite';

// Load environment variables
config();

async function setup() {
  console.log('⚙️ Starting database setup...');
  
  try {
    // Test connection to database
    const connStatus = await testConnection();
    
    if (connStatus.connected) {
      console.log(`✅ Successfully connected to ${connStatus.type.toUpperCase()} database`);
      
      // Initialize database with tables
      if (connStatus.type === 'mysql') {
        await initDatabase();
      } else if (connStatus.type === 'sqlite') {
        await initSQLiteDatabase();
      }
      
      console.log('🚀 Database setup complete!');
    } else {
      console.error('❌ Could not connect to any database.');
      
      // Show MySQL connection details
      console.error('\nMySQL configuration:');
      console.error(`Host: ${process.env.MYSQL_HOST || 'localhost'}`);
      console.error(`Port: ${process.env.MYSQL_PORT || '3306'}`);
      console.error(`User: ${process.env.MYSQL_USER || 'root'}`);
      console.error(`Database: ${process.env.MYSQL_DATABASE || 'cybersift'}`);
      
      // Show SQLite configuration
      const sqlitePath = process.env.SQLITE_PATH || './data/cybersift.sqlite';
      console.error('\nSQLite configuration:');
      console.error(`Path: ${sqlitePath}`);
      console.error(`Exists: ${fs.existsSync(sqlitePath) ? 'Yes' : 'No'}`);
      
      console.error('\nOptions to fix:');
      console.error('1. Install and start MySQL server');
      console.error('2. Update .env file with correct database credentials');
      console.error('3. Set DB_TYPE=sqlite in .env to use SQLite instead');
      
      process.exit(1);
    }
    
    console.log('\n📋 Next steps:');
    console.log('1. Run the application: bun run dev');
    console.log('2. Access the application at: http://localhost:3000');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Initialize SQLite database
async function initSQLiteDatabase() {
  console.log('Initializing SQLite database...');
  const dbPath = process.env.SQLITE_PATH || './data/cybersift.sqlite';
  
  // Create directory if it doesn't exist
  const dbDir = path.dirname(dbPath);
  fs.mkdirSync(dbDir, { recursive: true });
  
  // Open SQLite database
  const db = await open({
    filename: dbPath,
    driver: Database
  });
  
  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      avatarUrl TEXT,
      role TEXT NOT NULL DEFAULT 'investigator',
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      threatScore INTEGER,
      createdById INTEGER,
      reporterName TEXT,
      reporterEmail TEXT,
      reporterPhone TEXT,
      attackType TEXT,
      sourceIp TEXT,
      aiConfidence INTEGER,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE SET NULL
    );
    
    CREATE TABLE IF NOT EXISTS evidence (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      caseId INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      size TEXT,
      status TEXT NOT NULL DEFAULT 'processing',
      threatScore INTEGER,
      hash TEXT,
      storagePath TEXT,
      uploadedById INTEGER,
      timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE,
      FOREIGN KEY (uploadedById) REFERENCES users(id) ON DELETE SET NULL
    );
    
    CREATE TABLE IF NOT EXISTS artifacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      evidenceId INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      path TEXT,
      timestamp TIMESTAMP,
      threatScore INTEGER,
      isMalicious INTEGER,
      description TEXT,
      metadata TEXT,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (evidenceId) REFERENCES evidence(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      caseId INTEGER,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      model TEXT,
      userId INTEGER,
      timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
    );
    
    CREATE TABLE IF NOT EXISTS ai_analysis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      evidenceId INTEGER NOT NULL,
      confidence INTEGER NOT NULL,
      detectedAttackType TEXT,
      anomalyScore INTEGER,
      featureImportance TEXT,
      explanation TEXT,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (evidenceId) REFERENCES evidence(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS ml_predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      evidenceId INTEGER NOT NULL,
      isAttack INTEGER NOT NULL,
      attackType TEXT,
      confidence REAL NOT NULL,
      featureImportance TEXT,
      anomalyScore REAL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      modelUsed TEXT NOT NULL,
      FOREIGN KEY (evidenceId) REFERENCES evidence(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS threat_intel (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      indicator TEXT NOT NULL,
      indicatorType TEXT NOT NULL,
      severity INTEGER NOT NULL,
      description TEXT,
      caseId INTEGER,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE
    );
  `);
  
  // Create indices
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_evidence_caseId ON evidence(caseId);
    CREATE INDEX IF NOT EXISTS idx_artifacts_evidenceId ON artifacts(evidenceId);
    CREATE INDEX IF NOT EXISTS idx_messages_caseId ON messages(caseId);
    CREATE INDEX IF NOT EXISTS idx_ai_analysis_evidenceId ON ai_analysis(evidenceId);
    CREATE INDEX IF NOT EXISTS idx_ml_predictions_evidenceId ON ml_predictions(evidenceId);
  `);
  
  // Insert default admin user
  await db.run(`
    INSERT OR IGNORE INTO users (name, email, role)
    VALUES ('Admin', 'admin@cybersift.io', 'admin')
  `);
  
  console.log('SQLite database initialized successfully');
}

// Run setup
setup();

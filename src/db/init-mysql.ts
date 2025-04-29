import { pool } from './mysql';

/**
 * Initialize the database by creating necessary tables if they don't exist
 */
async function initDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Connected to MySQL database');

    // Check if database exists, create if not
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DATABASE || 'cybersift'}`);
    await connection.query(`USE ${process.env.MYSQL_DATABASE || 'cybersift'}`);
    console.log(`Using database: ${process.env.MYSQL_DATABASE || 'cybersift'}`);

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        avatarUrl VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'investigator',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create cases table with ON DELETE CASCADE for more robust foreign key behavior
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cases (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        threatScore INT,
        createdById INT,
        reporterName VARCHAR(255),
        reporterEmail VARCHAR(255),
        reporterPhone VARCHAR(50),
        attackType VARCHAR(100),
        sourceIp VARCHAR(50),
        aiConfidence INT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create evidence table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS evidence (
        id INT PRIMARY KEY AUTO_INCREMENT,
        caseId INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        size VARCHAR(50),
        status VARCHAR(50) NOT NULL DEFAULT 'processing',
        threatScore INT,
        hash VARCHAR(255),
        storagePath VARCHAR(255),
        uploadedById INT,
        timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE,
        FOREIGN KEY (uploadedById) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create artifacts table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS artifacts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        evidenceId INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        path VARCHAR(255),
        timestamp DATETIME,
        threatScore INT,
        isMalicious BOOLEAN,
        description TEXT,
        metadata JSON,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (evidenceId) REFERENCES evidence(id) ON DELETE CASCADE
      )
    `);

    // Create analyses table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS analyses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        caseId INT NOT NULL,
        evidenceId INT,
        artifactId INT,
        type VARCHAR(50) NOT NULL,
        result JSON NOT NULL,
        model VARCHAR(100),
        createdById INT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE,
        FOREIGN KEY (evidenceId) REFERENCES evidence(id) ON DELETE CASCADE,
        FOREIGN KEY (artifactId) REFERENCES artifacts(id) ON DELETE CASCADE,
        FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create reports table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reports (
        id INT PRIMARY KEY AUTO_INCREMENT,
        caseId INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        format VARCHAR(50) NOT NULL DEFAULT 'pdf',
        storagePath VARCHAR(255),
        createdById INT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE,
        FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create notes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        caseId INT NOT NULL,
        evidenceId INT,
        artifactId INT,
        content TEXT NOT NULL,
        createdById INT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE,
        FOREIGN KEY (evidenceId) REFERENCES evidence(id) ON DELETE CASCADE,
        FOREIGN KEY (artifactId) REFERENCES artifacts(id) ON DELETE CASCADE,
        FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create messages table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        caseId INT,
        role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        model VARCHAR(100),
        userId INT,
        timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create threat_intel table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS threat_intel (
        id INT PRIMARY KEY AUTO_INCREMENT,
        source VARCHAR(100) NOT NULL,
        indicator VARCHAR(255) NOT NULL,
        indicatorType VARCHAR(50) NOT NULL,
        severity INT NOT NULL,
        description TEXT,
        caseId INT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE
      )
    `);

    // Create ai_analysis table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ai_analysis (
        id INT PRIMARY KEY AUTO_INCREMENT,
        evidenceId INT NOT NULL,
        confidence INT NOT NULL,
        detectedAttackType VARCHAR(100),
        anomalyScore INT,
        featureImportance JSON,
        explanation TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (evidenceId) REFERENCES evidence(id) ON DELETE CASCADE
      )
    `);

    // Create ml_predictions table for machine learning results
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ml_predictions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        evidenceId INT NOT NULL,
        isAttack BOOLEAN NOT NULL,
        attackType VARCHAR(100),
        confidence FLOAT NOT NULL,
        featureImportance JSON,
        anomalyScore FLOAT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        modelUsed VARCHAR(100) NOT NULL,
        FOREIGN KEY (evidenceId) REFERENCES evidence(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await connection.execute(`CREATE INDEX IF NOT EXISTS idx_evidence_caseId ON evidence (caseId)`);
    await connection.execute(`CREATE INDEX IF NOT EXISTS idx_artifacts_evidenceId ON artifacts (evidenceId)`);
    await connection.execute(`CREATE INDEX IF NOT EXISTS idx_messages_caseId ON messages (caseId)`);
    await connection.execute(`CREATE INDEX IF NOT EXISTS idx_ai_analysis_evidenceId ON ai_analysis (evidenceId)`);
    await connection.execute(`CREATE INDEX IF NOT EXISTS idx_ml_predictions_evidenceId ON ml_predictions (evidenceId)`);

    console.log('Database tables created or verified and indexes created');
    
    // Insert default admin user if not exists
    await connection.execute(`
      INSERT IGNORE INTO users (name, email, role)
      VALUES ('Admin', 'admin@cybersift.io', 'admin')
    `);
    console.log('Default admin user created if not exists');
    
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export { initDatabase };

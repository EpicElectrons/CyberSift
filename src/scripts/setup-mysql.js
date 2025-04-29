const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  // Database connection
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
  });

  try {
    console.log('Creating database if not exists...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS cybersift');
    console.log('Database "cybersift" created or already exists');
    
    await connection.execute('USE cybersift');
    
    console.log('Creating tables...');
    
    // Users table
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
    
    // Cases table
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
        FOREIGN KEY (createdById) REFERENCES users(id)
      )
    `);
    
    // Evidence table
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
        FOREIGN KEY (uploadedById) REFERENCES users(id)
      )
    `);
    
    // Additional tables...
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
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);
    
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
    
    // Insert default user
    console.log('Inserting default user...');
    await connection.execute(`
      INSERT IGNORE INTO users (name, email, role)
      VALUES ('Admin User', 'admin@cybersift.dev', 'admin')
    `);
    
    // Insert default case
    console.log('Inserting default case...');
    await connection.execute(`
      INSERT IGNORE INTO cases (title, description, status, threatScore, reporterName, reporterEmail, sourceIp)
      VALUES (
        'Network Intrusion Investigation', 
        'Investigation of potential network intrusion detected on April 25, 2025',
        'active',
        75,
        'Security Team',
        'security@example.com',
        '192.168.1.100'
      )
    `);
    
    console.log('Database setup complete!');
    
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await connection.end();
  }
}

setupDatabase();

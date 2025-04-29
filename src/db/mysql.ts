import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { Database } from 'sqlite3';
import { open } from 'sqlite';

// Database connection pool - will be initialized based on configuration
let pool: mysql.Pool | null = null;
let sqliteDb: any = null;

// Check if we're using SQLite as a fallback
const useMySQL = process.env.DB_TYPE !== 'sqlite';
const useSQLite = !useMySQL || process.env.DB_TYPE === 'both';

// Create MySQL connection pool if MySQL is enabled
if (useMySQL) {
  try {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'password',
      database: process.env.MYSQL_DATABASE || 'cybersift',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000, // 10 seconds
      ssl: process.env.MYSQL_SSL === 'true' ? {} : undefined
    });
    console.log('MySQL connection pool initialized');
  } catch (error) {
    console.error('Failed to initialize MySQL connection pool:', error);
    pool = null;
  }
}

// Initialize SQLite connection if needed
async function initSQLite() {
  if (!sqliteDb && useSQLite) {
    try {
      // Ensure data directory exists
      const dbDir = path.dirname(process.env.SQLITE_PATH || './data/cybersift.sqlite');
      fs.mkdirSync(dbDir, { recursive: true });
      
      // Open SQLite database
      sqliteDb = await open({
        filename: process.env.SQLITE_PATH || './data/cybersift.sqlite',
        driver: Database
      });
      
      console.log('SQLite database initialized');
    } catch (error) {
      console.error('Failed to initialize SQLite database:', error);
      sqliteDb = null;
    }
  }
  return sqliteDb;
}

/**
 * Execute a SQL query with optional parameters
 * @param query The SQL query to execute
 * @param params Optional parameters for the query
 * @returns The query result
 */
export async function executeQuery<T>(query: string, params: any[] = []): Promise<T> {
  // Try MySQL first if available
  if (pool) {
    try {
      const [rows] = await pool.execute(query, params);
      return rows as T;
    } catch (error) {
      console.error('MySQL query error:', error);
      
      // If we're not using SQLite as fallback, throw the error
      if (!useSQLite) throw error;
      
      console.log('Falling back to SQLite...');
    }
  }
  
  // Fall back to SQLite or use it directly if MySQL is disabled
  if (useSQLite) {
    try {
      const db = await initSQLite();
      if (!db) throw new Error('No SQLite connection available');
      
      // Convert MySQL query to SQLite format if needed
      const sqliteQuery = convertMySQLToSQLite(query);
      
      // Execute the query
      if (sqliteQuery.includes('INSERT INTO') && sqliteQuery.includes('RETURNING')) {
        // SQLite doesn't support RETURNING clause directly
        const result = await db.run(sqliteQuery.replace(/\s+RETURNING.*;?/i, ''), params);
        const lastId = result.lastID;
        
        // If the query was an INSERT, return the inserted row
        if (lastId) {
          const table = sqliteQuery.match(/INSERT INTO\s+(\w+)/i)?.[1];
          if (table) {
            const row = await db.get(`SELECT * FROM ${table} WHERE id = ?`, lastId);
            return [row] as unknown as T;
          }
        }
        return [{ id: lastId }] as unknown as T;
      } 
      
      // For SELECT queries
      if (sqliteQuery.toLowerCase().trim().startsWith('select')) {
        return await db.all(sqliteQuery, params) as T;
      }
      
      // For other queries (UPDATE, DELETE)
      const result = await db.run(sqliteQuery, params);
      return { 
        affectedRows: result.changes,
        insertId: result.lastID 
      } as unknown as T;
    } catch (error) {
      console.error('SQLite query error:', error);
      throw error;
    }
  }
  
  throw new Error('No database connection available');
}

/**
 * Convert MySQL queries to SQLite format
 */
function convertMySQLToSQLite(query: string): string {
  // Basic conversion of some MySQL-specific syntax to SQLite
  return query
    // Replace MySQL-specific NOW() function with SQLite's datetime('now')
    .replace(/NOW\(\)/gi, "datetime('now')")
    // Replace MySQL-specific CURRENT_TIMESTAMP function
    .replace(/CURRENT_TIMESTAMP/gi, "datetime('now')")
    // MySQL uses backticks for identifiers, SQLite uses double quotes
    .replace(/`([^`]+)`/g, '"$1"')
    // Replace AUTO_INCREMENT with AUTOINCREMENT
    .replace(/AUTO_INCREMENT/gi, 'AUTOINCREMENT')
    // SQLite doesn't support ON UPDATE clause
    .replace(/\s+ON UPDATE CURRENT_TIMESTAMP/gi, '');
}

/**
 * Test database connection
 * @returns Connection status and connection type
 */
export async function testConnection(): Promise<{ connected: boolean, type: 'mysql' | 'sqlite' | 'none' }> {
  // Try MySQL connection first
  if (pool) {
    try {
      const connection = await pool.getConnection();
      console.log('MySQL database connection successful');
      connection.release();
      return { connected: true, type: 'mysql' };
    } catch (error) {
      console.error('MySQL database connection failed:', error);
      
      // If SQLite is not enabled as fallback, return false
      if (!useSQLite) return { connected: false, type: 'none' };
    }
  }
  
  // Try SQLite connection if MySQL failed or is disabled
  if (useSQLite) {
    try {
      const db = await initSQLite();
      if (db) {
        // Test the connection with a simple query
        await db.get('SELECT 1');
        console.log('SQLite database connection successful');
        return { connected: true, type: 'sqlite' };
      }
    } catch (error) {
      console.error('SQLite database connection failed:', error);
    }
  }
  
  return { connected: false, type: 'none' };
}

// Initialize SQLite if we're using it
if (useSQLite) {
  initSQLite().catch(err => console.error('Failed to initialize SQLite:', err));
}

// Export the database connections
export { pool, sqliteDb };

import { NextResponse } from "next/server";
import { testConnection } from "@/db/mysql";
import fs from 'fs';

/**
 * GET /api/database/status - Check database connection status
 */
export async function GET() {
  try {
    const connStatus = await testConnection();
    
    // Get configured database type
    const configuredDbType = process.env.DB_TYPE || 'mysql';
    
    // Check if SQLite database file exists
    const sqliteDbPath = process.env.SQLITE_PATH || './data/cybersift.sqlite';
    const sqliteExists = fs.existsSync(sqliteDbPath);
    
    return NextResponse.json({
      connected: connStatus.connected,
      databaseType: connStatus.type,
      configuredType: configuredDbType,
      mysqlConfig: {
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT || '3306',
        database: process.env.MYSQL_DATABASE || 'cybersift',
      },
      sqliteConfig: {
        path: sqliteDbPath,
        exists: sqliteExists
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking database status:', error);
    
    return NextResponse.json({
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

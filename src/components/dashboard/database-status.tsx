'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, Database, AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
type DatabaseStatusData = {
  connected: boolean;
  databaseType: 'mysql' | 'sqlite' | 'none';
  configuredType: string;
  mysqlConfig?: {
    host: string;
    port: string;
    database: string;
  };
  sqliteConfig?: {
    path: string;
    exists: boolean;
  };
  error?: string;
};

/**
 * DatabaseStatus component - Shows database connection status
 */
export default function DatabaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'warning' | 'error'>('checking');
  const [dbInfo, setDbInfo] = useState<DatabaseStatusData | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/database/status');
      const data = await response.json();
      setDbInfo(data);
      if (data.connected) {
        // Connected but maybe using fallback
        if (data.configuredType === 'mysql' && data.databaseType === 'sqlite') {
          setStatus('warning'); // Connected but using fallback
        } else {
          setStatus('connected');
        }
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
      console.error('Error checking database connection:', error);
    } finally {
      setLastChecked(new Date());
      setIsChecking(false);
    }
  };
  useEffect(() => {
    checkConnection();
    // Check connection every 5 minutes
    const interval = setInterval(checkConnection, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  return <div data-unique-id="4aef2f1e-e988-4e76-87bb-25e9f3d7c066" data-loc="68:4-68:9" data-file-name="components/dashboard/database-status.tsx">
      <div className="flex items-center space-x-2 text-sm" data-unique-id="2fb98dc4-201f-4f61-8982-3ff61deb8f4c" data-loc="69:6-69:59" data-file-name="components/dashboard/database-status.tsx">
        <div className={cn("flex items-center p-1.5 rounded", status === 'connected' ? 'bg-green-50' : status === 'warning' ? 'bg-yellow-50' : status === 'error' ? 'bg-red-50' : 'bg-gray-50')} data-unique-id="cc1dbcd4-6440-4201-a058-61ad71264ad8" data-loc="70:8-78:9" data-file-name="components/dashboard/database-status.tsx">
          <Database className={cn("h-4 w-4 mr-1.5", status === 'connected' ? 'text-green-600' : status === 'warning' ? 'text-yellow-600' : status === 'error' ? 'text-red-600' : 'text-gray-600')} />
          <span className={cn("font-medium", status === 'connected' ? 'text-green-700' : status === 'warning' ? 'text-yellow-700' : status === 'error' ? 'text-red-700' : 'text-gray-700')} data-unique-id="98f6a6db-1a03-4a28-9656-96deeb55dff1" data-loc="86:10-92:13" data-file-name="components/dashboard/database-status.tsx">
            {dbInfo?.databaseType === 'mysql' ? 'MySQL' : dbInfo?.databaseType === 'sqlite' ? 'SQLite' : 'Database'}
          </span>
        </div>
        
        {status === 'connected' && <span className="text-green-600 flex items-center" data-unique-id="6ec04e3c-10e7-4944-ac84-4d8e9ed521bc" data-loc="102:10-102:61" data-file-name="components/dashboard/database-status.tsx">
            <CheckCircle className="h-4 w-4 mr-1" />
            Connected
          </span>}
        {status === 'warning' && <span className="text-yellow-600 flex items-center" data-unique-id="ed36ba10-22df-42c8-8617-ebbf44eef7db" data-loc="108:10-108:62" data-file-name="components/dashboard/database-status.tsx">
            <AlertCircle className="h-4 w-4 mr-1" />
            Using Fallback
          </span>}
        {status === 'error' && <span className="text-red-600 flex items-center" data-unique-id="2ebba96c-daba-423f-93a2-b818264f4c4d" data-loc="114:10-114:59" data-file-name="components/dashboard/database-status.tsx">
            <XCircle className="h-4 w-4 mr-1" />
            Disconnected
          </span>}
        {status === 'checking' && <span className="text-gray-600 flex items-center" data-unique-id="dff48f33-93e3-4998-83f5-6f058ae9b7ee" data-loc="120:10-120:60" data-file-name="components/dashboard/database-status.tsx">
            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            Checking...
          </span>}
        
        <button onClick={checkConnection} disabled={isChecking} className={cn("text-xs p-1 rounded transition-colors", isChecking ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50')} title="Refresh database status" data-unique-id="56ab1731-2761-4994-8a32-dc321c3cc7cf" data-loc="126:8-134:9" data-file-name="components/dashboard/database-status.tsx">
          {isChecking ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
        </button>
        
        <button onClick={() => setShowDetails(!showDetails)} className="text-xs p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" title="Show database details" data-unique-id="1d62f82e-210c-4640-8bda-1a079e87c4f8" data-loc="142:8-146:9" data-file-name="components/dashboard/database-status.tsx">
          <HelpCircle className="h-3 w-3" />
        </button>
        
        {lastChecked && <span className="text-xs text-gray-500" data-unique-id="f21e4906-ff8b-4559-8d74-9c0f081c807e" data-loc="151:10-151:50" data-file-name="components/dashboard/database-status.tsx">
            Last checked: {lastChecked.toLocaleTimeString()}
          </span>}
      </div>
      
      {showDetails && dbInfo && <div className="mt-2 p-3 bg-gray-50 rounded-md text-xs border border-gray-200" data-unique-id="953fc044-71d4-4987-8036-75c2367eba9f" data-loc="158:8-158:87" data-file-name="components/dashboard/database-status.tsx">
          <h4 className="font-medium mb-1" data-unique-id="d7d5987d-5ec7-41d5-9376-19298a130ad3" data-loc="159:10-159:43" data-file-name="components/dashboard/database-status.tsx">Database Details:</h4>
          <ul className="space-y-1" data-unique-id="d3d0266f-fd2c-4e03-8428-04a8813d7e5e" data-loc="160:10-160:36" data-file-name="components/dashboard/database-status.tsx">
            <li data-unique-id="6e0377ac-3d3f-4dd5-9baa-03ea1d7be0cd" data-loc="161:12-161:16" data-file-name="components/dashboard/database-status.tsx"><span className="font-medium" data-unique-id="4d9fa4f0-24e3-4cca-9c29-38a44dc2e4e8" data-loc="161:16-161:46" data-file-name="components/dashboard/database-status.tsx">Status:</span> {dbInfo.connected ? 'Connected' : 'Disconnected'}</li>
            <li data-unique-id="55c39744-6236-4eca-b4f8-81c63496d7bb" data-loc="162:12-162:16" data-file-name="components/dashboard/database-status.tsx"><span className="font-medium" data-unique-id="0986753e-ee03-414a-868e-a7361242d91e" data-loc="162:16-162:46" data-file-name="components/dashboard/database-status.tsx">Active Type:</span> {dbInfo.databaseType}</li>
            <li data-unique-id="54135c3d-1daf-43f7-a927-5007170720a1" data-loc="163:12-163:16" data-file-name="components/dashboard/database-status.tsx"><span className="font-medium" data-unique-id="091dc1a6-a958-4c39-b253-8e6b1461a1cd" data-loc="163:16-163:46" data-file-name="components/dashboard/database-status.tsx">Configured Type:</span> {dbInfo.configuredType}</li>
            
            {dbInfo.mysqlConfig && <li className="ml-2" data-unique-id="6e7b2b19-4a75-4bda-8850-e07ea04de53d" data-loc="166:14-166:35" data-file-name="components/dashboard/database-status.tsx">
                <span className="font-medium" data-unique-id="6bd3781b-346d-40ac-b170-f2ffcc2051bc" data-loc="167:16-167:46" data-file-name="components/dashboard/database-status.tsx">MySQL:</span> 
                {dbInfo.mysqlConfig.host}:{dbInfo.mysqlConfig.port}/{dbInfo.mysqlConfig.database}
              </li>}
            
            {dbInfo.sqliteConfig && <li className="ml-2" data-unique-id="4f9b59ba-3f94-4d16-8a69-aa06e45dc630" data-loc="173:14-173:35" data-file-name="components/dashboard/database-status.tsx">
                <span className="font-medium" data-unique-id="12544f05-2324-47e0-b068-539e0a003e5f" data-loc="174:16-174:46" data-file-name="components/dashboard/database-status.tsx">SQLite:</span> 
                {dbInfo.sqliteConfig.path} 
                ({dbInfo.sqliteConfig.exists ? 'File exists' : 'File not found'})
              </li>}
            
            {dbInfo.error && <li className="text-red-600" data-unique-id="622caf53-9b7b-4852-89dd-28f7ec87a805" data-loc="181:14-181:43" data-file-name="components/dashboard/database-status.tsx">{dbInfo.error}</li>}
          </ul>
        </div>}
    </div>;
}
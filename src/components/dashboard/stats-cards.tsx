'use client';

import { useState, useEffect } from 'react';
import { FileText, Shield, Cpu, AlertCircle, CheckCircle, Clock, BarChart2, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
type DashboardStats = {
  totalCases: number;
  activeCases: number;
  solvedCases: number;
  totalEvidence: number;
  criticalThreats: number;
  averageThreatScore: number;
  pendingAnalysis: number;
};
export default function StatsCards() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 0,
    activeCases: 0,
    solvedCases: 0,
    totalEvidence: 0,
    criticalThreats: 0,
    averageThreatScore: 0,
    pendingAnalysis: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // In a real app, we'd fetch this data from the API
    // For now, we'll simulate loading and then set mock data
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data
        setStats({
          totalCases: 24,
          activeCases: 13,
          solvedCases: 11,
          totalEvidence: 38,
          criticalThreats: 7,
          averageThreatScore: 68,
          pendingAnalysis: 5
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-unique-id="ae5b65dc-7db8-4473-8457-e83baf4d633f" data-loc="54:9-54:79" data-file-name="components/dashboard/stats-cards.tsx">
      <StatCard title="Total Cases" value={stats.totalCases} icon={<Database className="h-6 w-6 text-blue-600" />} isLoading={isLoading} secondaryValue={stats.activeCases} secondaryLabel="Active" gradient="bg-gradient-to-br from-blue-50 to-blue-100" accentColor="border-blue-200" />
      
      <StatCard title="Evidence Items" value={stats.totalEvidence} icon={<FileText className="h-6 w-6 text-indigo-600" />} isLoading={isLoading} secondaryValue={stats.pendingAnalysis} secondaryLabel="Pending Analysis" gradient="bg-gradient-to-br from-indigo-50 to-indigo-100" accentColor="border-indigo-200" />
      
      <StatCard title="Critical Threats" value={stats.criticalThreats} icon={<AlertCircle className="h-6 w-6 text-red-600" />} isLoading={isLoading} gradient="bg-gradient-to-br from-red-50 to-red-100" accentColor="border-red-200" />
      
      <StatCard title="Cases Solved" value={stats.solvedCases} icon={<CheckCircle className="h-6 w-6 text-green-600" />} isLoading={isLoading} secondaryValue={`${Math.round(stats.solvedCases / (stats.totalCases || 1) * 100)}%`} secondaryLabel="Success Rate" gradient="bg-gradient-to-br from-green-50 to-green-100" accentColor="border-green-200" />
    </div>;
}
type StatCardProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  isLoading: boolean;
  secondaryValue?: number | string;
  secondaryLabel?: string;
  gradient?: string;
  accentColor?: string;
};
function StatCard({
  title,
  value,
  icon,
  isLoading,
  secondaryValue,
  secondaryLabel,
  gradient = "bg-gradient-to-br from-gray-50 to-gray-100",
  accentColor = "border-gray-200"
}: StatCardProps) {
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className={cn("border rounded-xl p-6 shadow-sm", gradient, accentColor)} data-unique-id="7b140067-6822-496f-a3e9-d11ee14b440d" data-loc="84:9-90:78" data-file-name="components/dashboard/stats-cards.tsx">
      <div className="flex justify-between items-start" data-unique-id="22998147-d695-43e3-a17d-742dbb5d0f3b" data-loc="91:6-91:56" data-file-name="components/dashboard/stats-cards.tsx">
        <h3 className="text-sm font-medium text-gray-600" data-unique-id="64ca7c78-cd20-4a1c-86b3-31207a589246" data-loc="92:8-92:58" data-file-name="components/dashboard/stats-cards.tsx">{title}</h3>
        <div className="p-2 rounded-full bg-white shadow-sm" data-unique-id="a4a5f0bd-d635-4aec-8f07-303909706850" data-loc="93:8-93:61" data-file-name="components/dashboard/stats-cards.tsx">
          {icon}
        </div>
      </div>
      
      {isLoading ? <div className="animate-pulse mt-2" data-unique-id="dab4c8a7-3fc8-4f22-90b3-739f2131357f" data-loc="98:19-98:55" data-file-name="components/dashboard/stats-cards.tsx">
          <div className="h-8 bg-gray-200 rounded w-20" data-unique-id="ac5c28d5-7cbc-464b-b44f-f860e5e787f7" data-loc="99:10-99:56" data-file-name="components/dashboard/stats-cards.tsx"></div>
          {secondaryLabel && <div className="h-5 bg-gray-200 rounded w-16 mt-2" data-unique-id="0bdf9094-483a-42d4-b39f-9869f931fdff" data-loc="100:29-100:80" data-file-name="components/dashboard/stats-cards.tsx"></div>}
        </div> : <div className="mt-2" data-unique-id="2d54d19c-c1d3-4c9b-bd6b-ac074b4c3d28" data-loc="101:17-101:39" data-file-name="components/dashboard/stats-cards.tsx">
          <p className="text-3xl font-bold tracking-tighter" data-unique-id="2e6281a2-f6ac-4a3e-960c-3116dfb29650" data-loc="102:10-102:61" data-file-name="components/dashboard/stats-cards.tsx">
            {value}
          </p>
          
          {secondaryValue && secondaryLabel && <div className="flex items-center mt-2 text-sm text-gray-500" data-unique-id="0f1a96d1-043f-4dad-9b21-77658530ef06" data-loc="106:47-106:109" data-file-name="components/dashboard/stats-cards.tsx">
              <span className="font-medium" data-unique-id="8f219a51-9ea7-48bc-a143-0166990efd9d" data-loc="107:14-107:44" data-file-name="components/dashboard/stats-cards.tsx">{secondaryValue}</span>
              <span className="ml-1" data-unique-id="de276dda-6c48-4c31-8a60-cd9f3e7bd753" data-loc="108:14-108:37" data-file-name="components/dashboard/stats-cards.tsx">{secondaryLabel}</span>
            </div>}
        </div>}
    </motion.div>;
}
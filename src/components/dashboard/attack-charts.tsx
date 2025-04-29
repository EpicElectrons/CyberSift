'use client';

import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, RadialLinearScale } from 'chart.js';
import { Bar, Pie, Radar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, RadialLinearScale);

// Attack distribution data type
type AttackDistribution = {
  attackType: string;
  count: number;
  averageConfidence: number;
};
export default function AttackCharts() {
  const [attackDistribution, setAttackDistribution] = useState<AttackDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchAttackDistribution = async () => {
      setIsLoading(true);
      try {
        // In a real app, fetch from API
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Mock data
        setAttackDistribution([{
          attackType: 'Ransomware',
          count: 7,
          averageConfidence: 89
        }, {
          attackType: 'DDoS',
          count: 5,
          averageConfidence: 82
        }, {
          attackType: 'SQLi',
          count: 4,
          averageConfidence: 76
        }, {
          attackType: 'Phishing',
          count: 9,
          averageConfidence: 91
        }, {
          attackType: 'Malware',
          count: 6,
          averageConfidence: 84
        }, {
          attackType: 'Brute Force',
          count: 3,
          averageConfidence: 72
        }, {
          attackType: 'Data Exfiltration',
          count: 4,
          averageConfidence: 80
        }]);
      } catch (error) {
        console.error("Error fetching attack distribution:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttackDistribution();
  }, []);
  const barChartData = {
    labels: attackDistribution.map(item => item.attackType),
    datasets: [{
      label: 'Count',
      data: attackDistribution.map(item => item.count),
      backgroundColor: 'rgba(53, 162, 235, 0.6)',
      borderColor: 'rgba(53, 162, 235, 1)',
      borderWidth: 1
    }]
  };
  const pieChartData = {
    labels: attackDistribution.map(item => item.attackType),
    datasets: [{
      data: attackDistribution.map(item => item.count),
      backgroundColor: ['rgba(53, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(255, 205, 86, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)', 'rgba(201, 203, 207, 0.6)'],
      borderColor: ['rgba(53, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 205, 86, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 'rgba(201, 203, 207, 1)'],
      borderWidth: 1
    }]
  };
  const radarChartData = {
    labels: attackDistribution.map(item => item.attackType),
    datasets: [{
      label: 'Average Confidence',
      data: attackDistribution.map(item => item.averageConfidence),
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(255, 99, 132, 1)',
      pointRadius: 4
    }]
  };
  return <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-unique-id="a1f7caeb-8237-4aaa-ac33-2b650ab29405" data-loc="97:9-97:64" data-file-name="components/dashboard/attack-charts.tsx">
      {isLoading ? <div className="col-span-3 flex flex-col items-center justify-center p-10" data-unique-id="2c1b0729-4161-49f5-9089-b8c6c900d676" data-loc="98:19-98:94" data-file-name="components/dashboard/attack-charts.tsx">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500" data-unique-id="ffb6403b-f345-43a3-87a4-fac468dda151" data-loc="100:10-100:39" data-file-name="components/dashboard/attack-charts.tsx">Loading attack statistics...</p>
        </div> : <>
          <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }} className="col-span-1 lg:col-span-1 bg-white border rounded-xl p-4 shadow-sm min-h-[300px]" data-unique-id="52b68964-b4bf-4a24-af95-0ac8e176c112" data-loc="102:10-110:101" data-file-name="components/dashboard/attack-charts.tsx">
            <h3 className="font-medium mb-4 px-2" data-unique-id="722b3b7b-8430-4447-b397-ef22ab07e56e" data-loc="111:12-111:50" data-file-name="components/dashboard/attack-charts.tsx">Attack Distribution</h3>
            <Pie data={pieChartData} options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 15,
                font: {
                  size: 11
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.label || '';
                  const value = context.raw as number || 0;
                  const total = (context.chart.data.datasets[0].data as number[]).reduce((a, b) => (a as number) + (b as number), 0) as number;
                  const percentage = Math.round(value / total * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }} />
          </motion.div>
          
          <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }} className="col-span-1 lg:col-span-2 bg-white border rounded-xl p-4 shadow-sm min-h-[300px]" data-unique-id="71fa034c-7719-45ef-ace0-3928a6535d16" data-loc="140:10-148:101" data-file-name="components/dashboard/attack-charts.tsx">
            <h3 className="font-medium mb-4 px-2" data-unique-id="2752e6d8-39e0-4048-ab9e-eeae59499281" data-loc="149:12-149:50" data-file-name="components/dashboard/attack-charts.tsx">Attack Frequency</h3>
            <Bar data={barChartData} options={{
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              },
              title: {
                display: true,
                text: 'Number of Incidents'
              }
            },
            x: {
              ticks: {
                font: {
                  size: 11
                }
              }
            }
          }
        }} />
          </motion.div>
          
          <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }} className="col-span-1 lg:col-span-3 bg-white border rounded-xl p-4 shadow-sm min-h-[300px]" data-unique-id="d6990c3c-1d8b-4a68-bbd2-111b26a37cc7" data-loc="180:10-188:101" data-file-name="components/dashboard/attack-charts.tsx">
            <h3 className="font-medium mb-4 px-2" data-unique-id="98ed36c0-90b0-434d-b92d-21b14e0c8ec6" data-loc="189:12-189:50" data-file-name="components/dashboard/attack-charts.tsx">Detection Confidence by Attack Type</h3>
            <div className="max-h-[350px]" data-unique-id="b5b8aad4-b9a0-4486-9880-1a88b9481523" data-loc="190:12-190:43" data-file-name="components/dashboard/attack-charts.tsx">
              <Radar data={radarChartData} options={{
            responsive: true,
            maintainAspectRatio: true,
            scales: {
              r: {
                angleLines: {
                  display: true
                },
                suggestedMin: 50,
                suggestedMax: 100,
                ticks: {
                  stepSize: 10
                }
              }
            }
          }} />
            </div>
          </motion.div>
        </>}
    </div>;
}
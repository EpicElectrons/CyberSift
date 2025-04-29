"use client";

import { useState, useRef, useEffect } from "react";
import DatabaseStatus from "@/components/dashboard/database-status";
import { Send, Loader2, Upload, Download, AlertCircle, FileText, CheckCircle, Shield, Search, Cpu, Download as DownloadIcon, BarChart3, Trash2, Clock, Code, PieChart, Zap, PlusCircle, Network, AlertOctagon, BarChart2, FileBarChart, Globe, Target, Radar, Wifi, X } from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";
import { formatTimestamp } from "@/lib/utils";
import UploadForm from "@/components/evidence/upload-form";
import AIResults from "@/components/analysis/ai-results";
import StatsCards from "@/components/dashboard/stats-cards";
import AttackCharts from "@/components/dashboard/attack-charts";
import { motion, AnimatePresence } from "framer-motion";
import { generateText, generateTextStream, getTextProviders } from "@/lib/api/util";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from 'uuid';

// Types for the digital forensics system
type EvidenceStatus = "processing" | "analyzed" | "flagged" | "cleared";
type Evidence = {
  id: number;
  caseId: number;
  name: string;
  type: string;
  size: string;
  timestamp: string;
  status: EvidenceStatus;
  threatScore: number;
  hash: string;
  storagePath?: string;
  uploadedById?: number;
  createdAt: string;
  updatedAt: string;
};
type Artifact = {
  id: number;
  evidenceId: number;
  name: string;
  type: string;
  path: string;
  timestamp: string;
  threatScore: number;
  isMalicious: boolean;
  description: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
};
type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  model?: string;
  userId?: number;
  caseId?: number;
};
type Case = {
  id: number;
  title: string;
  description?: string;
  status: string;
  threatScore?: number;
  createdById?: number;
  createdAt: string;
  updatedAt: string;
  reporterName?: string;
  reporterEmail?: string;
  reporterPhone?: string;
  attackType?: string;
  sourceIp?: string;
  detectedIps?: string[];
  aiConfidence?: number;
  threatIntelData?: ThreatIntelData[];
};
type ThreatIntelData = {
  id: string;
  source: string;
  indicator: string;
  type: string;
  severity: number;
  description: string;
  timestamp: string;
};
type AIAnalysisResult = {
  confidence: number;
  detectedAttackType: string;
  anomalyScore: number;
  featureImportance: Record<string, number>;
  explanation: string;
};
type Tab = "dashboard" | "evidence" | "analysis" | "timeline" | "threats" | "reports";
export default function ForensicsInterface() {
  // Render the threats tab
  const renderThreats = () => <div className="p-6" data-unique-id="ba752700-79e1-4aa6-a4d6-6d42f7f095f8" data-loc="94:30-94:51" data-file-name="components/chat/chat-interface.tsx">
      <div className="flex justify-between items-center mb-6" data-unique-id="f375bf7c-1d4d-4a72-ab6c-1f0714e59094" data-loc="95:6-95:62" data-file-name="components/chat/chat-interface.tsx">
        <h2 className="text-2xl font-semibold" data-unique-id="e876919c-dd6a-4115-8f13-d32d101704c5" data-loc="96:8-96:47" data-file-name="components/chat/chat-interface.tsx">Threat Intelligence</h2>
        <div className="flex space-x-2" data-unique-id="8db46b67-75a6-44f9-88be-db059d480ee8" data-loc="97:8-97:40" data-file-name="components/chat/chat-interface.tsx">
          <button className="py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center" data-unique-id="bb644b25-9730-4031-926a-d142e50ae5ca" data-loc="98:10-98:127" data-file-name="components/chat/chat-interface.tsx">
            <Wifi className="w-4 h-4 mr-2" />
            Check Network
          </button>
          <button className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center" data-unique-id="24ca179f-bae0-4b09-8aa1-6f5d03da14a6" data-loc="102:10-102:128" data-file-name="components/chat/chat-interface.tsx">
            <Radar className="w-4 h-4 mr-2" />
            Scan New IP
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-unique-id="5a1ab397-3fd5-4730-9813-aeec814de5bd" data-loc="109:6-109:61" data-file-name="components/chat/chat-interface.tsx">
        {/* Threat Intelligence Feed */}
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden" data-unique-id="38102fbc-1f55-4a13-8d33-b83cee486bb9" data-loc="111:8-111:78" data-file-name="components/chat/chat-interface.tsx">
          <div className="p-4 border-b bg-gray-50" data-unique-id="24f48dac-d7f5-4017-9d98-857ab31a3141" data-loc="112:10-112:51" data-file-name="components/chat/chat-interface.tsx">
            <h3 className="font-semibold text-gray-800" data-unique-id="a800a0ed-6542-4587-ae4c-dd29088f2b98" data-loc="113:12-113:56" data-file-name="components/chat/chat-interface.tsx">Live Threat Feed</h3>
          </div>
          
          <div className="max-h-[600px] overflow-y-auto" data-unique-id="3b6f5dea-c614-4666-8653-35a3dd6f8422" data-loc="116:10-116:57" data-file-name="components/chat/chat-interface.tsx">
            {threatAlerts.length === 0 ? <div className="p-8 text-center" data-unique-id="e47e9c1c-4afc-4294-9548-7dc6958654bf" data-loc="117:41-117:74" data-file-name="components/chat/chat-interface.tsx">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500" data-unique-id="151ee05f-e3e1-4744-bb0e-001b47ce5842" data-loc="119:16-119:45" data-file-name="components/chat/chat-interface.tsx">No threats detected yet</p>
              </div> : <div className="divide-y" data-unique-id="6c3355ed-5017-40a5-9154-4e92e31a0e24" data-loc="120:23-120:49" data-file-name="components/chat/chat-interface.tsx">
                {threatAlerts.map(alert => <div key={alert.id} className="p-4 hover:bg-gray-50" data-unique-id="c50ec1b8-2c8a-4624-83c3-6e3446c38646" data-loc="121:43-121:96" data-file-name="components/chat/chat-interface.tsx">
                    <div className="flex items-center justify-between mb-2" data-unique-id="a0143ee2-6543-42c2-9d65-6bb615179399" data-loc="122:20-122:76" data-file-name="components/chat/chat-interface.tsx">
                      <div className="flex items-center" data-unique-id="5aecae96-35a1-470f-9fff-98d63f5cc2f4" data-loc="123:22-123:57" data-file-name="components/chat/chat-interface.tsx">
                        <div className={cn("w-2 h-2 rounded-full mr-2", alert.severity > 7 ? "bg-red-500" : alert.severity > 5 ? "bg-amber-500" : "bg-yellow-500")} data-unique-id="c0004931-6d5c-4459-a940-4e7c403df133" data-loc="124:24-124:166" data-file-name="components/chat/chat-interface.tsx" />
                        <span className="font-medium" data-unique-id="37366619-5b77-4d26-b74e-ecdd7d67e1d2" data-loc="125:24-125:54" data-file-name="components/chat/chat-interface.tsx">{alert.indicator}</span>
                      </div>
                      <span className="text-sm text-gray-500" data-unique-id="1db26cfe-3b56-4913-820a-3bc5c7f429a2" data-loc="127:22-127:62" data-file-name="components/chat/chat-interface.tsx">{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-2" data-unique-id="29c89fd3-220f-4d05-b44a-534a679b0d5b" data-loc="130:20-130:82" data-file-name="components/chat/chat-interface.tsx">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs mr-2" data-unique-id="f56b56dc-7bf4-4ace-8c4c-3219e4fd0600" data-loc="131:22-131:99" data-file-name="components/chat/chat-interface.tsx">{alert.source}</span>
                      <span data-unique-id="70642930-feb2-48f9-8901-edd141acd4aa" data-loc="132:22-132:28" data-file-name="components/chat/chat-interface.tsx">{alert.type}</span>
                    </div>
                    
                    <p className="text-gray-700" data-unique-id="8091ebc0-9313-4326-9ca6-e40ac35c094a" data-loc="135:20-135:49" data-file-name="components/chat/chat-interface.tsx">{alert.description}</p>
                    
                    <div className="flex justify-end mt-2" data-unique-id="33d9d48b-ea72-42a9-b1d8-4bbc51516915" data-loc="137:20-137:59" data-file-name="components/chat/chat-interface.tsx">
                      <button className="text-sm text-blue-600 hover:text-blue-800" data-unique-id="66cf4bc5-821a-4c6d-8428-7a986ac167f6" data-loc="138:22-138:84" data-file-name="components/chat/chat-interface.tsx">View Details</button>
                    </div>
                  </div>)}
              </div>}
          </div>
        </div>
        
        {/* Threat Map & Statistics */}
        <div className="space-y-6" data-unique-id="2111a6ee-dd5f-4889-adcf-bc41f8c524f1" data-loc="146:8-146:35" data-file-name="components/chat/chat-interface.tsx">
          <div className="bg-white border rounded-lg shadow-sm p-6" data-unique-id="b19ef581-7945-4740-97b9-e18a79e50bce" data-loc="147:10-147:68" data-file-name="components/chat/chat-interface.tsx">
            <h3 className="font-semibold text-gray-800 mb-4" data-unique-id="d46f18fd-d313-4498-8255-d83ee8808b9d" data-loc="148:12-148:61" data-file-name="components/chat/chat-interface.tsx">Threat Statistics</h3>
            <div className="grid grid-cols-2 gap-4" data-unique-id="ff67da64-9b8c-42dc-bfc7-18c630ef2161" data-loc="149:12-149:52" data-file-name="components/chat/chat-interface.tsx">
              <div className="p-4 bg-gray-50 rounded-lg" data-unique-id="45f3f97b-6c80-425f-a72a-9f5139da3c4a" data-loc="150:14-150:57" data-file-name="components/chat/chat-interface.tsx">
                <h4 className="text-sm text-gray-500 mb-1" data-unique-id="525682ed-a0c2-43bd-952c-67f86fef8e88" data-loc="151:16-151:59" data-file-name="components/chat/chat-interface.tsx">Critical Threats</h4>
                <p className="text-3xl font-bold text-red-600" data-unique-id="53761037-4118-4392-b4ad-207ca4d06aa4" data-loc="152:16-152:63" data-file-name="components/chat/chat-interface.tsx">
                  {threatAlerts.filter(t => t.severity > 7).length}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg" data-unique-id="0228ea17-46e3-489f-9dd8-a58b015e4b98" data-loc="156:14-156:57" data-file-name="components/chat/chat-interface.tsx">
                <h4 className="text-sm text-gray-500 mb-1" data-unique-id="9fa72fd6-6d71-425e-8663-a5e19bbb6b67" data-loc="157:16-157:59" data-file-name="components/chat/chat-interface.tsx">Moderate Threats</h4>
                <p className="text-3xl font-bold text-amber-600" data-unique-id="5d7a949a-b535-4725-a9fe-e5a522f8f827" data-loc="158:16-158:65" data-file-name="components/chat/chat-interface.tsx">
                  {threatAlerts.filter(t => t.severity <= 7 && t.severity > 5).length}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg" data-unique-id="a1b6dab9-0a5f-4bf9-87b6-da482b2dbccd" data-loc="162:14-162:57" data-file-name="components/chat/chat-interface.tsx">
                <h4 className="text-sm text-gray-500 mb-1" data-unique-id="6e11c758-3157-4097-9558-298ea39cf482" data-loc="163:16-163:59" data-file-name="components/chat/chat-interface.tsx">Source Types</h4>
                <p className="text-3xl font-bold text-blue-600" data-unique-id="a94bc1cf-d7a6-48c8-887c-8a8607894415" data-loc="164:16-164:64" data-file-name="components/chat/chat-interface.tsx">
                  {new Set(threatAlerts.map(t => t.source)).size}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg" data-unique-id="f7764866-384c-490b-b6d3-99e1539680fc" data-loc="168:14-168:57" data-file-name="components/chat/chat-interface.tsx">
                <h4 className="text-sm text-gray-500 mb-1" data-unique-id="31c17639-ef76-4820-a23f-800aef3aaa6d" data-loc="169:16-169:59" data-file-name="components/chat/chat-interface.tsx">Average Severity</h4>
                <p className="text-3xl font-bold text-purple-600" data-unique-id="08eae6ae-eda3-4e96-a979-2d9701fa185e" data-loc="170:16-170:66" data-file-name="components/chat/chat-interface.tsx">
                  {threatAlerts.length > 0 ? (threatAlerts.reduce((acc, curr) => acc + curr.severity, 0) / threatAlerts.length).toFixed(1) : "N/A"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg shadow-sm p-6" data-unique-id="33cfd7f8-7b52-4d22-90e4-15c40d6418ef" data-loc="177:10-177:68" data-file-name="components/chat/chat-interface.tsx">
            <h3 className="font-semibold text-gray-800 mb-4" data-unique-id="7cf3a348-299d-4678-8b4d-aba866849144" data-loc="178:12-178:61" data-file-name="components/chat/chat-interface.tsx">Threat Sources</h3>
            <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300" data-unique-id="f7cdf9b4-1701-4ec8-92c8-bc3cd654194a" data-loc="179:12-179:131" data-file-name="components/chat/chat-interface.tsx">
              {/* This would be a real map visualization in a production app */}
              <div className="text-center" data-unique-id="66db1d64-ed21-4bf4-85d3-453e5544f7ce" data-loc="181:14-181:43" data-file-name="components/chat/chat-interface.tsx">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500" data-unique-id="43cecd3a-2f0b-4cc5-9a17-a7c051a9c614" data-loc="183:16-183:45" data-file-name="components/chat/chat-interface.tsx">Global threat map visualization</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
  // State management
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<number | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([{
    role: "system",
    content: "Cybersift is ready to assist with your digital forensics investigation. How can I help you today?",
    timestamp: new Date().toISOString()
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCreateCaseDialog, setShowCreateCaseDialog] = useState(false);
  const [newCaseTitle, setNewCaseTitle] = useState("");
  const [newCaseDescription, setNewCaseDescription] = useState("");
  const [selectedModel, setSelectedModel] = useState(getTextProviders()[0]);

  // New state for Cybersift features
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [attackType, setAttackType] = useState<string>("");
  const [attackTypes, setAttackTypes] = useState(["Phishing", "Malware", "DDoS", "Ransomware", "Data Breach", "SQL Injection", "XSS", "Social Engineering", "Insider Threat", "Supply Chain Attack", "Zero-day Exploit", "Cryptojacking", "API Abuse", "Privilege Escalation", "Other"]);
  const [sourceIp, setSourceIp] = useState("");
  const [isDetectingIp, setIsDetectingIp] = useState(false);
  const [threatAlerts, setThreatAlerts] = useState<ThreatIntelData[]>([]);
  const [showAIAnalysisDialog, setShowAIAnalysisDialog] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [selectedEvidenceForAnalysis, setSelectedEvidenceForAnalysis] = useState<Evidence | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Functions to manage scrolling
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load data from database
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        // Fetch cases
        const casesResponse = await fetch('/api/cases');
        if (casesResponse.ok) {
          const casesData = await casesResponse.json();
          setCases(casesData);

          // If we have cases and none is selected, select the first one
          if (casesData.length > 0 && !selectedCase) {
            setSelectedCase(casesData[0].id);
          }
        }

        // Set up socket.io for real-time threat alerts
        try {
          // In a real implementation, this would connect to your Socket.IO server
          // For demo purposes, we'll simulate incoming alerts
          const simulateAlert = () => {
            const newAlert: ThreatIntelData = {
              id: "alert-" + Math.random().toString(36).substring(2, 9),
              source: Math.random() > 0.5 ? "ThreatFox" : "AlienVault OTX",
              indicator: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
              type: "IP Address",
              severity: Math.floor(Math.random() * 5) + 5,
              description: "Newly identified threat actor infrastructure",
              timestamp: new Date().toISOString()
            };
            setThreatAlerts(prev => [newAlert, ...prev]);
          };

          // Simulate an alert every 30 seconds
          const alertInterval = setInterval(simulateAlert, 30000);
          return () => clearInterval(alertInterval);
        } catch (error) {
          console.error("Error setting up real-time alerts:", error);
        }

        // Fetch evidence (if a case is selected)
        if (selectedCase) {
          const evidenceResponse = await fetch(`/api/evidence?caseId=${selectedCase}`);
          if (evidenceResponse.ok) {
            const evidenceData = await evidenceResponse.json();
            setEvidence(evidenceData);
          }

          // Fetch messages for the selected case
          const messagesResponse = await fetch(`/api/messages?caseId=${selectedCase}`);
          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json();
            if (messagesData.length > 0) {
              // Add the system welcome message if there are no messages
              const systemMessage = {
                role: "system" as const,
                content: "ACTA (AI Cyber Triage Assistant) is ready to assist with your digital forensics investigation. How can I help you today?",
                timestamp: new Date().toISOString()
              };
              setMessages([systemMessage, ...messagesData]);
            }
          }
        }

        // Fetch artifacts for selected evidence
        if (selectedEvidence) {
          const artifactsResponse = await fetch(`/api/artifacts?evidenceId=${selectedEvidence}`);
          if (artifactsResponse.ok) {
            const artifactsData = await artifactsResponse.json();
            setArtifacts(artifactsData);
          }
        } else {
          // If no evidence is selected, fetch all artifacts
          const artifactsResponse = await fetch('/api/artifacts');
          if (artifactsResponse.ok) {
            const artifactsData = await artifactsResponse.json();
            setArtifacts(artifactsData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [selectedCase, selectedEvidence]);

  // Handle AI chat
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput("");

    // Create new message object
    const newUserMessage = {
      role: "user" as const,
      content: userMessage,
      timestamp: new Date().toISOString()
    };

    // Update local state
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    try {
      // Save user message to database
      await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: newUserMessage.role,
          content: newUserMessage.content,
          // If we have a selected case, associate the message with it
          ...(selectedCase && {
            caseId: selectedCase
          })
        })
      });
      let fullResponse = "";
      await generateTextStream(userMessage, chunk => {
        fullResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages[newMessages.length - 1]?.role === "assistant") {
            newMessages[newMessages.length - 1].content = fullResponse;
          } else {
            newMessages.push({
              role: "assistant",
              content: fullResponse,
              timestamp: new Date().toISOString()
            });
          }
          return newMessages;
        });
      }, selectedModel);

      // Save assistant response to database
      await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: "assistant",
          content: fullResponse,
          model: selectedModel,
          ...(selectedCase && {
            caseId: selectedCase
          })
        })
      });
    } catch (error) {
      const errorMessage = {
        role: "assistant" as const,
        content: "I apologize, but I encountered an error analyzing this evidence. Please try again or upload a different sample.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);

      // Save error message to database
      await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: errorMessage.role,
          content: errorMessage.content,
          model: selectedModel,
          ...(selectedCase && {
            caseId: selectedCase
          })
        })
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle evidence upload
  const handleEvidenceUpload = async (fileData: {
    name: string;
    type: string;
    size: string;
    hash: string;
  }) => {
    if (!selectedCase) {
      alert("Please select a case first");
      return;
    }
    try {
      // Create evidence record in database
      const newEvidence = {
        caseId: selectedCase,
        name: fileData.name,
        type: fileData.type,
        size: fileData.size,
        status: "analyzed" as EvidenceStatus,
        threatScore: Math.floor(Math.random() * 30) + 60,
        // 60-90
        hash: fileData.hash
      };
      const response = await fetch('/api/evidence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEvidence)
      });
      if (!response.ok) {
        throw new Error('Failed to create evidence');
      }
      const createdEvidence = await response.json();
      setEvidence(prev => [...prev, createdEvidence]);

      // Add artifact
      const newArtifact = {
        evidenceId: createdEvidence.id,
        name: fileData.name.split('.')[0] + "_artifact",
        type: fileData.type === "Network Capture" ? "Network Traffic" : "Log Entry",
        path: "/forensic/extracted/" + fileData.name,
        timestamp: new Date().toISOString(),
        threatScore: Math.floor(Math.random() * 30) + 60,
        // 60-90
        isMalicious: Math.random() > 0.3,
        // 70% chance of being malicious
        description: `Suspicious ${fileData.type === "Network Capture" ? "network pattern" : "log entry"} detected in the ${fileData.name} file`
      };
      const artifactResponse = await fetch('/api/artifacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newArtifact)
      });
      if (artifactResponse.ok) {
        const createdArtifact = await artifactResponse.json();
        setArtifacts(prev => [...prev, createdArtifact]);
      }

      // Update threat alerts
      if (Math.random() > 0.5) {
        // 50% chance of generating a threat alert
        const newAlert = {
          id: "alert-" + Math.random().toString(36).substring(2, 9),
          source: Math.random() > 0.5 ? "ThreatFox" : "AlienVault OTX",
          indicator: fileData.hash.substring(0, 16),
          type: "File Hash",
          severity: Math.floor(Math.random() * 3) + 7,
          // 7-9
          description: `Suspicious file hash detected in ${fileData.name}`,
          timestamp: new Date().toISOString()
        };
        setThreatAlerts(prev => [newAlert, ...prev]);
      }
    } catch (error) {
      console.error("Error uploading evidence:", error);
      alert("Failed to upload evidence");
    }
  };

  // Handle case creation
  const handleCreateCase = async () => {
    if (!newCaseTitle) {
      alert("Please enter a case title");
      return;
    }

    // Validate required fields
    if (!reporterName || !reporterEmail) {
      alert("Reporter name and email are required");
      return;
    }
    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newCaseTitle,
          description: newCaseDescription,
          status: 'active',
          reporterName,
          reporterEmail,
          reporterPhone,
          attackType,
          sourceIp
        })
      });
      if (!response.ok) {
        throw new Error('Failed to create case');
      }
      const createdCase = await response.json();
      setCases(prev => [...prev, createdCase]);
      setSelectedCase(createdCase.id);
      setShowCreateCaseDialog(false);

      // Reset form fields
      setNewCaseTitle("");
      setNewCaseDescription("");
      setReporterName("");
      setReporterEmail("");
      setReporterPhone("");
      setAttackType("");
      setSourceIp("");

      // Query threat intelligence after case creation
      fetchThreatIntelligence(sourceIp);
    } catch (error) {
      console.error("Error creating case:", error);
      alert("Failed to create case");
    }
  };

  // Detect user's IP address
  const detectMyIp = async () => {
    setIsDetectingIp(true);
    try {
      const response = await axios.get('https://api.ipify.org?format=json');
      setSourceIp(response.data.ip);

      // Get additional IP information
      const geoResponse = await axios.get(`http://ip-api.com/json/${response.data.ip}`);
      if (geoResponse.data && geoResponse.data.status === "success") {
        const geoInfo = geoResponse.data;
        setNewCaseDescription(prev => `${prev ? prev + '\n\n' : ''}IP Information:\n` + `Location: ${geoInfo.city}, ${geoInfo.regionName}, ${geoInfo.country}\n` + `ISP: ${geoInfo.isp}\n` + `Coordinates: ${geoInfo.lat}, ${geoInfo.lon}`);
      }
    } catch (error) {
      console.error("Error detecting IP:", error);
      alert("Failed to detect IP address");
    } finally {
      setIsDetectingIp(false);
    }
  };

  // Fetch threat intelligence
  const fetchThreatIntelligence = async (ip: string) => {
    if (!ip) return;
    try {
      // This would normally call our backend API which would query ThreatFox/AlienVault OTX
      // For demo purposes, we'll simulate a response
      const simulatedResponse = await new Promise<ThreatIntelData[]>(resolve => {
        setTimeout(() => {
          resolve([{
            id: "alert-" + Math.random().toString(36).substring(2, 9),
            source: "ThreatFox",
            indicator: ip,
            type: "IP Address",
            severity: 7,
            description: "Associated with botnet command and control activities",
            timestamp: new Date().toISOString()
          }, {
            id: "alert-" + Math.random().toString(36).substring(2, 9),
            source: "AlienVault OTX",
            indicator: ip,
            type: "IP Address",
            severity: 6,
            description: "Observed in multiple malware distribution campaigns",
            timestamp: new Date().toISOString()
          }]);
        }, 1000);
      });
      setThreatAlerts(simulatedResponse);
    } catch (error) {
      console.error("Error fetching threat intelligence:", error);
    }
  };

  // Run AI Analysis on evidence
  const runAIAnalysis = async (evidenceId: number) => {
    const evidenceItem = evidence.find(e => e.id === evidenceId);
    if (!evidenceItem) {
      alert("Evidence not found");
      return;
    }
    setSelectedEvidenceForAnalysis(evidenceItem);
    setShowAIAnalysisDialog(true);
    setIsProcessingAI(true);
    try {
      // Call the AI analysis API to trigger ML prediction
      const response = await fetch(`/api/ai-analysis?evidenceId=${evidenceId}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const result = await response.json();

      // Convert to the format expected by the UI
      setAiAnalysisResult({
        detectedAttackType: result.detectedAttackType,
        confidence: result.confidence / 100,
        anomalyScore: result.anomalyScore / 100,
        featureImportance: result.featureImportance || {
          "suspicious_patterns": 0.42,
          "behavioral_analysis": 0.28,
          "network_indicators": 0.18,
          "file_operations": 0.12
        },
        explanation: result.explanation
      });
    } catch (error) {
      console.error("Error running AI analysis:", error);
      alert("Failed to analyze evidence");
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Generate explainable AI report
  const generateAIReport = async () => {
    if (!selectedCase || !aiAnalysisResult) return;
    setIsGeneratingReport(true);
    try {
      // This would normally generate a PDF with detailed findings
      // For demo purposes, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert("Report generated successfully! Download started.");

      // In a real implementation, this would trigger a PDF download
      setIsGeneratingReport(false);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report");
      setIsGeneratingReport(false);
    }
  };

  // Render the dashboard tab
  const renderDashboard = () => <div className="p-6 space-y-8" data-unique-id="1bc73003-0aff-436c-bac7-6618ea1f3c92" data-loc="669:32-669:63" data-file-name="components/chat/chat-interface.tsx">
      <div className="flex items-center justify-between mb-2" data-unique-id="5acb1a3b-40b0-4797-88fc-1560b6ed779b" data-loc="670:6-670:62" data-file-name="components/chat/chat-interface.tsx">
        <h2 className="text-2xl font-semibold" data-unique-id="44d3b0be-ee45-4eb6-9561-08c0c587026b" data-loc="671:8-671:47" data-file-name="components/chat/chat-interface.tsx">Forensic Dashboard</h2>
        
        <div className="flex space-x-2" data-unique-id="acc1fff7-f148-4593-abe6-1992928b7fa1" data-loc="673:8-673:40" data-file-name="components/chat/chat-interface.tsx">
          <button onClick={() => setShowCreateCaseDialog(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center" data-unique-id="bd16fa74-3056-4541-87e3-4aa1d1781b5b" data-loc="674:10-674:156" data-file-name="components/chat/chat-interface.tsx">
            <PlusCircle className="h-4 w-4 mr-1.5" />
            New Case
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <StatsCards />
      
      {/* Charts */}
      <div className="mt-8" data-unique-id="9d463af4-6382-47eb-af1c-2261ee4a4b43" data-loc="685:6-685:28" data-file-name="components/chat/chat-interface.tsx">
        <h3 className="text-lg font-medium mb-4" data-unique-id="f4c552cd-b7c7-4c84-9db5-cfb02548fd27" data-loc="686:8-686:49" data-file-name="components/chat/chat-interface.tsx">Threat Analytics</h3>
        <AttackCharts />
      </div>
      
      {/* Recent Artifacts & Threats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6" data-unique-id="a9765c73-db77-44b7-b080-0262a3c9fcd9" data-loc="691:6-691:66" data-file-name="components/chat/chat-interface.tsx">
        <div className="bg-white border rounded-lg shadow-sm" data-unique-id="181cd70a-0007-4040-aeee-a60139d5206e" data-loc="692:8-692:62" data-file-name="components/chat/chat-interface.tsx">
          <div className="px-6 py-4 border-b flex justify-between items-center" data-unique-id="8a29492a-e67b-4145-b919-c2c30ea21264" data-loc="693:10-693:80" data-file-name="components/chat/chat-interface.tsx">
            <h3 className="font-semibold text-gray-900" data-unique-id="1db89b3f-b6b0-4019-98d2-3ed2561db23e" data-loc="694:12-694:56" data-file-name="components/chat/chat-interface.tsx">Recent Activity</h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full" data-unique-id="7a96574d-48b5-4554-97fc-98235fe3d4a8" data-loc="695:12-695:99" data-file-name="components/chat/chat-interface.tsx">
              Last 24 Hours
            </span>
          </div>
          <div className="p-1" data-unique-id="93102d39-7652-4bdb-849f-74c70a2f5d36" data-loc="699:10-699:31" data-file-name="components/chat/chat-interface.tsx">
            <div className="divide-y max-h-[300px] overflow-y-auto" data-unique-id="2bda5e02-1da4-4370-9c74-43e87b468cca" data-loc="700:12-700:68" data-file-name="components/chat/chat-interface.tsx">
              {artifacts.slice(0, 5).map(artifact => <div key={artifact.id} className="flex items-center p-4" data-unique-id="3c777647-036b-4fd0-906f-166acf05c8b4" data-loc="701:53-701:110" data-file-name="components/chat/chat-interface.tsx">
                  <div className={cn("w-2 h-2 rounded-full mr-3", artifact.threatScore > 80 ? "bg-red-500" : artifact.threatScore > 50 ? "bg-amber-500" : "bg-green-500")} data-unique-id="fcdc9b36-6b3f-44bd-91de-6459a0d851b2" data-loc="702:18-702:173" data-file-name="components/chat/chat-interface.tsx" />
                  <div className="flex-1 min-w-0" data-unique-id="2f06619f-c7b7-4e44-be4b-511198cffde2" data-loc="703:18-703:50" data-file-name="components/chat/chat-interface.tsx">
                    <div className="flex justify-between" data-unique-id="165eb915-1714-4515-b664-d9953e54dc86" data-loc="704:20-704:58" data-file-name="components/chat/chat-interface.tsx">
                      <h4 className="font-medium text-gray-900 truncate" data-unique-id="a8c3abfb-87db-411d-a4b9-9ddffd5b8648" data-loc="705:22-705:73" data-file-name="components/chat/chat-interface.tsx">{artifact.name}</h4>
                      <span className="text-sm text-gray-500" data-unique-id="c94413a5-53af-4726-8c9e-d245043d0249" data-loc="706:22-706:62" data-file-name="components/chat/chat-interface.tsx">
                        {formatTimestamp(artifact.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate" data-unique-id="70e3c799-4fa4-45c9-a312-ed7333226c19" data-loc="710:20-710:66" data-file-name="components/chat/chat-interface.tsx">{artifact.description}</p>
                  </div>
                </div>)}
              
              {artifacts.length === 0 && <div className="p-6 text-center text-gray-500" data-unique-id="d8e69efa-d77c-4548-8ee4-7b28c7eb555c" data-loc="714:41-714:88" data-file-name="components/chat/chat-interface.tsx">
                  <p data-unique-id="c01c833d-4be9-4024-adb3-6bba90d84b3e" data-loc="715:18-715:21" data-file-name="components/chat/chat-interface.tsx">No recent artifacts found.</p>
                </div>}
            </div>
          </div>
        </div>
        
        {/* Real-time Threat Alerts */}
        <div className="bg-white border rounded-lg shadow-sm" data-unique-id="f37ce4b7-a87b-4e0d-8145-0115e2fb752a" data-loc="722:8-722:62" data-file-name="components/chat/chat-interface.tsx">
          <div className="px-6 py-4 border-b flex justify-between items-center" data-unique-id="27c910bf-f924-44ba-a66b-a443f8afaca0" data-loc="723:10-723:80" data-file-name="components/chat/chat-interface.tsx">
            <h3 className="font-semibold text-gray-900" data-unique-id="550beaa5-2bf4-43da-acd7-6c18a7b5bf4b" data-loc="724:12-724:56" data-file-name="components/chat/chat-interface.tsx">Live Threat Intelligence</h3>
            <div className="flex items-center" data-unique-id="d46a49e4-dc79-43e0-b8b5-3020234bde65" data-loc="725:12-725:47" data-file-name="components/chat/chat-interface.tsx">
              <span className="relative flex h-3 w-3 mr-2" data-unique-id="1d52061f-e21e-4064-bc93-08ad55b8bdbc" data-loc="726:14-726:59" data-file-name="components/chat/chat-interface.tsx">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" data-unique-id="c729a665-6298-48d4-9d05-4a26b8e9cceb" data-loc="727:16-727:117" data-file-name="components/chat/chat-interface.tsx"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" data-unique-id="7329b204-824e-46b3-972d-041a13837380" data-loc="728:16-728:87" data-file-name="components/chat/chat-interface.tsx"></span>
              </span>
              <span className="text-xs text-gray-500" data-unique-id="bcf2e86e-37e6-418c-b38c-2764279bc5ad" data-loc="730:14-730:54" data-file-name="components/chat/chat-interface.tsx">Live</span>
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto" data-unique-id="1239a206-d33c-4016-9fc7-65d716f2e3dc" data-loc="733:10-733:57" data-file-name="components/chat/chat-interface.tsx">
            {threatAlerts.length === 0 ? <div className="p-6 text-center text-gray-500" data-unique-id="f87f3926-1273-43a5-85c8-5f42f943311c" data-loc="734:41-734:88" data-file-name="components/chat/chat-interface.tsx">
                <p data-unique-id="3b46fbd5-f544-4c79-9c06-05638475917d" data-loc="735:16-735:19" data-file-name="components/chat/chat-interface.tsx">No active threats detected.</p>
              </div> : <div className="divide-y" data-unique-id="1091106e-bcac-4867-9b83-422120690430" data-loc="736:23-736:49" data-file-name="components/chat/chat-interface.tsx">
                {threatAlerts.slice(0, 5).map(alert => <div key={alert.id} className="p-4 hover:bg-gray-50" data-unique-id="46839ebd-1033-47e7-acb8-5c4419020a3a" data-loc="737:55-737:108" data-file-name="components/chat/chat-interface.tsx">
                    <div className="flex items-center justify-between mb-1" data-unique-id="f07f3ace-2222-47cc-b570-36e70f745c8f" data-loc="738:20-738:76" data-file-name="components/chat/chat-interface.tsx">
                      <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full", alert.severity > 7 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800")} data-unique-id="b8f3b8e7-abd1-4d58-aaec-dc773e72470e" data-loc="739:22-739:171" data-file-name="components/chat/chat-interface.tsx">
                        Severity {alert.severity}/10
                      </span>
                      <span className="text-xs text-gray-500" data-unique-id="02dd5a87-4eab-43ae-8a90-48d18ffe01e4" data-loc="742:22-742:62" data-file-name="components/chat/chat-interface.tsx">
                        {formatTimestamp(alert.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-start mt-1" data-unique-id="655bbc49-4c4c-4682-be6b-760a6d35b642" data-loc="746:20-746:59" data-file-name="components/chat/chat-interface.tsx">
                      <AlertOctagon className={cn("h-5 w-5 mr-2 mt-0.5", alert.severity > 7 ? "text-red-500" : "text-amber-500")} />
                      <div data-unique-id="e6d1cc89-65a2-48d0-8bd2-c7984deec062" data-loc="748:22-748:27" data-file-name="components/chat/chat-interface.tsx">
                        <p className="font-medium text-gray-900" data-unique-id="be8d6a48-e3e9-46e0-8b81-4918afd75828" data-loc="749:24-749:65" data-file-name="components/chat/chat-interface.tsx">{alert.source}: {alert.indicator}</p>
                        <p className="text-sm text-gray-600 mt-0.5" data-unique-id="5ab713b7-df79-49fc-979f-cd9001601b3f" data-loc="750:24-750:68" data-file-name="components/chat/chat-interface.tsx">{alert.description}</p>
                      </div>
                    </div>
                  </div>)}
              </div>}
          </div>
        </div>
      </div>
    </div>;

  // Render the evidence tab
  const renderEvidence = () => <div className="p-6" data-unique-id="153b75a1-0e02-4862-8aed-7383a310de3f" data-loc="761:31-761:52" data-file-name="components/chat/chat-interface.tsx">
      <div className="flex justify-between items-center mb-6" data-unique-id="93ffc621-fc7e-478a-a9f2-6e36fb85aa14" data-loc="762:6-762:62" data-file-name="components/chat/chat-interface.tsx">
        <h2 className="text-2xl font-semibold" data-unique-id="764415ca-6ffd-4a01-9e73-19ac42f2db8b" data-loc="763:8-763:47" data-file-name="components/chat/chat-interface.tsx">Evidence Collection</h2>
        <button className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center" onClick={() => setShowUploadDialog(true)} data-unique-id="deef6904-eda7-469b-b4e1-f6bf915a66b7" data-loc="764:8-764:168" data-file-name="components/chat/chat-interface.tsx">
          <Upload className="w-4 h-4 mr-2" />
          Add Evidence
        </button>
      </div>
      
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden" data-unique-id="829da4d9-6299-4a44-9dff-3412cab73fe1" data-loc="770:6-770:76" data-file-name="components/chat/chat-interface.tsx">
        <table className="min-w-full divide-y divide-gray-200" data-unique-id="16506a27-d7b7-4196-8003-fbb58cf9ee46" data-loc="771:8-771:63" data-file-name="components/chat/chat-interface.tsx">
          <thead className="bg-gray-50" data-unique-id="b0ac3418-1750-448c-84f8-da29a9a62fbc" data-loc="772:10-772:40" data-file-name="components/chat/chat-interface.tsx">
            <tr data-unique-id="13d6364d-a36b-4ae8-af25-fd1a1c0d16e5" data-loc="773:12-773:16" data-file-name="components/chat/chat-interface.tsx">
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="e88409b2-9f99-4159-a71b-501ee4a554d1" data-loc="774:14-774:121" data-file-name="components/chat/chat-interface.tsx">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="e09182a3-f9c1-41a6-9010-07b6c8b3eb49" data-loc="775:14-775:121" data-file-name="components/chat/chat-interface.tsx">Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="e8512d2c-f769-4ece-afdd-d986d6b62a5e" data-loc="776:14-776:121" data-file-name="components/chat/chat-interface.tsx">Size</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="03049ed2-5b5b-4363-9c77-cb3f7b03592b" data-loc="777:14-777:121" data-file-name="components/chat/chat-interface.tsx">Added</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="6ba3458b-3b46-467f-9c43-61815e7c1180" data-loc="778:14-778:121" data-file-name="components/chat/chat-interface.tsx">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="1e2e3b60-7832-4f4d-91bd-15b58692bdb1" data-loc="779:14-779:121" data-file-name="components/chat/chat-interface.tsx">Threat</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="930d061f-3d14-489e-98ba-0aa0cca4575b" data-loc="780:14-780:121" data-file-name="components/chat/chat-interface.tsx">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200" data-unique-id="87f9e75a-012a-4346-adfd-ff08020006d1" data-loc="783:10-783:63" data-file-name="components/chat/chat-interface.tsx">
            {evidence.map(item => <tr key={item.id} className={selectedEvidence === item.id ? "bg-blue-50" : ""} data-unique-id="37fe5a71-bfe2-4aba-8ff3-6bbf5804b65c" data-loc="784:34-784:113" data-file-name="components/chat/chat-interface.tsx">
                <td className="px-6 py-4 whitespace-nowrap" data-unique-id="c629e572-de0b-4689-bc36-073dd7801c7e" data-loc="785:16-785:60" data-file-name="components/chat/chat-interface.tsx">
                  <div className="font-medium text-gray-900" data-unique-id="81037569-a540-423e-8fc9-f2de3b0bd37b" data-loc="786:18-786:61" data-file-name="components/chat/chat-interface.tsx">{item.name}</div>
                  <div className="text-xs text-gray-500" data-unique-id="5aea3676-eaf1-46f3-9887-40a7e1b633c3" data-loc="787:18-787:57" data-file-name="components/chat/chat-interface.tsx">ID: {item.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-unique-id="f0db883a-871a-47fe-a421-38720e95a3d1" data-loc="789:16-789:82" data-file-name="components/chat/chat-interface.tsx">{item.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-unique-id="6ad9908c-e1b4-43e0-a974-b87f3f51ceaa" data-loc="790:16-790:82" data-file-name="components/chat/chat-interface.tsx">{item.size}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-unique-id="29d43667-79ec-4856-916e-0185854b9499" data-loc="791:16-791:82" data-file-name="components/chat/chat-interface.tsx">
                  {new Date(item.timestamp).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap" data-unique-id="8dd59989-6433-49b3-a6c5-b419c62ddfe5" data-loc="794:16-794:60" data-file-name="components/chat/chat-interface.tsx">
                  <span className={cn("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", item.status === "processing" ? "bg-blue-100 text-blue-800" : item.status === "analyzed" ? "bg-green-100 text-green-800" : item.status === "flagged" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800")} data-unique-id="5eec930d-edbf-41ac-85d1-c5bedf4ff1c9" data-loc="795:18-795:311" data-file-name="components/chat/chat-interface.tsx">
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap" data-unique-id="6d8d9b11-d24e-461b-928c-d91884aedc36" data-loc="799:16-799:60" data-file-name="components/chat/chat-interface.tsx">
                  <div className="flex items-center" data-unique-id="47fbe5a2-27f1-481c-8424-3e0632f832da" data-loc="800:18-800:53" data-file-name="components/chat/chat-interface.tsx">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2" data-unique-id="2120c298-a9ab-4214-a925-f2d9fa364faf" data-loc="801:20-801:78" data-file-name="components/chat/chat-interface.tsx">
                      <div className={cn("h-2 rounded-full", item.threatScore > 80 ? "bg-red-500" : item.threatScore > 50 ? "bg-amber-500" : item.threatScore > 0 ? "bg-green-500" : "bg-gray-300")} style={{
                    width: `${item.threatScore}%`
                  }} data-unique-id="f133b582-d6d2-4649-aaf0-b638a0ca2f82" data-loc="802:22-804:23" data-file-name="components/chat/chat-interface.tsx" />
                    </div>
                    <span className="text-xs font-medium" data-unique-id="e7de719d-c874-45c2-a8a2-eed6224455df" data-loc="806:20-806:58" data-file-name="components/chat/chat-interface.tsx">{item.threatScore}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" data-unique-id="08c07637-59b3-4349-8fc0-0ad10533065d" data-loc="809:16-809:80" data-file-name="components/chat/chat-interface.tsx">
                  <button className="text-blue-600 hover:text-blue-900 mr-3" onClick={() => setSelectedEvidence(item.id === selectedEvidence ? null : item.id)} data-unique-id="b8e3dd13-244a-4838-a134-88782ef77723" data-loc="810:18-810:160" data-file-name="components/chat/chat-interface.tsx">
                    {item.id === selectedEvidence ? "Hide" : "View"}
                  </button>
                  <button className="text-green-600 hover:text-green-900 mr-3" data-unique-id="e01ac95f-311f-434c-a213-c44356c9e62a" data-loc="813:18-813:79" data-file-name="components/chat/chat-interface.tsx">
                    <Download className="h-4 w-4" />
                  </button>
                  <button className="text-purple-600 hover:text-purple-900" onClick={() => runAIAnalysis(item.id)} title="Run AI Analysis" data-unique-id="63f5a3e0-28ae-4448-a2c1-718993e2645e" data-loc="816:18-816:139" data-file-name="components/chat/chat-interface.tsx">
                    <Cpu className="h-4 w-4" />
                  </button>
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
      
      {selectedEvidence && <div className="mt-6 bg-white border rounded-lg shadow-sm p-6" data-unique-id="46ca024a-e852-43a6-84bc-93a5b29dd4d7" data-loc="825:27-825:90" data-file-name="components/chat/chat-interface.tsx">
          <h3 className="text-lg font-semibold mb-4" data-unique-id="cab9984f-369e-4df0-a5a3-77fe12ff3065" data-loc="826:10-826:53" data-file-name="components/chat/chat-interface.tsx">Artifacts Found</h3>
          <div className="overflow-x-auto" data-unique-id="f1ad1d54-0a1d-4137-9d97-7eaeb00a7d4d" data-loc="827:10-827:43" data-file-name="components/chat/chat-interface.tsx">
            <table className="min-w-full divide-y divide-gray-200" data-unique-id="bcd083b6-8641-4f5f-ab42-5c19a73dc616" data-loc="828:12-828:67" data-file-name="components/chat/chat-interface.tsx">
              <thead className="bg-gray-50" data-unique-id="c48d725a-c48a-4a8c-9a5d-8c4aed32f1b2" data-loc="829:14-829:44" data-file-name="components/chat/chat-interface.tsx">
                <tr data-unique-id="38c8ef5c-152e-4673-9af9-dd3c447590cb" data-loc="830:16-830:20" data-file-name="components/chat/chat-interface.tsx">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="244fdc8f-436c-4478-9203-e6a68ec7ef67" data-loc="831:18-831:125" data-file-name="components/chat/chat-interface.tsx">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="b40611e4-a228-49c8-9532-fbc7bdfc67ff" data-loc="832:18-832:125" data-file-name="components/chat/chat-interface.tsx">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="14944c72-2851-47e4-8b17-94d3b1e2d91a" data-loc="833:18-833:125" data-file-name="components/chat/chat-interface.tsx">Path</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="ec8eb23f-df99-4d80-b1aa-a9abe4bfba0a" data-loc="834:18-834:125" data-file-name="components/chat/chat-interface.tsx">Timestamp</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="8b3a9839-9ac0-4c27-b4fb-9bbadad27dd2" data-loc="835:18-835:125" data-file-name="components/chat/chat-interface.tsx">Threat Score</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200" data-unique-id="8ac2f32e-0d2c-440c-8e55-90010aa525b7" data-loc="838:14-838:67" data-file-name="components/chat/chat-interface.tsx">
                {artifacts.filter(artifact => artifact.evidenceId === selectedEvidence).map(artifact => <tr key={artifact.id} data-unique-id="2c3cfa93-01e4-48c3-8373-9e36929976eb" data-loc="839:104-839:126" data-file-name="components/chat/chat-interface.tsx">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900" data-unique-id="c600d5f3-f7ed-40f4-898d-ed636459dd2f" data-loc="840:22-840:92" data-file-name="components/chat/chat-interface.tsx">{artifact.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-unique-id="ba57e17d-4a12-4ddc-b6df-79a956a21cc7" data-loc="841:22-841:88" data-file-name="components/chat/chat-interface.tsx">{artifact.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-unique-id="dfd8272c-1f47-429c-a746-b6953b1b494b" data-loc="842:22-842:88" data-file-name="components/chat/chat-interface.tsx">{artifact.path}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-unique-id="c57de7fe-fb26-423d-93de-d839671a6547" data-loc="843:22-843:88" data-file-name="components/chat/chat-interface.tsx">
                        {new Date(artifact.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" data-unique-id="4c91622c-0c0f-43b0-b421-01502d0b3fae" data-loc="846:22-846:66" data-file-name="components/chat/chat-interface.tsx">
                        <div className={cn("px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full", artifact.threatScore > 80 ? "bg-red-100 text-red-800" : artifact.threatScore > 50 ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800")} data-unique-id="735cf03e-98e8-4fc7-b01d-37b967bac5c0" data-loc="847:24-847:261" data-file-name="components/chat/chat-interface.tsx">
                          {artifact.threatScore}/100
                        </div>
                      </td>
                    </tr>)}
              </tbody>
            </table>
          </div>
        </div>}
      
      {/* Upload Dialog */}
      {showUploadDialog && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-unique-id="1932dedf-c479-427e-9be6-5a370072325b" data-loc="858:27-858:119" data-file-name="components/chat/chat-interface.tsx">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl" data-unique-id="c9c9ddb3-4f8c-432d-8b14-fcbeb48bcbe3" data-loc="859:10-859:68" data-file-name="components/chat/chat-interface.tsx">
            <div className="flex justify-between items-center mb-4" data-unique-id="df169d57-b392-43c2-b101-69756443d2a8" data-loc="860:12-860:68" data-file-name="components/chat/chat-interface.tsx">
              <h3 className="text-lg font-semibold" data-unique-id="b841f2eb-f435-48f2-b2a0-e6c0339a7a98" data-loc="861:14-861:52" data-file-name="components/chat/chat-interface.tsx">Upload Forensic Evidence</h3>
            </div>
            
            <div className="mt-2" data-unique-id="a33d26b6-7800-47fa-8725-d0fc5e8c4475" data-loc="864:12-864:34" data-file-name="components/chat/chat-interface.tsx">
              <UploadForm caseId={selectedCase} onUploadComplete={handleEvidenceUpload} onClose={() => setShowUploadDialog(false)} />
            </div>
          </div>
        </div>}
        
      {/* Create Case Dialog */}
      {showCreateCaseDialog && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-unique-id="04cccc18-6972-4a6f-9c46-80b7cd50ff7a" data-loc="871:31-871:123" data-file-name="components/chat/chat-interface.tsx">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl" data-unique-id="6de90325-cc6b-4f9f-bc9f-b1ea931ae83f" data-loc="872:10-872:68" data-file-name="components/chat/chat-interface.tsx">
            <h3 className="text-lg font-semibold mb-4" data-unique-id="d8fa6eba-e7cd-4616-8bd7-8f7713163e60" data-loc="873:12-873:55" data-file-name="components/chat/chat-interface.tsx">Create New Case</h3>
            <div className="grid grid-cols-2 gap-4" data-unique-id="e7bd564e-b33c-4406-ae35-f472202def2d" data-loc="874:12-874:52" data-file-name="components/chat/chat-interface.tsx">
              <div className="col-span-2" data-unique-id="c2efe52b-b178-401c-8c71-bdbec7db32c9" data-loc="875:14-875:42" data-file-name="components/chat/chat-interface.tsx">
                <label htmlFor="case-title" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="aa1f4610-f613-4a5d-bc5d-62ddf37d444b" data-loc="876:16-876:101" data-file-name="components/chat/chat-interface.tsx">
                  Case Title *
                </label>
                <input id="case-title" type="text" value={newCaseTitle} onChange={e => setNewCaseTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter case title" data-unique-id="0eb4b48d-c569-46b8-ae94-89b3e5109198" data-loc="879:16-879:252" data-file-name="components/chat/chat-interface.tsx" />
              </div>
              
              <div className="col-span-2" data-unique-id="f53386e4-b3ac-412e-a752-27b786490017" data-loc="882:14-882:42" data-file-name="components/chat/chat-interface.tsx">
                <label htmlFor="case-description" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="63f928da-2b7c-45d1-b072-37b5c98a384f" data-loc="883:16-883:107" data-file-name="components/chat/chat-interface.tsx">
                  Description
                </label>
                <textarea id="case-description" value={newCaseDescription} onChange={e => setNewCaseDescription(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24" placeholder="Enter case description" data-unique-id="5b63b0ca-516c-4fe7-9774-4432cb896dbe" data-loc="886:16-886:272" data-file-name="components/chat/chat-interface.tsx" />
              </div>
              
              <div data-unique-id="fa88858b-5cae-4805-a191-98d9b8181540" data-loc="889:14-889:19" data-file-name="components/chat/chat-interface.tsx">
                <label htmlFor="attack-type" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="4ee71562-95e4-4147-9adf-721c41eb407e" data-loc="890:16-890:102" data-file-name="components/chat/chat-interface.tsx">
                  Attack Type *
                </label>
                <select id="attack-type" value={attackType} onChange={e => setAttackType(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" data-unique-id="288b0b19-d861-4203-adb2-49e76598afd1" data-loc="893:16-893:205" data-file-name="components/chat/chat-interface.tsx">
                  <option value="" data-unique-id="87723873-b399-4d82-a4da-bf91f6fc0642" data-loc="894:18-894:35" data-file-name="components/chat/chat-interface.tsx">Select attack type</option>
                  {attackTypes.map(type => <option key={type} value={type} data-unique-id="76fc3516-cabc-4fa4-97d0-567a7b6f7201" data-loc="895:43-895:75" data-file-name="components/chat/chat-interface.tsx">{type}</option>)}
                </select>
              </div>
              
              <div data-unique-id="cacd748f-605a-4a14-aff6-cb51e9b118b1" data-loc="899:14-899:19" data-file-name="components/chat/chat-interface.tsx">
                <label htmlFor="source-ip" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="422e724a-351c-4bbd-984c-e20a75187c8b" data-loc="900:16-900:100" data-file-name="components/chat/chat-interface.tsx">
                  Source IP
                </label>
                <div className="flex" data-unique-id="e7b76fe0-83ce-4e94-a3a2-92f0131fae61" data-loc="903:16-903:38" data-file-name="components/chat/chat-interface.tsx">
                  <input id="source-ip" type="text" value={sourceIp} onChange={e => setSourceIp(e.target.value)} className="w-full px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter source IP" data-unique-id="84a9a971-63f7-4100-8fb8-6a37e2c87bcb" data-loc="904:18-904:246" data-file-name="components/chat/chat-interface.tsx" />
                  <button type="button" onClick={detectMyIp} disabled={isDetectingIp} className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400" data-unique-id="eed3c108-0cfb-4454-b15c-ca16cde1ef5a" data-loc="905:18-905:201" data-file-name="components/chat/chat-interface.tsx">
                    {isDetectingIp ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1" data-unique-id="3e77e60e-bcf2-4b05-805e-745cc7f35c71" data-loc="909:16-909:58" data-file-name="components/chat/chat-interface.tsx">Click the button to auto-detect your IP</p>
              </div>
              
              <div data-unique-id="1bc8445f-b49a-48d1-9fe7-ad4c46710c42" data-loc="912:14-912:19" data-file-name="components/chat/chat-interface.tsx">
                <label htmlFor="reporter-name" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="01114e49-4cfa-417c-97a7-2f707ad3633e" data-loc="913:16-913:104" data-file-name="components/chat/chat-interface.tsx">
                  Reporter Name *
                </label>
                <input id="reporter-name" type="text" value={reporterName} onChange={e => setReporterName(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your name" data-unique-id="7d145762-48c1-405f-b125-9c61e6e48a7e" data-loc="916:16-916:254" data-file-name="components/chat/chat-interface.tsx" />
              </div>
              
              <div data-unique-id="b1d3bbf5-7f84-4225-8107-ef4d6d06f109" data-loc="919:14-919:19" data-file-name="components/chat/chat-interface.tsx">
                <label htmlFor="reporter-email" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="3d1e9066-8226-455c-ac21-e4073b8d9142" data-loc="920:16-920:105" data-file-name="components/chat/chat-interface.tsx">
                  Reporter Email *
                </label>
                <input id="reporter-email" type="email" value={reporterEmail} onChange={e => setReporterEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your email" data-unique-id="be6da527-4a13-4d6b-874c-cc1b0cdfbf0b" data-loc="923:16-923:259" data-file-name="components/chat/chat-interface.tsx" />
              </div>
              
              <div data-unique-id="88889dc1-80d1-40c8-8419-37a0d06f790c" data-loc="926:14-926:19" data-file-name="components/chat/chat-interface.tsx">
                <label htmlFor="reporter-phone" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="a42cc002-f7db-4af7-89e0-df707c8df414" data-loc="927:16-927:105" data-file-name="components/chat/chat-interface.tsx">
                  Reporter Phone
                </label>
                <input id="reporter-phone" type="text" value={reporterPhone} onChange={e => setReporterPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your phone number" data-unique-id="ded022b1-ce34-4a92-b392-196885008c91" data-loc="930:16-930:265" data-file-name="components/chat/chat-interface.tsx" />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6" data-unique-id="1dfd0338-98dd-4edd-98a5-69ccb074607a" data-loc="934:12-934:61" data-file-name="components/chat/chat-interface.tsx">
              <button className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900" onClick={() => setShowCreateCaseDialog(false)} data-unique-id="55dfdd17-b0a0-4870-ae0f-80a7553623c0" data-loc="935:14-935:133" data-file-name="components/chat/chat-interface.tsx">
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700" onClick={handleCreateCase} data-unique-id="837ed4a0-6b63-4203-b36f-0da8a1a4f19d" data-loc="938:14-938:143" data-file-name="components/chat/chat-interface.tsx">
                Create Case
              </button>
            </div>
          </div>
        </div>}
    </div>;

  // Render the analysis tab
  const renderAnalysis = () => <div className="p-6" data-unique-id="25d6d2f5-6b8f-4053-887a-da7017e7beb6" data-loc="947:31-947:52" data-file-name="components/chat/chat-interface.tsx">
      <h2 className="text-2xl font-semibold mb-6" data-unique-id="98d494f4-ad09-42b2-90a4-f99f1504bef2" data-loc="948:6-948:50" data-file-name="components/chat/chat-interface.tsx">AI-Powered Analysis</h2>
      
      <div className="flex flex-col h-[calc(100vh-12rem)]" data-unique-id="a8e2783f-2864-4cc8-84d3-3801b4a60218" data-loc="950:6-950:59" data-file-name="components/chat/chat-interface.tsx">
        <div className="flex-1 overflow-y-auto border rounded-lg bg-gray-50 mb-4 p-4 space-y-4" data-unique-id="71f5456a-fd83-4a98-8031-e1d6d7bc6326" data-loc="951:8-951:96" data-file-name="components/chat/chat-interface.tsx">
          <AnimatePresence>
            {messages.map((message, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0
          }} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`} data-unique-id="df6d04dd-3299-4c65-9f8a-78ec6dc97d94" data-loc="953:46-961:93" data-file-name="components/chat/chat-interface.tsx">
                <div className={cn("max-w-[80%] p-4 rounded-2xl", message.role === "user" ? "bg-blue-600 text-white" : message.role === "system" ? "bg-gray-200 text-gray-800" : "bg-white border text-gray-800 shadow-sm")} data-unique-id="a161bc1f-6037-48d7-a960-b0e7e17c7919" data-loc="962:16-962:221" data-file-name="components/chat/chat-interface.tsx">
                  {message.content}
                  {message.timestamp && <div className="mt-2 text-xs opacity-70" data-unique-id="af7c7567-fa3b-4a16-9db1-ada9c46d7708" data-loc="964:40-964:81" data-file-name="components/chat/chat-interface.tsx">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>}
                </div>
              </motion.div>)}
          </AnimatePresence>
          <div ref={messagesEndRef} data-unique-id="984dcab8-fa0c-4bab-b2d8-352f92e2964a" data-loc="970:10-970:38" data-file-name="components/chat/chat-interface.tsx" />
        </div>

        <div className="flex items-center mb-2" data-unique-id="3a687e32-f180-43da-a17c-1238225708ba" data-loc="973:8-973:48" data-file-name="components/chat/chat-interface.tsx">
          <span className="text-sm font-medium text-gray-700 mr-2" data-unique-id="30e40612-6fa1-4cfe-a096-e3965f599c1a" data-loc="974:10-974:67" data-file-name="components/chat/chat-interface.tsx">AI Model:</span>
          <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} className="text-sm border rounded-md px-2 py-1 bg-white" data-unique-id="6dd83797-c77b-4c8d-9423-086edc63da14" data-loc="975:10-975:146" data-file-name="components/chat/chat-interface.tsx">
            {getTextProviders().map(provider => <option key={provider} value={provider} data-unique-id="761a2e57-cb6a-4714-b0af-992ed6fe8137" data-loc="976:48-976:88" data-file-name="components/chat/chat-interface.tsx">
                {provider}
              </option>)}
          </select>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2" data-unique-id="490eb983-9d33-49b9-89ce-75e37fb4a8b8" data-loc="982:8-982:61" data-file-name="components/chat/chat-interface.tsx">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask ACTA to analyze evidence or provide investigative guidance..." className="flex-1 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading} data-unique-id="1b7bea33-77a2-4d58-b3e4-e08e3b0e779b" data-loc="983:10-983:280" data-file-name="components/chat/chat-interface.tsx" />
          <button type="submit" disabled={isLoading} className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400" data-unique-id="f8f5c976-83ee-4455-b69e-773022ac6fdd" data-loc="984:10-984:160" data-file-name="components/chat/chat-interface.tsx">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
          </button>
        </form>
      </div>
    </div>;

  // Render the timeline tab
  const renderTimeline = () => <div className="p-6" data-unique-id="23c94f87-c92b-4da6-9c2b-6793cc7c72b3" data-loc="992:31-992:52" data-file-name="components/chat/chat-interface.tsx">
      <h2 className="text-2xl font-semibold mb-6" data-unique-id="2fb2b89a-61b7-446b-b4e6-ef59b0da524c" data-loc="993:6-993:50" data-file-name="components/chat/chat-interface.tsx">Attack Timeline & Correlation</h2>
      
      <div className="bg-white border rounded-lg shadow-sm p-6 mb-6" data-unique-id="6a1058c6-1d1b-4112-8de2-e47fef31216f" data-loc="995:6-995:69" data-file-name="components/chat/chat-interface.tsx">
        <div className="relative" data-unique-id="36d9584c-d318-4c9f-8fa4-9d81c3f7956c" data-loc="996:8-996:34" data-file-name="components/chat/chat-interface.tsx">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 ml-6" data-unique-id="01f8a595-65f6-4d70-9292-4e625ecee39b" data-loc="997:10-997:83" data-file-name="components/chat/chat-interface.tsx" />
          
          {artifacts.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((artifact, index) => <div key={artifact.id} className="relative mb-8 last:mb-0" data-unique-id="f2511d23-8979-4214-b7cb-1c92e02c7c42" data-loc="999:128-999:187" data-file-name="components/chat/chat-interface.tsx">
              <div className={cn("absolute left-0 w-3 h-3 rounded-full mt-1.5 -ml-1.5", artifact.threatScore > 80 ? "bg-red-500" : artifact.threatScore > 50 ? "bg-amber-500" : "bg-green-500")} data-unique-id="a60397a3-dead-4292-bfb4-9720122d8e60" data-loc="1000:14-1000:195" data-file-name="components/chat/chat-interface.tsx" />
              
              <div className="ml-12" data-unique-id="52961601-0f22-4a9e-bc2c-5f4744338e20" data-loc="1002:14-1002:37" data-file-name="components/chat/chat-interface.tsx">
                <div className="flex items-center" data-unique-id="3b919b22-6756-4297-bfbd-a7f97a20ad69" data-loc="1003:16-1003:51" data-file-name="components/chat/chat-interface.tsx">
                  <h3 className="text-lg font-semibold" data-unique-id="790637fb-9629-4701-86cb-eba2f588e284" data-loc="1004:18-1004:56" data-file-name="components/chat/chat-interface.tsx">{artifact.name}</h3>
                  <span className="ml-3 text-sm text-gray-500" data-unique-id="3b5aa1c6-1f3e-46ee-83ea-7bcbb6830795" data-loc="1005:18-1005:63" data-file-name="components/chat/chat-interface.tsx">
                    {new Date(artifact.timestamp).toLocaleString()}
                  </span>
                </div>
                
                <p className="mt-1 text-gray-600" data-unique-id="8111238d-1184-4627-afcb-7d8fd8a18e76" data-loc="1010:16-1010:50" data-file-name="components/chat/chat-interface.tsx">{artifact.description}</p>
                
                <div className="mt-2 flex items-center text-sm" data-unique-id="0abfac39-3a8e-44ac-9e5c-2d716113d8b9" data-loc="1012:16-1012:64" data-file-name="components/chat/chat-interface.tsx">
                  <div className={cn("px-2 py-1 rounded-full font-medium", artifact.threatScore > 80 ? "bg-red-100 text-red-800" : artifact.threatScore > 50 ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800")} data-unique-id="e7fcff5f-f55f-4147-8bf2-7b9375c416da" data-loc="1013:18-1013:223" data-file-name="components/chat/chat-interface.tsx">
                    Threat Score: {artifact.threatScore}
                  </div>
                  
                  <div className="ml-4 text-gray-500 flex items-center" data-unique-id="950d0460-496b-43ae-8f00-721b42e15273" data-loc="1017:18-1017:72" data-file-name="components/chat/chat-interface.tsx">
                    <Code className="h-4 w-4 mr-1" data-unique-id={`0da901e4-d9d6-4045-963e-420967c8d77b_${index}`} data-loc="1018:20-1018:53" data-file-name="components/chat/chat-interface.tsx" />
                    {artifact.type}
                  </div>
                  
                  <div className="ml-4 text-gray-500 flex items-center" data-unique-id="c2d2881a-6a25-4268-bede-57913cf4c269" data-loc="1022:18-1022:72" data-file-name="components/chat/chat-interface.tsx">
                    <FileText className="h-4 w-4 mr-1" data-unique-id={`2a8e5c10-3d42-4e4f-b7d5-cd535a731eb4_${index}`} data-loc="1023:20-1023:57" data-file-name="components/chat/chat-interface.tsx" />
                    {artifact.path}
                  </div>
                </div>
              </div>
            </div>)}
        </div>
      </div>
    </div>;

  // Render the reports tab
  const renderReports = () => <div className="p-6" data-unique-id="758d19fc-2ebf-4256-a11b-66df60cf099e" data-loc="1034:30-1034:51" data-file-name="components/chat/chat-interface.tsx">
      <div className="flex justify-between items-center mb-6" data-unique-id="acf2ca42-46d7-4390-b60c-c70390ba99af" data-loc="1035:6-1035:62" data-file-name="components/chat/chat-interface.tsx">
        <h2 className="text-2xl font-semibold" data-unique-id="ad61da4a-c5b8-4874-9968-2fbec81add55" data-loc="1036:8-1036:47" data-file-name="components/chat/chat-interface.tsx">Investigation Reports</h2>
        <div className="flex space-x-2" data-unique-id="fbc7008b-69c2-4ffc-b116-4de28f206496" data-loc="1037:8-1037:40" data-file-name="components/chat/chat-interface.tsx">
          <button className="py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center" data-unique-id="4dcd46bb-7c87-4511-b4b9-f54dc900f577" data-loc="1038:10-1038:127" data-file-name="components/chat/chat-interface.tsx">
            <PieChart className="w-4 h-4 mr-2" />
            Generate Charts
          </button>
          <button className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center" data-unique-id="161b1f40-4934-462e-a1ed-439f9c58f41a" data-loc="1042:10-1042:128" data-file-name="components/chat/chat-interface.tsx">
            <DownloadIcon className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>
      
      <div className="bg-white border rounded-lg shadow-sm p-6" data-unique-id="11bd5c69-4838-435d-9c6c-ffce6ced07ef" data-loc="1049:6-1049:64" data-file-name="components/chat/chat-interface.tsx">
        <h3 className="text-lg font-semibold mb-4" data-unique-id="9008b5f7-999a-4342-874f-80612b45a845" data-loc="1050:8-1050:51" data-file-name="components/chat/chat-interface.tsx">Executive Summary</h3>
        <div className="prose max-w-none" data-unique-id="0a6335fc-58a9-4e2d-964a-8bf8a9edd828" data-loc="1051:8-1051:42" data-file-name="components/chat/chat-interface.tsx">
          <p data-unique-id="d9e8d710-c4db-4891-9d41-4903537441dd" data-loc="1052:10-1052:13" data-file-name="components/chat/chat-interface.tsx">
            This investigation was initiated on <strong data-unique-id="dd459190-dbda-4b16-be1d-12133b6089c6" data-loc="1053:48-1053:56" data-file-name="components/chat/chat-interface.tsx">April 25, 2025</strong> following detection of suspicious activity on a corporate workstation. 
            Analysis of the collected evidence indicates a targeted attack with data exfiltration attempts.
          </p>
          
          <h4 className="font-semibold mt-4" data-unique-id="0b87352b-3c88-4c20-904a-bf8b1d46f74a" data-loc="1057:10-1057:45" data-file-name="components/chat/chat-interface.tsx">Key Findings:</h4>
          <ul data-unique-id="9826b13b-a23c-4834-b51e-32093262c488" data-loc="1058:10-1058:14" data-file-name="components/chat/chat-interface.tsx">
            <li data-unique-id="e594abbe-91f3-42f0-8d09-09807f3d979a" data-loc="1059:12-1059:16" data-file-name="components/chat/chat-interface.tsx">Initial compromise occurred on April 24, 2025, through a phishing email containing a malicious attachment.</li>
            <li data-unique-id="30520634-481d-49e5-a33e-bfd8a06616f4" data-loc="1060:12-1060:16" data-file-name="components/chat/chat-interface.tsx">The attack vector was a sophisticated Trojan (detected in <code data-unique-id="ad2ca883-5451-4569-8039-94a045a49aa2" data-loc="1060:74-1060:80" data-file-name="components/chat/chat-interface.tsx">suspicious.exe</code>) with keylogging capabilities.</li>
            <li data-unique-id="e1a3de55-04a3-47d3-96f0-d3efa6674d51" data-loc="1061:12-1061:16" data-file-name="components/chat/chat-interface.tsx">Evidence shows connections to command and control servers at <code data-unique-id="cc2e8afc-84b7-426e-a50e-8b59b5a69901" data-loc="1061:77-1061:83" data-file-name="components/chat/chat-interface.tsx">malicious-domain.xyz</code>.</li>
            <li data-unique-id="dd67668e-23f2-4177-8156-dbe1e4d61c3b" data-loc="1062:12-1062:16" data-file-name="components/chat/chat-interface.tsx">Data exfiltration attempts were detected as files were compressed and staged for extraction.</li>
          </ul>
          
          <h4 className="font-semibold mt-4" data-unique-id="a9473271-cef5-463a-8597-b5a9121e7b30" data-loc="1065:10-1065:45" data-file-name="components/chat/chat-interface.tsx">Evidence Integrity:</h4>
          <p data-unique-id="97f97733-60a2-4a43-a762-b7202bf87fbf" data-loc="1066:10-1066:13" data-file-name="components/chat/chat-interface.tsx">
            All digital evidence was collected following forensically sound procedures. 
            SHA-3 blockchain hashing was employed to ensure evidence integrity, and chain of custody was maintained throughout the investigation.
          </p>
          
          <div className="border-l-4 border-blue-500 pl-4 my-6" data-unique-id="bb9e5e2b-2d40-4aec-8cda-3cf6ef879712" data-loc="1071:10-1071:64" data-file-name="components/chat/chat-interface.tsx">
            <p className="italic" data-unique-id="0ba43225-3e2b-4df7-a308-29cfc6a83418" data-loc="1072:12-1072:34" data-file-name="components/chat/chat-interface.tsx">
              "The artifacts recovered demonstrate a clear pattern of deliberate intrusion and data theft attempts. 
              Based on the timeline of events and technical indicators, this appears to be part of a targeted campaign rather than opportunistic malware."
            </p>
            <p className="font-medium mt-2" data-unique-id="56dd1395-8300-4741-9acb-c1a2b2609680" data-loc="1076:12-1076:44" data-file-name="components/chat/chat-interface.tsx">— ACTA AI Analysis</p>
          </div>
          
          <h4 className="font-semibold mt-4" data-unique-id="2a4f4dd5-d98b-4b7b-b71b-ac32b439dd62" data-loc="1079:10-1079:45" data-file-name="components/chat/chat-interface.tsx">Recommended Actions:</h4>
          <ol data-unique-id="8149e321-14c2-40cb-9b83-6dcddd9d4765" data-loc="1080:10-1080:14" data-file-name="components/chat/chat-interface.tsx">
            <li data-unique-id="a29149db-f9be-4f07-92ea-81b1bd63e79a" data-loc="1081:12-1081:16" data-file-name="components/chat/chat-interface.tsx">Isolate affected systems from the network immediately</li>
            <li data-unique-id="dc20368a-660e-49bd-80fe-ad0ed76770e2" data-loc="1082:12-1082:16" data-file-name="components/chat/chat-interface.tsx">Block all outbound connections to identified command and control servers</li>
            <li data-unique-id="3cf8f7ee-5d29-462a-b857-4d4c210eb9ed" data-loc="1083:12-1083:16" data-file-name="components/chat/chat-interface.tsx">Reset credentials for all potentially compromised accounts</li>
            <li data-unique-id="87249131-c7cf-455d-9a5e-778f83640a1a" data-loc="1084:12-1084:16" data-file-name="components/chat/chat-interface.tsx">Preserve memory dumps and disk images for further forensic analysis</li>
            <li data-unique-id="e3d6f33a-78bd-4a19-b7e4-289144f7fcf9" data-loc="1085:12-1085:16" data-file-name="components/chat/chat-interface.tsx">Implement enhanced monitoring for similar indicators of compromise</li>
          </ol>
        </div>
        
        <div className="mt-8 border-t pt-6" data-unique-id="790a2d05-943b-4ee7-a90d-4d5021971cab" data-loc="1089:8-1089:44" data-file-name="components/chat/chat-interface.tsx">
          <h3 className="text-lg font-semibold mb-4" data-unique-id="94b286fb-748d-452a-8010-4c98909df808" data-loc="1090:10-1090:53" data-file-name="components/chat/chat-interface.tsx">Technical Details</h3>
          <div className="overflow-x-auto" data-unique-id="27842377-1b91-48e8-b292-9ea1bceec402" data-loc="1091:10-1091:43" data-file-name="components/chat/chat-interface.tsx">
            <table className="min-w-full divide-y divide-gray-200" data-unique-id="998df931-eb3c-4466-ab7a-22616d3e8882" data-loc="1092:12-1092:67" data-file-name="components/chat/chat-interface.tsx">
              <thead data-unique-id="2d1210ca-d3b8-4e1e-a659-5d20d81cbc7e" data-loc="1093:14-1093:21" data-file-name="components/chat/chat-interface.tsx">
                <tr data-unique-id="502413fc-3282-4cda-b31e-3d81110560ae" data-loc="1094:16-1094:20" data-file-name="components/chat/chat-interface.tsx">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500" data-unique-id="03d371c2-ec8f-4326-9bfb-e17d8155599a" data-loc="1095:18-1095:88" data-file-name="components/chat/chat-interface.tsx">IOC Type</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500" data-unique-id="4bc4db05-e4d0-4277-a117-9a2ba4857ffb" data-loc="1096:18-1096:88" data-file-name="components/chat/chat-interface.tsx">Indicator</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500" data-unique-id="ad0bb378-fc52-4162-aa1e-82543670f133" data-loc="1097:18-1097:88" data-file-name="components/chat/chat-interface.tsx">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200" data-unique-id="3d468474-e1b6-4949-b32f-c09f7404825f" data-loc="1100:14-1100:58" data-file-name="components/chat/chat-interface.tsx">
                <tr data-unique-id="99f50240-897b-4a1d-90ff-115f73b86739" data-loc="1101:16-1101:20" data-file-name="components/chat/chat-interface.tsx">
                  <td className="px-4 py-2 text-sm" data-unique-id="4fab4947-0207-496e-a074-505eed55bebd" data-loc="1102:18-1102:52" data-file-name="components/chat/chat-interface.tsx">File Hash</td>
                  <td className="px-4 py-2 text-sm font-mono" data-unique-id="2686827e-d25b-4160-baea-d7f6f293ff87" data-loc="1103:18-1103:62" data-file-name="components/chat/chat-interface.tsx">a1c2e3b4d5f6...</td>
                  <td className="px-4 py-2 text-sm" data-unique-id="70bf1c58-5d06-4a60-9738-ea6ef37f6551" data-loc="1104:18-1104:52" data-file-name="components/chat/chat-interface.tsx">Trojan executable</td>
                </tr>
                <tr data-unique-id="afbc0e68-7392-4b62-9e71-401ada7aa2ef" data-loc="1106:16-1106:20" data-file-name="components/chat/chat-interface.tsx">
                  <td className="px-4 py-2 text-sm" data-unique-id="4c60076d-dd85-4176-95c0-87dbafada2a5" data-loc="1107:18-1107:52" data-file-name="components/chat/chat-interface.tsx">Domain</td>
                  <td className="px-4 py-2 text-sm font-mono" data-unique-id="ea4d6942-7955-43d7-bef4-bf66e4656726" data-loc="1108:18-1108:62" data-file-name="components/chat/chat-interface.tsx">malicious-domain.xyz</td>
                  <td className="px-4 py-2 text-sm" data-unique-id="1652cb36-ac0d-48f5-a2be-b62cd31c017d" data-loc="1109:18-1109:52" data-file-name="components/chat/chat-interface.tsx">Command & control server</td>
                </tr>
                <tr data-unique-id="95ff5e13-c824-4bbb-9238-0240050ea62b" data-loc="1111:16-1111:20" data-file-name="components/chat/chat-interface.tsx">
                  <td className="px-4 py-2 text-sm" data-unique-id="601033d3-1c0a-410b-b382-34ecb95e1cd0" data-loc="1112:18-1112:52" data-file-name="components/chat/chat-interface.tsx">IP Address</td>
                  <td className="px-4 py-2 text-sm font-mono" data-unique-id="dafca958-0359-482d-9cdf-5daac0b5dd16" data-loc="1113:18-1113:62" data-file-name="components/chat/chat-interface.tsx">192.168.0.123</td>
                  <td className="px-4 py-2 text-sm" data-unique-id="207e0f5d-0096-4782-9e0e-064431a75d82" data-loc="1114:18-1114:52" data-file-name="components/chat/chat-interface.tsx">Internal compromised host</td>
                </tr>
                <tr data-unique-id="eddad1d7-f546-4409-8b9d-b91a63da9460" data-loc="1116:16-1116:20" data-file-name="components/chat/chat-interface.tsx">
                  <td className="px-4 py-2 text-sm" data-unique-id="3f2bfb39-80aa-40fb-a6f8-c11163a2ad10" data-loc="1117:18-1117:52" data-file-name="components/chat/chat-interface.tsx">Registry Key</td>
                  <td className="px-4 py-2 text-sm font-mono" data-unique-id="a42fc640-ca2f-499a-8e1f-3acb5ac81cb0" data-loc="1118:18-1118:62" data-file-name="components/chat/chat-interface.tsx">HKCU\Software\...</td>
                  <td className="px-4 py-2 text-sm" data-unique-id="ce82003c-50df-481a-8c30-02d97c68a262" data-loc="1119:18-1119:52" data-file-name="components/chat/chat-interface.tsx">Persistence mechanism</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>;
  return <div className="flex h-screen bg-gray-100" data-unique-id="86e1fbfc-9d8f-430b-be83-e6f455146cee" data-loc="1127:9-1127:52" data-file-name="components/chat/chat-interface.tsx">
      {/* Sidebar */}
      <div className="w-20 bg-white border-r flex flex-col items-center py-6" data-unique-id="795017a4-c609-4516-b1f6-00633c0b7690" data-loc="1129:6-1129:78" data-file-name="components/chat/chat-interface.tsx">
        <div className="mb-8" data-unique-id="195f5c52-1fdf-492f-9d9e-7f4c5c28cac9" data-loc="1130:8-1130:30" data-file-name="components/chat/chat-interface.tsx">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold" data-unique-id="ea295b2d-8ac4-4ed0-b189-e132bafc13d6" data-loc="1131:10-1131:116" data-file-name="components/chat/chat-interface.tsx">
            CS
          </div>
        </div>
        
        <nav className="flex-1 flex flex-col items-center space-y-6" data-unique-id="0429f3cd-d1a4-47f9-93fc-5f28f92d8809" data-loc="1136:8-1136:69" data-file-name="components/chat/chat-interface.tsx">
          <button className={cn("w-12 h-12 rounded-lg flex items-center justify-center", activeTab === "dashboard" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100")} onClick={() => setActiveTab("dashboard")} data-unique-id="3dc12a36-6700-4d7f-991c-1bdcb1e6396e" data-loc="1137:10-1137:225" data-file-name="components/chat/chat-interface.tsx">
            <BarChart3 className="h-6 w-6" />
          </button>
          
          <button className={cn("w-12 h-12 rounded-lg flex items-center justify-center", activeTab === "evidence" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100")} onClick={() => setActiveTab("evidence")} data-unique-id="d643cf43-f89d-4050-ab91-f55b6308aa43" data-loc="1141:10-1141:223" data-file-name="components/chat/chat-interface.tsx">
            <FileText className="h-6 w-6" />
          </button>
          
          <button className={cn("w-12 h-12 rounded-lg flex items-center justify-center", activeTab === "analysis" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100")} onClick={() => setActiveTab("analysis")} data-unique-id="a4e16c33-c7d4-4f8d-88cf-49deaa36acd2" data-loc="1145:10-1145:223" data-file-name="components/chat/chat-interface.tsx">
            <Cpu className="h-6 w-6" />
          </button>
          
          <button className={cn("w-12 h-12 rounded-lg flex items-center justify-center", activeTab === "timeline" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100")} onClick={() => setActiveTab("timeline")} data-unique-id="fc1e203a-1bff-4a36-b0e5-64b8ac69bcd8" data-loc="1149:10-1149:223" data-file-name="components/chat/chat-interface.tsx">
            <Clock className="h-6 w-6" />
          </button>
          
          <button className={cn("w-12 h-12 rounded-lg flex items-center justify-center tooltip-container", activeTab === "threats" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100")} onClick={() => setActiveTab("threats")} data-unique-id="d27c1e34-4e84-4c2e-b61b-e434e34cb04c" data-loc="1153:10-1153:239" data-file-name="components/chat/chat-interface.tsx">
            <AlertOctagon className="h-6 w-6" />
            {threatAlerts.length > 0 && <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center" data-unique-id="ac852047-9428-40a5-8bab-cdec2c1fed20" data-loc="1155:40-1155:165" data-file-name="components/chat/chat-interface.tsx">
                {threatAlerts.length > 9 ? '9+' : threatAlerts.length}
              </span>}
          </button>
          
          <button className={cn("w-12 h-12 rounded-lg flex items-center justify-center", activeTab === "reports" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100")} onClick={() => setActiveTab("reports")} data-unique-id="d7df075b-4425-461a-8aae-8692221582e7" data-loc="1160:10-1160:221" data-file-name="components/chat/chat-interface.tsx">
            <FileBarChart className="h-6 w-6" />
          </button>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto" data-unique-id="1b7389bd-f78b-4734-b186-5fc7e03abd8d" data-loc="1167:6-1167:44" data-file-name="components/chat/chat-interface.tsx">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center" data-unique-id="aa4bd5de-cd22-481d-b48e-5d0af87deef3" data-loc="1169:8-1169:90" data-file-name="components/chat/chat-interface.tsx">
          <div className="flex items-center" data-unique-id="42c755cb-1b58-416c-9bd3-9b585c7933de" data-loc="1170:10-1170:45" data-file-name="components/chat/chat-interface.tsx">
            <div className="mr-6" data-unique-id="0fc0c9e2-822c-461c-987a-68d4710e5aab" data-loc="1171:12-1171:34" data-file-name="components/chat/chat-interface.tsx">
              <h1 className="text-2xl font-bold text-gray-900" data-unique-id="c08e444c-df51-4aaf-b2f6-d641bbdb62c6" data-loc="1172:14-1172:63" data-file-name="components/chat/chat-interface.tsx">Cybersift</h1>
              <p className="text-sm text-gray-500" data-unique-id="5eeb2711-346a-4543-8940-1f43303329d4" data-loc="1173:14-1173:51" data-file-name="components/chat/chat-interface.tsx">Advanced Forensic Platform</p>
            </div>
          
            <div data-unique-id="c1de2a99-0285-493e-911d-c717c66bb28b" data-loc="1176:12-1176:17" data-file-name="components/chat/chat-interface.tsx">
              <DatabaseStatus />
            </div>
            
            <div className="flex items-center space-x-2" data-unique-id="6c4d62ff-edcc-4c6c-ab6b-d468716a6a06" data-loc="1180:12-1180:57" data-file-name="components/chat/chat-interface.tsx">
              <select value={selectedCase || ''} onChange={e => setSelectedCase(e.target.value ? parseInt(e.target.value) : null)} className="pl-3 pr-8 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" data-unique-id="66107802-77dc-4531-8774-27833df4f9f9" data-loc="1181:14-1181:236" data-file-name="components/chat/chat-interface.tsx">
                <option value="" data-unique-id="bbaaf563-6c91-436e-9e67-0edd44b5ae74" data-loc="1182:16-1182:33" data-file-name="components/chat/chat-interface.tsx">Select Case</option>
                {cases.map(caseItem => <option key={caseItem.id} value={caseItem.id} data-unique-id="1b9f1ff5-0c75-4e0d-8946-10dad0b8a9cd" data-loc="1183:39-1183:85" data-file-name="components/chat/chat-interface.tsx">
                    {caseItem.title}
                  </option>)}
              </select>
              
              <button onClick={() => setShowCreateCaseDialog(true)} className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 rounded-lg" title="Create New Case" data-unique-id="407db797-fbe3-4700-92bf-a6f01391aa28" data-loc="1188:14-1188:164" data-file-name="components/chat/chat-interface.tsx">
                <PlusCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4" data-unique-id="4767f3ba-56cb-4a72-a2c9-987242f2effe" data-loc="1194:10-1194:55" data-file-name="components/chat/chat-interface.tsx">
            <div className="relative" data-unique-id="21bc93d5-59ed-4fc3-9018-84f8122d31e4" data-loc="1195:12-1195:38" data-file-name="components/chat/chat-interface.tsx">
              <input type="text" placeholder="Search evidence..." className="pl-8 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" data-unique-id="36d20240-d016-4ecb-91e2-6314d4179134" data-loc="1196:14-1196:173" data-file-name="components/chat/chat-interface.tsx" />
              <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
            
            <button className="p-2 text-gray-500 hover:text-gray-700" data-unique-id="dc3185e2-161f-4dff-b750-1429853b7d37" data-loc="1200:12-1200:70" data-file-name="components/chat/chat-interface.tsx">
              <Shield className="h-5 w-5" />
            </button>
            
            <button className="p-2 text-gray-500 hover:text-gray-700" data-unique-id="4edca18a-17fe-4ee2-85b4-a4acd4c8056a" data-loc="1204:12-1204:70" data-file-name="components/chat/chat-interface.tsx">
              <Zap className="h-5 w-5" />
            </button>
            
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium" data-unique-id="83215c15-a2f3-4069-ba94-e04efce4bc69" data-loc="1208:12-1208:121" data-file-name="components/chat/chat-interface.tsx">
              U
            </div>
          </div>
        </header>
        
        {/* Dynamic content based on active tab */}
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "evidence" && renderEvidence()}
        {activeTab === "analysis" && renderAnalysis()}
        {activeTab === "timeline" && renderTimeline()}
        {activeTab === "threats" && renderThreats()}
        {activeTab === "reports" && renderReports()}
      </div>

      {/* AI Analysis Dialog */}
      {showAIAnalysisDialog && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-unique-id="a513c305-3d75-4e89-9b1a-b82cbeedc314" data-loc="1224:31-1224:123" data-file-name="components/chat/chat-interface.tsx">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl" data-unique-id="5197b9bc-264b-4ea6-86f5-085f975f2dc9" data-loc="1225:10-1225:68" data-file-name="components/chat/chat-interface.tsx">
            <div className="flex justify-between items-center mb-6" data-unique-id="d11b285e-b34e-4d66-9fd7-a4232993812e" data-loc="1226:12-1226:68" data-file-name="components/chat/chat-interface.tsx">
              <h3 className="text-lg font-semibold" data-unique-id="911cbf36-488a-45b3-a50a-05203e86c171" data-loc="1227:14-1227:52" data-file-name="components/chat/chat-interface.tsx">Forensic Analysis Results</h3>
              
              {!isProcessingAI && <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowAIAnalysisDialog(false)} data-unique-id="2f46590c-1cf1-41fa-9ff4-e5b8579841f5" data-loc="1229:34-1229:135" data-file-name="components/chat/chat-interface.tsx">
                  <X className="h-5 w-5" />
                </button>}
            </div>
            
            <AIResults result={aiAnalysisResult ? {
          attack: aiAnalysisResult.detectedAttackType,
          confidence: aiAnalysisResult.confidence,
          anomalyScore: aiAnalysisResult.anomalyScore,
          iocs: Object.keys(aiAnalysisResult.featureImportance || {}),
          explanation: aiAnalysisResult.explanation,
          mlPrediction: {
            isAttack: aiAnalysisResult.confidence > 0.7,
            attackType: aiAnalysisResult.detectedAttackType,
            confidence: aiAnalysisResult.confidence * 100,
            anomalyScore: aiAnalysisResult.anomalyScore * 100,
            predictions: {
              [aiAnalysisResult.detectedAttackType]: aiAnalysisResult.confidence * 100,
              "Normal": (1 - aiAnalysisResult.confidence) * 100
            },
            featureImportance: aiAnalysisResult.featureImportance,
            modelUsed: "RandomForest"
          }
        } : null} isLoading={isProcessingAI} evidenceId={selectedEvidenceForAnalysis?.id || 0} evidenceName={selectedEvidenceForAnalysis?.name} onClose={() => setShowAIAnalysisDialog(false)} />
          </div>
        </div>}
    </div>;
}
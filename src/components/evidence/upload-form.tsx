'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2, Upload, AlertCircle, CheckCircle, FileDigit, FileText, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateSHA256, formatBytes } from '@/lib/utils';
import { cn } from '@/lib/utils';
type FileWithProgress = {
  file: File;
  progress: number;
  hash?: string;
  status: 'pending' | 'hashing' | 'uploading' | 'complete' | 'error';
  error?: string;
};
type UploadFormProps = {
  caseId: number | null;
  onUploadComplete: (fileData: {
    name: string;
    type: string;
    size: string;
    hash: string;
  }) => void;
  onClose: () => void;
};
export default function UploadForm({
  caseId,
  onUploadComplete,
  onClose
}: UploadFormProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);
  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.log', '.txt'],
      'application/octet-stream': ['.pcap', '.pcapng'],
      'application/json': ['.json'],
      'application/xml': ['.xml'],
      'application/x-evtx': ['.evtx']
    },
    maxSize: 1024 * 1024 * 100 // 100MB max size
  });
  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  const processFiles = async () => {
    if (!caseId) {
      alert('Please select a case first');
      return;
    }
    setIsUploading(true);
    const updatedFiles = [...files];

    // Process files one by one
    for (let i = 0; i < updatedFiles.length; i++) {
      const fileData = updatedFiles[i];
      try {
        // Update status to hashing
        updatedFiles[i] = {
          ...fileData,
          status: 'hashing' as const,
          progress: 10
        };
        setFiles([...updatedFiles]);

        // Calculate SHA-256 hash
        const hash = await calculateSHA256(fileData.file);
        updatedFiles[i] = {
          ...updatedFiles[i],
          hash,
          progress: 30,
          status: 'uploading' as const
        };
        setFiles([...updatedFiles]);

        // Simulate upload with progress updates
        await simulateFileUpload(i, updatedFiles);

        // Complete the upload
        const completedFile = {
          ...updatedFiles[i],
          progress: 100,
          status: 'complete' as const
        };
        updatedFiles[i] = completedFile;
        setFiles([...updatedFiles]);

        // Call the callback with uploaded file info
        onUploadComplete({
          name: fileData.file.name,
          type: getFileType(fileData.file),
          size: formatBytes(fileData.file.size),
          hash: hash
        });
      } catch (error) {
        console.error("Error processing file:", error);
        updatedFiles[i] = {
          ...fileData,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        setFiles([...updatedFiles]);
      }
    }
    setIsUploading(false);
  };
  const simulateFileUpload = async (index: number, filesArray: FileWithProgress[]) => {
    const totalSteps = 7;
    const incrementPerStep = (100 - filesArray[index].progress) / totalSteps;
    for (let step = 0; step < totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newProgress = Math.min(filesArray[index].progress + incrementPerStep, 95);
      filesArray[index] = {
        ...filesArray[index],
        progress: newProgress
      };
      setFiles([...filesArray]);
    }
  };
  const getFileType = (file: File): string => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension) return 'Unknown';
    switch (extension) {
      case 'pcap':
      case 'pcapng':
        return 'Network Capture';
      case 'log':
      case 'txt':
        return 'Log File';
      case 'json':
        return 'JSON Data';
      case 'xml':
        return 'XML Data';
      case 'evtx':
        return 'Event Log';
      default:
        return `${extension.toUpperCase()} File`;
    }
  };
  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pcap':
      case 'pcapng':
        return <Database className="h-6 w-6" />;
      case 'log':
      case 'txt':
        return <FileText className="h-6 w-6" />;
      case 'json':
      case 'xml':
      case 'evtx':
        return <FileDigit className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };
  return <div className="w-full space-y-6" data-unique-id="1686ece8-e066-4de0-8048-de1eed287c89" data-loc="170:9-170:43" data-file-name="components/evidence/upload-form.tsx">
      <div {...getRootProps()} className={cn("border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer", isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50")} data-unique-id="27cbd951-57bf-4d14-b2e6-e97467e3281b" data-loc="171:6-171:233" data-file-name="components/evidence/upload-form.tsx">
        <input {...getInputProps()} data-unique-id="f8a8f890-c0c4-496d-bf80-51f4299caf77" data-loc="172:8-172:38" data-file-name="components/evidence/upload-form.tsx" />
        <Upload className={cn("mx-auto h-12 w-12 transition-colors", isDragActive ? "text-blue-500" : "text-gray-400")} />
        
        {isDragActive ? <p className="mt-4 text-blue-600 font-medium" data-unique-id="c6818393-847e-4ca2-addb-deda0faf33e2" data-loc="175:24-175:70" data-file-name="components/evidence/upload-form.tsx">Drop files here...</p> : <div data-unique-id="341873c8-56e2-4075-b6df-7f872214e0d7" data-loc="175:95-175:100" data-file-name="components/evidence/upload-form.tsx">
            <p className="mt-4 text-gray-700" data-unique-id="daa6e9b0-85e9-4bd6-8578-9f1979fda24a" data-loc="176:12-176:46" data-file-name="components/evidence/upload-form.tsx">Drag and drop evidence files here or click to browse</p>
            <p className="mt-2 text-sm text-gray-500" data-unique-id="d9181ec8-09c8-448f-a74d-a30fb22dce78" data-loc="177:12-177:54" data-file-name="components/evidence/upload-form.tsx">
              Supported formats: .log, .txt, .pcap, .pcapng, .json, .xml, .evtx (Max 100MB)
            </p>
          </div>}
      </div>
      
      {files.length > 0 && <div className="border rounded-lg overflow-hidden" data-unique-id="3b48ab76-4712-4824-85f4-9a275ae45dfb" data-loc="183:27-183:78" data-file-name="components/evidence/upload-form.tsx">
          <div className="bg-gray-50 px-4 py-2 border-b" data-unique-id="d7652527-c524-4126-9c97-50656779c8d0" data-loc="184:10-184:57" data-file-name="components/evidence/upload-form.tsx">
            <h3 className="font-medium" data-unique-id="b7f06b34-21f8-4e29-92b8-3a1aee68b07b" data-loc="185:12-185:40" data-file-name="components/evidence/upload-form.tsx">Selected Files ({files.length})</h3>
          </div>
          <ul className="divide-y" data-unique-id="5d8ffc97-f83c-45b2-b263-1ce888e32c2a" data-loc="187:10-187:35" data-file-name="components/evidence/upload-form.tsx">
            {files.map((fileData, index) => <li key={index} className="p-4" data-unique-id="b6aac384-db1d-4d77-9735-5401ae97253b" data-loc="188:44-188:76" data-file-name="components/evidence/upload-form.tsx">
                <div className="flex items-start" data-unique-id="369b4100-b24e-46fc-9086-f4f2fa47e201" data-loc="189:16-189:50" data-file-name="components/evidence/upload-form.tsx">
                  <div className="mr-3 text-gray-500" data-unique-id="02f043c0-6172-4c48-80d6-d18bbd13de2b" data-loc="190:18-190:54" data-file-name="components/evidence/upload-form.tsx">
                    {getFileIcon(fileData.file)}
                  </div>
                  <div className="flex-1 min-w-0" data-unique-id="6bfba0bc-156d-448c-b730-feeaa13cf64d" data-loc="193:18-193:50" data-file-name="components/evidence/upload-form.tsx">
                    <p className="font-medium text-gray-900 truncate" data-unique-id="8fefcff0-2832-453a-9a91-71dad52b3db7" data-loc="194:20-194:70" data-file-name="components/evidence/upload-form.tsx">{fileData.file.name}</p>
                    <p className="text-sm text-gray-500" data-unique-id="7489e31b-9090-45b8-9771-fd3689d59ce1" data-loc="195:20-195:57" data-file-name="components/evidence/upload-form.tsx">
                      {getFileType(fileData.file)} • {formatBytes(fileData.file.size)}
                    </p>
                    
                    {fileData.hash && <p className="text-xs text-gray-500 font-mono mt-1 truncate" data-unique-id="10abdfdb-51a7-4544-83b6-fb8cf0debfaa" data-loc="199:38-199:99" data-file-name="components/evidence/upload-form.tsx">
                        SHA-256: {fileData.hash}
                      </p>}
                    
                    {fileData.status === 'error' && <p className="text-sm text-red-600 mt-1 flex items-center" data-unique-id="db07ce66-b02e-4a0e-99ff-c01f3e736aae" data-loc="203:52-203:111" data-file-name="components/evidence/upload-form.tsx">
                        <AlertCircle className="h-4 w-4 mr-1" data-unique-id={`cf3c6942-ef59-4463-a382-10f386f91783_${index}`} data-loc="204:24-204:64" data-file-name="components/evidence/upload-form.tsx" />
                        {fileData.error || 'Upload failed'}
                      </p>}
                    
                    {(fileData.status === 'hashing' || fileData.status === 'uploading') && <div className="mt-2" data-unique-id="e4eae620-af6f-4d28-aa99-46f23d88fd14" data-loc="208:91-208:113" data-file-name="components/evidence/upload-form.tsx">
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden" data-unique-id="f279b1a7-7982-4689-be27-c6a76a5accfb" data-loc="209:24-209:95" data-file-name="components/evidence/upload-form.tsx">
                          <motion.div className="h-full bg-blue-600 rounded-full" initial={{
                    width: 0
                  }} animate={{
                    width: `${fileData.progress}%`
                  }} transition={{
                    duration: 0.3
                  }} data-unique-id="658001e2-fb2e-40dc-88ce-eabfe9a85aca" data-loc="210:26-216:23" data-file-name="components/evidence/upload-form.tsx" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1" data-unique-id="d8a4af6f-0013-47db-817d-f4c7f270a488" data-loc="218:24-218:66" data-file-name="components/evidence/upload-form.tsx">
                          {fileData.status === 'hashing' ? 'Calculating hash...' : 'Uploading...'}
                          {' '}{Math.round(fileData.progress)}%
                        </p>
                      </div>}
                    
                    {fileData.status === 'complete' && <p className="text-sm text-green-600 mt-1 flex items-center" data-unique-id="bd38f869-ba42-4927-a9a4-37ab9dfa379d" data-loc="224:55-224:116" data-file-name="components/evidence/upload-form.tsx">
                        <CheckCircle className="h-4 w-4 mr-1" data-unique-id={`e130ef20-b70f-4f5a-b886-0e10c01d2fec_${index}`} data-loc="225:24-225:64" data-file-name="components/evidence/upload-form.tsx" />
                        Upload complete
                      </p>}
                  </div>
                  
                  {fileData.status !== 'uploading' && fileData.status !== 'hashing' && <button onClick={() => handleRemoveFile(index)} className="ml-3 text-gray-400 hover:text-gray-600" disabled={isUploading} data-unique-id="353efdea-49ef-43d2-9a2c-d206af507cce" data-loc="230:87-230:209" data-file-name="components/evidence/upload-form.tsx">
                      <span className="sr-only" data-unique-id="cf0c6b33-bd92-4b83-968b-fbb7c883cd42" data-loc="231:22-231:48" data-file-name="components/evidence/upload-form.tsx">Remove</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" data-unique-id="cdae0774-042b-4224-8842-59a8f63ab6df" data-loc="232:22-232:87" data-file-name="components/evidence/upload-form.tsx">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" data-unique-id={`a834eb15-a1d3-45b6-b918-1e0aa80b75fe_${index}`} data-loc="233:24-233:269" data-file-name="components/evidence/upload-form.tsx" />
                      </svg>
                    </button>}
                </div>
              </li>)}
          </ul>
        </div>}
      
      <div className="flex justify-end space-x-3" data-unique-id="b41c0980-ae59-44d6-96f6-3d3ff9de5d4c" data-loc="241:6-241:50" data-file-name="components/evidence/upload-form.tsx">
        <button className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900" onClick={onClose} disabled={isUploading} data-unique-id="73d6bad5-8cc2-448a-8583-3d253414a22b" data-loc="242:8-242:121" data-file-name="components/evidence/upload-form.tsx">
          Cancel
        </button>
        <button className={cn("px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center", (isUploading || files.length === 0) && "opacity-50 cursor-not-allowed")} onClick={processFiles} disabled={isUploading || files.length === 0} data-unique-id="4a7de2f8-1158-4486-a053-258a24c0fff1" data-loc="245:8-245:364" data-file-name="components/evidence/upload-form.tsx">
          {isUploading ? <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </> : <>
              Upload & Analyze
            </>}
        </button>
      </div>
    </div>;
}
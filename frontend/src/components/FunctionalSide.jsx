import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  Scan,
  BookOpen,
  Lightbulb,
  Globe,
  FileText,
  Edit,
  PenTool,
  BarChart3,
  Upload,
  Loader2
} from 'lucide-react';

import { useDocumentStore } from '../store/documentStore';
import { useAIStore } from '../store/aiStore';

const functions = [
  {
    id: 'scan',
    name: 'Scan Document',
    icon: Scan,
    description: 'Upload and scan documents',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'read',
    name: 'Read',
    icon: BookOpen,
    description: 'Listen to text content',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'explain',
    name: 'Explain',
    icon: Lightbulb,
    description: 'Get AI explanations',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'translate',
    name: 'Translate',
    icon: Globe,
    description: 'Translate text',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'pdf',
    name: 'Create PDF',
    icon: FileText,
    description: 'Convert text to PDF',
    color: 'from-red-500 to-rose-500'
  },
  {
    id: 'edit',
    name: 'Edit',
    icon: Edit,
    description: 'Edit documents',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    id: 'sign',
    name: 'Sign',
    icon: PenTool,
    description: 'Digital signatures',
    color: 'from-teal-500 to-cyan-500'
  },
  {
    id: 'report',
    name: 'Generate Report',
    icon: BarChart3,
    description: 'Create reports',
    color: 'from-orange-500 to-red-500'
  }
];

export default function FunctionalSide() {
  const [activeFunction, setActiveFunction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  
  const { uploadDocument, currentDocument } = useDocumentStore();
  const { processAIRequest } = useAIStore();

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      await uploadDocument(file);
      toast.success('Document uploaded successfully!');
      
      // Auto-trigger OCR after upload
      if (currentDocument) {
        await processAIRequest('ocr', { documentId: currentDocument.id });
        toast.success('Document processed with OCR!');
      }
    } catch (error) {
      toast.error('Failed to upload document');
      console.error('Upload error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  const handleFunctionClick = async (functionId) => {
    setActiveFunction(functionId);
    setIsProcessing(true);

    try {
      switch (functionId) {
        case 'scan':
          fileInputRef.current?.click();
          break;
        
        case 'read':
          if (!currentDocument) {
            toast.error('Please upload a document first');
            return;
          }
          await processAIRequest('tts', { 
            text: currentDocument.extracted_text || 'No text available' 
          });
          toast.success('Reading document...');
          break;
        
        case 'explain':
          if (!currentDocument) {
            toast.error('Please upload a document first');
            return;
          }
          await processAIRequest('explain', { 
            text: currentDocument.extracted_text || 'No text available',
            documentId: currentDocument.id
          });
          toast.success('Generating explanation...');
          break;
        
        case 'translate':
          if (!currentDocument) {
            toast.error('Please upload a document first');
            return;
          }
          await processAIRequest('translate', { 
            text: currentDocument.extracted_text || 'No text available',
            targetLanguage: 'English',
            documentId: currentDocument.id
          });
          toast.success('Translating text...');
          break;
        
        case 'pdf':
          if (!currentDocument) {
            toast.error('Please upload a document first');
            return;
          }
          await processAIRequest('pdf', { 
            text: currentDocument.extracted_text || 'Sample text for PDF',
            title: currentDocument.title
          });
          toast.success('Creating PDF...');
          break;
        
        case 'report':
          if (!currentDocument) {
            toast.error('Please upload a document first');
            return;
          }
          await processAIRequest('report', { 
            data: currentDocument.extracted_text || 'Sample data for report',
            reportType: 'summary',
            documentId: currentDocument.id
          });
          toast.success('Generating report...');
          break;
        
        default:
          toast.success(`${functionId} function activated!`);
      }
    } catch (error) {
      toast.error(`Failed to execute ${functionId}`);
      console.error('Function error:', error);
    } finally {
      setIsProcessing(false);
      setActiveFunction(null);
    }
  };

  return (
    <div className="glass-morphism p-6 rounded-2xl h-full">
      <h2 className="text-xl font-bold mb-6 text-center bg-gradient-to-r from-rendix-blue to-cyan-400 bg-clip-text text-transparent">
        Functions
      </h2>
      
      <div className="space-y-3">
        {functions.map((func) => {
          const Icon = func.icon;
          const isActive = activeFunction === func.id;
          
          return (
            <motion.button
              key={func.id}
              onClick={() => handleFunctionClick(func.id)}
              disabled={isProcessing}
              className={`
                w-full glass-button p-4 flex items-center space-x-3
                transition-all duration-300 relative overflow-hidden group
                ${isActive ? 'ring-2 ring-rendix-blue ring-offset-2 ring-offset-rendix-dark' : ''}
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              whileHover={{ scale: isProcessing ? 1 : 1.02 }}
              whileTap={{ scale: isProcessing ? 1 : 0.98 }}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${func.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
              
              {/* Icon */}
              <div className={`
                p-2 rounded-lg bg-gradient-to-r ${func.color}
                ${isProcessing ? 'animate-spin' : ''}
              `}>
                <Icon size={20} className="text-white" />
              </div>
              
              {/* Content */}
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-sm text-white">{func.name}</h3>
                <p className="text-xs text-gray-400">{func.description}</p>
              </div>
              
              {/* Loading indicator */}
              {isActive && isProcessing && (
                <Loader2 size={16} className="text-rendix-blue animate-spin" />
              )}
            </motion.button>
          );
        })}
      </div>
      
      {/* Hidden file input */}
      <div {...getRootProps()} className="hidden">
        <input {...getInputProps()} ref={fileInputRef} />
      </div>
      
      {/* Drag overlay */}
      {isDragActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-morphism p-8 rounded-2xl text-center">
            <Upload size={48} className="mx-auto mb-4 text-rendix-blue" />
            <p className="text-xl font-semibold mb-2">Drop document here</p>
            <p className="text-gray-400">Supports images and PDF files</p>
          </div>
        </div>
      )}
    </div>
  );
}

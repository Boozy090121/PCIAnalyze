"use client";

import React, { createContext, useContext, useState } from 'react';

// Define context types
interface DashboardContextType {
  // Data state
  rawData: Record<string, any>[] | null;
  setRawData: (data: Record<string, any>[] | null) => void;
  
  // File processing state
  isProcessing: boolean;
  processingProgress: number;
  processingStage: 'idle' | 'parsing' | 'analyzing' | 'complete' | 'error';
  processingError: string | null;
  
  // Filter state
  filters: {
    dateRange: { startDate: Date | null; endDate: Date | null };
    processTypes: string[];
    departments: string[];
  };
  setFilters: (filters: any) => void;
  
  // File handling
  handleFileUpload: (file: File) => void;
  resetData: () => void;
}

// Create context with default values
const DashboardContext = createContext<DashboardContextType>({
  rawData: null,
  setRawData: () => {},
  isProcessing: false,
  processingProgress: 0,
  processingStage: 'idle',
  processingError: null,
  filters: {
    dateRange: { startDate: null, endDate: null },
    processTypes: [],
    departments: []
  },
  setFilters: () => {},
  handleFileUpload: () => {},
  resetData: () => {}
});

// Custom hook to use the dashboard context
export const useDashboard = () => useContext(DashboardContext);

// Provider component
export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Data state
  const [rawData, setRawData] = useState<Record<string, any>[] | null>(null);
  
  // File processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState<'idle' | 'parsing' | 'analyzing' | 'complete' | 'error'>('idle');
  const [processingError, setProcessingError] = useState<string | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    dateRange: { startDate: null as Date | null, endDate: null as Date | null },
    processTypes: [] as string[],
    departments: [] as string[]
  });
  
  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      setIsProcessing(true);
      setProcessingStage('parsing');
      setProcessingProgress(0);
      setProcessingError(null);
      
      // Simulate file processing
      setTimeout(() => {
        setProcessingProgress(50);
        setProcessingStage('analyzing');
        
        setTimeout(() => {
          // Simulate completion
          setProcessingProgress(100);
          setProcessingStage('complete');
          setIsProcessing(false);
          
          // Set mock data
          setRawData([
            { id: 1, process: 'Process A', success: true, duration: 4.3 },
            { id: 2, process: 'Process B', success: false, duration: 5.7 },
            { id: 3, process: 'Process C', success: true, duration: 3.9 }
          ]);
          
          alert('File processed successfully! (Demo data loaded)');
        }, 1000);
      }, 1000);
      
    } catch (error: any) {
      setProcessingError(error.message);
      setProcessingStage('error');
      setIsProcessing(false);
    }
  };
  
  // Reset all data
  const resetData = () => {
    setRawData(null);
    setProcessingStage('idle');
    setProcessingProgress(0);
    setProcessingError(null);
    setFilters({
      dateRange: { startDate: null, endDate: null },
      processTypes: [],
      departments: []
    });
  };
  
  // Create context value
  const contextValue = {
    rawData,
    setRawData,
    isProcessing,
    processingProgress,
    processingStage,
    processingError,
    filters,
    setFilters,
    handleFileUpload,
    resetData
  };
  
  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

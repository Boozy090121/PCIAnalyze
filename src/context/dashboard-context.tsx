"use client";

/**
 * Dashboard Context Provider
 * 
 * This context provides global state management for the pharmaceutical
 * process analytics dashboard, including data, filters, and analytics state.
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { DataProcessingManager } from '@/lib/data-processing/data-processing-manager';
import { useFilteredAnalytics } from '@/hooks/use-memoized-analytics';

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
  
  // Schema state
  schema: {
    batchIdField: string | null;
    processTypeField: string | null;
    timestampField: string | null;
    departmentField: string | null;
    successField: string | null;
    durationField: string | null;
    parameterFields: string[];
  } | null;
  
  // Filter state
  filters: {
    dateRange: { startDate: Date | null; endDate: Date | null };
    processTypes: string[];
    departments: string[];
  };
  setFilters: (filters: any) => void;
  
  // Analytics state
  analytics: any | null;
  filteredData: Record<string, any>[] | null;
  
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
  schema: null,
  filters: {
    dateRange: { startDate: null, endDate: null },
    processTypes: [],
    departments: []
  },
  setFilters: () => {},
  analytics: null,
  filteredData: null,
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
  
  // Schema state
  const [schema, setSchema] = useState<{
    batchIdField: string | null;
    processTypeField: string | null;
    timestampField: string | null;
    departmentField: string | null;
    successField: string | null;
    durationField: string | null;
    parameterFields: string[];
  } | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    dateRange: { startDate: null as Date | null, endDate: null as Date | null },
    processTypes: [] as string[],
    departments: [] as string[]
  });
  
  // Create data processing manager
  const dataProcessingManager = useMemo(() => new DataProcessingManager(), []);
  
  // Get filtered analytics
  const { filteredData, analytics } = useFilteredAnalytics(
    rawData,
    filters,
    {
      processTypeField: schema?.processTypeField || '',
      successField: schema?.successField || '',
      successValue: true, // Default success value
      durationField: schema?.durationField || '',
      timeField: schema?.timestampField || '',
      parameterFields: schema?.parameterFields || [],
      departmentField: schema?.departmentField || ''
    },
    {
      confidenceLevel: 0.95,
      outlierDetection: true
    }
  );
  
  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      setIsProcessing(true);
      setProcessingStage('parsing');
      setProcessingProgress(0);
      setProcessingError(null);
      
      // Process file with progress updates
      dataProcessingManager.processFile(file, {
        onProgress: (progress, stage) => {
          setProcessingProgress(progress);
          if (stage) {
            setProcessingStage(stage as any);
          }
        },
        onComplete: (result) => {
          setRawData(result.data);
          setSchema(result.schema);
          
          // Set initial filters based on detected data
          if (result.schema.processTypeField) {
            const processTypes = Array.from(
              new Set(result.data.map(item => String(item[result.schema.processTypeField!])))
            );
            
            const departments = result.schema.departmentField
              ? Array.from(
                  new Set(result.data.map(item => String(item[result.schema.departmentField!])))
                )
              : [];
            
            setFilters({
              dateRange: { startDate: null, endDate: null },
              processTypes: [],
              departments: []
            });
          }
          
          setProcessingStage('complete');
          setIsProcessing(false);
        },
        onError: (error) => {
          setProcessingError(error.message);
          setProcessingStage('error');
          setIsProcessing(false);
        }
      });
    } catch (error: any) {
      setProcessingError(error.message);
      setProcessingStage('error');
      setIsProcessing(false);
    }
  };
  
  // Reset all data
  const resetData = () => {
    setRawData(null);
    setSchema(null);
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
    schema,
    filters,
    setFilters,
    analytics,
    filteredData,
    handleFileUpload,
    resetData
  };
  
  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

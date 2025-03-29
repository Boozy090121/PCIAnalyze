"use client";

/**
 * File Upload Component
 * 
 * This component provides Excel file upload functionality for the pharmaceutical
 * process analytics dashboard with progress tracking and error handling.
 */

import React, { useRef, useState } from 'react';
import { useDashboard } from '@/context/dashboard-context';

export const FileUpload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const {
    isProcessing,
    processingProgress,
    processingStage,
    processingError,
    handleFileUpload
  } = useDashboard();
  
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };
  
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };
  
  const renderProgressBar = () => {
    if (!isProcessing) return null;
    
    return (
      <div className="upload-progress">
        <div className="progress-bar">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${processingProgress}%` }}
          />
        </div>
        <div className="progress-status">
          {processingStage === 'parsing' && 'Parsing Excel file...'}
          {processingStage === 'analyzing' && 'Analyzing data...'}
          {processingStage === 'complete' && 'Processing complete!'}
          {processingProgress}%
        </div>
      </div>
    );
  };
  
  const renderError = () => {
    if (!processingError) return null;
    
    return (
      <div className="upload-error">
        <p>Error: {processingError}</p>
        <button 
          className="retry-button"
          onClick={() => fileInputRef.current?.click()}
        >
          Try Again
        </button>
      </div>
    );
  };
  
  return (
    <div className="file-upload-container">
      <div 
        className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${isProcessing ? 'processing' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={onFileChange}
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
        />
        
        {!isProcessing && !processingError && (
          <div className="upload-prompt">
            <div className="upload-icon">📊</div>
            <h3>Upload Excel File</h3>
            <p>Drag and drop your Excel file here or click to browse</p>
            <p className="file-types">Supported formats: .xlsx, .xls</p>
          </div>
        )}
        
        {renderProgressBar()}
        {renderError()}
      </div>
    </div>
  );
};

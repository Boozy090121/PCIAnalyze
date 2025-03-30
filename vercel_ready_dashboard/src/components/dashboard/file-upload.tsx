"use client";

import React, { useState } from 'react';

export const FileUpload: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  
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
    
    // In a real implementation, this would process the file
    alert('File upload functionality would process the Excel file here');
  };
  
  return (
    <div className="file-upload-container">
      <div 
        className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => alert('Click to upload file')}
      >
        <div className="upload-prompt">
          <div className="upload-icon">📊</div>
          <h3>Upload Excel File</h3>
          <p>Drag and drop your Excel file here or click to browse</p>
          <p className="file-types">Supported formats: .xlsx, .xls</p>
        </div>
      </div>
    </div>
  );
};

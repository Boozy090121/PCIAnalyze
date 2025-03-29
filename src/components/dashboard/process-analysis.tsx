"use client";

/**
 * Process Analysis Component
 * 
 * This component provides the process analysis tab for the pharmaceutical
 * process analytics dashboard, displaying detailed process performance metrics.
 */

import React from 'react';
import { useDashboard } from '@/context/dashboard-context';

export const ProcessAnalysis: React.FC = () => {
  const { analytics, filteredData, schema, isProcessing } = useDashboard();
  
  if (!filteredData || !schema) {
    return (
      <div className="dashboard-placeholder">
        <h2>Upload an Excel file to view process analysis</h2>
        <p>The dashboard will automatically analyze your pharmaceutical process data</p>
      </div>
    );
  }
  
  if (isProcessing) {
    return (
      <div className="dashboard-loading">
        <h2>Analyzing data...</h2>
        <p>Please wait while we process your data</p>
      </div>
    );
  }
  
  return (
    <div className="process-analysis">
      <h2>Process Analysis</h2>
      
      <div className="process-metrics">
        <div className="metrics-card">
          <h3>Process Performance Comparison</h3>
          <div className="chart-placeholder">
            <div className="placeholder-text">Process comparison chart</div>
          </div>
        </div>
        
        <div className="metrics-card">
          <h3>Process Duration Analysis</h3>
          <div className="chart-placeholder">
            <div className="placeholder-text">Process duration chart</div>
          </div>
        </div>
      </div>
      
      <div className="process-flow">
        <h3>Process Flow Analysis</h3>
        <div className="chart-placeholder tall">
          <div className="placeholder-text">Process flow diagram</div>
        </div>
      </div>
      
      <div className="process-details">
        <h3>Process Details</h3>
        <table className="process-table">
          <thead>
            <tr>
              <th>Process Type</th>
              <th>RFT Rate</th>
              <th>Avg. Duration</th>
              <th>Batch Count</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Process A</td>
              <td>95.2%</td>
              <td>4.3 min</td>
              <td>245</td>
              <td>↑ 2.1%</td>
            </tr>
            <tr>
              <td>Process B</td>
              <td>87.6%</td>
              <td>5.7 min</td>
              <td>189</td>
              <td>↓ 1.3%</td>
            </tr>
            <tr>
              <td>Process C</td>
              <td>92.1%</td>
              <td>3.9 min</td>
              <td>312</td>
              <td>↑ 0.8%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

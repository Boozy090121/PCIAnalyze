"use client";

/**
 * Dashboard Overview Component
 * 
 * This component provides the overview tab for the pharmaceutical
 * process analytics dashboard, displaying key metrics and high-level insights.
 */

import React from 'react';
import { useDashboard } from '@/context/dashboard-context';
import { KPICard } from './kpi-card';

export const DashboardOverview: React.FC = () => {
  const { analytics, filteredData, schema, isProcessing } = useDashboard();
  
  if (!filteredData || !schema) {
    return (
      <div className="dashboard-placeholder">
        <h2>Upload an Excel file to view dashboard</h2>
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
    <div className="dashboard-overview">
      <h2>Dashboard Overview</h2>
      
      <div className="kpi-cards-container">
        <KPICard 
          title="Overall RFT Rate"
          value={analytics?.overallRFT?.rate || 0}
          format="percentage"
          trend={analytics?.overallRFT?.trend || 0}
          description="Right First Time rate across all processes"
        />
        
        <KPICard 
          title="Average Process Duration"
          value={analytics?.duration?.average || 0}
          format="time"
          trend={analytics?.duration?.trend || 0}
          description="Average time to complete processes"
        />
        
        <KPICard 
          title="Total Batches"
          value={filteredData.length}
          format="number"
          description="Total number of batches analyzed"
        />
        
        <KPICard 
          title="Process Types"
          value={analytics?.processTypes?.length || 0}
          format="number"
          description="Number of distinct process types"
        />
      </div>
      
      <div className="overview-charts">
        <div className="chart-container">
          <h3>Process Performance</h3>
          <div className="chart-placeholder">
            {/* Chart would be rendered here */}
            <div className="placeholder-text">Process performance chart</div>
          </div>
        </div>
        
        <div className="chart-container">
          <h3>RFT Trend</h3>
          <div className="chart-placeholder">
            {/* Chart would be rendered here */}
            <div className="placeholder-text">RFT trend chart</div>
          </div>
        </div>
      </div>
      
      <div className="insights-container">
        <h3>Key Insights</h3>
        <ul className="insights-list">
          <li>Process A has the highest RFT rate at 95%</li>
          <li>Process B shows a declining trend in performance</li>
          <li>Department X has 20% faster processing times</li>
          <li>Temperature parameter shows strong correlation with success rate</li>
        </ul>
      </div>
    </div>
  );
};

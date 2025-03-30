"use client";

import React from 'react';

export const DashboardOverview: React.FC = () => {
  return (
    <div className="dashboard-overview">
      <h2>Dashboard Overview</h2>
      
      <div className="kpi-cards-container">
        <div className="kpi-card">
          <div className="kpi-header">
            <h3 className="kpi-title">Overall RFT Rate</h3>
          </div>
          <div className="kpi-content">
            <div className="kpi-value">92.5%</div>
            <div className="kpi-trend positive">
              <span className="trend-icon">↑</span>
              <span className="trend-value">2.1%</span>
            </div>
          </div>
          <div className="kpi-description">
            <p>Right First Time rate across all processes</p>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-header">
            <h3 className="kpi-title">Average Process Duration</h3>
          </div>
          <div className="kpi-content">
            <div className="kpi-value">4.7 min</div>
            <div className="kpi-trend negative">
              <span className="trend-icon">↓</span>
              <span className="trend-value">0.3%</span>
            </div>
          </div>
          <div className="kpi-description">
            <p>Average time to complete processes</p>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-header">
            <h3 className="kpi-title">Total Batches</h3>
          </div>
          <div className="kpi-content">
            <div className="kpi-value">746</div>
          </div>
          <div className="kpi-description">
            <p>Total number of batches analyzed</p>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-header">
            <h3 className="kpi-title">Process Types</h3>
          </div>
          <div className="kpi-content">
            <div className="kpi-value">8</div>
          </div>
          <div className="kpi-description">
            <p>Number of distinct process types</p>
          </div>
        </div>
      </div>
      
      <div className="overview-charts">
        <div className="chart-container">
          <h3>Process Performance</h3>
          <div className="chart-placeholder">
            <div className="placeholder-text">Process performance chart</div>
          </div>
        </div>
        
        <div className="chart-container">
          <h3>RFT Trend</h3>
          <div className="chart-placeholder">
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

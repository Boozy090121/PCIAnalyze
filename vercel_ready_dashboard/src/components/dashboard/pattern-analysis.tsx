"use client";

import React from 'react';

export const PatternAnalysis: React.FC = () => {
  return (
    <div className="pattern-analysis">
      <h2>Pattern Analysis</h2>
      
      <div className="pattern-metrics">
        <div className="metrics-card">
          <h3>Correlation Analysis</h3>
          <div className="chart-placeholder">
            <div className="placeholder-text">Correlation heatmap</div>
          </div>
        </div>
        
        <div className="metrics-card">
          <h3>Parameter Impact Analysis</h3>
          <div className="chart-placeholder">
            <div className="placeholder-text">Parameter impact chart</div>
          </div>
        </div>
      </div>
      
      <div className="pattern-details">
        <h3>Detected Patterns</h3>
        <div className="patterns-list">
          <div className="pattern-item">
            <h4>Cyclical Pattern</h4>
            <p>Process performance shows a weekly cycle with lower RFT rates on Mondays</p>
            <div className="confidence">Confidence: 92%</div>
          </div>
          
          <div className="pattern-item">
            <h4>Parameter Correlation</h4>
            <p>Temperature parameter strongly correlates with process success rate</p>
            <div className="confidence">Correlation: 0.87</div>
          </div>
          
          <div className="pattern-item">
            <h4>Batch ID Pattern</h4>
            <p>Batches with prefix 'A' show 15% higher RFT rates than those with prefix 'B'</p>
            <div className="confidence">Confidence: 95%</div>
          </div>
        </div>
      </div>
      
      <div className="correlation-matrix">
        <h3>Parameter Correlation Matrix</h3>
        <table className="correlation-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Temperature</th>
              <th>Pressure</th>
              <th>pH</th>
              <th>Duration</th>
              <th>Success</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Temperature</td>
              <td>1.00</td>
              <td>0.32</td>
              <td>-0.15</td>
              <td>0.45</td>
              <td>0.87</td>
            </tr>
            <tr>
              <td>Pressure</td>
              <td>0.32</td>
              <td>1.00</td>
              <td>0.21</td>
              <td>0.18</td>
              <td>0.42</td>
            </tr>
            <tr>
              <td>pH</td>
              <td>-0.15</td>
              <td>0.21</td>
              <td>1.00</td>
              <td>-0.08</td>
              <td>0.29</td>
            </tr>
            <tr>
              <td>Duration</td>
              <td>0.45</td>
              <td>0.18</td>
              <td>-0.08</td>
              <td>1.00</td>
              <td>0.53</td>
            </tr>
            <tr>
              <td>Success</td>
              <td>0.87</td>
              <td>0.42</td>
              <td>0.29</td>
              <td>0.53</td>
              <td>1.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

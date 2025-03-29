"use client";

/**
 * KPI Card Component
 * 
 * This component displays a key performance indicator with
 * value, trend, and description for the pharmaceutical dashboard.
 */

import React from 'react';

export interface KPICardProps {
  title: string;
  value: number;
  format?: 'number' | 'percentage' | 'time' | 'currency';
  trend?: number;
  description?: string;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  format = 'number',
  trend,
  description,
  className = ''
}) => {
  // Format the value based on the specified format
  const formatValue = () => {
    switch (format) {
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      case 'time':
        return `${value.toFixed(1)} min`;
      case 'currency':
        return `$${value.toFixed(2)}`;
      case 'number':
      default:
        return value.toLocaleString();
    }
  };
  
  // Determine trend direction and class
  const getTrendIndicator = () => {
    if (!trend || trend === 0) return null;
    
    const isPositive = trend > 0;
    const trendClass = isPositive ? 'positive' : 'negative';
    const trendIcon = isPositive ? '↑' : '↓';
    const trendValue = Math.abs(trend * 100).toFixed(1);
    
    return (
      <div className={`kpi-trend ${trendClass}`}>
        <span className="trend-icon">{trendIcon}</span>
        <span className="trend-value">{trendValue}%</span>
      </div>
    );
  };
  
  return (
    <div className={`kpi-card ${className}`}>
      <div className="kpi-header">
        <h3 className="kpi-title">{title}</h3>
      </div>
      
      <div className="kpi-content">
        <div className="kpi-value">{formatValue()}</div>
        {getTrendIndicator()}
      </div>
      
      {description && (
        <div className="kpi-description">
          <p>{description}</p>
        </div>
      )}
    </div>
  );
};

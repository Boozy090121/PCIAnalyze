/**
 * Process Comparison Component
 * 
 * This component displays a comparative view of different process types
 * for the pharmaceutical process analytics dashboard.
 */

import React from 'react';
import { ChartFactory } from '../charts/chart-factory';

export interface ProcessComparisonProps {
  data: any[];
  processTypeField: string;
  metricField: string;
  metricLabel: string;
  title?: string;
  subtitle?: string;
  sortBy?: 'value' | 'name';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  showAverage?: boolean;
  className?: string;
}

/**
 * Process Comparison component for comparing performance across process types
 */
export const ProcessComparison: React.FC<ProcessComparisonProps> = ({
  data,
  processTypeField,
  metricField,
  metricLabel,
  title = 'Process Type Comparison',
  subtitle,
  sortBy = 'value',
  sortDirection = 'desc',
  limit = 10,
  showAverage = true,
  className = '',
}) => {
  // Group data by process type and calculate metrics
  const processGroups = data.reduce((groups, item) => {
    const processType = item[processTypeField];
    if (!processType) return groups;
    
    if (!groups[processType]) {
      groups[processType] = {
        processType,
        values: [],
        count: 0,
        sum: 0,
        average: 0,
      };
    }
    
    const value = Number(item[metricField]);
    if (!isNaN(value)) {
      groups[processType].values.push(value);
      groups[processType].count += 1;
      groups[processType].sum += value;
    }
    
    return groups;
  }, {} as Record<string, { processType: string; values: number[]; count: number; sum: number; average: number }>);
  
  // Calculate averages
  Object.values(processGroups).forEach(group => {
    group.average = group.count > 0 ? group.sum / group.count : 0;
  });
  
  // Convert to array and sort
  let processArray = Object.values(processGroups);
  
  // Sort by specified criteria
  if (sortBy === 'value') {
    processArray.sort((a, b) => 
      sortDirection === 'asc' 
        ? a.average - b.average 
        : b.average - a.average
    );
  } else {
    processArray.sort((a, b) => 
      sortDirection === 'asc'
        ? a.processType.localeCompare(b.processType)
        : b.processType.localeCompare(a.processType)
    );
  }
  
  // Limit the number of process types shown
  if (limit > 0 && processArray.length > limit) {
    processArray = processArray.slice(0, limit);
  }
  
  // Calculate overall average if needed
  const overallAverage = showAverage
    ? data.reduce((sum, item) => {
        const value = Number(item[metricField]);
        return !isNaN(value) ? sum + value : sum;
      }, 0) / data.length
    : 0;
  
  // Prepare chart data
  const chartData = processArray.map(group => ({
    processType: group.processType,
    [metricLabel]: group.average,
  }));
  
  return (
    <div className={`process-comparison ${className}`}>
      <ChartFactory
        type="bar"
        data={chartData}
        dimensions={[{ name: 'Process Type', accessor: 'processType' }]}
        measures={[{ name: metricLabel, accessor: metricLabel }]}
        options={{
          title,
          subtitle,
          xAxisLabel: 'Process Type',
          yAxisLabel: metricLabel,
          showLegend: false,
          showGrid: true,
          showTooltip: true,
          horizontal: false,
        }}
      />
      
      {showAverage && (
        <div className="overall-average">
          <span className="average-label">Overall Average:</span>
          <span className="average-value">{overallAverage.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
};

export default ProcessComparison;

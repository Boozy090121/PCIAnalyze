/**
 * Filter Controls Component
 * 
 * This component provides interactive filters for the pharmaceutical
 * process analytics dashboard, including date range, process type,
 * and department selectors.
 */

import React from 'react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface DateRangeOption {
  value: string;
  label: string;
  startDate?: Date;
  endDate?: Date;
}

export interface FilterControlsProps {
  dateRangeOptions: DateRangeOption[];
  selectedDateRange: string;
  onDateRangeChange: (value: string) => void;
  
  processTypeOptions: FilterOption[];
  selectedProcessTypes: string[];
  onProcessTypeChange: (values: string[]) => void;
  
  departmentOptions: FilterOption[];
  selectedDepartments: string[];
  onDepartmentChange: (values: string[]) => void;
  
  customDateRange?: {
    startDate: Date | null;
    endDate: Date | null;
  };
  onCustomDateRangeChange?: (startDate: Date | null, endDate: Date | null) => void;
  
  className?: string;
}

/**
 * Filter Controls component for filtering dashboard data
 */
export const FilterControls: React.FC<FilterControlsProps> = ({
  dateRangeOptions,
  selectedDateRange,
  onDateRangeChange,
  
  processTypeOptions,
  selectedProcessTypes,
  onProcessTypeChange,
  
  departmentOptions,
  selectedDepartments,
  onDepartmentChange,
  
  customDateRange,
  onCustomDateRangeChange,
  
  className = '',
}) => {
  // Handle date range change
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onDateRangeChange(e.target.value);
  };
  
  // Handle process type change
  const handleProcessTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const values: string[] = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        values.push(options[i].value);
      }
    }
    
    onProcessTypeChange(values);
  };
  
  // Handle department change
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const values: string[] = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        values.push(options[i].value);
      }
    }
    
    onDepartmentChange(values);
  };
  
  // Handle custom date range change
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onCustomDateRangeChange) {
      const startDate = e.target.value ? new Date(e.target.value) : null;
      onCustomDateRangeChange(startDate, customDateRange?.endDate || null);
    }
  };
  
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onCustomDateRangeChange) {
      const endDate = e.target.value ? new Date(e.target.value) : null;
      onCustomDateRangeChange(customDateRange?.startDate || null, endDate);
    }
  };
  
  return (
    <div className={`filter-controls ${className}`}>
      <div className="filter-section">
        <label htmlFor="date-range" className="filter-label">Date Range:</label>
        <select
          id="date-range"
          className="filter-select"
          value={selectedDateRange}
          onChange={handleDateRangeChange}
        >
          {dateRangeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {selectedDateRange === 'custom' && onCustomDateRangeChange && (
        <div className="filter-section custom-date-range">
          <div className="date-input-group">
            <label htmlFor="start-date" className="filter-label">Start Date:</label>
            <input
              id="start-date"
              type="date"
              className="filter-date-input"
              value={customDateRange?.startDate?.toISOString().split('T')[0] || ''}
              onChange={handleStartDateChange}
            />
          </div>
          
          <div className="date-input-group">
            <label htmlFor="end-date" className="filter-label">End Date:</label>
            <input
              id="end-date"
              type="date"
              className="filter-date-input"
              value={customDateRange?.endDate?.toISOString().split('T')[0] || ''}
              onChange={handleEndDateChange}
            />
          </div>
        </div>
      )}
      
      <div className="filter-section">
        <label htmlFor="process-type" className="filter-label">Process Type:</label>
        <select
          id="process-type"
          className="filter-select"
          multiple
          value={selectedProcessTypes}
          onChange={handleProcessTypeChange}
        >
          {processTypeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="filter-section">
        <label htmlFor="department" className="filter-label">Department:</label>
        <select
          id="department"
          className="filter-select"
          multiple
          value={selectedDepartments}
          onChange={handleDepartmentChange}
        >
          {departmentOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterControls;

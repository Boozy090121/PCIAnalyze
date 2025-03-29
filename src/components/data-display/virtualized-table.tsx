/**
 * Virtualized Data Table Component
 * 
 * This component provides a virtualized table for displaying large datasets
 * in the pharmaceutical process analytics dashboard without performance issues.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';

export interface VirtualizedTableProps {
  data: Record<string, any>[];
  columns: {
    key: string;
    header: string;
    width?: number;
    formatter?: (value: any, row: Record<string, any>) => React.ReactNode;
    sortable?: boolean;
    className?: string;
  }[];
  height?: number;
  rowHeight?: number;
  className?: string;
  striped?: boolean;
  highlightRows?: boolean;
  sortable?: boolean;
  defaultSortColumn?: string;
  defaultSortDirection?: 'asc' | 'desc';
  onRowClick?: (row: Record<string, any>, index: number) => void;
}

/**
 * Virtualized Table component for displaying large datasets
 */
export const VirtualizedTable: React.FC<VirtualizedTableProps> = ({
  data,
  columns,
  height = 400,
  rowHeight = 40,
  className = '',
  striped = true,
  highlightRows = true,
  sortable = true,
  defaultSortColumn,
  defaultSortDirection = 'asc',
  onRowClick
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [sortColumn, setSortColumn] = useState<string | undefined>(defaultSortColumn);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate total height
  const totalHeight = data.length * rowHeight;
  
  // Calculate visible rows
  const visibleRowsCount = Math.ceil(height / rowHeight) + 1; // +1 for partially visible rows
  const startIndex = Math.floor(scrollTop / rowHeight);
  const endIndex = Math.min(startIndex + visibleRowsCount, data.length);
  
  // Handle scroll
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };
  
  // Handle sort
  const handleSort = (columnKey: string) => {
    if (!sortable) return;
    
    if (sortColumn === columnKey) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default direction
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };
  
  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      // Handle different value types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      }
      
      // Convert to strings for comparison
      const aString = String(aValue || '');
      const bString = String(bValue || '');
      
      return sortDirection === 'asc' 
        ? aString.localeCompare(bString) 
        : bString.localeCompare(aString);
    });
  }, [data, sortColumn, sortDirection]);
  
  // Render visible rows
  const visibleRows = useMemo(() => {
    return sortedData.slice(startIndex, endIndex).map((row, index) => {
      const actualIndex = startIndex + index;
      
      return (
        <div 
          key={actualIndex}
          className={`virtualized-table-row ${striped && actualIndex % 2 === 1 ? 'striped' : ''} ${highlightRows ? 'highlight-hover' : ''}`}
          style={{ height: rowHeight, top: actualIndex * rowHeight }}
          onClick={() => onRowClick && onRowClick(row, actualIndex)}
        >
          {columns.map(column => (
            <div 
              key={column.key}
              className={`virtualized-table-cell ${column.className || ''}`}
              style={{ width: column.width }}
            >
              {column.formatter 
                ? column.formatter(row[column.key], row) 
                : row[column.key]}
            </div>
          ))}
        </div>
      );
    });
  }, [sortedData, startIndex, endIndex, columns, rowHeight, striped, highlightRows, onRowClick]);
  
  return (
    <div 
      className={`virtualized-table-container ${className}`}
      style={{ height, position: 'relative', overflow: 'hidden' }}
    >
      {/* Header */}
      <div className="virtualized-table-header">
        {columns.map(column => (
          <div 
            key={column.key}
            className={`virtualized-table-header-cell ${column.className || ''} ${sortable && column.sortable !== false ? 'sortable' : ''} ${sortColumn === column.key ? `sorted-${sortDirection}` : ''}`}
            style={{ width: column.width }}
            onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
          >
            {column.header}
            {sortable && column.sortable !== false && sortColumn === column.key && (
              <span className="sort-indicator">
                {sortDirection === 'asc' ? '▲' : '▼'}
              </span>
            )}
          </div>
        ))}
      </div>
      
      {/* Scrollable body */}
      <div 
        ref={containerRef}
        className="virtualized-table-body"
        style={{ height: height - rowHeight, overflowY: 'auto' }}
        onScroll={handleScroll}
      >
        {/* Spacer for total height */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleRows}
        </div>
      </div>
    </div>
  );
};

export default VirtualizedTable;

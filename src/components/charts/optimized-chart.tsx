/**
 * Optimized Chart Renderer
 * 
 * This component provides optimized chart rendering for the pharmaceutical
 * process analytics dashboard, implementing performance techniques like
 * memoization, virtualization, and progressive rendering.
 */

import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { ChartFactory } from '@/components/charts/chart-factory';

export interface OptimizedChartProps {
  type: 'bar' | 'line' | 'pie' | 'column' | 'area' | 'scatter' | 'radar' | 'pareto';
  data: Record<string, any>[];
  dimensions: { name: string; accessor: string }[];
  measures: { name: string; accessor: string }[];
  options?: {
    showGrid?: boolean;
    showLegend?: boolean;
    xAxisLabel?: string;
    yAxisLabel?: string;
    height?: number;
    width?: number;
    colors?: string[];
    stacked?: boolean;
    animate?: boolean;
  };
  className?: string;
  throttleResize?: boolean;
  progressiveRendering?: boolean;
  dataLimit?: number;
}

/**
 * Optimized Chart component with performance enhancements
 */
export const OptimizedChart: React.FC<OptimizedChartProps> = ({
  type,
  data,
  dimensions,
  measures,
  options = {},
  className = '',
  throttleResize = true,
  progressiveRendering = true,
  dataLimit = 1000
}) => {
  const [visibleData, setVisibleData] = useState<Record<string, any>[]>([]);
  const [isFullyRendered, setIsFullyRendered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Process data in chunks for progressive rendering
  useEffect(() => {
    if (!progressiveRendering || data.length <= dataLimit) {
      setVisibleData(data);
      setIsFullyRendered(true);
      return;
    }
    
    // Reset state for new data
    setVisibleData([]);
    setIsFullyRendered(false);
    
    // Calculate chunk size
    const totalItems = data.length;
    const chunkSize = Math.min(Math.ceil(totalItems / 5), dataLimit / 2);
    
    // Process data in chunks
    let processedItems = 0;
    
    const processNextChunk = () => {
      const nextChunkSize = Math.min(chunkSize, totalItems - processedItems);
      const nextChunk = data.slice(processedItems, processedItems + nextChunkSize);
      
      setVisibleData(prev => [...prev, ...nextChunk]);
      
      processedItems += nextChunkSize;
      
      if (processedItems >= totalItems) {
        setIsFullyRendered(true);
      } else {
        // Schedule next chunk with delay to allow UI updates
        setTimeout(processNextChunk, 50);
      }
    };
    
    // Start processing
    processNextChunk();
  }, [data, progressiveRendering, dataLimit]);
  
  // Handle resize with throttling
  useEffect(() => {
    if (!throttleResize || !containerRef.current) return;
    
    const updateSize = () => {
      if (!containerRef.current) return;
      
      const { width, height } = containerRef.current.getBoundingClientRect();
      setContainerSize({ width, height });
    };
    
    // Initial size
    updateSize();
    
    // Throttled resize handler
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      resizeTimeoutRef.current = setTimeout(() => {
        updateSize();
        resizeTimeoutRef.current = null;
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [throttleResize]);
  
  // Memoize chart options
  const memoizedOptions = useMemo(() => {
    return {
      ...options,
      // Use container dimensions if not explicitly provided
      width: options.width || (containerSize.width > 0 ? containerSize.width : undefined),
      height: options.height || (containerSize.height > 0 ? containerSize.height : undefined),
      // Disable animations for large datasets
      animate: options.animate !== undefined ? options.animate : (data.length <= 500)
    };
  }, [options, containerSize, data.length]);
  
  // Memoize chart data to prevent unnecessary re-renders
  const optimizedData = useMemo(() => {
    // Use visible data for rendering
    const dataToRender = visibleData;
    
    // For large datasets, apply additional optimizations
    if (dataToRender.length > dataLimit) {
      // Sample data for better performance
      const samplingRate = Math.ceil(dataToRender.length / dataLimit);
      return dataToRender.filter((_, index) => index % samplingRate === 0);
    }
    
    return dataToRender;
  }, [visibleData, dataLimit]);
  
  // Render loading indicator for progressive rendering
  const renderLoadingIndicator = useCallback(() => {
    if (isFullyRendered || !progressiveRendering) return null;
    
    const progress = visibleData.length / data.length * 100;
    
    return (
      <div className="chart-loading-indicator">
        <div className="chart-loading-progress" style={{ width: `${progress}%` }} />
        <span className="chart-loading-text">
          Rendering chart ({Math.round(progress)}%)
        </span>
      </div>
    );
  }, [isFullyRendered, progressiveRendering, visibleData.length, data.length]);
  
  return (
    <div 
      ref={containerRef}
      className={`optimized-chart-container ${className}`}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      <ChartFactory
        type={type}
        data={optimizedData}
        dimensions={dimensions}
        measures={measures}
        options={memoizedOptions}
      />
      {renderLoadingIndicator()}
    </div>
  );
};

export default OptimizedChart;

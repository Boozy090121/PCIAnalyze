/**
 * Memoized Analytics Hook
 * 
 * This hook provides memoized analytics calculations for the pharmaceutical
 * process analytics dashboard to improve performance with large datasets.
 */

import { useMemo } from 'react';
import { AnalyticsService, AnalyticsDashboardData } from '@/lib/analytics/analytics-service';

export interface UseMemoizedAnalyticsOptions {
  cacheKey?: string;
  confidenceLevel?: number;
  outlierDetection?: boolean;
  outlierThreshold?: number;
  significanceThreshold?: number;
  minCorrelationStrength?: number;
  predictionHorizon?: number;
}

/**
 * Hook for memoized analytics calculations
 * @param data - Data array to analyze
 * @param config - Analytics configuration
 * @param options - Hook options
 * @returns Memoized analytics results
 */
export function useMemoizedAnalytics(
  data: Record<string, any>[] | null,
  config: {
    processTypeField: string;
    successField: string;
    successValue: any;
    durationField: string;
    timeField: string;
    parameterFields: string[];
  },
  options: UseMemoizedAnalyticsOptions = {}
): AnalyticsDashboardData | null {
  // Create a cache key based on data length and config
  const effectiveCacheKey = options.cacheKey || 
    `${data?.length || 0}-${config.processTypeField}-${config.successField}-${config.timeField}`;
  
  // Memoize analytics calculations
  return useMemo(() => {
    if (!data || data.length === 0) return null;
    
    try {
      // Create analytics service with options
      const analyticsService = new AnalyticsService({
        confidenceLevel: options.confidenceLevel,
        outlierDetection: options.outlierDetection,
        outlierThreshold: options.outlierThreshold,
        significanceThreshold: options.significanceThreshold,
        minCorrelationStrength: options.minCorrelationStrength,
        predictionHorizon: options.predictionHorizon
      });
      
      // Generate dashboard analytics
      return analyticsService.generateDashboardAnalytics(data, config);
    } catch (error) {
      console.error('Error generating analytics:', error);
      return null;
    }
  }, [data, effectiveCacheKey, config, options]);
}

/**
 * Hook for memoized filtered analytics calculations
 * @param data - Full data array
 * @param filters - Filter criteria
 * @param config - Analytics configuration
 * @param options - Hook options
 * @returns Memoized filtered analytics results
 */
export function useFilteredAnalytics(
  data: Record<string, any>[] | null,
  filters: {
    dateRange?: { startDate: Date | null; endDate: Date | null };
    processTypes?: string[];
    departments?: string[];
  },
  config: {
    processTypeField: string;
    successField: string;
    successValue: any;
    durationField: string;
    timeField: string;
    parameterFields: string[];
    departmentField: string;
  },
  options: UseMemoizedAnalyticsOptions = {}
): {
  filteredData: Record<string, any>[] | null;
  analytics: AnalyticsDashboardData | null;
} {
  // Memoize filtered data
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    let result = [...data];
    
    // Apply date range filter
    if (filters.dateRange?.startDate && filters.dateRange?.endDate && config.timeField) {
      result = result.filter(item => {
        const timestamp = new Date(item[config.timeField]);
        return timestamp >= filters.dateRange!.startDate! && 
               timestamp <= filters.dateRange!.endDate!;
      });
    }
    
    // Apply process type filter
    if (filters.processTypes && filters.processTypes.length > 0 && config.processTypeField) {
      result = result.filter(item => 
        filters.processTypes!.includes(String(item[config.processTypeField]))
      );
    }
    
    // Apply department filter
    if (filters.departments && filters.departments.length > 0 && config.departmentField) {
      result = result.filter(item => 
        filters.departments!.includes(String(item[config.departmentField]))
      );
    }
    
    return result;
  }, [data, filters, config]);
  
  // Create a cache key for filtered data
  const filteredCacheKey = `filtered-${filteredData?.length || 0}-${
    filters.dateRange?.startDate?.getTime() || 0
  }-${
    filters.dateRange?.endDate?.getTime() || 0
  }-${
    filters.processTypes?.join(',') || ''
  }-${
    filters.departments?.join(',') || ''
  }`;
  
  // Get memoized analytics for filtered data
  const analytics = useMemoizedAnalytics(
    filteredData,
    {
      processTypeField: config.processTypeField,
      successField: config.successField,
      successValue: config.successValue,
      durationField: config.durationField,
      timeField: config.timeField,
      parameterFields: config.parameterFields
    },
    {
      ...options,
      cacheKey: filteredCacheKey
    }
  );
  
  return { filteredData, analytics };
}

export default useMemoizedAnalytics;

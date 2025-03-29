/**
 * Analytics Service Module
 * 
 * This module provides a unified service for accessing analytics functionality
 * in the pharmaceutical process analytics dashboard, coordinating between
 * KPI calculations and advanced process analytics.
 */

import { KPICalculator, RFTResult, ProcessDurationResult, VarianceAnalysisResult } from './kpi-calculator';
import { ProcessAnalytics, CorrelationResult, PatternRecognitionResult, PredictionResult } from './process-analytics';

export interface AnalyticsOptions {
  confidenceLevel?: number; // Default: 0.95 (95%)
  outlierDetection?: boolean; // Default: true
  outlierThreshold?: number; // Default: 1.5 (IQR method)
  significanceThreshold?: number; // Default: 0.05
  minCorrelationStrength?: number; // Default: 0.3
  predictionHorizon?: number; // Default: 3 (periods)
}

export interface ProcessPerformanceResult {
  processType: string;
  rft: RFTResult;
  duration: ProcessDurationResult;
  rank: number;
  significantlyBetter: boolean;
  percentileBetter: number;
}

export interface AnalyticsDashboardData {
  overallRFT: RFTResult;
  processPerformance: ProcessPerformanceResult[];
  trends: any;
  patterns: PatternRecognitionResult[];
  correlations: CorrelationResult[];
  predictions: PredictionResult[];
}

/**
 * Analytics Service class providing unified access to analytics functionality
 */
export class AnalyticsService {
  private kpiCalculator: KPICalculator;
  private processAnalytics: ProcessAnalytics;
  private options: AnalyticsOptions;
  
  constructor(options: AnalyticsOptions = {}) {
    this.options = {
      confidenceLevel: 0.95,
      outlierDetection: true,
      outlierThreshold: 1.5,
      significanceThreshold: 0.05,
      minCorrelationStrength: 0.3,
      predictionHorizon: 3,
      ...options
    };
    
    this.kpiCalculator = new KPICalculator({
      confidenceLevel: this.options.confidenceLevel,
      outlierDetection: this.options.outlierDetection,
      outlierThreshold: this.options.outlierThreshold
    });
    
    this.processAnalytics = new ProcessAnalytics({
      confidenceLevel: this.options.confidenceLevel,
      significanceThreshold: this.options.significanceThreshold,
      minCorrelationStrength: this.options.minCorrelationStrength,
      predictionHorizon: this.options.predictionHorizon
    });
  }
  
  /**
   * Generate comprehensive analytics for dashboard
   * @param data - Array of process data
   * @param config - Configuration for analytics
   * @returns Dashboard analytics data
   */
  generateDashboardAnalytics(
    data: Record<string, any>[],
    config: {
      processTypeField: string;
      successField: string;
      successValue: any;
      durationField: string;
      timeField: string;
      parameterFields: string[];
    }
  ): AnalyticsDashboardData {
    const { 
      processTypeField, 
      successField, 
      successValue, 
      durationField,
      timeField,
      parameterFields
    } = config;
    
    // Calculate overall RFT
    const overallRFT = this.kpiCalculator.calculateRFT(
      data,
      successField,
      successValue
    );
    
    // Group data by process type
    const processByType: Record<string, any[]> = {};
    
    data.forEach(item => {
      const processType = String(item[processTypeField] || 'Unknown');
      
      if (!processByType[processType]) {
        processByType[processType] = [];
      }
      
      processByType[processType].push(item);
    });
    
    // Calculate process performance metrics
    const processPerformance: ProcessPerformanceResult[] = [];
    
    Object.entries(processByType).forEach(([processType, items]) => {
      if (items.length < 3) {
        // Not enough data for statistical analysis
        return;
      }
      
      // Calculate RFT for this process type
      const rft = this.kpiCalculator.calculateRFT(
        items,
        successField,
        successValue
      );
      
      // Calculate duration metrics for this process type
      const duration = this.kpiCalculator.calculateProcessDuration(
        items,
        durationField
      );
      
      processPerformance.push({
        processType,
        rft,
        duration,
        rank: 0, // Will be updated later
        significantlyBetter: false, // Will be updated later
        percentileBetter: 0 // Will be updated later
      });
    });
    
    // Identify best performers and update rankings
    const bestPerformers = this.processAnalytics.identifyBestPerformers(
      data,
      processTypeField,
      successField,
      true // Higher RFT is better
    );
    
    // Update process performance with rankings
    processPerformance.forEach(process => {
      const bestPerformer = bestPerformers.find(
        bp => bp.processType === process.processType
      );
      
      if (bestPerformer) {
        process.rank = bestPerformer.rank;
        process.significantlyBetter = bestPerformer.significantlyBetterCount > 0;
        process.percentileBetter = bestPerformer.percentileBetter;
      }
    });
    
    // Sort by rank
    processPerformance.sort((a, b) => a.rank - b.rank);
    
    // Identify trends
    const trends = this.kpiCalculator.identifyTrends(
      data,
      timeField,
      successField,
      5 // Divide into 5 periods
    );
    
    // Recognize patterns
    const patterns = this.processAnalytics.recognizePatterns(
      data,
      timeField,
      parameterFields
    );
    
    // Analyze correlations
    const correlations = this.processAnalytics.analyzeCorrelations(
      data,
      parameterFields
    );
    
    // Generate predictions
    const predictions = this.processAnalytics.generatePredictions(
      data,
      timeField,
      parameterFields
    );
    
    return {
      overallRFT,
      processPerformance,
      trends,
      patterns,
      correlations,
      predictions
    };
  }
  
  /**
   * Calculate Right First Time (RFT) metrics with confidence intervals
   * @param data - Array of process data
   * @param successField - Field name indicating success/failure
   * @param successValue - Value indicating success
   * @returns RFT result with rate and confidence interval
   */
  calculateRFT(
    data: Record<string, any>[],
    successField: string,
    successValue: any
  ): RFTResult {
    return this.kpiCalculator.calculateRFT(data, successField, successValue);
  }
  
  /**
   * Calculate process duration metrics with outlier detection
   * @param data - Array of process data
   * @param durationField - Field name containing duration values
   * @returns Process duration result with statistics
   */
  calculateProcessDuration(
    data: Record<string, any>[],
    durationField: string
  ): ProcessDurationResult {
    return this.kpiCalculator.calculateProcessDuration(data, durationField);
  }
  
  /**
   * Analyze variance across process types
   * @param data - Array of process data
   * @param groupField - Field name for grouping (e.g., process type)
   * @param valueField - Field name containing the value to analyze
   * @returns Array of variance analysis results by group
   */
  analyzeVariance(
    data: Record<string, any>[],
    groupField: string,
    valueField: string
  ): VarianceAnalysisResult[] {
    return this.kpiCalculator.analyzeVariance(data, groupField, valueField);
  }
  
  /**
   * Analyze correlations between process parameters
   * @param data - Array of process data
   * @param parameters - Array of parameter field names to analyze
   * @returns Array of correlation results
   */
  analyzeCorrelations(
    data: Record<string, any>[],
    parameters: string[]
  ): CorrelationResult[] {
    return this.processAnalytics.analyzeCorrelations(data, parameters);
  }
  
  /**
   * Recognize patterns in process data
   * @param data - Array of process data
   * @param timeField - Field name containing time/date values
   * @param parameters - Array of parameter field names to analyze
   * @returns Array of pattern recognition results
   */
  recognizePatterns(
    data: Record<string, any>[],
    timeField: string,
    parameters: string[]
  ): PatternRecognitionResult[] {
    return this.processAnalytics.recognizePatterns(data, timeField, parameters);
  }
  
  /**
   * Generate predictions for process parameters
   * @param data - Array of process data
   * @param timeField - Field name containing time/date values
   * @param parameters - Array of parameter field names to predict
   * @returns Array of prediction results
   */
  generatePredictions(
    data: Record<string, any>[],
    timeField: string,
    parameters: string[]
  ): PredictionResult[] {
    return this.processAnalytics.generatePredictions(data, timeField, parameters);
  }
  
  /**
   * Identify best performing processes
   * @param data - Array of process data
   * @param processTypeField - Field name for process type
   * @param performanceField - Field name for performance metric
   * @param higherIsBetter - Whether higher values indicate better performance
   * @returns Array of best performing processes with statistical confidence
   */
  identifyBestPerformers(
    data: Record<string, any>[],
    processTypeField: string,
    performanceField: string,
    higherIsBetter: boolean = true
  ): any[] {
    return this.processAnalytics.identifyBestPerformers(
      data,
      processTypeField,
      performanceField,
      higherIsBetter
    );
  }
}

export default AnalyticsService;

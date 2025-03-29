/**
 * Process Analytics Module
 * 
 * This module provides advanced analytics functionality for pharmaceutical
 * manufacturing processes, including correlation analysis, pattern recognition,
 * and predictive analytics.
 */

import { KPICalculator } from './kpi-calculator';

export interface CorrelationResult {
  parameter1: string;
  parameter2: string;
  correlationCoefficient: number;
  pValue: number;
  significant: boolean;
  sampleSize: number;
}

export interface PatternRecognitionResult {
  patternType: string;
  description: string;
  affectedParameters: string[];
  confidence: number;
  supportingData: any[];
}

export interface PredictionResult {
  parameter: string;
  currentValue: number;
  predictedValue: number;
  predictedChange: number;
  predictedChangePercent: number;
  confidenceInterval: [number, number];
  predictionHorizon: string;
  reliability: number;
}

export interface ProcessAnalyticsOptions {
  confidenceLevel?: number; // Default: 0.95 (95%)
  significanceThreshold?: number; // Default: 0.05
  minCorrelationStrength?: number; // Default: 0.3
  predictionHorizon?: number; // Default: 3 (periods)
}

/**
 * Process Analytics class for advanced pharmaceutical manufacturing analytics
 */
export class ProcessAnalytics {
  private options: ProcessAnalyticsOptions;
  private kpiCalculator: KPICalculator;
  
  constructor(options: ProcessAnalyticsOptions = {}) {
    this.options = {
      confidenceLevel: 0.95,
      significanceThreshold: 0.05,
      minCorrelationStrength: 0.3,
      predictionHorizon: 3,
      ...options
    };
    
    this.kpiCalculator = new KPICalculator({
      confidenceLevel: this.options.confidenceLevel
    });
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
    const results: CorrelationResult[] = [];
    
    // Calculate correlations between all parameter pairs
    for (let i = 0; i < parameters.length; i++) {
      for (let j = i + 1; j < parameters.length; j++) {
        const param1 = parameters[i];
        const param2 = parameters[j];
        
        // Extract parameter values
        const pairs: [number, number][] = [];
        
        data.forEach(item => {
          const value1 = Number(item[param1]);
          const value2 = Number(item[param2]);
          
          if (!isNaN(value1) && !isNaN(value2)) {
            pairs.push([value1, value2]);
          }
        });
        
        if (pairs.length < 3) {
          // Not enough data for correlation
          continue;
        }
        
        // Calculate Pearson correlation coefficient
        const correlation = this.calculatePearsonCorrelation(pairs);
        
        // Calculate p-value for correlation
        const pValue = this.calculateCorrelationPValue(correlation, pairs.length);
        
        // Determine if correlation is significant
        const significant = pValue < (this.options.significanceThreshold || 0.05) &&
          Math.abs(correlation) >= (this.options.minCorrelationStrength || 0.3);
        
        results.push({
          parameter1: param1,
          parameter2: param2,
          correlationCoefficient: correlation,
          pValue,
          significant,
          sampleSize: pairs.length
        });
      }
    }
    
    // Sort results by correlation strength (absolute value)
    return results.sort((a, b) => 
      Math.abs(b.correlationCoefficient) - Math.abs(a.correlationCoefficient)
    );
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
    const results: PatternRecognitionResult[] = [];
    
    // Sort data by time
    const sortedData = [...data].sort((a, b) => {
      const timeA = new Date(a[timeField]).getTime();
      const timeB = new Date(b[timeField]).getTime();
      return timeA - timeB;
    });
    
    // Check for various pattern types
    
    // 1. Cyclical patterns
    parameters.forEach(param => {
      const cyclicalPattern = this.detectCyclicalPattern(sortedData, param);
      if (cyclicalPattern) {
        results.push(cyclicalPattern);
      }
    });
    
    // 2. Trend patterns
    parameters.forEach(param => {
      const trendPattern = this.detectTrendPattern(sortedData, param);
      if (trendPattern) {
        results.push(trendPattern);
      }
    });
    
    // 3. Step change patterns
    parameters.forEach(param => {
      const stepChangePattern = this.detectStepChangePattern(sortedData, param);
      if (stepChangePattern) {
        results.push(stepChangePattern);
      }
    });
    
    // 4. Correlation patterns
    const correlations = this.analyzeCorrelations(data, parameters);
    const significantCorrelations = correlations.filter(corr => corr.significant);
    
    significantCorrelations.forEach(corr => {
      results.push({
        patternType: 'correlation',
        description: `Strong ${corr.correlationCoefficient > 0 ? 'positive' : 'negative'} correlation between ${corr.parameter1} and ${corr.parameter2}`,
        affectedParameters: [corr.parameter1, corr.parameter2],
        confidence: 1 - corr.pValue,
        supportingData: []
      });
    });
    
    return results;
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
    const results: PredictionResult[] = [];
    
    // Sort data by time
    const sortedData = [...data].sort((a, b) => {
      const timeA = new Date(a[timeField]).getTime();
      const timeB = new Date(b[timeField]).getTime();
      return timeA - timeB;
    });
    
    // Generate predictions for each parameter
    parameters.forEach(param => {
      // Extract parameter values with timestamps
      const timeSeriesData: [Date, number][] = [];
      
      sortedData.forEach(item => {
        const timestamp = new Date(item[timeField]);
        const value = Number(item[param]);
        
        if (!isNaN(value) && timestamp instanceof Date && !isNaN(timestamp.getTime())) {
          timeSeriesData.push([timestamp, value]);
        }
      });
      
      if (timeSeriesData.length < 5) {
        // Not enough data for prediction
        return;
      }
      
      // Get current value (latest in time series)
      const currentValue = timeSeriesData[timeSeriesData.length - 1][1];
      
      // Prepare data for regression
      const xValues: number[] = [];
      const yValues: number[] = [];
      
      // Convert timestamps to numeric values (days from first timestamp)
      const firstTimestamp = timeSeriesData[0][0].getTime();
      timeSeriesData.forEach(([timestamp, value]) => {
        const daysDiff = (timestamp.getTime() - firstTimestamp) / (1000 * 60 * 60 * 24);
        xValues.push(daysDiff);
        yValues.push(value);
      });
      
      // Calculate linear regression
      const regression = this.calculateLinearRegression(xValues, yValues);
      
      // Calculate prediction horizon in days
      const predictionHorizonDays = (this.options.predictionHorizon || 3) * 
        (xValues[xValues.length - 1] - xValues[0]) / xValues.length;
      
      // Calculate predicted value
      const lastX = xValues[xValues.length - 1];
      const predictX = lastX + predictionHorizonDays;
      const predictedValue = regression.slope * predictX + regression.intercept;
      
      // Calculate prediction interval
      const predictionInterval = this.calculatePredictionInterval(
        xValues, 
        yValues, 
        regression, 
        predictX, 
        this.options.confidenceLevel || 0.95
      );
      
      // Calculate change metrics
      const predictedChange = predictedValue - currentValue;
      const predictedChangePercent = (predictedChange / currentValue) * 100;
      
      // Calculate reliability based on R-squared and data points
      const reliability = regression.rSquared * (1 - 1 / Math.sqrt(timeSeriesData.length));
      
      // Format prediction horizon
      const predictionHorizonText = `${Math.round(predictionHorizonDays)} days`;
      
      results.push({
        parameter: param,
        currentValue,
        predictedValue,
        predictedChange,
        predictedChangePercent,
        confidenceInterval: predictionInterval,
        predictionHorizon: predictionHorizonText,
        reliability
      });
    });
    
    return results;
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
    // Group data by process type
    const processByType: Record<string, any[]> = {};
    
    data.forEach(item => {
      const processType = String(item[processTypeField] || 'Unknown');
      
      if (!processByType[processType]) {
        processByType[processType] = [];
      }
      
      processByType[processType].push(item);
    });
    
    // Calculate performance metrics for each process type
    const processPerformance = Object.entries(processByType).map(([processType, items]) => {
      // Extract performance values
      const performanceValues = items
        .map(item => Number(item[performanceField]))
        .filter(value => !isNaN(value));
      
      if (performanceValues.length < 3) {
        // Not enough data for statistical analysis
        return null;
      }
      
      // Calculate statistics
      const average = this.calculateMean(performanceValues);
      const stdDev = this.calculateStandardDeviation(performanceValues);
      const confidenceInterval = this.calculateConfidenceInterval(
        performanceValues,
        this.options.confidenceLevel || 0.95
      );
      
      return {
        processType,
        average,
        stdDev,
        confidenceInterval,
        sampleSize: performanceValues.length
      };
    }).filter(Boolean);
    
    // Sort by performance (considering whether higher is better)
    const sortedPerformance = [...processPerformance].sort((a, b) => 
      higherIsBetter 
        ? b.average - a.average 
        : a.average - b.average
    );
    
    // Determine statistical significance of differences
    const results = sortedPerformance.map((process, index) => {
      // Compare with other processes to determine if significantly better
      const significantlyBetter = sortedPerformance
        .filter((_, i) => i !== index)
        .map(otherProcess => {
          const diff = process.average - otherProcess.average;
          const direction = higherIsBetter ? diff > 0 : diff < 0;
          
          if (!direction) {
            return { better: false, significant: false };
          }
          
          // Calculate pooled standard error
          const pooledVariance = 
            ((process.sampleSize - 1) * Math.pow(process.stdDev, 2) + 
             (otherProcess.sampleSize - 1) * Math.pow(otherProcess.stdDev, 2)) / 
            (process.sampleSize + otherProcess.sampleSize - 2);
          
          const standardError = Math.sqrt(pooledVariance * 
            (1 / process.sampleSize + 1 / otherProcess.sampleSize));
          
          // Calculate t-statistic
          const tStat = Math.abs(diff) / standardError;
          
          // Calculate degrees of freedom
          const df = process.sampleSize + otherProcess.sampleSize - 2;
          
          // Calculate p-value
          const pValue = this.tDistPValue(tStat, df);
          
          return {
            better: true,
            significant: pValue < (this.options.significanceThreshold || 0.05),
            pValue
          };
        });
      
      // Count how many processes this one is significantly better than
      const significantlyBetterCount = significantlyBetter.filter(
        result => result.better && result.significant
      ).length;
      
      return {
        ...process,
        rank: index + 1,
        significantlyBetterCount,
        percentileBetter: (significantlyBetterCount / Math.max(1, sortedPerformance.length - 1)) * 100
      };
    });
    
    return results;
  }
  
  /**
   * Detect cyclical patterns in time series data
   * @param sortedData - Data sorted by time
   * @param parameter - Parameter to analyze
   * @returns Pattern recognition result if pattern detected, null otherwise
   */
  private detectCyclicalPattern(
    sortedData: Record<string, any>[],
    parameter: string
  ): PatternRecognitionResult | null {
    // Extract parameter values
    const values = sortedData
      .map(item => Number(item[parameter]))
      .filter(value => !isNaN(value));
    
    if (values.length < 10) {
      // Not enough data for cyclical pattern detection
      return null;
    }
    
    // Simple autocorrelation to detect cycles
    // This is a simplified implementation
    const maxLag = Math.floor(values.length / 3);
    const autocorrelations: number[] = [];
    
    for (let lag = 1; lag <= maxLag; lag++) {
      let numerator = 0;
      let denominator = 0;
      
      const mean = this.calculateMean(values);
      
      for (let i = 0; i < values.length - lag; i++) {
        numerator += (values[i] - mean) * (values[i + lag] - mean);
        denominator += Math.pow(values[i] - mean, 2);
      }
      
      const autocorrelation = numerator / denominator;
      autocorrelations.push(autocorrelation);
    }
    
    // Find peaks in autocorrelation
    const peaks: number[] = [];
    
    for (let i = 1; i < autocorrelations.length - 1; i++) {
      if (autocorrelations[i] > autocorrelations[i - 1] && 
          autocorrelations[i] > autocorrelations[i + 1] &&
          autocorrelations[i] > 0.3) {
        peaks.push(i + 1); // +1 because lag starts at 1
      }
    }
    
    if (peaks.length === 0) {
      return null;
    }
    
    // Use the first peak as the cycle length
    const cycleLength = peaks[0];
    
    // Calculate confidence based on autocorrelation strength
    const confidence = Math.min(1, autocorrelations[cycleLength - 1] + 0.5);
    
    return {
      patternType: 'cyclical',
      description: `Cyclical pattern detected in ${parameter} with approximate cycle length of ${cycleLength} data points`,
      affectedParameters: [parameter],
      confidence,
      supportingData: [
        { cycleLength, autocorrelation: autocorrelations[cycleLength - 1] }
      ]
    };
  }
  
  /**
   * Detect trend patterns in time series data
   * @param sortedData - Data sorted by time
   * @param parameter - Parameter to analyze
   * @returns Pattern recognition result if pattern detected, null otherwise
   */
  private detectTrendPattern(
    sortedData: Record<string, any>[],
    parameter: string
  ): PatternRecognitionResult | null {
    // Extract parameter values
    const values = sortedData
      .map(item => Number(item[parameter]))
      .filter(value => !isNaN(value));
    
    if (values.length < 5) {
      // Not enough data for trend detection
      return null;
    }
    
    // Calculate linear regression
    const xValues = Array.from({ length: values.length }, (_, i) => i);
    const regression = this.calculateLinearRegression(xValues, values);
    
    // Check if trend is significant
    // Calculate t-statistic for slope
    const n = values.length;
    const xMean = this.calculateMean(xValues);
    const sumSquaredX = xValues.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0);
    
    // Calculate residuals
    const residuals = values.map((y, i) => 
      y - (regression.slope * xValues[i] + regression.intercept)
    );
    
    // Calculate standard error of residuals
    const residualSumSquares = residuals.reduce((sum, r) => sum + r * r, 0);
    const standardError = Math.sqrt(residualSumSquares / (n - 2));
    
    // Calculate standard error of slope
    const slopeStandardError = standardError / Math.sqrt(sumSquaredX);
    
    // Calculate t-statistic
    const tStatistic = regression.slope / slopeStandardError;
    
    // Calculate p-value
    const degreesOfFreedom = n - 2;
    const pValue = this.tDistPValue(Math.abs(tStatistic), degreesOfFreedom);
    
    // Check if trend is significant
    if (pValue >= (this.options.significanceThreshold || 0.05) || 
        Math.abs(regression.slope) < 0.01 * this.calculateMean(values)) {
      return null;
    }
    
    // Determine trend direction and strength
    const trendDirection = regression.slope > 0 ? 'increasing' : 'decreasing';
    const trendStrength = Math.abs(regression.slope) / this.calculateMean(values);
    
    // Calculate confidence based on p-value and R-squared
    const confidence = (1 - pValue) * regression.rSquared;
    
    return {
      patternType: 'trend',
      description: `${trendDirection.charAt(0).toUpperCase() + trendDirection.slice(1)} trend detected in ${parameter}`,
      affectedParameters: [parameter],
      confidence,
      supportingData: [
        { 
          slope: regression.slope, 
          rSquared: regression.rSquared,
          pValue,
          trendStrength
        }
      ]
    };
  }
  
  /**
   * Detect step change patterns in time series data
   * @param sortedData - Data sorted by time
   * @param parameter - Parameter to analyze
   * @returns Pattern recognition result if pattern detected, null otherwise
   */
  private detectStepChangePattern(
    sortedData: Record<string, any>[],
    parameter: string
  ): PatternRecognitionResult | null {
    // Extract parameter values
    const values = sortedData
      .map(item => Number(item[parameter]))
      .filter(value => !isNaN(value));
    
    if (values.length < 10) {
      // Not enough data for step change detection
      return null;
    }
    
    // Look for significant changes in mean
    // This is a simplified implementation of change point detection
    const minSegmentSize = Math.max(3, Math.floor(values.length / 10));
    let bestChangePoint = -1;
    let maxMeanDifference = 0;
    
    for (let i = minSegmentSize; i <= values.length - minSegmentSize; i++) {
      const segment1 = values.slice(0, i);
      const segment2 = values.slice(i);
      
      const mean1 = this.calculateMean(segment1);
      const mean2 = this.calculateMean(segment2);
      
      const meanDifference = Math.abs(mean2 - mean1);
      
      if (meanDifference > maxMeanDifference) {
        maxMeanDifference = meanDifference;
        bestChangePoint = i;
      }
    }
    
    if (bestChangePoint === -1) {
      return null;
    }
    
    // Calculate statistics for segments
    const segment1 = values.slice(0, bestChangePoint);
    const segment2 = values.slice(bestChangePoint);
    
    const mean1 = this.calculateMean(segment1);
    const mean2 = this.calculateMean(segment2);
    
    const stdDev1 = this.calculateStandardDeviation(segment1);
    const stdDev2 = this.calculateStandardDeviation(segment2);
    
    // Calculate t-statistic for difference in means
    const pooledVariance = 
      ((segment1.length - 1) * Math.pow(stdDev1, 2) + 
       (segment2.length - 1) * Math.pow(stdDev2, 2)) / 
      (segment1.length + segment2.length - 2);
    
    const standardError = Math.sqrt(pooledVariance * 
      (1 / segment1.length + 1 / segment2.length));
    
    const tStat = Math.abs(mean2 - mean1) / standardError;
    
    // Calculate degrees of freedom
    const df = segment1.length + segment2.length - 2;
    
    // Calculate p-value
    const pValue = this.tDistPValue(tStat, df);
    
    // Check if step change is significant
    if (pValue >= (this.options.significanceThreshold || 0.05)) {
      return null;
    }
    
    // Calculate relative change
    const relativeChange = (mean2 - mean1) / mean1;
    
    // Calculate confidence based on p-value and relative change
    const confidence = (1 - pValue) * Math.min(1, Math.abs(relativeChange) * 5);
    
    return {
      patternType: 'step_change',
      description: `Step change detected in ${parameter} at data point ${bestChangePoint}`,
      affectedParameters: [parameter],
      confidence,
      supportingData: [
        { 
          changePoint: bestChangePoint,
          beforeMean: mean1,
          afterMean: mean2,
          relativeChange: relativeChange * 100, // as percentage
          pValue
        }
      ]
    };
  }
  
  /**
   * Calculate Pearson correlation coefficient
   * @param pairs - Array of [x, y] value pairs
   * @returns Correlation coefficient
   */
  private calculatePearsonCorrelation(pairs: [number, number][]): number {
    if (pairs.length < 2) return 0;
    
    const n = pairs.length;
    
    // Calculate means
    let sumX = 0;
    let sumY = 0;
    
    for (const [x, y] of pairs) {
      sumX += x;
      sumY += y;
    }
    
    const meanX = sumX / n;
    const meanY = sumY / n;
    
    // Calculate correlation components
    let numerator = 0;
    let denominatorX = 0;
    let denominatorY = 0;
    
    for (const [x, y] of pairs) {
      const xDiff = x - meanX;
      const yDiff = y - meanY;
      
      numerator += xDiff * yDiff;
      denominatorX += xDiff * xDiff;
      denominatorY += yDiff * yDiff;
    }
    
    // Calculate correlation coefficient
    const denominator = Math.sqrt(denominatorX * denominatorY);
    
    return denominator === 0 ? 0 : numerator / denominator;
  }
  
  /**
   * Calculate p-value for correlation coefficient
   * @param r - Correlation coefficient
   * @param n - Sample size
   * @returns P-value
   */
  private calculateCorrelationPValue(r: number, n: number): number {
    if (n < 3) return 1;
    
    // Calculate t-statistic
    const tStat = r * Math.sqrt((n - 2) / (1 - r * r));
    
    // Calculate p-value
    return this.tDistPValue(Math.abs(tStat), n - 2);
  }
  
  /**
   * Calculate linear regression
   * @param x - Array of x values
   * @param y - Array of y values
   * @returns Regression results with slope, intercept, and R-squared
   */
  private calculateLinearRegression(
    x: number[],
    y: number[]
  ): { slope: number; intercept: number; rSquared: number } {
    if (x.length !== y.length || x.length === 0) {
      return { slope: 0, intercept: 0, rSquared: 0 };
    }
    
    const n = x.length;
    
    // Calculate means
    const xMean = this.calculateMean(x);
    const yMean = this.calculateMean(y);
    
    // Calculate sums for regression formula
    let sumXY = 0;
    let sumXX = 0;
    let sumYY = 0;
    
    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - xMean;
      const yDiff = y[i] - yMean;
      
      sumXY += xDiff * yDiff;
      sumXX += xDiff * xDiff;
      sumYY += yDiff * yDiff;
    }
    
    // Calculate slope and intercept
    const slope = sumXY / sumXX;
    const intercept = yMean - slope * xMean;
    
    // Calculate R-squared
    const rSquared = Math.pow(sumXY, 2) / (sumXX * sumYY);
    
    return { slope, intercept, rSquared };
  }
  
  /**
   * Calculate prediction interval for regression
   * @param x - Array of x values
   * @param y - Array of y values
   * @param regression - Regression results
   * @param predictX - X value to predict
   * @param confidenceLevel - Confidence level
   * @returns Prediction interval as [lower, upper]
   */
  private calculatePredictionInterval(
    x: number[],
    y: number[],
    regression: { slope: number; intercept: number; rSquared: number },
    predictX: number,
    confidenceLevel: number
  ): [number, number] {
    if (x.length !== y.length || x.length < 3) {
      return [0, 0];
    }
    
    const n = x.length;
    const xMean = this.calculateMean(x);
    
    // Calculate predicted value
    const predictedY = regression.slope * predictX + regression.intercept;
    
    // Calculate residuals
    const residuals = y.map((yValue, i) => 
      yValue - (regression.slope * x[i] + regression.intercept)
    );
    
    // Calculate standard error of residuals
    const residualSumSquares = residuals.reduce((sum, r) => sum + r * r, 0);
    const standardError = Math.sqrt(residualSumSquares / (n - 2));
    
    // Calculate sum of squared x differences
    const sumSquaredX = x.reduce((sum, xValue) => sum + Math.pow(xValue - xMean, 2), 0);
    
    // Calculate prediction interval width
    const tValue = this.getTValue(n - 2, confidenceLevel);
    
    const predictionWidth = tValue * standardError * Math.sqrt(
      1 + 1 / n + Math.pow(predictX - xMean, 2) / sumSquaredX
    );
    
    return [
      predictedY - predictionWidth,
      predictedY + predictionWidth
    ];
  }
  
  /**
   * Calculate mean of values
   * @param values - Array of values
   * @returns Mean value
   */
  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
  
  /**
   * Calculate standard deviation of values
   * @param values - Array of values
   * @returns Standard deviation
   */
  private calculateStandardDeviation(values: number[]): number {
    if (values.length <= 1) return 0;
    
    const mean = this.calculateMean(values);
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    
    return Math.sqrt(squaredDiffs.reduce((sum, value) => sum + value, 0) / (values.length - 1));
  }
  
  /**
   * Calculate confidence interval for mean
   * @param values - Array of values
   * @param confidenceLevel - Confidence level
   * @returns Confidence interval as [lower, upper]
   */
  private calculateConfidenceInterval(
    values: number[],
    confidenceLevel: number
  ): [number, number] {
    if (values.length <= 1) return [0, 0];
    
    const mean = this.calculateMean(values);
    const stdDev = this.calculateStandardDeviation(values);
    const n = values.length;
    
    // Get t-value for confidence level
    const tValue = this.getTValue(n - 1, confidenceLevel);
    
    // Calculate margin of error
    const marginOfError = tValue * (stdDev / Math.sqrt(n));
    
    return [
      mean - marginOfError,
      mean + marginOfError
    ];
  }
  
  /**
   * Get t-value for confidence interval
   * @param degreesOfFreedom - Degrees of freedom
   * @param confidenceLevel - Confidence level
   * @returns T-value
   */
  private getTValue(degreesOfFreedom: number, confidenceLevel: number): number {
    // This is a simplified approximation of t-values
    // In a real implementation, this would use a t-distribution table or calculation
    
    // For large degrees of freedom, t-distribution approaches normal distribution
    if (degreesOfFreedom > 30) {
      // Use z-value approximation
      const alpha = 1 - confidenceLevel;
      
      // Common z-values for confidence levels
      if (confidenceLevel === 0.90) return 1.645;
      if (confidenceLevel === 0.95) return 1.96;
      if (confidenceLevel === 0.99) return 2.576;
      
      // Linear interpolation for other confidence levels
      if (confidenceLevel > 0.90 && confidenceLevel < 0.95) {
        return 1.645 + (1.96 - 1.645) * ((confidenceLevel - 0.90) / 0.05);
      }
      if (confidenceLevel > 0.95 && confidenceLevel < 0.99) {
        return 1.96 + (2.576 - 1.96) * ((confidenceLevel - 0.95) / 0.04);
      }
      
      return 2; // Default approximation
    }
    
    // For smaller degrees of freedom, use approximation
    // These are rough approximations for common confidence levels
    if (confidenceLevel === 0.95) {
      if (degreesOfFreedom === 1) return 12.71;
      if (degreesOfFreedom === 2) return 4.30;
      if (degreesOfFreedom === 3) return 3.18;
      if (degreesOfFreedom === 4) return 2.78;
      if (degreesOfFreedom === 5) return 2.57;
      if (degreesOfFreedom <= 10) return 2.23;
      if (degreesOfFreedom <= 20) return 2.09;
      return 2.04;
    }
    
    if (confidenceLevel === 0.99) {
      if (degreesOfFreedom === 1) return 63.66;
      if (degreesOfFreedom === 2) return 9.92;
      if (degreesOfFreedom === 3) return 5.84;
      if (degreesOfFreedom === 4) return 4.60;
      if (degreesOfFreedom === 5) return 4.03;
      if (degreesOfFreedom <= 10) return 3.17;
      if (degreesOfFreedom <= 20) return 2.85;
      return 2.75;
    }
    
    // Default approximation for other confidence levels
    return 2;
  }
  
  /**
   * Calculate p-value from t-statistic (approximation)
   * @param t - T-statistic
   * @param df - Degrees of freedom
   * @returns P-value
   */
  private tDistPValue(t: number, df: number): number {
    // Approximation of the t-distribution p-value
    // For large df, t-distribution approaches normal distribution
    if (df > 30) {
      return 2 * (1 - this.normalCDF(t));
    }
    
    // For smaller df, use a simple approximation
    // This is a very simplified approximation
    const x = df / (df + t * t);
    let p = Math.sqrt(1 - x) * (0.5 + (0.3989422804 * Math.exp(-t * t / 2)));
    
    // Adjust for degrees of freedom
    p = p * (1 - 1 / (4 * df));
    
    return 2 * p;
  }
  
  /**
   * Calculate cumulative distribution function for standard normal distribution
   * @param x - Z-score
   * @returns Probability
   */
  private normalCDF(x: number): number {
    // Approximation of the normal CDF
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    
    return x > 0 ? 1 - p : p;
  }
}

export default ProcessAnalytics;

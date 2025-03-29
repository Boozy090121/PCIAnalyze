/**
 * KPI Calculator Module
 * 
 * This module provides functionality for calculating key performance indicators (KPIs)
 * for the pharmaceutical process analytics dashboard, including RFT metrics with
 * statistical confidence intervals.
 */

export interface KPICalculatorOptions {
  confidenceLevel?: number; // Default: 0.95 (95%)
  outlierDetection?: boolean; // Default: true
  outlierThreshold?: number; // Default: 1.5 (IQR method)
}

export interface RFTResult {
  rate: number;
  confidenceInterval: [number, number];
  sampleSize: number;
}

export interface ProcessDurationResult {
  average: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  confidenceInterval: [number, number];
  outliers: number[];
  sampleSize: number;
}

export interface VarianceAnalysisResult {
  groupName: string;
  average: number;
  variance: number;
  sampleSize: number;
  significantlyDifferent: boolean;
  pValue?: number;
}

/**
 * KPI Calculator class for calculating pharmaceutical manufacturing KPIs
 */
export class KPICalculator {
  private options: KPICalculatorOptions;
  
  constructor(options: KPICalculatorOptions = {}) {
    this.options = {
      confidenceLevel: 0.95,
      outlierDetection: true,
      outlierThreshold: 1.5,
      ...options
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
    // Count successes
    const totalCount = data.length;
    const successCount = data.filter(item => {
      const value = item[successField];
      
      // Handle different types of success values
      if (typeof successValue === 'boolean') {
        return Boolean(value) === successValue;
      } else if (typeof successValue === 'string') {
        return String(value).toLowerCase() === successValue.toLowerCase();
      } else {
        return value === successValue;
      }
    }).length;
    
    // Calculate RFT rate
    const rftRate = totalCount > 0 ? successCount / totalCount : 0;
    
    // Calculate confidence interval using Wilson score interval
    const confidenceInterval = this.calculateWilsonInterval(
      successCount,
      totalCount,
      this.options.confidenceLevel || 0.95
    );
    
    return {
      rate: rftRate,
      confidenceInterval,
      sampleSize: totalCount
    };
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
    // Extract duration values
    const durations = data
      .map(item => Number(item[durationField]))
      .filter(value => !isNaN(value));
    
    if (durations.length === 0) {
      return {
        average: 0,
        median: 0,
        min: 0,
        max: 0,
        stdDev: 0,
        confidenceInterval: [0, 0],
        outliers: [],
        sampleSize: 0
      };
    }
    
    // Detect outliers if enabled
    let cleanedDurations = durations;
    let outliers: number[] = [];
    
    if (this.options.outlierDetection) {
      const result = this.detectOutliers(durations, this.options.outlierThreshold || 1.5);
      cleanedDurations = result.cleanData;
      outliers = result.outliers;
    }
    
    // Calculate statistics
    const average = this.calculateMean(cleanedDurations);
    const median = this.calculateMedian(cleanedDurations);
    const min = Math.min(...cleanedDurations);
    const max = Math.max(...cleanedDurations);
    const stdDev = this.calculateStandardDeviation(cleanedDurations);
    
    // Calculate confidence interval for mean
    const confidenceInterval = this.calculateConfidenceIntervalForMean(
      cleanedDurations,
      this.options.confidenceLevel || 0.95
    );
    
    return {
      average,
      median,
      min,
      max,
      stdDev,
      confidenceInterval,
      outliers,
      sampleSize: durations.length
    };
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
    // Group data
    const groups: Record<string, number[]> = {};
    
    data.forEach(item => {
      const groupValue = String(item[groupField] || 'Unknown');
      const value = Number(item[valueField]);
      
      if (!isNaN(value)) {
        if (!groups[groupValue]) {
          groups[groupValue] = [];
        }
        groups[groupValue].push(value);
      }
    });
    
    // Calculate statistics for each group
    const groupStats = Object.entries(groups).map(([groupName, values]) => {
      const average = this.calculateMean(values);
      const variance = this.calculateVariance(values);
      
      return {
        groupName,
        values,
        average,
        variance,
        sampleSize: values.length
      };
    });
    
    // Calculate overall statistics
    const allValues = Object.values(groups).flat();
    const overallAverage = this.calculateMean(allValues);
    const overallVariance = this.calculateVariance(allValues);
    
    // Perform ANOVA-like analysis to determine if differences are significant
    return groupStats.map(group => {
      // Simple significance test based on variance ratio
      // In a real implementation, this would use proper ANOVA or t-tests
      const varianceRatio = group.variance / overallVariance;
      const significantlyDifferent = Math.abs(group.average - overallAverage) > 
        2 * Math.sqrt(overallVariance / group.sampleSize);
      
      // Calculate p-value (simplified approximation)
      // In a real implementation, this would use proper statistical methods
      const zScore = Math.abs(group.average - overallAverage) / 
        Math.sqrt(overallVariance / group.sampleSize);
      const pValue = 2 * (1 - this.normalCDF(zScore));
      
      return {
        groupName: group.groupName,
        average: group.average,
        variance: group.variance,
        sampleSize: group.sampleSize,
        significantlyDifferent,
        pValue
      };
    });
  }
  
  /**
   * Identify trends in time-series data with statistical significance testing
   * @param data - Array of time-series data
   * @param timeField - Field name containing time/date values
   * @param valueField - Field name containing the value to analyze
   * @param periods - Number of periods to divide the data into
   * @returns Trend analysis result
   */
  identifyTrends(
    data: Record<string, any>[],
    timeField: string,
    valueField: string,
    periods: number = 5
  ): any {
    // Sort data by time
    const sortedData = [...data].sort((a, b) => {
      const timeA = new Date(a[timeField]).getTime();
      const timeB = new Date(b[timeField]).getTime();
      return timeA - timeB;
    });
    
    // Extract values
    const values = sortedData.map(item => Number(item[valueField])).filter(v => !isNaN(v));
    
    if (values.length === 0) {
      return {
        trend: 'none',
        significance: 0,
        periods: []
      };
    }
    
    // Divide into periods
    const periodSize = Math.max(1, Math.floor(values.length / periods));
    const periodValues: number[][] = [];
    
    for (let i = 0; i < periods; i++) {
      const start = i * periodSize;
      const end = i === periods - 1 ? values.length : (i + 1) * periodSize;
      periodValues.push(values.slice(start, end));
    }
    
    // Calculate period statistics
    const periodStats = periodValues.map((periodData, index) => {
      const average = this.calculateMean(periodData);
      const stdDev = this.calculateStandardDeviation(periodData);
      
      return {
        period: index + 1,
        average,
        stdDev,
        sampleSize: periodData.length
      };
    });
    
    // Calculate trend using linear regression
    const xValues = periodStats.map((_, i) => i + 1);
    const yValues = periodStats.map(stat => stat.average);
    
    const regression = this.calculateLinearRegression(xValues, yValues);
    
    // Determine trend direction and significance
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (regression.slope > 0) {
      trend = 'increasing';
    } else if (regression.slope < 0) {
      trend = 'decreasing';
    }
    
    // Calculate statistical significance of trend
    // Using t-statistic for slope
    const n = periods;
    const xMean = this.calculateMean(xValues);
    const sumSquaredX = xValues.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0);
    
    // Calculate residuals
    const residuals = yValues.map((y, i) => 
      y - (regression.slope * xValues[i] + regression.intercept)
    );
    
    // Calculate standard error of residuals
    const residualSumSquares = residuals.reduce((sum, r) => sum + r * r, 0);
    const standardError = Math.sqrt(residualSumSquares / (n - 2));
    
    // Calculate standard error of slope
    const slopeStandardError = standardError / Math.sqrt(sumSquaredX);
    
    // Calculate t-statistic
    const tStatistic = regression.slope / slopeStandardError;
    
    // Calculate p-value (simplified)
    const degreesOfFreedom = n - 2;
    const pValue = this.tDistPValue(Math.abs(tStatistic), degreesOfFreedom);
    
    // Determine significance
    const significant = pValue < 0.05;
    
    return {
      trend,
      slope: regression.slope,
      intercept: regression.intercept,
      rSquared: regression.rSquared,
      significant,
      pValue,
      periods: periodStats
    };
  }
  
  /**
   * Calculate Wilson score interval for binomial proportion confidence interval
   * @param successes - Number of successes
   * @param total - Total number of trials
   * @param confidenceLevel - Confidence level (e.g., 0.95 for 95%)
   * @returns Confidence interval as [lower, upper]
   */
  private calculateWilsonInterval(
    successes: number,
    total: number,
    confidenceLevel: number
  ): [number, number] {
    if (total === 0) return [0, 0];
    
    const proportion = successes / total;
    const z = this.getZScore(confidenceLevel);
    const z2 = z * z;
    
    const numerator = proportion + z2 / (2 * total);
    const denominator = 1 + z2 / total;
    const center = numerator / denominator;
    
    const adjustment = z * Math.sqrt(
      (proportion * (1 - proportion) + z2 / (4 * total)) / total
    ) / denominator;
    
    return [
      Math.max(0, center - adjustment),
      Math.min(1, center + adjustment)
    ];
  }
  
  /**
   * Calculate confidence interval for mean
   * @param values - Array of values
   * @param confidenceLevel - Confidence level (e.g., 0.95 for 95%)
   * @returns Confidence interval as [lower, upper]
   */
  private calculateConfidenceIntervalForMean(
    values: number[],
    confidenceLevel: number
  ): [number, number] {
    if (values.length === 0) return [0, 0];
    
    const mean = this.calculateMean(values);
    const stdDev = this.calculateStandardDeviation(values);
    const n = values.length;
    
    // For large samples, use normal distribution
    // For small samples, should use t-distribution, but simplified here
    const z = this.getZScore(confidenceLevel);
    const marginOfError = z * (stdDev / Math.sqrt(n));
    
    return [
      mean - marginOfError,
      mean + marginOfError
    ];
  }
  
  /**
   * Detect outliers using IQR method
   * @param values - Array of values
   * @param threshold - IQR multiplier for outlier detection
   * @returns Object with clean data and outliers
   */
  private detectOutliers(
    values: number[],
    threshold: number
  ): { cleanData: number[]; outliers: number[] } {
    if (values.length === 0) {
      return { cleanData: [], outliers: [] };
    }
    
    // Sort values
    const sortedValues = [...values].sort((a, b) => a - b);
    
    // Calculate quartiles
    const q1Index = Math.floor(sortedValues.length * 0.25);
    const q3Index = Math.floor(sortedValues.length * 0.75);
    
    const q1 = sortedValues[q1Index];
    const q3 = sortedValues[q3Index];
    
    // Calculate IQR and bounds
    const iqr = q3 - q1;
    const lowerBound = q1 - threshold * iqr;
    const upperBound = q3 + threshold * iqr;
    
    // Separate clean data and outliers
    const cleanData: number[] = [];
    const outliers: number[] = [];
    
    values.forEach(value => {
      if (value < lowerBound || value > upperBound) {
        outliers.push(value);
      } else {
        cleanData.push(value);
      }
    });
    
    return { cleanData, outliers };
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
   * Get Z-score for a given confidence level
   * @param confidenceLevel - Confidence level (e.g., 0.95 for 95%)
   * @returns Z-score
   */
  private getZScore(confidenceLevel: number): number {
    // Common z-scores for confidence levels
    if (confidenceLevel === 0.90) return 1.645;
    if (confidenceLevel === 0.95) return 1.96;
    if (confidenceLevel === 0.99) return 2.576;
    
    // For other confidence levels, use approximation
    // This is a simplified approximation
    const alpha = 1 - confidenceLevel;
    return -this.inverseNormalCDF(alpha / 2);
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
   * Calculate median of values
   * @param values - Array of values
   * @returns Median value
   */
  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    
    const sortedValues = [...values].sort((a, b) => a - b);
    const midIndex = Math.floor(sortedValues.length / 2);
    
    if (sortedValues.length % 2 === 0) {
      return (sortedValues[midIndex - 1] + sortedValues[midIndex]) / 2;
    } else {
      return sortedValues[midIndex];
    }
  }
  
  /**
   * Calculate variance of values
   * @param values - Array of values
   * @returns Variance
   */
  private calculateVariance(values: number[]): number {
    if (values.length <= 1) return 0;
    
    const mean = this.calculateMean(values);
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    
    return squaredDiffs.reduce((sum, value) => sum + value, 0) / (values.length - 1);
  }
  
  /**
   * Calculate standard deviation of values
   * @param values - Array of values
   * @returns Standard deviation
   */
  private calculateStandardDeviation(values: number[]): number {
    return Math.sqrt(this.calculateVariance(values));
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
  
  /**
   * Calculate inverse of the normal CDF (approximation)
   * @param p - Probability
   * @returns Z-score
   */
  private inverseNormalCDF(p: number): number {
    // Approximation of the inverse normal CDF
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    
    const a1 = -39.6968302866538;
    const a2 = 220.946098424521;
    const a3 = -275.928510446969;
    const a4 = 138.357751867269;
    const a5 = -30.6647980661472;
    const a6 = 2.50662827745924;
    
    const b1 = -54.4760987982241;
    const b2 = 161.585836858041;
    const b3 = -155.698979859887;
    const b4 = 66.8013118877197;
    const b5 = -13.2806815528857;
    
    const c1 = -7.78489400243029E-03;
    const c2 = -0.322396458041136;
    const c3 = -2.40075827716184;
    const c4 = -2.54973253934373;
    const c5 = 4.37466414146497;
    const c6 = 2.93816398269878;
    
    const d1 = 7.78469570904146E-03;
    const d2 = 0.32246712907004;
    const d3 = 2.445134137143;
    const d4 = 3.75440866190742;
    
    let q = p - 0.5;
    
    if (Math.abs(q) <= 0.425) {
      const r = 0.180625 - q * q;
      return q * (((((a6 * r + a5) * r + a4) * r + a3) * r + a2) * r + a1) /
             (((((b5 * r + b4) * r + b3) * r + b2) * r + b1) * r + 1);
    }
    
    let r = q < 0 ? p : 1 - p;
    r = Math.sqrt(-Math.log(r));
    
    let x;
    if (r <= 5) {
      r = r - 1.6;
      x = (((((c6 * r + c5) * r + c4) * r + c3) * r + c2) * r + c1) /
          ((((d4 * r + d3) * r + d2) * r + d1) * r + 1);
    } else {
      r = r - 5;
      x = (((((c6 * r + c5) * r + c4) * r + c3) * r + c2) * r + c1) /
          ((((d4 * r + d3) * r + d2) * r + d1) * r + 1);
    }
    
    return q < 0 ? -x : x;
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
}

export default KPICalculator;

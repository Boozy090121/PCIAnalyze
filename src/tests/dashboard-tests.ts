/**
 * Dashboard Test Suite
 * 
 * This file contains tests for the pharmaceutical process analytics dashboard
 * to ensure all components work together correctly.
 */

import { DataProcessingManager } from '@/lib/data-processing/data-processing-manager';
import { AnalyticsService } from '@/lib/analytics/analytics-service';
import { KPICalculator } from '@/lib/analytics/kpi-calculator';
import { ProcessAnalytics } from '@/lib/analytics/process-analytics';

// Mock data for testing
const mockExcelData = [
  {
    BatchID: 'Commercial_Batch123',
    Timestamp: '2024-01-15T08:30:00',
    Department: 'Manufacturing',
    ProcessType: 'Commercial',
    Duration: 4.5,
    Temperature: 25.2,
    Pressure: 101.3,
    pH: 7.2,
    Success: true
  },
  {
    BatchID: 'Commercial_Batch124',
    Timestamp: '2024-01-16T09:15:00',
    Department: 'Manufacturing',
    ProcessType: 'Commercial',
    Duration: 4.2,
    Temperature: 25.5,
    Pressure: 101.5,
    pH: 7.1,
    Success: true
  },
  {
    BatchID: 'Development_Batch45',
    Timestamp: '2024-01-17T10:00:00',
    Department: 'R&D',
    ProcessType: 'Development',
    Duration: 5.1,
    Temperature: 24.8,
    Pressure: 100.9,
    pH: 7.3,
    Success: false
  },
  {
    BatchID: 'Validation_Batch12',
    Timestamp: '2024-01-18T11:30:00',
    Department: 'Quality',
    ProcessType: 'Validation',
    Duration: 3.8,
    Temperature: 25.0,
    Pressure: 101.0,
    pH: 7.0,
    Success: true
  },
  {
    BatchID: 'Commercial_Batch125',
    Timestamp: '2024-01-19T08:45:00',
    Department: 'Manufacturing',
    ProcessType: 'Commercial',
    Duration: 4.3,
    Temperature: 25.3,
    Pressure: 101.4,
    pH: 7.2,
    Success: true
  }
];

// Test schema detection
function testSchemaDetection() {
  console.log('Testing schema detection...');
  
  try {
    // Create Excel parser
    const dataProcessingManager = new DataProcessingManager();
    
    // Mock parsed data
    const parsedData = {
      headers: Object.keys(mockExcelData[0]),
      rows: mockExcelData,
      schema: {}
    };
    
    // Detect schema
    const excelParser = dataProcessingManager['excelParser']; // Access private property for testing
    if (!excelParser) {
      throw new Error('Excel parser not initialized');
    }
    
    const schema = excelParser.detectSchema(parsedData.headers, parsedData.rows);
    
    // Verify schema detection
    console.log('Detected schema:', schema);
    
    // Check if key fields were detected correctly
    const tests = [
      { field: 'batchIdField', expected: 'BatchID', actual: schema.batchIdField },
      { field: 'timestampField', expected: 'Timestamp', actual: schema.timestampField },
      { field: 'processTypeField', expected: 'ProcessType', actual: schema.processTypeField },
      { field: 'departmentField', expected: 'Department', actual: schema.departmentField },
      { field: 'successField', expected: 'Success', actual: schema.successField },
      { field: 'durationField', expected: 'Duration', actual: schema.durationField }
    ];
    
    let allPassed = true;
    
    tests.forEach(test => {
      const passed = test.actual === test.expected;
      console.log(`  ${test.field}: ${passed ? 'PASSED' : 'FAILED'} (Expected: ${test.expected}, Got: ${test.actual})`);
      if (!passed) allPassed = false;
    });
    
    // Check parameter fields
    const expectedParameters = ['Temperature', 'Pressure', 'pH'];
    const hasAllParameters = expectedParameters.every(param => schema.parameterFields.includes(param));
    console.log(`  parameterFields: ${hasAllParameters ? 'PASSED' : 'FAILED'} (Expected to include: ${expectedParameters.join(', ')})`);
    if (!hasAllParameters) allPassed = false;
    
    console.log(`Schema detection test: ${allPassed ? 'PASSED' : 'FAILED'}`);
    return allPassed;
  } catch (error) {
    console.error('Error in schema detection test:', error);
    return false;
  }
}

// Test pattern analysis
function testPatternAnalysis() {
  console.log('Testing pattern analysis...');
  
  try {
    // Create pattern analyzer
    const patternAnalyzer = new ProcessAnalytics();
    
    // Analyze patterns
    const patterns = patternAnalyzer.recognizePatterns(
      mockExcelData,
      'Timestamp',
      ['Temperature', 'Pressure', 'pH', 'Duration']
    );
    
    // Verify pattern recognition
    console.log(`Detected ${patterns.length} patterns`);
    
    // Check if patterns were detected
    const hasPatterns = patterns.length > 0;
    console.log(`  Pattern detection: ${hasPatterns ? 'PASSED' : 'FAILED'} (Expected some patterns to be detected)`);
    
    // Check correlations
    const correlations = patternAnalyzer.analyzeCorrelations(
      mockExcelData,
      ['Temperature', 'Pressure', 'pH', 'Duration']
    );
    
    console.log(`Detected ${correlations.length} correlations`);
    
    // Check if correlations were detected
    const hasCorrelations = correlations.length > 0;
    console.log(`  Correlation analysis: ${hasCorrelations ? 'PASSED' : 'FAILED'} (Expected some correlations to be detected)`);
    
    return hasPatterns && hasCorrelations;
  } catch (error) {
    console.error('Error in pattern analysis test:', error);
    return false;
  }
}

// Test KPI calculations
function testKPICalculations() {
  console.log('Testing KPI calculations...');
  
  try {
    // Create KPI calculator
    const kpiCalculator = new KPICalculator();
    
    // Calculate RFT
    const rft = kpiCalculator.calculateRFT(
      mockExcelData,
      'Success',
      true
    );
    
    // Verify RFT calculation
    console.log('Calculated RFT:', rft);
    
    // Expected RFT: 4 out of 5 = 0.8
    const expectedRFT = 0.8;
    const rftPassed = Math.abs(rft.rate - expectedRFT) < 0.001;
    console.log(`  RFT calculation: ${rftPassed ? 'PASSED' : 'FAILED'} (Expected: ${expectedRFT}, Got: ${rft.rate})`);
    
    // Check confidence interval
    const hasConfidenceInterval = Array.isArray(rft.confidenceInterval) && rft.confidenceInterval.length === 2;
    console.log(`  Confidence interval: ${hasConfidenceInterval ? 'PASSED' : 'FAILED'} (Expected array with 2 elements)`);
    
    // Calculate process duration
    const duration = kpiCalculator.calculateProcessDuration(
      mockExcelData,
      'Duration'
    );
    
    // Verify duration calculation
    console.log('Calculated duration metrics:', duration);
    
    // Expected average duration: (4.5 + 4.2 + 5.1 + 3.8 + 4.3) / 5 = 4.38
    const expectedAvgDuration = 4.38;
    const durationPassed = Math.abs(duration.average - expectedAvgDuration) < 0.01;
    console.log(`  Duration calculation: ${durationPassed ? 'PASSED' : 'FAILED'} (Expected: ${expectedAvgDuration}, Got: ${duration.average})`);
    
    return rftPassed && hasConfidenceInterval && durationPassed;
  } catch (error) {
    console.error('Error in KPI calculations test:', error);
    return false;
  }
}

// Test analytics service
function testAnalyticsService() {
  console.log('Testing analytics service...');
  
  try {
    // Create analytics service
    const analyticsService = new AnalyticsService();
    
    // Generate dashboard analytics
    const analytics = analyticsService.generateDashboardAnalytics(
      mockExcelData,
      {
        processTypeField: 'ProcessType',
        successField: 'Success',
        successValue: true,
        durationField: 'Duration',
        timeField: 'Timestamp',
        parameterFields: ['Temperature', 'Pressure', 'pH']
      }
    );
    
    // Verify analytics generation
    console.log('Generated analytics:', Object.keys(analytics));
    
    // Check if all required analytics sections are present
    const requiredSections = ['overallRFT', 'processPerformance', 'trends', 'patterns', 'correlations', 'predictions'];
    const hasAllSections = requiredSections.every(section => analytics[section] !== undefined);
    console.log(`  Analytics sections: ${hasAllSections ? 'PASSED' : 'FAILED'} (Expected all required sections)`);
    
    // Check process performance
    const hasProcessPerformance = analytics.processPerformance.length > 0;
    console.log(`  Process performance: ${hasProcessPerformance ? 'PASSED' : 'FAILED'} (Expected some process performance data)`);
    
    // Check predictions
    const hasPredictions = analytics.predictions.length > 0;
    console.log(`  Predictions: ${hasPredictions ? 'PASSED' : 'FAILED'} (Expected some predictions)`);
    
    return hasAllSections && hasProcessPerformance && hasPredictions;
  } catch (error) {
    console.error('Error in analytics service test:', error);
    return false;
  }
}

// Run all tests
function runAllTests() {
  console.log('Running dashboard tests...');
  console.log('------------------------');
  
  const schemaTestPassed = testSchemaDetection();
  console.log('------------------------');
  
  const patternTestPassed = testPatternAnalysis();
  console.log('------------------------');
  
  const kpiTestPassed = testKPICalculations();
  console.log('------------------------');
  
  const analyticsTestPassed = testAnalyticsService();
  console.log('------------------------');
  
  // Summary
  console.log('Test Summary:');
  console.log(`  Schema Detection: ${schemaTestPassed ? 'PASSED' : 'FAILED'}`);
  console.log(`  Pattern Analysis: ${patternTestPassed ? 'PASSED' : 'FAILED'}`);
  console.log(`  KPI Calculations: ${kpiTestPassed ? 'PASSED' : 'FAILED'}`);
  console.log(`  Analytics Service: ${analyticsTestPassed ? 'PASSED' : 'FAILED'}`);
  
  const allPassed = schemaTestPassed && patternTestPassed && kpiTestPassed && analyticsTestPassed;
  console.log(`Overall Test Result: ${allPassed ? 'PASSED' : 'FAILED'}`);
  
  return allPassed;
}

// Export test functions
export {
  testSchemaDetection,
  testPatternAnalysis,
  testKPICalculations,
  testAnalyticsService,
  runAllTests
};

// Run tests if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runAllTests();
}

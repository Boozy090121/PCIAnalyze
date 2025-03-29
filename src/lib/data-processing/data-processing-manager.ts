/**
 * Data Processing Manager
 * 
 * This module coordinates the data processing workflow for the pharmaceutical
 * process analytics dashboard, including file parsing, schema detection, and pattern analysis.
 */

import { ExcelParser } from './excel-parser';
import { PatternAnalyzer } from './pattern-analyzer';

export interface ProcessingOptions {
  onProgress?: (progress: number, stage?: string) => void;
  onComplete?: (result: ProcessingResult) => void;
  onError?: (error: Error) => void;
}

export interface ProcessingResult {
  data: Record<string, any>[];
  schema: {
    batchIdField: string | null;
    processTypeField: string | null;
    timestampField: string | null;
    departmentField: string | null;
    successField: string | null;
    durationField: string | null;
    parameterFields: string[];
  };
  patterns: any[];
}

export class DataProcessingManager {
  private excelParser: ExcelParser;
  private patternAnalyzer: PatternAnalyzer;
  
  constructor() {
    this.excelParser = new ExcelParser();
    this.patternAnalyzer = new PatternAnalyzer();
  }
  
  /**
   * Process an Excel file with progress tracking
   * @param file - Excel file to process
   * @param options - Processing options with callbacks
   */
  async processFile(file: File, options: ProcessingOptions = {}): Promise<void> {
    try {
      // Report initial progress
      if (options.onProgress) {
        options.onProgress(0, 'parsing');
      }
      
      // Parse Excel file
      const { data, schema } = await this.excelParser.parseExcelFile(file, {
        onProgress: (progress) => {
          if (options.onProgress) {
            options.onProgress(progress * 0.7, 'parsing');
          }
        }
      });
      
      // Report progress after parsing
      if (options.onProgress) {
        options.onProgress(70, 'analyzing');
      }
      
      // Analyze patterns if batch ID field is detected
      let patterns: any[] = [];
      if (schema.batchIdField && data.length > 0) {
        patterns = this.patternAnalyzer.analyzePatterns(data, schema);
      }
      
      // Report completion
      if (options.onProgress) {
        options.onProgress(100, 'complete');
      }
      
      // Call completion callback
      if (options.onComplete) {
        options.onComplete({
          data,
          schema,
          patterns
        });
      }
    } catch (error: any) {
      // Handle errors
      if (options.onError) {
        options.onError(error);
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Process data directly (without file)
   * @param data - Data array to process
   * @param options - Processing options
   */
  processData(data: Record<string, any>[], options: ProcessingOptions = {}): void {
    try {
      // Report initial progress
      if (options.onProgress) {
        options.onProgress(0, 'analyzing');
      }
      
      // Detect schema
      const schema = this.excelParser.detectSchema(data);
      
      // Report progress
      if (options.onProgress) {
        options.onProgress(50, 'analyzing');
      }
      
      // Analyze patterns
      let patterns: any[] = [];
      if (schema.batchIdField) {
        patterns = this.patternAnalyzer.analyzePatterns(data, schema);
      }
      
      // Report completion
      if (options.onProgress) {
        options.onProgress(100, 'complete');
      }
      
      // Call completion callback
      if (options.onComplete) {
        options.onComplete({
          data,
          schema,
          patterns
        });
      }
    } catch (error: any) {
      // Handle errors
      if (options.onError) {
        options.onError(error);
      } else {
        throw error;
      }
    }
  }
}

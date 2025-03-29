/**
 * Pattern Analyzer Module
 * 
 * This module provides functionality for analyzing patterns in pharmaceutical manufacturing data,
 * particularly focusing on batch ID patterns to extract process types and categories.
 */

export interface PatternAnalysisOptions {
  batchIdField: string;
  processTypeField?: string;
  timestampField?: string;
}

export interface ProcessTypeInfo {
  processType: string;
  subType?: string;
  category?: string;
  isCommercial: boolean;
}

export interface PatternAnalysisResult {
  processTypes: Record<string, ProcessTypeInfo>;
  timePeriodsGenerated: boolean;
  groupedData: Record<string, any[]>;
}

/**
 * Pattern Analyzer class for identifying patterns in pharmaceutical manufacturing data
 */
export class PatternAnalyzer {
  private options: PatternAnalysisOptions;
  
  constructor(options: PatternAnalysisOptions) {
    this.options = options;
  }
  
  /**
   * Analyze patterns in the data to extract process types and categories
   * @param data - Array of data rows
   * @returns Pattern analysis results
   */
  analyzePatterns(data: Record<string, any>[]): PatternAnalysisResult {
    const { batchIdField, processTypeField } = this.options;
    
    // Ensure required fields exist
    if (!batchIdField || !data.some(row => row[batchIdField])) {
      throw new Error(`Batch ID field "${batchIdField}" not found in data`);
    }
    
    // Extract process types from batch IDs
    const processTypes: Record<string, ProcessTypeInfo> = {};
    const groupedData: Record<string, any[]> = {};
    
    // First pass: extract process types from batch IDs or use existing process type field
    for (const row of data) {
      const batchId = String(row[batchIdField] || '');
      if (!batchId) continue;
      
      let processTypeInfo: ProcessTypeInfo;
      
      // If process type field exists, use it as a starting point
      if (processTypeField && row[processTypeField]) {
        const existingType = String(row[processTypeField]);
        processTypeInfo = this.enhanceProcessTypeInfo(existingType, batchId);
      } else {
        // Extract process type from batch ID
        processTypeInfo = this.extractProcessTypeFromBatchId(batchId);
      }
      
      // Store process type info
      const processTypeKey = processTypeInfo.processType;
      processTypes[processTypeKey] = processTypeInfo;
      
      // Group data by process type
      if (!groupedData[processTypeKey]) {
        groupedData[processTypeKey] = [];
      }
      groupedData[processTypeKey].push({
        ...row,
        _processTypeInfo: processTypeInfo
      });
    }
    
    // Generate synthetic time periods if timestamp field is missing
    const timePeriodsGenerated = this.generateTimePeriods(data);
    
    return {
      processTypes,
      timePeriodsGenerated,
      groupedData
    };
  }
  
  /**
   * Extract process type information from a batch ID
   * @param batchId - Batch identifier
   * @returns Process type information
   */
  private extractProcessTypeFromBatchId(batchId: string): ProcessTypeInfo {
    // Common patterns in pharmaceutical batch IDs
    const patterns = [
      // Commercial_BatchXYZ pattern
      {
        regex: /^(Commercial|COMM|COM)[\s_-](.+)$/i,
        processType: 'Commercial',
        isCommercial: true
      },
      // DEV_BatchXYZ pattern
      {
        regex: /^(Development|DEV|R&D)[\s_-](.+)$/i,
        processType: 'Development',
        isCommercial: false
      },
      // TECH_BatchXYZ pattern
      {
        regex: /^(Technical|TECH|TEC)[\s_-](.+)$/i,
        processType: 'Technical',
        isCommercial: false
      },
      // STAB_BatchXYZ pattern
      {
        regex: /^(Stability|STAB|STB)[\s_-](.+)$/i,
        processType: 'Stability',
        isCommercial: false
      },
      // VAL_BatchXYZ pattern
      {
        regex: /^(Validation|VAL|VLD)[\s_-](.+)$/i,
        processType: 'Validation',
        isCommercial: false
      },
      // QC_BatchXYZ pattern
      {
        regex: /^(QualityControl|QC|QA)[\s_-](.+)$/i,
        processType: 'Quality Control',
        isCommercial: false
      },
      // PR_BatchXYZ pattern
      {
        regex: /^(Production|PROD|PR)[\s_-](.+)$/i,
        processType: 'Production',
        isCommercial: true
      }
    ];
    
    // Try to match batch ID against known patterns
    for (const pattern of patterns) {
      const match = batchId.match(pattern.regex);
      if (match) {
        return {
          processType: pattern.processType,
          isCommercial: pattern.isCommercial,
          // Try to extract subtype from the remaining part
          subType: this.extractSubType(match[2])
        };
      }
    }
    
    // If no pattern matches, try to extract information from the batch ID structure
    if (batchId.includes('_')) {
      const parts = batchId.split('_');
      return {
        processType: parts[0],
        subType: parts.length > 1 ? parts[1] : undefined,
        isCommercial: batchId.toLowerCase().includes('com') || batchId.toLowerCase().includes('prod')
      };
    }
    
    // Default process type if no pattern is recognized
    return {
      processType: 'Unknown',
      isCommercial: false
    };
  }
  
  /**
   * Extract subtype information from batch ID components
   * @param batchComponent - Component of batch ID after process type
   * @returns Extracted subtype
   */
  private extractSubType(batchComponent: string): string | undefined {
    // Look for common subtype patterns
    const subtypePatterns = [
      // Product code pattern (letters followed by numbers)
      { regex: /^([A-Z]+)(\d+)/i, group: 1 },
      // Category-Number pattern
      { regex: /^([A-Z]+)-(\d+)/i, group: 1 },
      // Take first part before any delimiter
      { regex: /^([^-_\s]+)/, group: 1 }
    ];
    
    for (const pattern of subtypePatterns) {
      const match = batchComponent.match(pattern.regex);
      if (match) {
        return match[pattern.group];
      }
    }
    
    return undefined;
  }
  
  /**
   * Enhance process type information with batch ID patterns
   * @param existingType - Existing process type from data
   * @param batchId - Batch identifier
   * @returns Enhanced process type information
   */
  private enhanceProcessTypeInfo(existingType: string, batchId: string): ProcessTypeInfo {
    const baseInfo: ProcessTypeInfo = {
      processType: existingType,
      isCommercial: this.isCommercialType(existingType)
    };
    
    // Extract subtype from batch ID if possible
    if (batchId.includes('_')) {
      const parts = batchId.split('_');
      baseInfo.subType = parts.length > 1 ? parts[1] : undefined;
    }
    
    // Determine category based on process type and batch ID
    baseInfo.category = this.determineCategory(existingType, batchId);
    
    return baseInfo;
  }
  
  /**
   * Determine if a process type is commercial
   * @param processType - Process type string
   * @returns Boolean indicating if process is commercial
   */
  private isCommercialType(processType: string): boolean {
    const commercialTerms = ['commercial', 'production', 'manufacturing', 'prod', 'com'];
    return commercialTerms.some(term => processType.toLowerCase().includes(term));
  }
  
  /**
   * Determine category based on process type and batch ID
   * @param processType - Process type string
   * @param batchId - Batch identifier
   * @returns Category string if determined
   */
  private determineCategory(processType: string, batchId: string): string | undefined {
    // Common categories in pharmaceutical manufacturing
    const categories = {
      'API': ['api', 'active', 'ingredient', 'substance'],
      'Formulation': ['form', 'formulation', 'tablet', 'capsule', 'solution'],
      'Packaging': ['pack', 'packaging', 'blister', 'bottle'],
      'Testing': ['test', 'testing', 'qc', 'qa'],
      'Stability': ['stab', 'stability'],
      'Validation': ['val', 'validation']
    };
    
    // Check process type and batch ID against category terms
    const combinedText = `${processType} ${batchId}`.toLowerCase();
    
    for (const [category, terms] of Object.entries(categories)) {
      if (terms.some(term => combinedText.includes(term))) {
        return category;
      }
    }
    
    return undefined;
  }
  
  /**
   * Generate synthetic time periods if timestamp field is missing
   * @param data - Array of data rows
   * @returns Boolean indicating if time periods were generated
   */
  private generateTimePeriods(data: Record<string, any>[]): boolean {
    const { timestampField } = this.options;
    
    // If timestamp field exists and has values, no need to generate
    if (timestampField && data.some(row => row[timestampField])) {
      return false;
    }
    
    // Generate synthetic time periods based on row order
    const totalRows = data.length;
    if (totalRows === 0) return false;
    
    // Create synthetic dates spanning one year from current date
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 1);
    
    const timeRange = endDate.getTime() - startDate.getTime();
    
    // Assign synthetic dates to each row
    data.forEach((row, index) => {
      const position = index / totalRows;
      const timestamp = new Date(startDate.getTime() + timeRange * position);
      row._syntheticTimestamp = timestamp;
    });
    
    return true;
  }
}

export default PatternAnalyzer;

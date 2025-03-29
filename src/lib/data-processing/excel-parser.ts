/**
 * Excel Parser Module
 * 
 * This module provides functionality for parsing Excel files with intelligent schema detection
 * for pharmaceutical manufacturing process data.
 */

import * as XLSX from 'xlsx';

export interface ExcelParserOptions {
  detectHeaders: boolean;
  dateFormat?: string;
  numberFormat?: string;
}

export interface ParsedData {
  headers: string[];
  rows: Record<string, any>[];
  schema: SchemaInfo;
}

export interface SchemaInfo {
  batchIdField?: string;
  timestampField?: string;
  processTypeField?: string;
  departmentField?: string;
  rftStatusField?: string;
  detectedFields: DetectedField[];
}

export interface DetectedField {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'unknown';
  possibleAlternateNames?: string[];
}

/**
 * Excel Parser class for handling Excel file parsing with schema detection
 */
export class ExcelParser {
  private options: ExcelParserOptions;

  constructor(options: ExcelParserOptions = { detectHeaders: true }) {
    this.options = {
      detectHeaders: true,
      dateFormat: 'YYYY-MM-DD',
      numberFormat: '0.00',
      ...options
    };
  }

  /**
   * Parse Excel file and return structured data with schema information
   * @param fileData - ArrayBuffer containing the Excel file data
   * @returns Promise resolving to parsed data with schema information
   */
  async parseFile(fileData: ArrayBuffer): Promise<ParsedData> {
    try {
      // Read the Excel file
      const workbook = XLSX.read(new Uint8Array(fileData), { type: 'array' });
      
      // Get the first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Extract headers and rows
      const headers = this.options.detectHeaders 
        ? jsonData[0] as string[]
        : this.generateDefaultHeaders(jsonData[0].length);
      
      const rows = jsonData.slice(this.options.detectHeaders ? 1 : 0).map(row => {
        const rowObj: Record<string, any> = {};
        headers.forEach((header, index) => {
          rowObj[header] = (row as any[])[index];
        });
        return rowObj;
      });
      
      // Detect schema
      const schema = this.detectSchema(headers, rows);
      
      return {
        headers,
        rows,
        schema
      };
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Generate default headers when headers are not detected
   * @param count - Number of columns
   * @returns Array of default header names
   */
  private generateDefaultHeaders(count: number): string[] {
    return Array.from({ length: count }, (_, i) => `Column${i + 1}`);
  }
  
  /**
   * Detect schema from headers and data rows
   * @param headers - Array of header names
   * @param rows - Array of data rows
   * @returns Schema information
   */
  private detectSchema(headers: string[], rows: Record<string, any>[]): SchemaInfo {
    const detectedFields: DetectedField[] = headers.map(header => {
      const type = this.detectFieldType(header, rows);
      return {
        name: header,
        type,
        possibleAlternateNames: this.findPossibleAlternateNames(header)
      };
    });
    
    return {
      batchIdField: this.findBatchIdField(headers, rows),
      timestampField: this.findTimestampField(headers, rows),
      processTypeField: this.findProcessTypeField(headers, rows),
      departmentField: this.findDepartmentField(headers, rows),
      rftStatusField: this.findRFTStatusField(headers, rows),
      detectedFields
    };
  }
  
  /**
   * Detect the type of a field based on its values
   * @param header - Field name
   * @param rows - Data rows
   * @returns Detected field type
   */
  private detectFieldType(header: string, rows: Record<string, any>[]): 'string' | 'number' | 'date' | 'boolean' | 'unknown' {
    // Get non-null values for this field
    const values = rows
      .map(row => row[header])
      .filter(val => val !== null && val !== undefined);
    
    if (values.length === 0) return 'unknown';
    
    // Check if all values are numbers
    if (values.every(val => typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val))))) {
      return 'number';
    }
    
    // Check if all values are booleans or boolean-like
    if (values.every(val => 
      typeof val === 'boolean' || 
      val === 'true' || 
      val === 'false' || 
      val === 'yes' || 
      val === 'no' || 
      val === 'y' || 
      val === 'n' ||
      val === 1 ||
      val === 0
    )) {
      return 'boolean';
    }
    
    // Check if all values are dates
    if (values.every(val => !isNaN(Date.parse(String(val))))) {
      return 'date';
    }
    
    // Default to string
    return 'string';
  }
  
  /**
   * Find possible alternate names for a field
   * @param header - Field name
   * @returns Array of possible alternate names
   */
  private findPossibleAlternateNames(header: string): string[] {
    const headerLower = header.toLowerCase();
    
    // Common alternate names for batch ID
    if (
      headerLower.includes('batch') || 
      headerLower.includes('lot') || 
      headerLower.includes('id')
    ) {
      return ['batch_id', 'lot_number', 'batch_number', 'id', 'identifier'];
    }
    
    // Common alternate names for timestamp
    if (
      headerLower.includes('date') || 
      headerLower.includes('time') || 
      headerLower.includes('timestamp')
    ) {
      return ['date', 'timestamp', 'time', 'created_at', 'processed_at'];
    }
    
    // Common alternate names for process type
    if (
      headerLower.includes('process') || 
      headerLower.includes('type') || 
      headerLower.includes('category')
    ) {
      return ['process_type', 'process', 'type', 'category', 'classification'];
    }
    
    // Common alternate names for department
    if (
      headerLower.includes('dept') || 
      headerLower.includes('department') || 
      headerLower.includes('division')
    ) {
      return ['department', 'dept', 'division', 'unit', 'section'];
    }
    
    // Common alternate names for RFT status
    if (
      headerLower.includes('rft') || 
      headerLower.includes('status') || 
      headerLower.includes('result') ||
      headerLower.includes('pass') ||
      headerLower.includes('fail')
    ) {
      return ['rft_status', 'status', 'result', 'pass_fail', 'outcome'];
    }
    
    return [];
  }
  
  /**
   * Find the batch ID field in the data
   * @param headers - Array of header names
   * @param rows - Array of data rows
   * @returns Name of the batch ID field, if found
   */
  private findBatchIdField(headers: string[], rows: Record<string, any>[]): string | undefined {
    // Look for common batch ID field names
    const batchIdPatterns = [
      /batch[_\s]?id/i,
      /batch[_\s]?number/i,
      /lot[_\s]?number/i,
      /lot[_\s]?id/i,
      /^id$/i,
      /identifier/i
    ];
    
    // First try to find by header name
    for (const pattern of batchIdPatterns) {
      const match = headers.find(header => pattern.test(header));
      if (match) return match;
    }
    
    // If not found by name, look for fields with batch-like patterns in the data
    for (const header of headers) {
      const values = rows.map(row => String(row[header])).filter(Boolean);
      if (values.length === 0) continue;
      
      // Check if values match common batch ID patterns
      const batchPatterns = [
        /^[A-Z]+_\d+$/,  // e.g., BATCH_12345
        /^[A-Z]+-\d+$/,  // e.g., BATCH-12345
        /^B\d+$/,        // e.g., B12345
        /^LOT\d+$/i      // e.g., LOT12345
      ];
      
      if (values.some(val => batchPatterns.some(pattern => pattern.test(val)))) {
        return header;
      }
    }
    
    return undefined;
  }
  
  /**
   * Find the timestamp field in the data
   * @param headers - Array of header names
   * @param rows - Array of data rows
   * @returns Name of the timestamp field, if found
   */
  private findTimestampField(headers: string[], rows: Record<string, any>[]): string | undefined {
    // Look for common timestamp field names
    const timestampPatterns = [
      /date/i,
      /time/i,
      /timestamp/i,
      /created[_\s]?at/i,
      /processed[_\s]?at/i
    ];
    
    // First try to find by header name
    for (const pattern of timestampPatterns) {
      const match = headers.find(header => pattern.test(header));
      if (match) return match;
    }
    
    // If not found by name, look for fields with date-like values
    for (const header of headers) {
      const values = rows.map(row => row[header]).filter(Boolean);
      if (values.length === 0) continue;
      
      // Check if values are dates
      if (values.every(val => !isNaN(Date.parse(String(val))))) {
        return header;
      }
    }
    
    return undefined;
  }
  
  /**
   * Find the process type field in the data
   * @param headers - Array of header names
   * @param rows - Array of data rows
   * @returns Name of the process type field, if found
   */
  private findProcessTypeField(headers: string[], rows: Record<string, any>[]): string | undefined {
    // Look for common process type field names
    const processTypePatterns = [
      /process[_\s]?type/i,
      /process/i,
      /type/i,
      /category/i,
      /classification/i
    ];
    
    // First try to find by header name
    for (const pattern of processTypePatterns) {
      const match = headers.find(header => pattern.test(header));
      if (match) return match;
    }
    
    // If not found by name, look for fields with categorical values
    for (const header of headers) {
      const values = rows.map(row => String(row[header])).filter(Boolean);
      if (values.length === 0) continue;
      
      // Check if values are categorical (few unique values relative to total)
      const uniqueValues = new Set(values);
      if (uniqueValues.size > 1 && uniqueValues.size <= Math.min(10, values.length / 5)) {
        // Check if values contain process-related terms
        const processTerms = ['process', 'production', 'manufacturing', 'commercial', 'development', 'testing'];
        if (Array.from(uniqueValues).some(val => 
          processTerms.some(term => String(val).toLowerCase().includes(term))
        )) {
          return header;
        }
      }
    }
    
    return undefined;
  }
  
  /**
   * Find the department field in the data
   * @param headers - Array of header names
   * @param rows - Array of data rows
   * @returns Name of the department field, if found
   */
  private findDepartmentField(headers: string[], rows: Record<string, any>[]): string | undefined {
    // Look for common department field names
    const departmentPatterns = [
      /department/i,
      /dept/i,
      /division/i,
      /unit/i,
      /section/i
    ];
    
    // First try to find by header name
    for (const pattern of departmentPatterns) {
      const match = headers.find(header => pattern.test(header));
      if (match) return match;
    }
    
    // If not found by name, look for fields with categorical values
    for (const header of headers) {
      const values = rows.map(row => String(row[header])).filter(Boolean);
      if (values.length === 0) continue;
      
      // Check if values are categorical (few unique values relative to total)
      const uniqueValues = new Set(values);
      if (uniqueValues.size > 1 && uniqueValues.size <= Math.min(10, values.length / 5)) {
        // Check if values contain department-related terms
        const deptTerms = ['dept', 'lab', 'manufacturing', 'quality', 'production', 'r&d', 'research'];
        if (Array.from(uniqueValues).some(val => 
          deptTerms.some(term => String(val).toLowerCase().includes(term))
        )) {
          return header;
        }
      }
    }
    
    return undefined;
  }
  
  /**
   * Find the RFT status field in the data
   * @param headers - Array of header names
   * @param rows - Array of data rows
   * @returns Name of the RFT status field, if found
   */
  private findRFTStatusField(headers: string[], rows: Record<string, any>[]): string | undefined {
    // Look for common RFT status field names
    const rftStatusPatterns = [
      /rft[_\s]?status/i,
      /right[_\s]?first[_\s]?time/i,
      /status/i,
      /result/i,
      /pass[_\s]?fail/i,
      /outcome/i
    ];
    
    // First try to find by header name
    for (const pattern of rftStatusPatterns) {
      const match = headers.find(header => pattern.test(header));
      if (match) return match;
    }
    
    // If not found by name, look for fields with binary/boolean values
    for (const header of headers) {
      const values = rows.map(row => String(row[header]).toLowerCase()).filter(Boolean);
      if (values.length === 0) continue;
      
      // Check if values are binary (pass/fail, yes/no, true/false, etc.)
      const uniqueValues = new Set(values);
      if (uniqueValues.size === 2) {
        const valuesArray = Array.from(uniqueValues);
        const binaryPairs = [
          ['pass', 'fail'],
          ['yes', 'no'],
          ['true', 'false'],
          ['success', 'failure'],
          ['1', '0'],
          ['y', 'n']
        ];
        
        for (const [pos, neg] of binaryPairs) {
          if (
            (valuesArray.includes(pos) && valuesArray.includes(neg)) ||
            (valuesArray.some(v => v.includes(pos)) && valuesArray.some(v => v.includes(neg)))
          ) {
            return header;
          }
        }
      }
    }
    
    return undefined;
  }
}

export default ExcelParser;

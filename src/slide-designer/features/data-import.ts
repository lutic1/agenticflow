/**
 * Data Import (P1.12)
 * Import data from CSV, Excel, JSON for charts
 * Parse and validate data for chart integration
 */

export interface DataImportResult {
  success: boolean;
  data: any[][];
  headers?: string[];
  rows: number;
  columns: number;
  format: 'csv' | 'excel' | 'json';
  error?: string;
}

export interface ImportOptions {
  hasHeaders?: boolean;
  delimiter?: string; // for CSV
  skipRows?: number;
  maxRows?: number;
}

/**
 * Data Import Manager
 * Parse CSV, Excel (simulated), and JSON data
 */
export class DataImportManager {
  /**
   * Import from CSV string
   */
  importCSV(csvData: string, options: ImportOptions = {}): DataImportResult {
    const {
      hasHeaders = true,
      delimiter = ',',
      skipRows = 0,
      maxRows
    } = options;

    try {
      const lines = csvData.trim().split('\n').slice(skipRows);

      if (lines.length === 0) {
        return {
          success: false,
          data: [],
          rows: 0,
          columns: 0,
          format: 'csv',
          error: 'No data found in CSV'
        };
      }

      let headers: string[] | undefined;
      let dataLines = lines;

      if (hasHeaders) {
        headers = this.parseCSVLine(lines[0], delimiter);
        dataLines = lines.slice(1);
      }

      if (maxRows) {
        dataLines = dataLines.slice(0, maxRows);
      }

      const data = dataLines.map(line => this.parseCSVLine(line, delimiter));

      return {
        success: true,
        data,
        headers,
        rows: data.length,
        columns: data[0]?.length || 0,
        format: 'csv'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        rows: 0,
        columns: 0,
        format: 'csv',
        error: error instanceof Error ? error.message : 'CSV parsing failed'
      };
    }
  }

  /**
   * Parse CSV line (handles quoted values)
   */
  private parseCSVLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        // Handle escaped quotes
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Import from JSON
   */
  importJSON(jsonData: string, options: ImportOptions = {}): DataImportResult {
    try {
      const parsed = JSON.parse(jsonData);

      if (!Array.isArray(parsed)) {
        return {
          success: false,
          data: [],
          rows: 0,
          columns: 0,
          format: 'json',
          error: 'JSON must be an array'
        };
      }

      // Convert objects to 2D array
      if (parsed.length > 0 && typeof parsed[0] === 'object') {
        const headers = Object.keys(parsed[0]);
        const data = parsed.map(obj =>
          headers.map(key => String(obj[key] ?? ''))
        );

        return {
          success: true,
          data,
          headers,
          rows: data.length,
          columns: headers.length,
          format: 'json'
        };
      }

      // Already 2D array
      return {
        success: true,
        data: parsed,
        rows: parsed.length,
        columns: parsed[0]?.length || 0,
        format: 'json'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        rows: 0,
        columns: 0,
        format: 'json',
        error: error instanceof Error ? error.message : 'JSON parsing failed'
      };
    }
  }

  /**
   * Simulate Excel import (would use library in production)
   */
  importExcel(excelData: ArrayBuffer, options: ImportOptions = {}): DataImportResult {
    // In production, would use libraries like:
    // - xlsx (SheetJS)
    // - exceljs
    // For now, return simulated result

    return {
      success: false,
      data: [],
      rows: 0,
      columns: 0,
      format: 'excel',
      error: 'Excel import requires xlsx library (install: npm install xlsx)'
    };

    /*
    // Production implementation:
    import * as XLSX from 'xlsx';

    const workbook = XLSX.read(excelData);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    return {
      success: true,
      data: jsonData,
      headers: options.hasHeaders ? jsonData[0] : undefined,
      rows: jsonData.length,
      columns: jsonData[0]?.length || 0,
      format: 'excel'
    };
    */
  }

  /**
   * Convert imported data to Chart.js format
   */
  toChartData(
    importResult: DataImportResult,
    labelColumn: number = 0,
    dataColumns: number[] = [1]
  ): {
    labels: string[];
    datasets: Array<{ label: string; data: number[] }>;
  } {
    if (!importResult.success || importResult.data.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = importResult.data.map(row => String(row[labelColumn]));
    const datasets = dataColumns.map((colIndex, i) => ({
      label: importResult.headers?.[colIndex] || `Dataset ${i + 1}`,
      data: importResult.data.map(row => {
        const value = row[colIndex];
        return typeof value === 'number' ? value : parseFloat(value) || 0;
      })
    }));

    return { labels, datasets };
  }

  /**
   * Validate data format for charts
   */
  validateChartData(importResult: DataImportResult): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!importResult.success) {
      errors.push(importResult.error || 'Import failed');
      return { valid: false, errors };
    }

    if (importResult.rows === 0) {
      errors.push('No data rows found');
    }

    if (importResult.columns < 2) {
      errors.push('Need at least 2 columns (labels + data)');
    }

    // Check for numeric data in value columns
    const hasNumericData = importResult.data.some(row =>
      row.slice(1).some(val => !isNaN(parseFloat(val)))
    );

    if (!hasNumericData) {
      errors.push('No numeric data found for chart values');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Auto-detect format from file extension or content
   */
  detectFormat(filename: string, content?: string): 'csv' | 'excel' | 'json' | 'unknown' {
    // Check extension
    if (/\.csv$/i.test(filename)) return 'csv';
    if (/\.xlsx?$/i.test(filename)) return 'excel';
    if (/\.json$/i.test(filename)) return 'json';

    // Check content
    if (content) {
      // Try JSON parse
      try {
        JSON.parse(content);
        return 'json';
      } catch {}

      // Check for CSV structure
      if (content.includes(',') && content.includes('\n')) {
        return 'csv';
      }
    }

    return 'unknown';
  }

  /**
   * Get sample data for testing
   */
  getSampleCSV(): string {
    return `Month,Revenue,Expenses,Profit
January,45000,28000,17000
February,52000,30000,22000
March,48000,29000,19000
April,61000,32000,29000
May,58000,31000,27000`;
  }

  /**
   * Get sample JSON for testing
   */
  getSampleJSON(): string {
    return JSON.stringify([
      { month: 'January', revenue: 45000, expenses: 28000, profit: 17000 },
      { month: 'February', revenue: 52000, expenses: 30000, profit: 22000 },
      { month: 'March', revenue: 48000, expenses: 29000, profit: 19000 },
      { month: 'April', revenue: 61000, expenses: 32000, profit: 29000 },
      { month: 'May', revenue: 58000, expenses: 31000, profit: 27000 }
    ], null, 2);
  }
}

export const dataImportManager = new DataImportManager();

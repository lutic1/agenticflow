'use client';

import { useCallback, useState } from 'react';
import { useDataImport } from '@/hooks/use-p1-features';
import { useDropzone } from 'react-dropzone';
import { Loader2, Upload, FileSpreadsheet, BarChart3 } from 'lucide-react';

interface DataImporterProps {
  slideId: string;
}

export function DataImporter({ slideId }: DataImporterProps) {
  const { importData, isImporting, importedData } = useDataImport();
  const [showPreview, setShowPreview] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) {
        importData(acceptedFiles[0]);
        setShowPreview(true);
      }
    },
    [importData]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/json': ['.json'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Data Import</h3>
        <FileSpreadsheet className="w-5 h-5 text-gray-400" />
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        {isDragActive ? (
          <p className="text-sm text-blue-600">Drop data file here...</p>
        ) : (
          <div>
            <p className="text-sm text-gray-700 mb-1">
              Drag and drop data file, or click to browse
            </p>
            <p className="text-xs text-gray-500">
              Supports CSV, Excel (.xls, .xlsx), JSON (max 10MB)
            </p>
          </div>
        )}
      </div>

      {isImporting && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-800">Importing data...</span>
        </div>
      )}

      {/* Data Preview */}
      {showPreview && importedData && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">
              Data Preview ({importedData.data.length} rows)
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              Generate Chart
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {importedData.columns.map((column) => (
                      <th
                        key={column}
                        className="px-4 py-2 text-left font-medium text-gray-700"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {importedData.data.slice(0, 5).map((row, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      {importedData.columns.map((column) => (
                        <td key={column} className="px-4 py-2 text-gray-600">
                          {row[column]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span>Insert as Chart</span>
          </button>
        </div>
      )}

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Import data to automatically generate charts and visualizations.
        </p>
      </div>
    </div>
  );
}

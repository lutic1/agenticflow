'use client';

import { useState } from 'react';
import { useExportFormats } from '@/hooks/use-p0-features';
import { Loader2, Download, FileText, Image, File, Code } from 'lucide-react';

interface ExportDialogProps {
  presentationId: string;
  onExport?: (config: any) => void;
}

export function ExportDialog({ presentationId, onExport }: ExportDialogProps) {
  const { data: exportConfig, isLoading, error } = useExportFormats();
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [quality, setQuality] = useState('high');
  const [pageSize, setPageSize] = useState('16:9');
  const [exporting, setExporting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading export options...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">Error loading export options: {error.message}</p>
      </div>
    );
  }

  const formats = [
    { id: 'pdf', name: 'PDF Document', icon: FileText, description: 'Best for printing and sharing' },
    { id: 'pptx', name: 'PowerPoint', icon: File, description: 'Editable presentation file' },
    { id: 'html', name: 'HTML', icon: Code, description: 'Interactive web presentation' },
    { id: 'png', name: 'PNG Images', icon: Image, description: 'Image per slide' },
  ];

  const qualities = [
    { id: 'low', name: 'Low (Fast)', description: '72 DPI' },
    { id: 'medium', name: 'Medium', description: '150 DPI' },
    { id: 'high', name: 'High', description: '300 DPI' },
    { id: 'ultra', name: 'Ultra (Slow)', description: '600 DPI' },
  ];

  const pageSizes = [
    { id: '16:9', name: 'Widescreen (16:9)', description: 'Modern displays' },
    { id: '4:3', name: 'Standard (4:3)', description: 'Classic format' },
    { id: 'A4', name: 'A4', description: 'Print-ready' },
    { id: 'Letter', name: 'US Letter', description: 'Print-ready' },
  ];

  const handleExport = async () => {
    setExporting(true);
    const config = {
      format: selectedFormat,
      quality,
      pageSize,
      presentationId,
    };

    onExport?.(config);

    // Simulate export
    setTimeout(() => {
      setExporting(false);
    }, 2000);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Presentation
        </h3>
      </div>

      {/* Format Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Export Format</label>
        <div className="grid grid-cols-2 gap-2">
          {formats.map((format) => {
            const Icon = format.icon;
            const isSelected = selectedFormat === format.id;

            return (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={`p-3 border-2 rounded-lg transition-all text-left hover:border-blue-400 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-2">
                  <Icon className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {format.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{format.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quality */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Quality</label>
        <select
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {qualities.map((q) => (
            <option key={q.id} value={q.id}>
              {q.name} - {q.description}
            </option>
          ))}
        </select>
      </div>

      {/* Page Size */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Page Size</label>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {pageSizes.map((size) => (
            <option key={size.id} value={size.id}>
              {size.name} - {size.description}
            </option>
          ))}
        </select>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
      >
        {exporting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Export as {formats.find((f) => f.id === selectedFormat)?.name}
          </>
        )}
      </button>

      {/* Export Info */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Export Settings:</strong>
        </p>
        <ul className="text-xs text-gray-600 mt-1 space-y-1">
          <li>• Format: {formats.find((f) => f.id === selectedFormat)?.name}</li>
          <li>• Quality: {qualities.find((q) => q.id === quality)?.name}</li>
          <li>• Page Size: {pageSizes.find((s) => s.id === pageSize)?.name}</li>
        </ul>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Use PDF for sharing and printing, PPTX for further editing,
          HTML for web presentations, and PNG for social media.
        </p>
      </div>
    </div>
  );
}

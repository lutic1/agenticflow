'use client';

import { AnalyticsDashboard } from '@/components/features/p1';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const handleExport = () => {
    // Export analytics report
    console.log('Exporting analytics report...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-200 rounded-lg">
          <AnalyticsDashboard presentationId="demo-presentation" />
        </div>
      </div>
    </div>
  );
}

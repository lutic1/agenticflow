'use client';

import { useState } from 'react';
import { useChartComponents } from '@/hooks/use-p0-features';
import { Loader2, BarChart3, LineChart, PieChart, TrendingUp } from 'lucide-react';

interface ChartInserterProps {
  slideId: string;
  onChartInsert?: (chartConfig: any) => void;
}

export function ChartInserter({ slideId, onChartInsert }: ChartInserterProps) {
  const { data: chartConfig, isLoading, error } = useChartComponents();
  const [selectedType, setSelectedType] = useState<string>('bar');
  const [chartData, setChartData] = useState('10,20,30,40,50');

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading chart components...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">Error loading charts: {error.message}</p>
      </div>
    );
  }

  const chartTypes = [
    { id: 'bar', name: 'Bar Chart', icon: BarChart3, description: 'Compare values across categories' },
    { id: 'line', name: 'Line Chart', icon: LineChart, description: 'Show trends over time' },
    { id: 'pie', name: 'Pie Chart', icon: PieChart, description: 'Display proportions' },
    { id: 'area', name: 'Area Chart', icon: TrendingUp, description: 'Visualize cumulative data' },
  ];

  const handleInsertChart = () => {
    const data = chartData.split(',').map((val) => parseFloat(val.trim()));
    onChartInsert?.({
      type: selectedType,
      data,
      labels: data.map((_, i) => `Item ${i + 1}`),
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Insert Chart</h3>

      {/* Chart Type Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Chart Type</label>
        <div className="grid grid-cols-2 gap-3">
          {chartTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;

            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-3 border-2 rounded-lg transition-all hover:border-blue-400 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon className={`w-8 h-8 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                  <div className="text-center">
                    <div className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {type.name}
                    </div>
                    <div className="text-xs text-gray-500">{type.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Data Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Data (comma-separated values)
        </label>
        <input
          type="text"
          value={chartData}
          onChange={(e) => setChartData(e.target.value)}
          placeholder="10,20,30,40,50"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500">
          Enter numbers separated by commas (e.g., 10,20,30,40,50)
        </p>
      </div>

      {/* Insert Button */}
      <button
        onClick={handleInsertChart}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Insert Chart
      </button>

      {/* Preview */}
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-white">
        <p className="text-xs text-gray-500 mb-2">Preview:</p>
        <div className="flex items-end gap-2 h-32 justify-center">
          {chartData.split(',').map((val, i) => {
            const value = parseFloat(val.trim()) || 0;
            const maxValue = Math.max(...chartData.split(',').map((v) => parseFloat(v.trim()) || 0));
            const height = (value / maxValue) * 100;

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-600">{value}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

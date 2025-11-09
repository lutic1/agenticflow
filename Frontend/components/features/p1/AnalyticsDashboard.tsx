'use client';

import { usePresentationAnalytics } from '@/hooks/use-p1-features';
import { Loader2, Eye, Clock, TrendingUp, Globe, Smartphone } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AnalyticsDashboardProps {
  presentationId: string;
}

export function AnalyticsDashboard({ presentationId }: AnalyticsDashboardProps) {
  const { data: analytics, isLoading, error } = usePresentationAnalytics(presentationId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">Error loading analytics</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">No analytics data available</p>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Presentation Analytics</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {analytics.views.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Views</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {analytics.avgTimePerSlide}s
              </div>
              <div className="text-sm text-gray-500">Avg Time per Slide</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {analytics.completionRate}%
              </div>
              <div className="text-sm text-gray-500">Completion Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Geographic Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Geographic Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.geographic}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Device Breakdown</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.devices}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.devices.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Real-time Analytics:</strong> Data updates every 5 minutes. Export reports available in Settings.
        </p>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { telemetry, type TelemetryEvent } from '@/lib/telemetry/telemetry';
import { getBreadcrumbs, getUserJourney } from '@/lib/telemetry/breadcrumbs';

export function TelemetryDashboard() {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'api' | 'errors' | 'breadcrumbs'>('overview');

  useEffect(() => {
    // Update every second
    const interval = setInterval(() => {
      setEvents(telemetry.getEvents());
      setStats(telemetry.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    const logs = telemetry.exportLogs();
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telemetry-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const apiCalls = events.filter(e => e.type === 'api_call');
  const errors = events.filter(e => e.type === 'error');
  const userActions = events.filter(e => e.type === 'user_action');
  const breadcrumbs = getBreadcrumbs();

  if (!stats) {
    return <div className="p-4">Loading telemetry data...</div>;
  }

  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Telemetry Dashboard</h2>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Export Logs
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(['overview', 'api', 'errors', 'breadcrumbs'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 font-medium ${
              selectedTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            subtitle={`Session: ${stats.sessionId.slice(0, 8)}...`}
          />
          <StatCard
            title="API Calls"
            value={stats.apiCalls.total}
            subtitle={`${stats.apiCalls.successRate.toFixed(1)}% success rate`}
            status={stats.apiCalls.successRate > 90 ? 'good' : 'warning'}
          />
          <StatCard
            title="Errors"
            value={stats.errors.total}
            subtitle={`${Object.keys(stats.errors.byType).length} unique types`}
            status={stats.errors.total === 0 ? 'good' : 'error'}
          />
          <StatCard
            title="Avg API Time"
            value={`${stats.apiCalls.avgTime.toFixed(0)}ms`}
            subtitle={`Total: ${stats.apiCalls.totalTime.toFixed(0)}ms`}
            status={stats.apiCalls.avgTime < 500 ? 'good' : 'warning'}
          />
        </div>
      )}

      {/* API Tab */}
      {selectedTab === 'api' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold mb-4">API Performance</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Calls:</span>
                <span className="font-mono">{stats.apiCalls.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Successes:</span>
                <span className="font-mono text-green-600">{stats.apiCalls.successes}</span>
              </div>
              <div className="flex justify-between">
                <span>Failures:</span>
                <span className="font-mono text-red-600">{stats.apiCalls.failures}</span>
              </div>
              <div className="flex justify-between">
                <span>Average Time:</span>
                <span className="font-mono">{stats.apiCalls.avgTime.toFixed(2)}ms</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold mb-4">Recent API Calls</h3>
            <div className="space-y-2 max-h-96 overflow-auto">
              {apiCalls.slice(-10).reverse().map((event, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-mono text-sm">{event.action}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono text-sm ${event.label === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {event.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {event.value?.toFixed(0)}ms
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Errors Tab */}
      {selectedTab === 'errors' && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold mb-4">Error Log</h3>
          {errors.length === 0 ? (
            <p className="text-gray-500">No errors recorded</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-auto">
              {errors.slice(-20).reverse().map((event, i) => (
                <div key={i} className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-bold text-red-800">{event.action}</div>
                      <div className="text-sm text-red-600 mt-1">
                        {event.metadata?.message as string}
                      </div>
                      {event.label && (
                        <div className="text-xs text-gray-600 mt-1">Context: {event.label}</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  {process.env.NODE_ENV === 'development' && event.metadata?.stack && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-gray-600">Stack trace</summary>
                      <pre className="text-xs mt-1 p-2 bg-white rounded overflow-auto">
                        {event.metadata.stack as string}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Breadcrumbs Tab */}
      {selectedTab === 'breadcrumbs' && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold mb-4">User Journey</h3>
          <div className="space-y-2 max-h-96 overflow-auto">
            {breadcrumbs.slice(-30).reverse().map((breadcrumb, i) => (
              <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{breadcrumb.action}</div>
                  <div className="text-sm text-gray-600">{breadcrumb.path}</div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(breadcrumb.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              const journey = getUserJourney();
              navigator.clipboard.writeText(journey);
              alert('User journey copied to clipboard');
            }}
            className="mt-4 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Copy Journey to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  status?: 'good' | 'warning' | 'error';
}

function StatCard({ title, value, subtitle, status = 'good' }: StatCardProps) {
  const statusColors = {
    good: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    error: 'border-red-200 bg-red-50',
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 border ${statusColors[status]}`}>
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}

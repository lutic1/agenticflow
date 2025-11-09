'use client';

import { useVersionHistory } from '@/hooks/use-p1-features';
import { Loader2, History, RotateCcw } from 'lucide-react';

interface VersionHistoryPanelProps {
  presentationId: string;
}

export function VersionHistoryPanel({ presentationId }: VersionHistoryPanelProps) {
  const { versions, isLoading, restoreVersion } = useVersionHistory(presentationId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading version history...</span>
      </div>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">No version history available</p>
      </div>
    );
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} min ago`;
    }
    if (hours < 24) {
      return `${hours} hr ago`;
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Version History</h3>
        <History className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-2">
        {versions.map((version, index) => (
          <div
            key={version.id}
            className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-gray-900">
                    {formatTime(version.timestamp)}
                  </div>
                  {index === 0 && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  by {version.author}
                </div>
                <div className="text-sm text-gray-700 mt-2">
                  {version.changes}
                </div>
              </div>

              {index !== 0 && (
                <button
                  onClick={() => restoreVersion(version.id)}
                  className="ml-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Restore this version"
                >
                  <RotateCcw className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Auto-save:</strong> Versions are automatically saved every 5 minutes.
        </p>
      </div>
    </div>
  );
}

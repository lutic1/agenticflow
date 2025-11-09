'use client';

import { useCollaboration } from '@/hooks/use-p1-features';
import { Loader2, Users, MessageSquare } from 'lucide-react';
import Image from 'next/image';

interface CollaborationPanelProps {
  presentationId: string;
}

export function CollaborationPanel({ presentationId }: CollaborationPanelProps) {
  const { session, isLoading } = useCollaboration(presentationId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading collaboration...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">No active collaboration session</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Collaboration</h3>
        <Users className="w-5 h-5 text-gray-400" />
      </div>

      {/* Active Users */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">
          Active Users ({session.users.length})
        </div>
        <div className="space-y-2">
          {session.users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className="relative">
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">Online</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share Button */}
      <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Share Presentation
      </button>

      {/* Comments */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <MessageSquare className="w-4 h-4" />
          <span>Comments: 0</span>
        </div>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Live Editing:</strong> Changes are synced in real-time across all users.
        </p>
      </div>
    </div>
  );
}

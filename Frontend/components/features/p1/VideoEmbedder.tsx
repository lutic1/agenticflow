'use client';

import { useState } from 'react';
import { useVideoEmbed } from '@/hooks/use-p1-features';
import { Loader2, Video, Link as LinkIcon } from 'lucide-react';

interface VideoEmbedderProps {
  slideId: string;
}

export function VideoEmbedder({ slideId }: VideoEmbedderProps) {
  const { embedVideo, isEmbedding } = useVideoEmbed(slideId);
  const [url, setUrl] = useState('');
  const [embeddedVideo, setEmbeddedVideo] = useState<any>(null);

  const handleEmbed = async () => {
    if (!url) return;

    try {
      const video = await embedVideo(url);
      setEmbeddedVideo(video);
      setUrl('');
    } catch (error) {
      console.error('Failed to embed video:', error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Video Embed</h3>
        <Video className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-3">
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="url"
            placeholder="Paste YouTube, Vimeo, or Loom URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEmbed()}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
          />
        </div>

        <button
          onClick={handleEmbed}
          disabled={!url || isEmbedding}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isEmbedding ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Embedding...</span>
            </>
          ) : (
            'Embed Video'
          )}
        </button>
      </div>

      {embeddedVideo && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">{embeddedVideo.provider} video</p>
            </div>
          </div>
          <div className="p-3 bg-gray-50">
            <p className="text-xs text-gray-600 truncate">{embeddedVideo.url}</p>
          </div>
        </div>
      )}

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Supported:</strong> YouTube, Vimeo, and Loom. Videos will auto-play in presentation mode.
        </p>
      </div>
    </div>
  );
}

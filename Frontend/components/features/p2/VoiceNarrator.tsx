/**
 * Voice Narration Component (P2.3)
 * Text-to-Speech functionality for slides
 */

'use client';

import { useState, useRef } from 'react';
import { useVoiceNarration } from '@/hooks/use-p2-features';
import { Mic, Play, Pause, Download, Volume2, Loader2 } from 'lucide-react';

interface VoiceNarratorProps {
  slideId: string;
  content: string;
}

export function VoiceNarrator({ slideId, content }: VoiceNarratorProps) {
  const { data: voiceFeature, isLoading } = useVoiceNarration();
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!voiceFeature) {
    return null;
  }

  const voices = voiceFeature.getVoices();

  const handleGenerateVoice = async () => {
    if (!content) return;

    setIsGenerating(true);
    try {
      const audioBuffer = await voiceFeature.speak(content, {
        voice: selectedVoice,
      });

      // Convert AudioBuffer to Blob for playback
      const blob = await voiceFeature.exportAudio(slideId);
      setAudioBlob(blob);

      // Auto-play
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(blob);
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Failed to generate voice:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    if (!audioBlob) return;

    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slide-${slideId}-narration.mp3`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-2">
        <Volume2 className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">Voice Narration</h3>
      </div>

      {/* Voice Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Select Voice
        </label>
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">Choose a voice...</option>
          {voices.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.name} ({voice.language}) - {voice.gender}
            </option>
          ))}
        </select>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleGenerateVoice}
          disabled={!selectedVoice || isGenerating || !content}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              Generate Voice
            </>
          )}
        </button>

        {audioBlob && (
          <>
            <button
              onClick={togglePlayback}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Play
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </>
        )}
      </div>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Waveform Visualization (placeholder) */}
      {audioBlob && (
        <div className="h-20 bg-gradient-to-r from-purple-100 to-purple-50 rounded-md flex items-center justify-center">
          <div className="flex items-end gap-1 h-16">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-purple-600 rounded-t"
                style={{
                  height: `${Math.random() * 100}%`,
                  opacity: isPlaying ? 0.8 : 0.3,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

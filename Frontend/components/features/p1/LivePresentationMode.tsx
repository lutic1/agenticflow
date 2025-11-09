'use client';

import { useState, useEffect } from 'react';
import { useLivePresentation } from '@/hooks/use-p1-features';
import { Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface LivePresentationModeProps {
  presentationId: string;
  onExit?: () => void;
}

export function LivePresentationMode({ presentationId, onExit }: LivePresentationModeProps) {
  const { slides, isLoading } = useLivePresentation(presentationId);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          nextSlide();
          break;
        case 'ArrowLeft':
          prevSlide();
          break;
        case 'Escape':
          onExit?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, slides]);

  const nextSlide = () => {
    if (slides && currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading presentation...</span>
        </div>
      </div>
    );
  }

  if (!slides || slides.length === 0) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">No slides available</p>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200"
          >
            Exit
          </button>
        </div>
      </div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="text-white text-sm">
          {formatTime(elapsedTime)}
        </div>
        <button
          onClick={onExit}
          className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Slide */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-6xl aspect-video bg-white rounded-lg shadow-2xl p-12">
          <div className="h-full flex flex-col">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              {slide.content?.title || `Slide ${currentSlide + 1}`}
            </h1>
            <div className="flex-1">
              <p className="text-2xl text-gray-700">{slide.content?.body}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex items-center justify-between text-white">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="p-3 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="p-3 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center text-white/80 text-sm mt-2">
          Slide {currentSlide + 1} of {slides.length}
        </div>
      </div>
    </div>
  );
}

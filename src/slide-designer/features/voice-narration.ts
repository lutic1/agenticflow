/**
 * Voice Narration (P2.3)
 * Text-to-speech narration with multi-voice support
 * Auto-narrate slides, custom voice selection, export audio
 */

export interface VoiceProfile {
  id: string;
  name: string;
  lang: string;
  gender: 'male' | 'female' | 'neutral';
  voiceURI: string;
  localService: boolean;
  default: boolean;
}

export interface NarrationSettings {
  voice?: VoiceProfile;
  rate: number;        // 0.1 to 10 (1 = normal)
  pitch: number;       // 0 to 2 (1 = normal)
  volume: number;      // 0 to 1 (1 = max)
  lang?: string;
  pauseBetweenSlides?: number; // milliseconds
}

export interface SlideNarration {
  slideNumber: number;
  text: string;
  duration?: number;   // milliseconds
  timestamp?: Date;
  audioBlob?: Blob;
}

export interface NarrationTrack {
  id: string;
  presentationId: string;
  slides: SlideNarration[];
  settings: NarrationSettings;
  totalDuration: number;
  createdAt: Date;
  format: 'text' | 'audio';
}

export interface SpeechSynthesisOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onBoundary?: (event: SpeechSynthesisEvent) => void;
  onError?: (event: SpeechSynthesisErrorEvent) => void;
}

/**
 * Voice Narration Manager
 * Text-to-speech narration for presentations
 */
export class VoiceNarrationManager {
  private synthesis: SpeechSynthesis | null = null;
  private voices: VoiceProfile[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private settings: NarrationSettings;
  private tracks: Map<string, NarrationTrack>;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private currentTrackId: string | null = null;
  private currentSlideIndex: number = 0;

  constructor() {
    this.settings = this.getDefaultSettings();
    this.tracks = new Map();

    // Initialize Web Speech API
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();

      // Load voices when they change (Chrome specific)
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  /**
   * Get default narration settings
   */
  private getDefaultSettings(): NarrationSettings {
    return {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      pauseBetweenSlides: 1000
    };
  }

  /**
   * Load available voices
   */
  private loadVoices(): void {
    if (!this.synthesis) return;

    const systemVoices = this.synthesis.getVoices();
    this.voices = systemVoices.map(voice => ({
      id: voice.name.toLowerCase().replace(/\s+/g, '-'),
      name: voice.name,
      lang: voice.lang,
      gender: this.detectGender(voice.name),
      voiceURI: voice.voiceURI,
      localService: voice.localService,
      default: voice.default
    }));
  }

  /**
   * Detect gender from voice name (heuristic)
   */
  private detectGender(voiceName: string): 'male' | 'female' | 'neutral' {
    const lower = voiceName.toLowerCase();
    if (lower.includes('male') && !lower.includes('female')) return 'male';
    if (lower.includes('female')) return 'female';
    if (lower.includes('samantha') || lower.includes('victoria') ||
        lower.includes('karen') || lower.includes('moira')) return 'female';
    if (lower.includes('daniel') || lower.includes('alex') ||
        lower.includes('fred') || lower.includes('oliver')) return 'male';
    return 'neutral';
  }

  /**
   * Get available voices
   */
  getVoices(filterOptions?: {
    lang?: string;
    gender?: 'male' | 'female' | 'neutral';
    localOnly?: boolean;
  }): VoiceProfile[] {
    let filtered = this.voices;

    if (filterOptions?.lang) {
      filtered = filtered.filter(v =>
        v.lang.toLowerCase().startsWith(filterOptions.lang!.toLowerCase())
      );
    }

    if (filterOptions?.gender) {
      filtered = filtered.filter(v => v.gender === filterOptions.gender);
    }

    if (filterOptions?.localOnly) {
      filtered = filtered.filter(v => v.localService);
    }

    return filtered;
  }

  /**
   * Get voice by ID
   */
  getVoice(voiceId: string): VoiceProfile | undefined {
    return this.voices.find(v => v.id === voiceId);
  }

  /**
   * Update narration settings
   */
  updateSettings(settings: Partial<NarrationSettings>): void {
    Object.assign(this.settings, settings);
  }

  /**
   * Get current settings
   */
  getSettings(): NarrationSettings {
    return { ...this.settings };
  }

  /**
   * Speak text immediately
   */
  speak(
    text: string,
    options?: SpeechSynthesisOptions & { settings?: Partial<NarrationSettings> }
  ): void {
    if (!this.synthesis) {
      console.error('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const settings = { ...this.settings, ...options?.settings };

    // Apply settings
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    if (settings.voice) {
      const systemVoice = this.synthesis.getVoices().find(
        v => v.name === settings.voice!.name
      );
      if (systemVoice) {
        utterance.voice = systemVoice;
      }
    }

    if (settings.lang) {
      utterance.lang = settings.lang;
    }

    // Event handlers
    if (options?.onStart) utterance.onstart = options.onStart;
    if (options?.onEnd) utterance.onend = options.onEnd;
    if (options?.onPause) utterance.onpause = options.onPause;
    if (options?.onResume) utterance.onresume = options.onResume;
    if (options?.onBoundary) utterance.onboundary = options.onBoundary;
    if (options?.onError) utterance.onerror = options.onError;

    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);
    this.isPlaying = true;
  }

  /**
   * Pause speech
   */
  pause(): void {
    if (this.synthesis && this.isPlaying) {
      this.synthesis.pause();
      this.isPaused = true;
    }
  }

  /**
   * Resume speech
   */
  resume(): void {
    if (this.synthesis && this.isPaused) {
      this.synthesis.resume();
      this.isPaused = false;
    }
  }

  /**
   * Stop speech
   */
  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isPlaying = false;
      this.isPaused = false;
      this.currentUtterance = null;
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synthesis?.speaking || false;
  }

  /**
   * Create narration track
   */
  createTrack(
    presentationId: string,
    slides: Array<{ slideNumber: number; text: string }>
  ): NarrationTrack {
    const trackId = this.generateId();

    const slideNarrations: SlideNarration[] = slides.map(slide => ({
      slideNumber: slide.slideNumber,
      text: slide.text,
      timestamp: new Date()
    }));

    const track: NarrationTrack = {
      id: trackId,
      presentationId,
      slides: slideNarrations,
      settings: { ...this.settings },
      totalDuration: 0,
      createdAt: new Date(),
      format: 'text'
    };

    this.tracks.set(trackId, track);
    return track;
  }

  /**
   * Play narration track
   */
  playTrack(trackId: string, startSlide: number = 0): void {
    const track = this.tracks.get(trackId);
    if (!track) {
      console.error('Track not found:', trackId);
      return;
    }

    this.currentTrackId = trackId;
    this.currentSlideIndex = startSlide;
    this.playNextSlide();
  }

  /**
   * Play next slide in track
   */
  private playNextSlide(): void {
    if (!this.currentTrackId) return;

    const track = this.tracks.get(this.currentTrackId);
    if (!track) return;

    if (this.currentSlideIndex >= track.slides.length) {
      // Track completed
      this.currentTrackId = null;
      this.currentSlideIndex = 0;
      this.isPlaying = false;
      return;
    }

    const slide = track.slides[this.currentSlideIndex];

    this.speak(slide.text, {
      settings: track.settings,
      onEnd: () => {
        // Wait between slides
        setTimeout(() => {
          this.currentSlideIndex++;
          this.playNextSlide();
        }, track.settings.pauseBetweenSlides || 1000);
      },
      onError: (event) => {
        console.error('Narration error:', event);
        this.currentTrackId = null;
        this.isPlaying = false;
      }
    });
  }

  /**
   * Stop track playback
   */
  stopTrack(): void {
    this.stop();
    this.currentTrackId = null;
    this.currentSlideIndex = 0;
  }

  /**
   * Estimate narration duration (approximate)
   */
  estimateDuration(text: string, rate: number = 1.0): number {
    // Average speaking rate: ~150 words per minute at normal speed
    const words = text.split(/\s+/).length;
    const baseWPM = 150;
    const adjustedWPM = baseWPM * rate;
    const minutes = words / adjustedWPM;
    return Math.round(minutes * 60 * 1000); // milliseconds
  }

  /**
   * Update track duration estimates
   */
  updateTrackDuration(trackId: string): void {
    const track = this.tracks.get(trackId);
    if (!track) return;

    let totalDuration = 0;

    track.slides.forEach(slide => {
      const duration = this.estimateDuration(slide.text, track.settings.rate);
      slide.duration = duration;
      totalDuration += duration;
      totalDuration += track.settings.pauseBetweenSlides || 1000;
    });

    track.totalDuration = totalDuration;
  }

  /**
   * Export track to JSON
   */
  exportTrack(trackId: string): string {
    const track = this.tracks.get(trackId);
    if (!track) return '{}';

    return JSON.stringify({
      ...track,
      slides: track.slides.map(s => ({
        slideNumber: s.slideNumber,
        text: s.text,
        duration: s.duration
      }))
    }, null, 2);
  }

  /**
   * Import track from JSON
   */
  importTrack(jsonData: string): string | null {
    try {
      const data = JSON.parse(jsonData);
      const trackId = data.id || this.generateId();

      const track: NarrationTrack = {
        id: trackId,
        presentationId: data.presentationId,
        slides: data.slides.map((s: any) => ({
          slideNumber: s.slideNumber,
          text: s.text,
          duration: s.duration,
          timestamp: new Date()
        })),
        settings: data.settings || this.getDefaultSettings(),
        totalDuration: data.totalDuration || 0,
        createdAt: new Date(data.createdAt || new Date()),
        format: 'text'
      };

      this.tracks.set(trackId, track);
      return trackId;
    } catch {
      return null;
    }
  }

  /**
   * Delete track
   */
  deleteTrack(trackId: string): boolean {
    return this.tracks.delete(trackId);
  }

  /**
   * Get all tracks
   */
  getTracks(presentationId?: string): NarrationTrack[] {
    const tracks = Array.from(this.tracks.values());

    if (presentationId) {
      return tracks.filter(t => t.presentationId === presentationId);
    }

    return tracks;
  }

  /**
   * Get track by ID
   */
  getTrack(trackId: string): NarrationTrack | undefined {
    return this.tracks.get(trackId);
  }

  /**
   * Generate suggested narration from slide content
   */
  generateNarration(slideContent: {
    title?: string;
    bullets?: string[];
    text?: string;
  }): string {
    const parts: string[] = [];

    if (slideContent.title) {
      parts.push(slideContent.title);
    }

    if (slideContent.bullets) {
      parts.push(...slideContent.bullets);
    }

    if (slideContent.text) {
      parts.push(slideContent.text);
    }

    return parts.join('. ');
  }

  /**
   * Check if speech synthesis is supported
   */
  isSupported(): boolean {
    return this.synthesis !== null && this.voices.length > 0;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    const languages = new Set<string>();
    this.voices.forEach(voice => {
      const lang = voice.lang.split('-')[0]; // Get base language code
      languages.add(lang);
    });
    return Array.from(languages).sort();
  }

  /**
   * Get voice recommendations based on language
   */
  getRecommendedVoice(lang: string, gender?: 'male' | 'female'): VoiceProfile | undefined {
    const voices = this.getVoices({ lang, gender });

    // Prefer local voices
    const localVoices = voices.filter(v => v.localService);
    if (localVoices.length > 0) {
      return localVoices[0];
    }

    return voices[0];
  }

  /**
   * Test voice with sample text
   */
  testVoice(voiceId: string, sampleText: string = 'Hello, this is a sample narration.'): void {
    const voice = this.getVoice(voiceId);
    if (!voice) return;

    this.speak(sampleText, {
      settings: { voice }
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `narration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all tracks
   */
  clearTracks(): void {
    this.tracks.clear();
  }

  /**
   * Get narration statistics
   */
  getStats(): {
    totalTracks: number;
    totalDuration: number;
    averageDuration: number;
    voicesAvailable: number;
    languagesAvailable: number;
  } {
    const tracks = Array.from(this.tracks.values());
    const totalDuration = tracks.reduce((sum, t) => sum + t.totalDuration, 0);

    return {
      totalTracks: tracks.length,
      totalDuration,
      averageDuration: tracks.length > 0 ? totalDuration / tracks.length : 0,
      voicesAvailable: this.voices.length,
      languagesAvailable: this.getSupportedLanguages().length
    };
  }
}

// Singleton instance
export const voiceNarrationManager = new VoiceNarrationManager();

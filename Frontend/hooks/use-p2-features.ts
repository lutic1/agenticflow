/**
 * Custom hooks for P2 features
 * Wraps backend hooks with additional UI-specific logic
 */

import {
  useP2Feature,
  useEnableP2Feature,
  useDisableP2Feature
} from '@backend/frontend-integration/hooks/use-backend';
import type { P2FeatureId } from '@backend/frontend-integration/types/backend';

// Type definitions for P2 features
export interface VoiceNarrationFeature {
  speak: (text: string, options?: VoiceOptions) => Promise<AudioBuffer>;
  getVoices: () => VoiceOption[];
  exportAudio: (slideId: string) => Promise<Blob>;
}

export interface VoiceOptions {
  voice?: string;
  language?: string;
  rate?: number;
  pitch?: number;
}

export interface VoiceOption {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female';
}

export interface APIAccessFeature {
  generateKey: () => Promise<string>;
  revokeKey: (keyId: string) => Promise<void>;
  getUsage: () => Promise<APIUsageStats>;
  getDocumentation: () => OpenAPISpec;
}

export interface APIUsageStats {
  requests: number;
  limit: number;
  resetDate: string;
}

export interface OpenAPISpec {
  openapi: string;
  info: { title: string; version: string };
  paths: Record<string, unknown>;
}

export interface InteractiveElementsFeature {
  createPoll: (config: PollConfig) => Promise<InteractiveElement>;
  createQuiz: (config: QuizConfig) => Promise<InteractiveElement>;
  createQA: (config: QAConfig) => Promise<InteractiveElement>;
  getResponses: (elementId: string) => Promise<Response[]>;
}

export interface PollConfig {
  question: string;
  options: string[];
  type: 'multiple-choice' | 'rating' | 'yes-no';
}

export interface QuizConfig {
  questions: QuizQuestion[];
  timeLimit?: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QAConfig {
  topic: string;
  allowAnonymous: boolean;
}

export interface InteractiveElement {
  id: string;
  type: 'poll' | 'quiz' | 'qa';
  data: unknown;
}

export interface Response {
  id: string;
  answer: unknown;
  timestamp: string;
}

export interface ThemesMarketplaceFeature {
  browseThemes: (filters?: ThemeFilters) => Promise<Theme[]>;
  purchaseTheme: (themeId: string) => Promise<Purchase>;
  installTheme: (themeId: string) => Promise<void>;
  uploadTheme: (theme: ThemeData) => Promise<string>;
  getMyThemes: () => Promise<Theme[]>;
}

export interface ThemeFilters {
  category?: string;
  priceRange?: [number, number];
  rating?: number;
}

export interface Theme {
  id: string;
  name: string;
  author: string;
  price: number;
  rating: number;
  downloads: number;
  preview: string;
}

export interface Purchase {
  id: string;
  themeId: string;
  price: number;
  date: string;
}

export interface ThemeData {
  name: string;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  layouts: unknown[];
}

export interface ThreeDAnimationFeature {
  createScene: () => ThreeScene;
  addModel: (sceneId: string, model: File) => Promise<void>;
  animate: (sceneId: string, animation: AnimationConfig) => void;
  exportGIF: (sceneId: string) => Promise<Blob>;
}

export interface ThreeScene {
  id: string;
  objects: ThreeObject[];
  camera: CameraConfig;
  lights: LightConfig[];
}

export interface ThreeObject {
  id: string;
  type: 'cube' | 'sphere' | 'cylinder' | 'model';
  position: [number, number, number];
  rotation: [number, number, number];
}

export interface CameraConfig {
  position: [number, number, number];
  fov: number;
}

export interface LightConfig {
  type: 'ambient' | 'directional' | 'point';
  intensity: number;
  position?: [number, number, number];
}

export interface AnimationConfig {
  duration: number;
  keyframes: Keyframe[];
}

export interface Keyframe {
  time: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export interface DesignImportFeature {
  connectFigma: () => Promise<void>;
  getFigmaFiles: () => Promise<FigmaFile[]>;
  importFrame: (fileId: string, frameId: string) => Promise<Slide>;
}

export interface FigmaFile {
  id: string;
  name: string;
  thumbnail: string;
  frames: FigmaFrame[];
}

export interface FigmaFrame {
  id: string;
  name: string;
  width: number;
  height: number;
}

export interface Slide {
  id: string;
  content: unknown;
}

export interface ARPresentationFeature {
  checkSupport: () => boolean;
  startSession: () => Promise<ARSession>;
  placeSlide: (sessionId: string, position: [number, number, number]) => void;
  shareSession: (sessionId: string) => Promise<string>;
}

export interface ARSession {
  id: string;
  active: boolean;
  participants: number;
}

export interface BlockchainNFTFeature {
  connectWallet: () => Promise<WalletConnection>;
  mintNFT: (presentationId: string, metadata: NFTMetadata) => Promise<NFTMintResult>;
  estimateGas: (presentationId: string) => Promise<number>;
  listNFT: (tokenId: string, price: number) => Promise<void>;
}

export interface WalletConnection {
  address: string;
  network: string;
  balance: number;
}

export interface NFTMetadata {
  name: string;
  description: string;
  royalty: number;
}

export interface NFTMintResult {
  tokenId: string;
  transactionHash: string;
  ipfsUrl: string;
}

// Hooks for each P2 feature
export function useVoiceNarration() {
  return useP2Feature<VoiceNarrationFeature>('voice-narration');
}

export function useAPIAccess() {
  return useP2Feature<APIAccessFeature>('api-access');
}

export function useInteractiveElements() {
  return useP2Feature<InteractiveElementsFeature>('interactive-elements');
}

export function useThemesMarketplace() {
  return useP2Feature<ThemesMarketplaceFeature>('themes-marketplace');
}

export function useThreeDAnimation() {
  return useP2Feature<ThreeDAnimationFeature>('3d-animations');
}

export function useDesignImport() {
  return useP2Feature<DesignImportFeature>('design-import');
}

export function useARPresentation() {
  return useP2Feature<ARPresentationFeature>('ar-presentation');
}

export function useBlockchainNFT() {
  return useP2Feature<BlockchainNFTFeature>('blockchain-nft');
}

// Feature toggle hooks
export function useToggleP2Feature(featureId: P2FeatureId) {
  const enableMutation = useEnableP2Feature();
  const disableMutation = useDisableP2Feature();

  return {
    enable: () => enableMutation.mutate(featureId),
    disable: () => disableMutation.mutate(featureId),
    isEnabling: enableMutation.isPending,
    isDisabling: disableMutation.isPending,
  };
}

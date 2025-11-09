/**
 * React Hooks for Backend API
 *
 * Provides React Query hooks for all backend operations.
 * Features automatic caching, refetching, and error handling.
 *
 * @module hooks/use-backend
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { backendClient } from '../api/backend-client.js';
import type {
  SlideGenerationRequest,
  SlideGenerationResult,
  P0FeatureId,
  P1FeatureId,
  P2FeatureId,
  CombinedHealthReport,
  CombinedInitializationResult,
} from '../types/backend.js';
import type { ApiError } from '../api/backend-client.js';

// ===== Query Keys =====

/**
 * Centralized query keys for React Query.
 * Ensures consistent cache management.
 */
export const queryKeys = {
  health: ['backend', 'health'] as const,
  p0: {
    all: ['backend', 'p0'] as const,
    feature: (id: P0FeatureId) => ['backend', 'p0', id] as const,
    health: () => ['backend', 'p0', 'health'] as const,
  },
  p1: {
    all: ['backend', 'p1'] as const,
    feature: (id: P1FeatureId) => ['backend', 'p1', id] as const,
    health: () => ['backend', 'p1', 'health'] as const,
  },
  p2: {
    all: ['backend', 'p2'] as const,
    feature: (id: P2FeatureId) => ['backend', 'p2', id] as const,
    health: () => ['backend', 'p2', 'health'] as const,
  },
  presentation: {
    all: ['backend', 'presentation'] as const,
    byId: (id: string) => ['backend', 'presentation', id] as const,
  },
} as const;

// ===== Initialization Hook =====

/**
 * Initialize the backend integration.
 * Should be called once at application startup.
 *
 * @example
 * ```tsx
 * function App() {
 *   const { data, isLoading, error } = useBackendInitialization();
 *
 *   if (isLoading) return <div>Initializing...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return <div>Backend initialized: {data.message}</div>;
 * }
 * ```
 */
export function useBackendInitialization(
  options?: Omit<UseQueryOptions<CombinedInitializationResult, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<CombinedInitializationResult, ApiError>({
    queryKey: ['backend', 'initialization'],
    queryFn: () => backendClient.initialize(),
    staleTime: Infinity, // Only initialize once
    retry: 1, // Only retry once on failure
    ...options,
  });
}

// ===== Presentation Generation Hook =====

/**
 * Generate a presentation with automatic caching and error handling.
 *
 * @example
 * ```tsx
 * function PresentationGenerator() {
 *   const { mutate, isPending, error } = useGeneratePresentation();
 *
 *   const handleGenerate = () => {
 *     mutate({
 *       topic: 'AI in Healthcare',
 *       slideCount: 10,
 *       tone: 'formal',
 *     }, {
 *       onSuccess: (result) => {
 *         console.log(`Generated ${result.slides.length} slides`);
 *       },
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleGenerate} disabled={isPending}>
 *       {isPending ? 'Generating...' : 'Generate Presentation'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useGeneratePresentation(
  options?: UseMutationOptions<SlideGenerationResult, ApiError, SlideGenerationRequest>
) {
  const queryClient = useQueryClient();

  return useMutation<SlideGenerationResult, ApiError, SlideGenerationRequest>({
    mutationFn: (request) => backendClient.generatePresentation(request),
    onSuccess: (data, variables, context) => {
      // Cache the generated presentation
      if (data.slides[0]?.id) {
        queryClient.setQueryData(
          queryKeys.presentation.byId(data.slides[0].id),
          data
        );
      }

      // Invalidate presentation list
      queryClient.invalidateQueries({
        queryKey: queryKeys.presentation.all,
      });

      // Call user's onSuccess if provided
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

// ===== P0 Feature Hooks =====

/**
 * Get a P0 (core) feature instance.
 *
 * @example
 * ```tsx
 * function GridLayoutDemo() {
 *   const { data: gridLayout, isLoading } = useP0Feature('grid-layout');
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return <div>Grid layout loaded</div>;
 * }
 * ```
 */
export function useP0Feature<T = unknown>(
  featureId: P0FeatureId,
  options?: Omit<UseQueryOptions<T, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, ApiError>({
    queryKey: queryKeys.p0.feature(featureId),
    queryFn: () => backendClient.p0.getFeature<T>(featureId),
    enabled: backendClient.isReady(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Check if P0 features are healthy.
 *
 * @example
 * ```tsx
 * function HealthIndicator() {
 *   const { data: isHealthy } = useP0Health();
 *   return <div>P0 Status: {isHealthy ? '✓' : '✗'}</div>;
 * }
 * ```
 */
export function useP0Health(
  options?: Omit<UseQueryOptions<boolean, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<boolean, ApiError>({
    queryKey: queryKeys.p0.health(),
    queryFn: () => backendClient.p0.isHealthy(),
    enabled: backendClient.isReady(),
    refetchInterval: 30000, // Refresh every 30 seconds
    ...options,
  });
}

// ===== P1 Feature Hooks =====

/**
 * Get a P1 (advanced) feature instance.
 * Only queries if the feature is enabled and available.
 *
 * @example
 * ```tsx
 * function AnalyticsPanel() {
 *   const { data: analytics, isLoading } = useP1Feature('analytics');
 *
 *   if (!analytics) return null;
 *
 *   return <div>Analytics loaded</div>;
 * }
 * ```
 */
export function useP1Feature<T = unknown>(
  featureId: P1FeatureId,
  options?: Omit<UseQueryOptions<T, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, ApiError>({
    queryKey: queryKeys.p1.feature(featureId),
    queryFn: () => backendClient.p1.getFeature<T>(featureId),
    enabled: backendClient.isReady() && backendClient.p1.isFeatureAvailable(featureId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Enable a P1 feature at runtime.
 *
 * @example
 * ```tsx
 * function FeatureToggle() {
 *   const { mutate: enableAnalytics } = useEnableP1Feature();
 *
 *   return (
 *     <button onClick={() => enableAnalytics('analytics')}>
 *       Enable Analytics
 *     </button>
 *   );
 * }
 * ```
 */
export function useEnableP1Feature(
  options?: UseMutationOptions<void, ApiError, P1FeatureId>
) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, P1FeatureId>({
    mutationFn: (featureId) => {
      backendClient.p1.enableFeature(featureId);
      return Promise.resolve();
    },
    onSuccess: (data, featureId, context) => {
      // Invalidate feature queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.p1.feature(featureId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.health,
      });

      options?.onSuccess?.(data, featureId, context);
    },
    ...options,
  });
}

/**
 * Disable a P1 feature at runtime.
 *
 * @example
 * ```tsx
 * function FeatureToggle() {
 *   const { mutate: disableAnalytics } = useDisableP1Feature();
 *
 *   return (
 *     <button onClick={() => disableAnalytics('analytics')}>
 *       Disable Analytics
 *     </button>
 *   );
 * }
 * ```
 */
export function useDisableP1Feature(
  options?: UseMutationOptions<void, ApiError, P1FeatureId>
) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, P1FeatureId>({
    mutationFn: (featureId) => {
      backendClient.p1.disableFeature(featureId);
      return Promise.resolve();
    },
    onSuccess: (data, featureId, context) => {
      // Invalidate feature queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.p1.feature(featureId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.health,
      });

      options?.onSuccess?.(data, featureId, context);
    },
    ...options,
  });
}

// ===== P2 Feature Hooks =====

/**
 * Get a P2 (nice-to-have) feature instance.
 * Only queries if the feature is enabled and available.
 *
 * @example
 * ```tsx
 * function VoiceNarration() {
 *   const { data: voice, isLoading } = useP2Feature('voice-narration');
 *
 *   if (!voice) return null;
 *
 *   return <div>Voice narration loaded</div>;
 * }
 * ```
 */
export function useP2Feature<T = unknown>(
  featureId: P2FeatureId,
  options?: Omit<UseQueryOptions<T, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, ApiError>({
    queryKey: queryKeys.p2.feature(featureId),
    queryFn: () => backendClient.p2.getFeature<T>(featureId),
    enabled: backendClient.isReady() && backendClient.p2.isFeatureAvailable(featureId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Enable a P2 feature at runtime.
 *
 * @example
 * ```tsx
 * function FeatureToggle() {
 *   const { mutate: enableVoice } = useEnableP2Feature();
 *
 *   return (
 *     <button onClick={() => enableVoice('voice-narration')}>
 *       Enable Voice Narration
 *     </button>
 *   );
 * }
 * ```
 */
export function useEnableP2Feature(
  options?: UseMutationOptions<void, ApiError, P2FeatureId>
) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, P2FeatureId>({
    mutationFn: (featureId) => {
      backendClient.p2.enableFeature(featureId);
      return Promise.resolve();
    },
    onSuccess: (data, featureId, context) => {
      // Invalidate feature queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.p2.feature(featureId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.health,
      });

      options?.onSuccess?.(data, featureId, context);
    },
    ...options,
  });
}

/**
 * Disable a P2 feature at runtime.
 *
 * @example
 * ```tsx
 * function FeatureToggle() {
 *   const { mutate: disableVoice } = useDisableP2Feature();
 *
 *   return (
 *     <button onClick={() => disableVoice('voice-narration')}>
 *       Disable Voice Narration
 *     </button>
 *   );
 * }
 * ```
 */
export function useDisableP2Feature(
  options?: UseMutationOptions<void, ApiError, P2FeatureId>
) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, P2FeatureId>({
    mutationFn: (featureId) => {
      backendClient.p2.disableFeature(featureId);
      return Promise.resolve();
    },
    onSuccess: (data, featureId, context) => {
      // Invalidate feature queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.p2.feature(featureId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.health,
      });

      options?.onSuccess?.(data, featureId, context);
    },
    ...options,
  });
}

// ===== Health Monitoring Hook =====

/**
 * Get comprehensive health report for all features.
 * Automatically refetches every 30 seconds.
 *
 * @example
 * ```tsx
 * function HealthDashboard() {
 *   const { data: health, isLoading } = useBackendHealth();
 *
 *   if (isLoading) return <div>Loading health status...</div>;
 *
 *   return (
 *     <div>
 *       <h2>System Health: {health.overallHealth}</h2>
 *       <p>P0: {health.p0.summary.ready}/{health.p0.summary.total}</p>
 *       <p>P1: {health.p1?.summary.ready}/{health.p1?.summary.total}</p>
 *       <p>P2: {health.p2?.summary.ready}/{health.p2?.summary.total}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useBackendHealth(
  options?: Omit<UseQueryOptions<CombinedHealthReport, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<CombinedHealthReport, ApiError>({
    queryKey: queryKeys.health,
    queryFn: () => backendClient.getHealthReport(),
    enabled: backendClient.isReady(),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider stale after 10 seconds
    ...options,
  });
}

/**
 * Check if the entire backend is healthy.
 *
 * @example
 * ```tsx
 * function StatusIndicator() {
 *   const { data: isHealthy } = useIsBackendHealthy();
 *
 *   return (
 *     <div className={isHealthy ? 'text-green-500' : 'text-red-500'}>
 *       {isHealthy ? '● Online' : '● Offline'}
 *     </div>
 *   );
 * }
 * ```
 */
export function useIsBackendHealthy(
  options?: Omit<UseQueryOptions<boolean, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<boolean, ApiError>({
    queryKey: ['backend', 'is-healthy'],
    queryFn: () => backendClient.isHealthy(),
    enabled: backendClient.isReady(),
    refetchInterval: 15000, // Refresh every 15 seconds
    ...options,
  });
}

// ===== Utility Hooks =====

/**
 * Check if the backend is ready to accept requests.
 *
 * @example
 * ```tsx
 * function ProtectedRoute({ children }) {
 *   const isReady = useBackendReady();
 *
 *   if (!isReady) return <div>Backend initializing...</div>;
 *
 *   return children;
 * }
 * ```
 */
export function useBackendReady(): boolean {
  return backendClient.isReady();
}

/**
 * Cancel all pending backend requests.
 *
 * @example
 * ```tsx
 * function CancelButton() {
 *   const cancelAll = useCancelBackendRequests();
 *
 *   return (
 *     <button onClick={cancelAll}>
 *       Cancel All Requests
 *     </button>
 *   );
 * }
 * ```
 */
export function useCancelBackendRequests() {
  return () => backendClient.cancelAll();
}

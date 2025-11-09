# Slide Designer Frontend Architecture
**Version:** 1.0
**Date:** 2025-11-09
**Status:** Technical Design Specification
**Author:** Frontend Architect
**Target:** Next.js 16.0.0 + React 19.2.0 + TypeScript 5.9.3

---

## Executive Summary

This document defines the complete frontend architecture for integrating **35 features** (12 P0, 13 P1, 8 P2) into a Next.js application. The architecture emphasizes **scalability**, **performance**, **accessibility**, and **progressive enhancement**.

### Key Principles

1. **Component Isolation**: Each feature is a self-contained module
2. **Progressive Enhancement**: Core features (P0) work without P1/P2
3. **Feature Flags**: Runtime feature toggling for gradual rollout
4. **Accessibility First**: WCAG 2.1 Level AA minimum, AAA for core paths
5. **Performance Budget**: <3s TTI, <500ms per interaction
6. **Type Safety**: 100% TypeScript strict mode

---

## Table of Contents

1. [Component Hierarchy](#1-component-hierarchy)
2. [Data Flow Architecture](#2-data-flow-architecture)
3. [Routing Strategy](#3-routing-strategy)
4. [State Management](#4-state-management)
5. [API Layer](#5-api-layer)
6. [Error & Loading States](#6-error--loading-states)
7. [Feature Flag System](#7-feature-flag-system)
8. [File Structure](#8-file-structure)
9. [Naming Conventions](#9-naming-conventions)
10. [Accessibility Strategy](#10-accessibility-strategy)
11. [Performance Optimization](#11-performance-optimization)
12. [Testing Strategy](#12-testing-strategy)

---

## 1. Component Hierarchy

### 1.1 Component Tree Overview

```
app/
├── layout.tsx                       # Root layout (persistent header, footer)
├── page.tsx                         # Home page (landing/create new)
├── error.tsx                        # Global error boundary
├── loading.tsx                      # Global loading state
│
├── (auth)/                          # Auth route group
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx
│
├── presentations/                   # Main presentations routes
│   ├── page.tsx                     # List all presentations
│   ├── new/page.tsx                 # Create new (with AI generation)
│   ├── [id]/
│   │   ├── page.tsx                 # View presentation (read-only)
│   │   ├── edit/
│   │   │   ├── page.tsx             # Edit mode (main editor)
│   │   │   └── layout.tsx           # Editor layout (sidebar, toolbar)
│   │   ├── present/
│   │   │   ├── page.tsx             # Presentation mode (P1.15 Live)
│   │   │   └── ar/page.tsx          # AR mode (P2.2)
│   │   ├── analytics/page.tsx       # Analytics dashboard (P1.13)
│   │   └── versions/page.tsx        # Version history (P1.10)
│
├── library/                         # P1.5 Template Library
│   ├── page.tsx                     # Browse templates
│   └── [templateId]/page.tsx        # Preview template
│
├── marketplace/                     # P2.5 Themes Marketplace
│   ├── page.tsx                     # Browse marketplace
│   ├── [themeId]/page.tsx           # Theme details
│   └── publish/page.tsx             # Publish custom theme
│
├── api-docs/                        # P2.6 Developer API Docs
│   └── page.tsx
│
└── settings/                        # User settings
    ├── page.tsx                     # General settings
    ├── fonts/page.tsx               # P1.8 Custom fonts
    ├── language/page.tsx            # P1.6 i18n preferences
    └── integrations/page.tsx        # API keys, Figma, etc.

components/
├── layout/                          # Layout components
│   ├── AppHeader.tsx
│   ├── AppSidebar.tsx
│   ├── AppFooter.tsx
│   └── PageContainer.tsx
│
├── editor/                          # Editor-specific components
│   ├── EditorCanvas.tsx             # Main slide canvas
│   ├── EditorToolbar.tsx            # Top toolbar
│   ├── EditorSidebar.tsx            # Left sidebar (slide thumbnails)
│   ├── EditorPropertiesPanel.tsx   # Right panel (properties)
│   ├── SlideNavigator.tsx           # Slide navigation controls
│   └── ZoomControls.tsx             # Zoom in/out
│
├── slides/                          # Slide components
│   ├── SlideCanvas.tsx              # Individual slide renderer
│   ├── SlidePreview.tsx             # Thumbnail preview
│   ├── SlideThumbnail.tsx           # Sidebar thumbnail
│   ├── SlideGridView.tsx            # Grid view of slides
│   └── SlideListView.tsx            # List view of slides
│
├── features/                        # Feature components
│   ├── p0/                          # 12 P0 features
│   │   ├── GridLayoutControls.tsx
│   │   ├── TypographyPanel.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── ChartEditor.tsx
│   │   ├── TextOverflowHandler.tsx
│   │   ├── MasterSlideEditor.tsx
│   │   ├── TransitionsPanel.tsx
│   │   ├── AccessibilityChecker.tsx
│   │   ├── ExportDialog.tsx
│   │   ├── ImageUploader.tsx
│   │   ├── ContentValidator.tsx
│   │   └── QualityScoreCard.tsx
│   │
│   ├── p1/                          # 13 P1 features
│   │   ├── SpeakerNotesEditor.tsx   # P1.3
│   │   ├── SlideManagerPanel.tsx    # P1.4
│   │   ├── TemplateLibraryBrowser.tsx # P1.5
│   │   ├── LanguageSwitcher.tsx     # P1.6
│   │   ├── VideoEmbedDialog.tsx     # P1.7
│   │   ├── CustomFontManager.tsx    # P1.8
│   │   ├── CollaborationPanel.tsx   # P1.9
│   │   ├── VersionHistoryPanel.tsx  # P1.10
│   │   ├── AIImageGenerator.tsx     # P1.11
│   │   ├── DataImporter.tsx         # P1.12
│   │   ├── AnalyticsDashboard.tsx   # P1.13
│   │   ├── MobilePreview.tsx        # P1.14
│   │   └── LivePresentationMode.tsx # P1.15
│   │
│   └── p2/                          # 8 P2 features
│       ├── VoiceNarrationPanel.tsx  # P2.3
│       ├── APIAccessDocs.tsx        # P2.6
│       ├── InteractiveElements.tsx  # P2.4
│       ├── MarketplaceBrowser.tsx   # P2.5
│       ├── ThreeDAnimations.tsx     # P2.1
│       ├── FigmaImporter.tsx        # P2.7
│       ├── ARPresentationMode.tsx   # P2.2
│       └── NFTMinter.tsx            # P2.8
│
├── presentation/                    # Presentation mode components
│   ├── PresentationViewer.tsx
│   ├── PresentationControls.tsx
│   ├── PresentationProgress.tsx
│   ├── PresenterNotes.tsx
│   └── AudienceView.tsx
│
├── shared/                          # Shared components
│   ├── ErrorBoundary.tsx
│   ├── LoadingSkeleton.tsx
│   ├── EmptyState.tsx
│   ├── FeatureFlagGuard.tsx
│   ├── ConfirmDialog.tsx
│   ├── Toast.tsx
│   └── HelpTooltip.tsx
│
└── ui/                              # shadcn/ui components (57 existing)
    ├── button.tsx
    ├── dialog.tsx
    ├── dropdown-menu.tsx
    ├── input.tsx
    ├── select.tsx
    ├── slider.tsx
    ├── tabs.tsx
    └── ... (50 more)
```

### 1.2 Component Responsibility Matrix

| Component | Responsibility | P0/P1/P2 | Key Features |
|-----------|---------------|----------|--------------|
| **EditorCanvas** | Main editing surface | P0 | Grid layout, drag-drop, selection |
| **EditorToolbar** | Top-level actions | P0+P1 | Undo/redo, zoom, export, share |
| **EditorSidebar** | Slide navigation | P0+P1 | Thumbnails, reorder, duplicate |
| **EditorPropertiesPanel** | Element properties | P0+P1 | Typography, colors, spacing |
| **SlideCanvas** | Render individual slide | P0 | HTML/CSS rendering, responsive |
| **SpeakerNotesEditor** | Speaker notes | P1 | Rich text, auto-save |
| **CollaborationPanel** | Real-time collab | P1 | Comments, presence, cursors |
| **LivePresentationMode** | Live presenting | P1 | Presenter view, audience sync |
| **VoiceNarrationPanel** | TTS controls | P2 | Voice selection, preview |
| **ARPresentationMode** | WebXR AR mode | P2 | 3D placement, gestures |

---

## 2. Data Flow Architecture

### 2.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend Application                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  Components  │───▶│ React Query  │───▶│  API Client  │      │
│  │  (UI Layer)  │    │  (Caching)   │    │  (HTTP/WS)   │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                     │                    │             │
│         │                     │                    │             │
│  ┌──────▼──────┐    ┌────────▼────────┐  ┌───────▼──────┐     │
│  │   Zustand   │    │  Local Storage  │  │  IndexedDB   │     │
│  │   (State)   │    │  (Preferences)  │  │  (Offline)   │     │
│  └─────────────┘    └─────────────────┘  └──────────────┘     │
│                                                                   │
└───────────────────────────────────────────────────────────────┬─┘
                                                                 │
                                                                 ▼
                                                    ┌────────────────────┐
                                                    │  Backend API       │
                                                    │  ─────────────     │
                                                    │  P0Integration     │
                                                    │  P1Integration     │
                                                    │  P2Integration     │
                                                    └────────────────────┘
```

### 2.2 State Management Strategy

**Use Zustand for:**
- Global app state (user, auth, settings)
- Editor state (current slide, selection, history)
- Feature flags
- UI state (modals, panels, toolbars)

**Use React Query for:**
- Server state (presentations, templates, themes)
- API caching (automatic cache invalidation)
- Optimistic updates (slide reordering, quick edits)
- Real-time data (collaboration, live presentations)

**Use React Context for:**
- Theme (light/dark mode)
- Feature flag access
- Accessibility preferences
- Localization (i18n)

**Use Local Component State for:**
- Form inputs
- Temporary UI state
- Animations
- Controlled components

### 2.3 State Store Structure

```typescript
// store/editorStore.ts
interface EditorStore {
  // Presentation state
  presentationId: string | null;
  slides: Slide[];
  currentSlideIndex: number;

  // Selection state
  selectedElements: string[];
  clipboard: ElementData | null;

  // History (undo/redo)
  history: EditorState[];
  historyIndex: number;

  // UI state
  zoom: number;
  showGrid: boolean;
  showRulers: boolean;
  sidebarOpen: boolean;
  propertiesPanelOpen: boolean;

  // Actions
  setCurrentSlide: (index: number) => void;
  addSlide: (slide: Slide, position?: number) => void;
  deleteSlide: (index: number) => void;
  duplicateSlide: (index: number) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;

  undo: () => void;
  redo: () => void;

  selectElements: (ids: string[]) => void;
  copy: () => void;
  paste: () => void;

  setZoom: (zoom: number) => void;
  toggleSidebar: () => void;
}

// store/userStore.ts
interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  preferences: UserPreferences;

  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
}

// store/featureFlagsStore.ts
interface FeatureFlagsStore {
  flags: FeatureFlags;
  isFeatureEnabled: (feature: FeatureName) => boolean;
  enableFeature: (feature: FeatureName) => void;
  disableFeature: (feature: FeatureName) => void;
}
```

### 2.4 API Client Architecture

```typescript
// lib/api/client.ts
class APIClient {
  private baseURL: string;
  private httpClient: AxiosInstance;
  private wsClient: WebSocket | null;

  // P0 API methods
  async generatePresentation(topic: string): Promise<Presentation>;
  async exportPresentation(id: string, format: ExportFormat): Promise<Blob>;

  // P1 API methods
  async getTemplates(): Promise<Template[]>;
  async saveVersion(id: string, snapshot: Snapshot): Promise<Version>;
  async joinCollaboration(sessionId: string): Promise<CollabSession>;

  // P2 API methods
  async generateAIImage(prompt: string): Promise<ImageURL>;
  async mintNFT(presentationId: string): Promise<Transaction>;

  // WebSocket for real-time features
  subscribeToSlideUpdates(presentationId: string, callback: Callback): void;
  subscribeToCollaboration(sessionId: string, callback: Callback): void;
}

// Usage
const api = new APIClient(process.env.NEXT_PUBLIC_API_URL);
export default api;
```

---

## 3. Routing Strategy

### 3.1 Route Map

| Route | Page | Features | Auth | P0/P1/P2 |
|-------|------|----------|------|----------|
| `/` | Home/Landing | Create new, browse recent | Optional | P0 |
| `/presentations` | Presentation list | Grid/list view, search, filter | Required | P0 |
| `/presentations/new` | Create new | AI generation, templates | Required | P0+P1 |
| `/presentations/[id]` | View presentation | Read-only view, share | Public | P0 |
| `/presentations/[id]/edit` | **Editor** | **Main editing interface** | Required | **P0+P1** |
| `/presentations/[id]/present` | **Present mode** | **Live presentation** | Required | **P1** |
| `/presentations/[id]/present/ar` | AR mode | WebXR AR presentation | Required | P2 |
| `/presentations/[id]/analytics` | Analytics | View stats, engagement | Required | P1 |
| `/presentations/[id]/versions` | Version history | Browse versions, restore | Required | P1 |
| `/library` | Template library | Browse templates, preview | Public | P1 |
| `/library/[templateId]` | Template details | Preview, clone, customize | Public | P1 |
| `/marketplace` | Themes marketplace | Browse, search, purchase | Public | P2 |
| `/marketplace/[themeId]` | Theme details | Preview, purchase, rate | Public | P2 |
| `/marketplace/publish` | Publish theme | Upload custom theme | Required | P2 |
| `/api-docs` | API documentation | OpenAPI docs, try it | Public | P2 |
| `/settings` | User settings | General preferences | Required | - |
| `/settings/fonts` | Custom fonts | Upload, manage fonts | Required | P1 |
| `/settings/language` | Language settings | i18n preferences | Required | P1 |
| `/settings/integrations` | Integrations | API keys, Figma, etc. | Required | P2 |

### 3.2 Route Groups

```typescript
// app/(auth)/layout.tsx
// Auth-required routes (presentations, settings)
export default function AuthLayout({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    redirect('/login');
  }

  return <>{children}</>;
}

// app/(public)/layout.tsx
// Public routes (library, marketplace, view presentation)
export default function PublicLayout({ children }) {
  return <>{children}</>;
}

// app/(editor)/presentations/[id]/edit/layout.tsx
// Editor-specific layout (sidebar, toolbar, properties panel)
export default function EditorLayout({ children }) {
  return (
    <div className="h-screen flex flex-col">
      <EditorToolbar />
      <div className="flex-1 flex overflow-hidden">
        <EditorSidebar />
        <main className="flex-1">{children}</main>
        <EditorPropertiesPanel />
      </div>
    </div>
  );
}
```

### 3.3 Dynamic Routing & Prefetching

```typescript
// app/presentations/[id]/edit/page.tsx
export async function generateStaticParams() {
  // Pre-generate popular presentations at build time
  const popularPresentations = await api.getPopularPresentations();
  return popularPresentations.map(p => ({ id: p.id }));
}

export default async function EditPage({ params }: { params: { id: string } }) {
  // Server-side data fetching
  const presentation = await api.getPresentation(params.id);

  return <Editor initialPresentation={presentation} />;
}
```

---

## 4. State Management

### 4.1 Zustand Store Pattern

```typescript
// store/editorStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface EditorState {
  presentationId: string | null;
  slides: Slide[];
  currentSlideIndex: number;
  selectedElements: string[];
  history: EditorSnapshot[];
  historyIndex: number;
}

interface EditorActions {
  // Slide management (P1.4)
  addSlide: (slide: Slide, position?: number) => void;
  deleteSlide: (index: number) => void;
  duplicateSlide: (index: number) => void;
  moveSlide: (from: number, to: number) => void;

  // Selection
  selectElements: (ids: string[]) => void;
  clearSelection: () => void;

  // History (undo/redo)
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Navigation
  goToSlide: (index: number) => void;
  nextSlide: () => void;
  previousSlide: () => void;
}

export const useEditorStore = create<EditorState & EditorActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        presentationId: null,
        slides: [],
        currentSlideIndex: 0,
        selectedElements: [],
        history: [],
        historyIndex: -1,

        // Actions
        addSlide: (slide, position) => set(state => {
          const index = position ?? state.slides.length;
          state.slides.splice(index, 0, slide);
          state.currentSlideIndex = index;

          // Save to history
          state.history.push(createSnapshot(state));
          state.historyIndex = state.history.length - 1;
        }),

        deleteSlide: (index) => set(state => {
          if (state.slides.length === 1) return; // Don't delete last slide

          state.slides.splice(index, 1);

          // Adjust current index
          if (state.currentSlideIndex >= state.slides.length) {
            state.currentSlideIndex = state.slides.length - 1;
          }

          state.history.push(createSnapshot(state));
          state.historyIndex = state.history.length - 1;
        }),

        duplicateSlide: (index) => set(state => {
          const slide = state.slides[index];
          const duplicate = cloneDeep(slide);
          duplicate.id = generateId();

          state.slides.splice(index + 1, 0, duplicate);
          state.currentSlideIndex = index + 1;

          state.history.push(createSnapshot(state));
          state.historyIndex = state.history.length - 1;
        }),

        moveSlide: (from, to) => set(state => {
          const [slide] = state.slides.splice(from, 1);
          state.slides.splice(to, 0, slide);
          state.currentSlideIndex = to;

          state.history.push(createSnapshot(state));
          state.historyIndex = state.history.length - 1;
        }),

        undo: () => set(state => {
          if (state.historyIndex > 0) {
            state.historyIndex--;
            return state.history[state.historyIndex];
          }
        }),

        redo: () => set(state => {
          if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++;
            return state.history[state.historyIndex];
          }
        }),

        canUndo: () => get().historyIndex > 0,
        canRedo: () => get().historyIndex < get().history.length - 1,

        // ... other actions
      })),
      {
        name: 'editor-storage',
        partialize: (state) => ({
          // Only persist preferences, not full editor state
          zoom: state.zoom,
          showGrid: state.showGrid,
          showRulers: state.showRulers,
        }),
      }
    )
  )
);
```

### 4.2 React Query Integration

```typescript
// lib/hooks/usePresentations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api/client';

export function usePresentations() {
  return useQuery({
    queryKey: ['presentations'],
    queryFn: () => api.getPresentations(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePresentation(id: string) {
  return useQuery({
    queryKey: ['presentations', id],
    queryFn: () => api.getPresentation(id),
    enabled: !!id,
  });
}

export function useUpdatePresentation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Presentation> }) =>
      api.updatePresentation(id, data),

    // Optimistic update
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['presentations', id] });

      const previousPresentation = queryClient.getQueryData(['presentations', id]);

      queryClient.setQueryData(['presentations', id], (old: Presentation) => ({
        ...old,
        ...data,
      }));

      return { previousPresentation };
    },

    // Rollback on error
    onError: (err, { id }, context) => {
      queryClient.setQueryData(['presentations', id], context?.previousPresentation);
    },

    // Refetch on success
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['presentations', id] });
    },
  });
}
```

---

## 5. API Layer

### 5.1 API Client Architecture

```typescript
// lib/api/client.ts
import axios, { AxiosInstance } from 'axios';

class APIClient {
  private http: AxiosInstance;
  private ws: WebSocket | null = null;

  constructor(baseURL: string) {
    this.http = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor
    this.http.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add error interceptor
    this.http.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Redirect to login
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ===== P0 API Methods =====

  async generatePresentation(topic: string, options?: GenerationOptions): Promise<Presentation> {
    const { data } = await this.http.post('/api/generate', {
      topic,
      ...options,
    });
    return data;
  }

  async exportPresentation(id: string, format: ExportFormat): Promise<Blob> {
    const { data } = await this.http.get(`/api/export/${id}/${format}`, {
      responseType: 'blob',
    });
    return data;
  }

  async getPresentations(): Promise<Presentation[]> {
    const { data } = await this.http.get('/api/presentations');
    return data;
  }

  async getPresentation(id: string): Promise<Presentation> {
    const { data } = await this.http.get(`/api/presentations/${id}`);
    return data;
  }

  async updatePresentation(id: string, updates: Partial<Presentation>): Promise<Presentation> {
    const { data } = await this.http.patch(`/api/presentations/${id}`, updates);
    return data;
  }

  async deletePresentation(id: string): Promise<void> {
    await this.http.delete(`/api/presentations/${id}`);
  }

  // ===== P1 API Methods =====

  async getTemplates(): Promise<Template[]> {
    const { data } = await this.http.get('/api/templates');
    return data;
  }

  async getTemplate(id: string): Promise<Template> {
    const { data } = await this.http.get(`/api/templates/${id}`);
    return data;
  }

  async saveVersion(id: string, snapshot: Snapshot): Promise<Version> {
    const { data } = await this.http.post(`/api/presentations/${id}/versions`, snapshot);
    return data;
  }

  async getVersions(id: string): Promise<Version[]> {
    const { data } = await this.http.get(`/api/presentations/${id}/versions`);
    return data;
  }

  async restoreVersion(id: string, versionId: string): Promise<Presentation> {
    const { data } = await this.http.post(`/api/presentations/${id}/versions/${versionId}/restore`);
    return data;
  }

  async uploadCustomFont(font: File): Promise<FontMetadata> {
    const formData = new FormData();
    formData.append('font', font);

    const { data } = await this.http.post('/api/fonts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }

  async generateAIImage(prompt: string): Promise<string> {
    const { data } = await this.http.post('/api/ai/images', { prompt });
    return data.url;
  }

  // ===== P2 API Methods =====

  async getMarketplaceThemes(): Promise<MarketplaceTheme[]> {
    const { data } = await this.http.get('/api/marketplace/themes');
    return data;
  }

  async publishTheme(theme: CustomTheme): Promise<string> {
    const { data } = await this.http.post('/api/marketplace/themes', theme);
    return data.id;
  }

  async importFigmaFile(fileKey: string): Promise<Presentation> {
    const { data } = await this.http.post('/api/figma/import', { fileKey });
    return data;
  }

  async generateVoiceNarration(slideId: string, text: string): Promise<AudioURL> {
    const { data } = await this.http.post('/api/voice/narrate', { slideId, text });
    return data.audioUrl;
  }

  async mintNFT(presentationId: string, metadata: NFTMetadata): Promise<Transaction> {
    const { data } = await this.http.post('/api/nft/mint', { presentationId, metadata });
    return data;
  }

  // ===== WebSocket for Real-Time Features =====

  subscribeToCollaboration(sessionId: string, callbacks: CollabCallbacks): () => void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      const wsURL = this.http.defaults.baseURL!.replace('http', 'ws');
      this.ws = new WebSocket(`${wsURL}/ws/collaboration/${sessionId}`);

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case 'presence_update':
            callbacks.onPresenceUpdate?.(message.data);
            break;
          case 'slide_update':
            callbacks.onSlideUpdate?.(message.data);
            break;
          case 'comment_added':
            callbacks.onCommentAdded?.(message.data);
            break;
        }
      };
    }

    // Return cleanup function
    return () => {
      this.ws?.close();
      this.ws = null;
    };
  }
}

export default new APIClient(process.env.NEXT_PUBLIC_API_URL!);
```

---

## 6. Error & Loading States

### 6.1 Error Boundary Pattern

```typescript
// components/shared/ErrorBoundary.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // Log to error tracking service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo);
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;

      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error!} reset={this.reset} />;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button onClick={this.reset}>Try again</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 6.2 Loading Skeleton Pattern

```typescript
// components/shared/LoadingSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function PresentationListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="h-screen flex">
      {/* Sidebar skeleton */}
      <div className="w-64 border-r p-4 space-y-2">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>

      {/* Canvas skeleton */}
      <div className="flex-1 p-8">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Properties panel skeleton */}
      <div className="w-80 border-l p-4 space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
```

### 6.3 Empty State Pattern

```typescript
// components/shared/EmptyState.tsx
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <Icon className="w-16 h-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          <Plus className="w-4 h-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Usage
<EmptyState
  title="No presentations yet"
  description="Create your first presentation to get started"
  action={{
    label: "Create presentation",
    onClick: () => router.push('/presentations/new'),
  }}
/>
```

### 6.4 Error State Matrix

| Error Type | Handling Strategy | User Experience | Retry |
|------------|------------------|-----------------|-------|
| **Network Error** | Show toast, retry automatically | "Connection lost. Retrying..." | 3x with backoff |
| **API 400 Error** | Show inline validation | "Please check your input" | Manual |
| **API 401 Error** | Redirect to login | "Session expired. Please log in" | No |
| **API 403 Error** | Show permission error | "You don't have access to this" | No |
| **API 404 Error** | Show not found page | "Presentation not found" | No |
| **API 500 Error** | Show error boundary | "Server error. Try again later" | Manual |
| **P2 Feature Unavailable** | Graceful degradation | "Feature unavailable. Using fallback" | No |
| **Browser Incompatible** | Show upgrade message | "Please upgrade your browser" | No |

---

## 7. Feature Flag System

### 7.1 Feature Flag Store

```typescript
// store/featureFlagsStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FeatureFlags {
  // P0 flags (all enabled by default)
  'p0.grid-layout': boolean;
  'p0.typography': boolean;
  'p0.color-palettes': boolean;
  'p0.charts': boolean;
  'p0.export': boolean;
  // ... all P0 features

  // P1 flags (most enabled, some premium)
  'p1.speaker-notes': boolean;
  'p1.slide-manager': boolean;
  'p1.template-library': boolean;
  'p1.i18n': boolean;
  'p1.video-embed': boolean;
  'p1.custom-fonts': boolean;
  'p1.collaboration': boolean; // Premium
  'p1.version-history': boolean;
  'p1.ai-image-generation': boolean; // Premium
  'p1.data-import': boolean;
  'p1.analytics': boolean; // Premium
  'p1.mobile-app': boolean;
  'p1.live-presentation': boolean; // Premium

  // P2 flags (experimental, opt-in)
  'p2.voice-narration': boolean;
  'p2.api-access': boolean;
  'p2.interactive-elements': boolean;
  'p2.themes-marketplace': boolean;
  'p2.3d-animations': boolean;
  'p2.figma-import': boolean;
  'p2.ar-presentation': boolean;
  'p2.blockchain-nft': boolean;
}

interface FeatureFlagsStore {
  flags: FeatureFlags;
  userPlan: 'free' | 'pro' | 'enterprise';

  isFeatureEnabled: (feature: keyof FeatureFlags) => boolean;
  enableFeature: (feature: keyof FeatureFlags) => void;
  disableFeature: (feature: keyof FeatureFlags) => void;
  canAccessFeature: (feature: keyof FeatureFlags) => boolean;
}

export const useFeatureFlags = create<FeatureFlagsStore>()(
  persist(
    (set, get) => ({
      flags: {
        // P0: All enabled
        'p0.grid-layout': true,
        'p0.typography': true,
        'p0.color-palettes': true,
        'p0.charts': true,
        'p0.export': true,
        'p0.text-overflow': true,
        'p0.master-slides': true,
        'p0.transitions': true,
        'p0.accessibility': true,
        'p0.image-optimization': true,
        'p0.content-validation': true,
        'p0.llm-judge': true,

        // P1: Most enabled
        'p1.speaker-notes': true,
        'p1.slide-manager': true,
        'p1.template-library': true,
        'p1.i18n': true,
        'p1.video-embed': true,
        'p1.custom-fonts': true,
        'p1.collaboration': false, // Premium
        'p1.version-history': true,
        'p1.ai-image-generation': false, // Premium
        'p1.data-import': true,
        'p1.analytics': false, // Premium
        'p1.mobile-app': true,
        'p1.live-presentation': false, // Premium

        // P2: Experimental (opt-in)
        'p2.voice-narration': false,
        'p2.api-access': false,
        'p2.interactive-elements': false,
        'p2.themes-marketplace': false,
        'p2.3d-animations': false,
        'p2.figma-import': false,
        'p2.ar-presentation': false,
        'p2.blockchain-nft': false,
      },

      userPlan: 'free',

      isFeatureEnabled: (feature) => {
        const flags = get().flags;
        return flags[feature] ?? false;
      },

      canAccessFeature: (feature) => {
        const plan = get().userPlan;

        // Premium features
        const premiumFeatures: Array<keyof FeatureFlags> = [
          'p1.collaboration',
          'p1.ai-image-generation',
          'p1.analytics',
          'p1.live-presentation',
        ];

        // Enterprise features
        const enterpriseFeatures: Array<keyof FeatureFlags> = [
          'p2.api-access',
          'p2.blockchain-nft',
        ];

        if (premiumFeatures.includes(feature) && plan === 'free') {
          return false;
        }

        if (enterpriseFeatures.includes(feature) && plan !== 'enterprise') {
          return false;
        }

        return true;
      },

      enableFeature: (feature) => set(state => ({
        flags: { ...state.flags, [feature]: true },
      })),

      disableFeature: (feature) => set(state => ({
        flags: { ...state.flags, [feature]: false },
      })),
    }),
    {
      name: 'feature-flags-storage',
    }
  )
);
```

### 7.2 Feature Flag Guard Component

```typescript
// components/shared/FeatureFlagGuard.tsx
import { useFeatureFlags } from '@/store/featureFlagsStore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureFlagGuardProps {
  feature: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureFlagGuard({ feature, children, fallback }: FeatureFlagGuardProps) {
  const { isFeatureEnabled, canAccessFeature } = useFeatureFlags();

  if (!isFeatureEnabled(feature)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return null;
  }

  if (!canAccessFeature(feature)) {
    return (
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          This feature requires a Pro or Enterprise plan.
          <Button variant="link" size="sm" asChild>
            <a href="/pricing">Upgrade now</a>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}

// Usage
<FeatureFlagGuard feature="p1.collaboration">
  <CollaborationPanel />
</FeatureFlagGuard>

<FeatureFlagGuard
  feature="p2.3d-animations"
  fallback={<Button disabled>3D Animations (Coming Soon)</Button>}
>
  <ThreeDAnimationsPanel />
</FeatureFlagGuard>
```

---

## 8. File Structure

### 8.1 Complete Directory Structure

```
/app                             # Next.js App Router
├── layout.tsx                   # Root layout
├── page.tsx                     # Home page
├── error.tsx                    # Global error page
├── loading.tsx                  # Global loading
├── not-found.tsx                # 404 page
│
├── (auth)/                      # Auth route group
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx
│
├── presentations/
│   ├── page.tsx
│   ├── new/page.tsx
│   └── [id]/
│       ├── page.tsx
│       ├── edit/
│       │   ├── page.tsx
│       │   └── layout.tsx
│       ├── present/
│       │   ├── page.tsx
│       │   └── ar/page.tsx
│       ├── analytics/page.tsx
│       └── versions/page.tsx
│
├── library/
│   ├── page.tsx
│   └── [templateId]/page.tsx
│
├── marketplace/
│   ├── page.tsx
│   ├── [themeId]/page.tsx
│   └── publish/page.tsx
│
├── api-docs/page.tsx
│
└── settings/
    ├── page.tsx
    ├── fonts/page.tsx
    ├── language/page.tsx
    └── integrations/page.tsx

/components                      # React components
├── layout/
│   ├── AppHeader.tsx
│   ├── AppSidebar.tsx
│   ├── AppFooter.tsx
│   └── PageContainer.tsx
│
├── editor/
│   ├── EditorCanvas.tsx
│   ├── EditorToolbar.tsx
│   ├── EditorSidebar.tsx
│   └── EditorPropertiesPanel.tsx
│
├── slides/
│   ├── SlideCanvas.tsx
│   ├── SlidePreview.tsx
│   └── SlideThumbnail.tsx
│
├── features/
│   ├── p0/
│   │   ├── GridLayoutControls.tsx
│   │   ├── TypographyPanel.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── ChartEditor.tsx
│   │   ├── TextOverflowHandler.tsx
│   │   ├── MasterSlideEditor.tsx
│   │   ├── TransitionsPanel.tsx
│   │   ├── AccessibilityChecker.tsx
│   │   ├── ExportDialog.tsx
│   │   ├── ImageUploader.tsx
│   │   ├── ContentValidator.tsx
│   │   └── QualityScoreCard.tsx
│   │
│   ├── p1/
│   │   ├── SpeakerNotesEditor.tsx
│   │   ├── SlideManagerPanel.tsx
│   │   ├── TemplateLibraryBrowser.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   ├── VideoEmbedDialog.tsx
│   │   ├── CustomFontManager.tsx
│   │   ├── CollaborationPanel.tsx
│   │   ├── VersionHistoryPanel.tsx
│   │   ├── AIImageGenerator.tsx
│   │   ├── DataImporter.tsx
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── MobilePreview.tsx
│   │   └── LivePresentationMode.tsx
│   │
│   └── p2/
│       ├── VoiceNarrationPanel.tsx
│       ├── APIAccessDocs.tsx
│       ├── InteractiveElements.tsx
│       ├── MarketplaceBrowser.tsx
│       ├── ThreeDAnimations.tsx
│       ├── FigmaImporter.tsx
│       ├── ARPresentationMode.tsx
│       └── NFTMinter.tsx
│
├── presentation/
│   ├── PresentationViewer.tsx
│   ├── PresentationControls.tsx
│   └── PresenterNotes.tsx
│
├── shared/
│   ├── ErrorBoundary.tsx
│   ├── LoadingSkeleton.tsx
│   ├── EmptyState.tsx
│   ├── FeatureFlagGuard.tsx
│   ├── ConfirmDialog.tsx
│   └── Toast.tsx
│
└── ui/                          # shadcn/ui components (57 existing)

/lib                             # Utilities and libraries
├── api/
│   ├── client.ts                # Main API client
│   ├── types.ts                 # API types
│   └── endpoints.ts             # API endpoints
│
├── hooks/
│   ├── usePresentations.ts
│   ├── useTemplates.ts
│   ├── useCollaboration.ts
│   ├── useFeatureFlags.ts
│   └── useKeyboardShortcuts.ts
│
├── utils/
│   ├── cn.ts                    # Tailwind class merger
│   ├── formatters.ts            # Date, number formatters
│   ├── validators.ts            # Input validation
│   └── helpers.ts               # General helpers
│
└── constants/
    ├── routes.ts                # Route constants
    ├── features.ts              # Feature definitions
    └── config.ts                # App configuration

/store                           # Zustand stores
├── editorStore.ts
├── userStore.ts
├── featureFlagsStore.ts
└── index.ts

/types                           # TypeScript types
├── presentation.ts
├── slide.ts
├── template.ts
├── collaboration.ts
├── user.ts
└── index.ts

/styles                          # Global styles
├── globals.css
└── themes/
    ├── light.css
    └── dark.css

/public                          # Static assets
├── fonts/
├── images/
└── icons/

/tests                           # Tests
├── unit/
├── integration/
└── e2e/
```

---

## 9. Naming Conventions

### 9.1 File Naming

| Type | Convention | Example |
|------|-----------|---------|
| **Components** | PascalCase | `EditorCanvas.tsx` |
| **Pages (App Router)** | lowercase | `page.tsx` |
| **Layouts** | lowercase | `layout.tsx` |
| **API Routes** | lowercase | `route.ts` |
| **Hooks** | camelCase with `use` prefix | `usePresentations.ts` |
| **Utilities** | camelCase | `formatters.ts` |
| **Types** | camelCase | `presentation.ts` |
| **Stores** | camelCase with `Store` suffix | `editorStore.ts` |
| **Tests** | Match source file + `.test` | `EditorCanvas.test.tsx` |

### 9.2 Variable Naming

```typescript
// Components: PascalCase
const EditorCanvas = () => { /* ... */ };

// Hooks: camelCase with 'use' prefix
const usePresentations = () => { /* ... */ };

// Constants: UPPER_SNAKE_CASE
const MAX_SLIDES = 100;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Functions: camelCase
function formatDate(date: Date): string { /* ... */ }

// Types/Interfaces: PascalCase
interface Presentation { /* ... */ }
type SlideType = 'title' | 'content';

// Boolean variables: 'is', 'has', 'should' prefix
const isLoading = true;
const hasUnsavedChanges = false;
const shouldShowGrid = true;

// Event handlers: 'handle' or 'on' prefix
const handleSave = () => { /* ... */ };
const onSlideClick = (id: string) => { /* ... */ };

// Arrays: plural
const slides = [];
const presentations = [];

// Objects: singular
const presentation = {};
const slide = {};
```

### 9.3 Component Patterns

```typescript
// Feature component naming: Feature + Descriptor
// Good
<TypographyPanel />
<ColorPicker />
<SlideManagerPanel />

// Bad
<Panel />
<Picker />
<Manager />

// Boolean props: 'is', 'has', 'should'
<EditorCanvas
  isGridVisible={true}
  hasUnsavedChanges={false}
  shouldAutoSave={true}
/>

// Event props: 'on' prefix
<SlideCanvas
  onSlideClick={handleSlideClick}
  onSlideUpdate={handleSlideUpdate}
  onElementDrop={handleElementDrop}
/>

// Render props: 'render' prefix
<FeatureFlagGuard
  feature="p1.collaboration"
  renderFallback={() => <UpgradePrompt />}
>
  <CollaborationPanel />
</FeatureFlagGuard>
```

---

## 10. Accessibility Strategy

### 10.1 WCAG 2.1 Compliance Matrix

| Feature | WCAG Level | Requirements | Implementation |
|---------|-----------|--------------|----------------|
| **Color Contrast** | AA (minimum) | 4.5:1 for text, 3:1 for large text | P0.ColorEngine enforces AAA (7:1) |
| **Keyboard Navigation** | A | All interactive elements accessible | Focus management, Tab order |
| **Screen Reader** | A | ARIA labels, roles, descriptions | Semantic HTML, ARIA attributes |
| **Focus Indicators** | AA | Visible focus state | Custom focus rings, skip links |
| **Text Resize** | AA | Readable at 200% zoom | Responsive typography, rem units |
| **Color Independence** | A | Info not conveyed by color alone | Icons, patterns, labels |
| **Alternative Text** | A | All images have alt text | P0.ImageOptimization |
| **Error Identification** | A | Clear error messages | Inline validation, ARIA alerts |

### 10.2 Keyboard Shortcuts

```typescript
// lib/hooks/useKeyboardShortcuts.ts
export const KEYBOARD_SHORTCUTS = {
  // Editor shortcuts
  SAVE: { keys: ['Ctrl', 'S'], action: 'save' },
  UNDO: { keys: ['Ctrl', 'Z'], action: 'undo' },
  REDO: { keys: ['Ctrl', 'Shift', 'Z'], action: 'redo' },
  COPY: { keys: ['Ctrl', 'C'], action: 'copy' },
  PASTE: { keys: ['Ctrl', 'V'], action: 'paste' },
  DELETE: { keys: ['Delete'], action: 'delete' },

  // Slide navigation
  NEXT_SLIDE: { keys: ['ArrowRight'], action: 'nextSlide' },
  PREV_SLIDE: { keys: ['ArrowLeft'], action: 'previousSlide' },
  FIRST_SLIDE: { keys: ['Home'], action: 'firstSlide' },
  LAST_SLIDE: { keys: ['End'], action: 'lastSlide' },

  // Presentation mode
  START_PRESENTATION: { keys: ['F5'], action: 'startPresentation' },
  END_PRESENTATION: { keys: ['Escape'], action: 'endPresentation' },

  // Zoom
  ZOOM_IN: { keys: ['Ctrl', '+'], action: 'zoomIn' },
  ZOOM_OUT: { keys: ['Ctrl', '-'], action: 'zoomOut' },
  ZOOM_RESET: { keys: ['Ctrl', '0'], action: 'zoomReset' },

  // Tools
  TOGGLE_GRID: { keys: ['Ctrl', 'G'], action: 'toggleGrid' },
  TOGGLE_RULERS: { keys: ['Ctrl', 'R'], action: 'toggleRulers' },
  TOGGLE_SIDEBAR: { keys: ['Ctrl', 'B'], action: 'toggleSidebar' },
};

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of Object.values(KEYBOARD_SHORTCUTS)) {
        const matches = shortcut.keys.every(key => {
          if (key === 'Ctrl') return e.ctrlKey || e.metaKey;
          if (key === 'Shift') return e.shiftKey;
          if (key === 'Alt') return e.altKey;
          return e.key === key;
        });

        if (matches) {
          e.preventDefault();
          handlers[shortcut.action]?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
```

### 10.3 Screen Reader Support

```typescript
// components/editor/EditorCanvas.tsx
export function EditorCanvas() {
  const { currentSlide, slides } = useEditorStore();

  return (
    <div
      role="main"
      aria-label="Presentation editor"
      aria-describedby="editor-instructions"
    >
      <div id="editor-instructions" className="sr-only">
        Use arrow keys to navigate slides. Press Enter to select an element. Press Tab to move between elements.
      </div>

      <div
        role="article"
        aria-label={`Slide ${currentSlide + 1} of ${slides.length}`}
        tabIndex={0}
      >
        <SlideCanvas slide={slides[currentSlide]} />
      </div>

      <div role="navigation" aria-label="Slide navigation">
        <button
          onClick={previousSlide}
          aria-label="Previous slide"
          disabled={currentSlide === 0}
        >
          <ChevronLeft />
          <span className="sr-only">Previous</span>
        </button>

        <span aria-live="polite" aria-atomic="true">
          Slide {currentSlide + 1} of {slides.length}
        </span>

        <button
          onClick={nextSlide}
          aria-label="Next slide"
          disabled={currentSlide === slides.length - 1}
        >
          <ChevronRight />
          <span className="sr-only">Next</span>
        </button>
      </div>
    </div>
  );
}
```

### 10.4 Focus Management

```typescript
// lib/hooks/useFocusTrap.ts
export function useFocusTrap(containerRef: RefObject<HTMLElement>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, isActive]);
}
```

---

## 11. Performance Optimization

### 11.1 Performance Budget

| Metric | Target | Maximum | Current |
|--------|--------|---------|---------|
| **Time to Interactive (TTI)** | < 3s | < 5s | TBD |
| **First Contentful Paint (FCP)** | < 1.5s | < 2s | TBD |
| **Largest Contentful Paint (LCP)** | < 2.5s | < 4s | TBD |
| **Cumulative Layout Shift (CLS)** | < 0.1 | < 0.25 | TBD |
| **Total Blocking Time (TBT)** | < 200ms | < 600ms | TBD |
| **Bundle Size (Initial)** | < 200KB | < 300KB | TBD |
| **Bundle Size (Total)** | < 1MB | < 2MB | TBD |

### 11.2 Code Splitting Strategy

```typescript
// app/presentations/[id]/edit/page.tsx
import dynamic from 'next/dynamic';

// Lazy load heavy editor components
const EditorCanvas = dynamic(() => import('@/components/editor/EditorCanvas'), {
  loading: () => <EditorSkeleton />,
  ssr: false, // Disable SSR for editor (client-only)
});

const EditorPropertiesPanel = dynamic(
  () => import('@/components/editor/EditorPropertiesPanel'),
  { loading: () => <Skeleton className="w-80 h-full" /> }
);

// Lazy load P2 features
const ThreeDAnimationsPanel = dynamic(
  () => import('@/components/features/p2/ThreeDAnimations'),
  { loading: () => <LoadingSkeleton /> }
);

const ARPresentationMode = dynamic(
  () => import('@/components/features/p2/ARPresentationMode'),
  { loading: () => <LoadingSkeleton /> }
);
```

### 11.3 Image Optimization

```typescript
// components/slides/SlideCanvas.tsx
import Image from 'next/image';

export function SlideCanvas({ slide }: { slide: Slide }) {
  return (
    <div className="slide-canvas">
      {slide.backgroundImage && (
        <Image
          src={slide.backgroundImage}
          alt={slide.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          quality={85}
          priority={slide.index === 0} // Priority for first slide
          placeholder="blur"
          blurDataURL={slide.blurDataURL}
        />
      )}

      {slide.elements.map(element => {
        if (element.type === 'image') {
          return (
            <Image
              key={element.id}
              src={element.src}
              alt={element.alt}
              width={element.width}
              height={element.height}
              quality={90}
              loading="lazy"
            />
          );
        }
        // ... other elements
      })}
    </div>
  );
}
```

### 11.4 Caching Strategy

```typescript
// lib/api/client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Presentations: Cache for 5 minutes
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,

      // Refetch on window focus for collaboration
      refetchOnWindowFocus: true,

      // Retry failed requests
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Optimistic updates for better UX
      onMutate: async (variables) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries();
      },
    },
  },
});

// Cache keys
export const cacheKeys = {
  presentations: ['presentations'] as const,
  presentation: (id: string) => ['presentations', id] as const,
  templates: ['templates'] as const,
  template: (id: string) => ['templates', id] as const,
  versions: (id: string) => ['presentations', id, 'versions'] as const,
  collaboration: (sessionId: string) => ['collaboration', sessionId] as const,
};
```

---

## 12. Testing Strategy

### 12.1 Testing Pyramid

```
                     ┌─────────┐
                    │   E2E   │  10% - Critical user flows
                    │  Tests  │
                   └───────────┘
                  ┌──────────────┐
                 │  Integration  │  30% - Component integration
                 │     Tests     │
                └────────────────┘
              ┌───────────────────────┐
             │     Unit Tests         │  60% - Component logic
             └───────────────────────┘
```

### 12.2 Unit Tests Example

```typescript
// components/editor/EditorCanvas.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { EditorCanvas } from './EditorCanvas';
import { useEditorStore } from '@/store/editorStore';

describe('EditorCanvas', () => {
  it('renders slide canvas', () => {
    const mockSlide = {
      id: '1',
      title: 'Test Slide',
      elements: [],
    };

    useEditorStore.setState({
      currentSlideIndex: 0,
      slides: [mockSlide],
    });

    render(<EditorCanvas />);

    expect(screen.getByRole('main', { name: /presentation editor/i })).toBeInTheDocument();
  });

  it('navigates to next slide on arrow key', () => {
    const mockSlides = [
      { id: '1', title: 'Slide 1', elements: [] },
      { id: '2', title: 'Slide 2', elements: [] },
    ];

    useEditorStore.setState({
      currentSlideIndex: 0,
      slides: mockSlides,
    });

    render(<EditorCanvas />);

    fireEvent.keyDown(window, { key: 'ArrowRight' });

    expect(useEditorStore.getState().currentSlideIndex).toBe(1);
  });
});
```

### 12.3 Integration Tests Example

```typescript
// tests/integration/presentation-workflow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PresentationEditor } from '@/app/presentations/[id]/edit/page';

describe('Presentation Workflow', () => {
  it('creates new slide and edits content', async () => {
    const user = userEvent.setup();

    render(<PresentationEditor presentationId="test-123" />);

    // Wait for editor to load
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    // Click "Add Slide" button
    const addSlideBtn = screen.getByRole('button', { name: /add slide/i });
    await user.click(addSlideBtn);

    // Verify new slide was added
    expect(screen.getByText(/slide 2 of 2/i)).toBeInTheDocument();

    // Edit slide title
    const titleInput = screen.getByRole('textbox', { name: /slide title/i });
    await user.clear(titleInput);
    await user.type(titleInput, 'New Slide Title');

    // Verify title updated
    expect(titleInput).toHaveValue('New Slide Title');
  });
});
```

### 12.4 E2E Tests Example

```typescript
// tests/e2e/create-presentation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Create Presentation Flow', () => {
  test('user can create presentation from scratch', async ({ page }) => {
    // Navigate to home
    await page.goto('/');

    // Click "Create Presentation"
    await page.getByRole('button', { name: /create presentation/i }).click();

    // Enter topic
    await page.getByLabel(/topic/i).fill('Machine Learning Basics');

    // Select slide count
    await page.getByLabel(/slide count/i).selectOption('10');

    // Submit
    await page.getByRole('button', { name: /generate/i }).click();

    // Wait for generation (might take 30-45s)
    await expect(page.getByText(/generating/i)).toBeVisible();
    await expect(page.getByText(/generating/i)).not.toBeVisible({ timeout: 60000 });

    // Verify redirect to editor
    await expect(page).toHaveURL(/\/presentations\/.*\/edit/);

    // Verify 10 slides created
    await expect(page.getByText(/slide 1 of 10/i)).toBeVisible();
  });
});
```

---

## Appendix A: Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 16.0.0 | React framework with App Router |
| **UI Library** | React | 19.2.0 | Component library |
| **Language** | TypeScript | 5.9.3 | Type safety |
| **Styling** | Tailwind CSS | 4.1.16 | Utility-first CSS |
| **Components** | shadcn/ui | Latest | 57 pre-built components |
| **State Management** | Zustand | 4.x | Global state |
| **Server State** | React Query | 5.x | API caching & sync |
| **Forms** | React Hook Form | 7.x | Form validation |
| **Animations** | Framer Motion | 11.x | Smooth animations |
| **Icons** | Lucide React | 0.548.0 | Icon library |
| **Charts** | Chart.js | 4.5.1 | Data visualization (P0.4) |
| **3D Graphics** | Three.js | 0.160.x | 3D animations (P2.1) |
| **WebXR** | WebXR API | Native | AR mode (P2.2) |
| **Web3** | Web3.js | 4.x | NFT minting (P2.8) |
| **HTTP Client** | Axios | 1.x | API requests |
| **WebSocket** | Native WS | - | Real-time collab (P1.9) |
| **Testing** | Jest + RTL | 29.x + 14.x | Unit tests |
| **E2E Testing** | Playwright | 1.x | End-to-end tests |
| **Linting** | ESLint | 8.x | Code quality |
| **Formatting** | Prettier | 3.x | Code formatting |

---

## Appendix B: Browser Support

| Browser | Minimum Version | P0 Support | P1 Support | P2 Support |
|---------|----------------|------------|------------|------------|
| **Chrome** | 90+ | ✅ Full | ✅ Full | ✅ Full |
| **Firefox** | 88+ | ✅ Full | ✅ Full | ⚠️ Partial (no AR) |
| **Safari** | 15+ | ✅ Full | ✅ Full | ⚠️ Partial (limited 3D) |
| **Edge** | 90+ | ✅ Full | ✅ Full | ✅ Full |
| **Mobile Chrome** | 90+ | ✅ Full | ✅ Full | ⚠️ Partial |
| **Mobile Safari** | 15+ | ✅ Full | ✅ Full | ❌ No AR/3D |

**Notes:**
- P0 features work on all modern browsers
- P1 features work on all browsers except legacy (<2 years old)
- P2 features require cutting-edge browsers:
  - 3D Animations (P2.1): Chrome/Edge/Firefox 90+
  - AR Mode (P2.2): Chrome Android 90+ (WebXR)
  - Blockchain NFT (P2.8): Chrome/Firefox/Brave with Web3 wallet

---

## Appendix C: Deployment Checklist

### Pre-Deployment
- [ ] All TypeScript errors resolved
- [ ] ESLint passes with no errors
- [ ] Unit tests pass (>80% coverage)
- [ ] Integration tests pass
- [ ] E2E tests pass for critical paths
- [ ] Performance budgets met
- [ ] Accessibility audit passes (WCAG AA)
- [ ] Bundle size within budget
- [ ] Environment variables configured

### Deployment
- [ ] Build succeeds (`npm run build`)
- [ ] Static pages generated
- [ ] API routes tested
- [ ] WebSocket connections tested
- [ ] Feature flags verified
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (GA4)
- [ ] CDN configured for static assets

### Post-Deployment
- [ ] Smoke tests pass in production
- [ ] Performance metrics monitored
- [ ] Error rates within SLA
- [ ] User feedback collected
- [ ] Rollback plan tested

---

**Document Status:** ✅ Complete
**Last Updated:** 2025-11-09
**Next Review:** After P0 Feature Integration
**Author:** Frontend Architect

**Approval Required:**
- [ ] Technical Lead
- [ ] UX/UI Designer
- [ ] Accessibility Specialist
- [ ] Product Owner

---

*This architecture is designed to scale from 35 features to 100+ without major refactoring. All patterns follow industry best practices and Next.js 16 conventions.*

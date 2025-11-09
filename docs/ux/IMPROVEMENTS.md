# Actionable UX Improvements - Phase 2B

**Date:** November 9, 2025
**Priority:** CRITICAL → LOW
**Estimated Effort:** 3-5 days for critical issues

---

## Critical Issues (Must Fix Before Production)

### 1. No Icon Toolbar (24 hours)
**Problem:** Features listed vertically in sidebar instead of icon-based toolbar
**Impact:** Wastes screen space, creates visual clutter, poor discoverability

**Fix:**
1. Create horizontal toolbar component at top of canvas
2. Use icon-only buttons with tooltips
3. Group related tools in dropdowns

**Files to Update:**
- `app/presentations/[id]/edit/page.tsx` (entire layout)
- Create: `components/editor/Toolbar.tsx`
- Create: `components/editor/ToolDropdown.tsx`

**Code Example:**
```tsx
// components/editor/Toolbar.tsx
export function EditorToolbar() {
  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 bg-white">
      {/* Layout Group */}
      <ToolDropdown
        icon={<Layout className="w-5 h-5" />}
        label="Layout"
        tooltip="Layout Tools (L)"
      >
        <ToolButton icon={<Grid />} label="Grid" onClick={() => {}} />
        <ToolButton icon={<Type />} label="Typography" onClick={() => {}} />
        <ToolButton icon={<Palette />} label="Colors" onClick={() => {}} />
      </ToolDropdown>

      <Divider />

      {/* Content Group */}
      <ToolDropdown icon={<FileText />} label="Content" tooltip="Content Tools (C)">
        <ToolButton icon={<BarChart3 />} label="Charts" />
        <ToolButton icon={<AlignLeft />} label="Text Overflow" />
        <ToolButton icon={<ImageIcon />} label="Images" />
      </ToolDropdown>

      <Divider />

      {/* AI Tools - Visually Distinct */}
      <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
        <AIToolButton icon={<Sparkles />} label="AI Images" />
        <AIToolButton icon={<Sparkles />} label="AI Quality" />
      </div>

      {/* Right Side */}
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Undo className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Redo className="w-4 h-4" />
        </Button>
        <Button variant="primary">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
}
```

**Before/After:**
- Before: 24 items in vertical list, wastes horizontal space
- After: ~12 visible icons, groups in dropdowns, uses full width efficiently

---

### 2. LLM Features Not Differentiated (8 hours)
**Problem:** AI features (AI Images, Voice Narration, LLM Judge) look identical to manual tools
**Impact:** Users can't distinguish AI-powered features, miss key functionality

**Fix:**
1. Create `AIBadge.tsx` component
2. Add sparkle icons to all AI tools
3. Apply gradient backgrounds to AI panels
4. Add "AI" prefix to labels in toolbar

**Files to Create:**
- `components/ui/AIBadge.tsx`

**Files to Update:**
- `components/features/p1/AIImageGenerator.tsx`
- `components/features/p2/VoiceNarrator.tsx`
- `components/features/p0/ContentQualityPanel.tsx`

**Code:**
```tsx
// components/ui/AIBadge.tsx
export function AIBadge({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-xs font-semibold shadow-lg shadow-purple-500/30 ${className}`}>
      <Sparkles className="w-3 h-3" />
      {children || 'AI POWERED'}
    </div>
  );
}

// Update AIImageGenerator.tsx (line 23-28)
<div className="p-4 space-y-4 relative overflow-hidden">
  {/* Gradient Background */}
  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-blue-50/50 -z-10" />

  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <h3 className="text-lg font-semibold">AI Image Generator</h3>
      <AIBadge />
    </div>
    <Sparkles className="w-5 h-5 text-purple-500" />
  </div>
  {/* ... rest of component */}
</div>

// Update VoiceNarrator.tsx (line 88-92)
<div className="space-y-4 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
  <div className="flex items-center gap-2 justify-between">
    <div className="flex items-center gap-2">
      <Sparkles className="w-5 h-5 text-purple-600" /> {/* Changed from Volume2 */}
      <h3 className="font-semibold text-gray-900">Voice Narration</h3>
    </div>
    <AIBadge>TTS AI</AIBadge>
  </div>
  {/* ... rest */}
</div>

// Update ContentQualityPanel.tsx - Add badge at top
<div className="flex items-center justify-between mb-4">
  <h3 className="text-lg font-semibold">Content Quality</h3>
  <AIBadge>LLM JUDGE</AIBadge>
</div>
```

**Before/After:**
- Before: AI features indistinguishable from manual tools
- After: Sparkle icons, gradient backgrounds, "AI POWERED" badges clearly visible

---

### 3. Toolbar Clutter - 24 Items (12 hours)
**Problem:** 12 P0 + 8 P1 visible + 4 quick links = 24 items overwhelming users
**Impact:** Analysis paralysis, can't find tools quickly, poor UX

**Fix:**
1. Group related tools into dropdowns (max 5-6 items per dropdown)
2. Reduce visible items to 15-18
3. Use progressive disclosure for advanced features

**Recommended Grouping:**
```tsx
// Toolbar Layout (15 visible items)
1. Layout Dropdown (3 items)
   - Grid Layout
   - Typography
   - Colors

2. Content Dropdown (4 items)
   - Charts
   - Text Overflow
   - Images
   - Video Embed

3. Quality Dropdown (3 items)
   - Validation
   - Accessibility
   - Image Optimizer

4. Master Slides (standalone)

5. Transitions (standalone)

6. AI Tools Group (3 items - visually distinct)
   - AI Images
   - Voice Narration
   - AI Quality

7. Export (standalone, primary button)

8. Slide Manager (standalone)

9. Collaboration Dropdown (2 items)
   - Speaker Notes
   - Version History

10. Advanced Dropdown (remaining P1/P2 features)
```

**Files to Update:**
- `app/presentations/[id]/edit/page.tsx`

**Code:**
```tsx
// app/presentations/[id]/edit/page.tsx
const toolbarConfig = {
  main: [
    {
      id: 'layout',
      type: 'dropdown',
      icon: Layout,
      label: 'Layout',
      shortcut: 'L',
      items: [
        { id: 'grid', icon: Layout, label: 'Grid Layout', component: GridLayoutEditor },
        { id: 'typography', icon: Type, label: 'Typography', component: TypographyControls },
        { id: 'colors', icon: Palette, label: 'Colors', component: ColorPaletteSelector },
      ]
    },
    {
      id: 'content',
      type: 'dropdown',
      icon: FileText,
      label: 'Content',
      shortcut: 'C',
      items: [
        { id: 'charts', icon: BarChart3, label: 'Charts', component: ChartInserter },
        { id: 'overflow', icon: AlignLeft, label: 'Text Overflow', component: TextOverflowManager },
        { id: 'images', icon: ImageIcon, label: 'Images', component: ImageOptimizer },
        { id: 'video', icon: Video, label: 'Video', component: VideoEmbedder },
      ]
    },
    // ... continue pattern
  ],
  ai: [
    { id: 'ai-image', icon: Sparkles, label: 'AI Images', component: AIImageGenerator },
    { id: 'ai-voice', icon: Sparkles, label: 'Voice', component: VoiceNarrator },
    { id: 'ai-quality', icon: Sparkles, label: 'Quality', component: ContentQualityPanel },
  ],
  actions: [
    { id: 'export', icon: Download, label: 'Export', component: ExportDialog, primary: true },
  ]
};
```

**Before/After:**
- Before: 24 items, vertical scrolling required
- After: 15 items, no scrolling, clear hierarchy

---

### 4. No Mobile Layout (16 hours)
**Problem:** 3-column layout (sidebar, canvas, panel) breaks on mobile screens
**Impact:** Completely unusable on phones/tablets

**Fix:**
1. Add responsive breakpoints (Tailwind: sm, md, lg)
2. Hamburger menu for left toolbar on mobile
3. Bottom navigation for key actions
4. Full-screen canvas on mobile
5. Slide-up drawer for right panel

**Files to Update:**
- `app/presentations/[id]/edit/page.tsx`
- Create: `components/editor/MobileToolbar.tsx`
- Create: `components/editor/BottomNav.tsx`

**Code:**
```tsx
// app/presentations/[id]/edit/page.tsx
export default function EditorPage({ params }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Desktop Toolbar (hidden on mobile) */}
      <div className="hidden md:block">
        <EditorToolbar />
      </div>

      {/* Mobile Toolbar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-white">
        <button onClick={() => setMobileMenuOpen(true)} className="p-2">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="font-semibold">Presentation</h1>
        <button onClick={() => setMobilePanelOpen(true)} className="p-2">
          <Settings className="w-6 h-6" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="hidden md:block w-64 border-r bg-white">
          {/* Sidebar content */}
        </div>

        {/* Mobile Hamburger Menu */}
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          tools={toolbarConfig}
        />

        {/* Canvas - Full width on mobile */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {/* Slide canvas */}
        </div>

        {/* Desktop Right Panel (hidden on mobile) */}
        {activePanel && (
          <div className="hidden md:block w-96 border-l bg-white">
            {/* Panel content */}
          </div>
        )}

        {/* Mobile Slide-Up Panel */}
        <MobilePanel
          isOpen={mobilePanelOpen}
          onClose={() => setMobilePanelOpen(false)}
          component={ActiveComponent}
        />
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden border-t bg-white">
        <BottomNav
          items={[
            { icon: Layers, label: 'Slides', onClick: () => {} },
            { icon: Plus, label: 'Add', onClick: () => {} },
            { icon: Play, label: 'Present', onClick: () => {} },
            { icon: Share, label: 'Share', onClick: () => {} },
          ]}
        />
      </div>
    </div>
  );
}

// components/editor/MobileMenu.tsx
export function MobileMenu({ isOpen, onClose, tools }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl overflow-y-auto"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-lg">Tools</h2>
              <button onClick={onClose} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Tool groups */}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// components/editor/BottomNav.tsx
export function BottomNav({ items }) {
  return (
    <div className="flex items-center justify-around py-2 safe-area-inset-bottom">
      {items.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          className="flex flex-col items-center gap-1 px-4 py-2 min-w-[64px] touch-target"
        >
          <item.icon className="w-6 h-6 text-gray-600" />
          <span className="text-xs text-gray-600">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
```

**CSS Additions:**
```css
/* tailwind.config.ts - add safe-area support */
.safe-area-inset-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.touch-target {
  min-height: 44px;
  min-width: 44px;
}
```

**Before/After:**
- Before: Unusable on mobile, 3-column layout breaks
- After: Hamburger menu, full-screen canvas, bottom nav, slide-up panels

---

### 5. Color Contrast Violations (4 hours)
**Problem:** Multiple WCAG AA failures (purple-on-purple, gray-on-white)
**Impact:** Accessibility issues, hard to read for users with visual impairments

**Fix:**
1. Run WebAIM Contrast Checker on all text/background combinations
2. Adjust colors to achieve 4.5:1 minimum contrast
3. Create color variables in Tailwind config

**Files to Update:**
- `tailwind.config.ts`
- `components/features/p2/VoiceNarrator.tsx`
- `components/features/p2/ThemesMarketplace.tsx`
- All components with colored text

**Code:**
```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Accessible color system
        primary: {
          50: '#eff6ff',  // Very light blue
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Base blue - use for backgrounds
          600: '#2563eb', // Darker blue - use for text on light backgrounds
          700: '#1d4ed8', // Even darker - use for hover states
          800: '#1e40af',
          900: '#1e3a8a', // Darkest - high contrast
        },
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7', // Base purple
          600: '#9333ea', // Use for text
          700: '#7e22ce', // Darker purple
          800: '#6b21a8',
          900: '#581c87', // Darkest purple
        }
      }
    }
  }
}

// Fix VoiceNarrator.tsx (line 92)
// BEFORE: text-purple-600 on bg-purple-100 (2.8:1 contrast)
<div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
  ⚡ BETA
</div>

// AFTER: (4.52:1 contrast)
<div className="text-xs bg-purple-100 text-purple-900 px-2 py-1 rounded font-semibold">
  ⚡ BETA
</div>

// Fix ThemesMarketplace.tsx (line 46)
// BEFORE: gray text on white (3.2:1)
<button className="bg-gray-100 text-gray-600">

// AFTER: (4.6:1)
<button className="bg-gray-100 text-gray-800">

// Fix disabled states
// BEFORE: opacity-50 on already low-contrast text
<button disabled className="text-gray-600 opacity-50">

// AFTER: Use specific disabled color
<button disabled className="text-gray-400 cursor-not-allowed">
```

**Testing Checklist:**
- [ ] Run WAVE accessibility checker
- [ ] Test with Chrome DevTools Lighthouse
- [ ] Manual test with screen reader (NVDA/JAWS)
- [ ] Verify all text has 4.5:1 minimum contrast
- [ ] Check focus indicators are visible

**Before/After:**
- Before: Purple badge 2.8:1 contrast (FAILS WCAG AA)
- After: Purple badge 4.5:1 contrast (PASSES WCAG AA)

---

## High Priority Issues

### 6. No Visual Hierarchy in Toolbar (8 hours)
**Problem:** All 20 tools have identical button styling, equal visual weight
**Impact:** Users can't quickly identify frequently used or important tools

**Fix:**
1. Make frequently used tools larger (Export, Present)
2. Use primary button style for key actions
3. Dim advanced/rarely used tools
4. Add visual separators between groups

**Files to Update:**
- `components/editor/Toolbar.tsx` (new file)
- `components/ui/Button.tsx` (create variants)

**Code:**
```tsx
// components/ui/Button.tsx
const buttonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  ghost: 'hover:bg-gray-100 text-gray-600',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  ai: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/30',
};

const sizeVariants = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
  xl: 'px-6 py-4 text-lg', // For primary actions
};

// Usage in Toolbar
<Button variant="xl" size="xl" className="ml-auto">
  <Download className="w-5 h-5 mr-2" />
  Export
</Button>

<Button variant="ai" size="md">
  <Sparkles className="w-4 h-4 mr-2" />
  AI Images
</Button>

<Button variant="ghost" size="sm" className="opacity-60">
  <Settings className="w-4 h-4" />
</Button>
```

**Visual Hierarchy Rules:**
1. **Primary actions** (Export, Present): Large, colorful, right side
2. **AI tools**: Gradient background, sparkle icons, grouped together
3. **Frequent tools**: Normal size, tooltips
4. **Advanced tools**: Smaller, lower opacity, in dropdowns
5. **Undo/Redo**: Small ghost buttons near primary actions

**Before/After:**
- Before: All tools same size, can't distinguish important from rarely used
- After: Clear hierarchy - large Export button, grouped AI tools, dimmed advanced features

---

### 7. Missing Micro-Interactions (12 hours)
**Problem:** Instant state changes feel abrupt, no smooth transitions
**Impact:** Interface feels unpolished, lacks "juice"

**Fix:**
1. Add transitions to all interactive elements (200-300ms)
2. Scale buttons on hover (scale: 1.02)
3. Slide-in animation for panels
4. Fade transitions for loading states
5. Bounce animation for success states

**Files to Update:**
- All component files
- Create: `lib/animations.ts` (reusable animation configs)

**Code:**
```tsx
// lib/animations.ts
export const transitions = {
  default: 'transition-all duration-200 ease-in-out',
  fast: 'transition-all duration-150 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',
  bounce: 'transition-all duration-300 ease-bounce',
};

export const animations = {
  scaleOnHover: 'hover:scale-102 active:scale-95',
  fadeIn: 'animate-fade-in',
  slideIn: 'animate-slide-in',
  pulse: 'animate-pulse-once',
};

// tailwind.config.ts - add custom animations
module.exports = {
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'pulse-once': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'scale-up': {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-in-out',
        'slide-in': 'slide-in 300ms ease-out',
        'pulse-once': 'pulse-once 500ms ease-in-out',
        'scale-up': 'scale-up 150ms ease-out',
      },
      scale: {
        '102': '1.02',
      },
    },
  },
};

// Update Button component
<button className={`
  ${transitions.default}
  ${animations.scaleOnHover}
  hover:shadow-md
  active:shadow-sm
  bg-blue-600 hover:bg-blue-700
`}>
  Click me
</button>

// Update Panel opening
<AnimatePresence>
  {activePanel && (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-96 bg-white border-l"
    >
      {/* Panel content */}
    </motion.div>
  )}
</AnimatePresence>

// Update Loading states
<div className="flex items-center gap-2 animate-fade-in">
  <Loader2 className="w-4 h-4 animate-spin" />
  <span className="animate-pulse-once">Loading...</span>
</div>

// Success state animation
<motion.div
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: 'spring', bounce: 0.4 }}
  className="p-3 bg-green-50 border border-green-200 rounded-lg"
>
  <Check className="w-5 h-5 text-green-600" />
  Saved successfully
</motion.div>
```

**Micro-Interaction Checklist:**
- [ ] Button hover: scale(1.02) + shadow increase
- [ ] Button active: scale(0.95)
- [ ] Panel open: slide-in from right (300ms)
- [ ] Panel close: slide-out to right (200ms)
- [ ] Loading: fade-in (200ms)
- [ ] Success: bounce animation (300ms)
- [ ] Error: shake animation (400ms)
- [ ] Tooltip: fade-in + slide-up (150ms)

**Before/After:**
- Before: Instant state changes, no transitions
- After: Smooth 60fps animations, polished feel

---

### 8. No Pages/Slides Component (16 hours)
**Problem:** Only shows "Slide X / 10" with arrows, no visual thumbnails
**Impact:** Can't get overview of presentation, can't reorder slides, poor navigation

**Fix:**
1. Create left sidebar with slide thumbnails
2. Add drag-and-drop reordering
3. Show slide numbers and titles
4. Add duplicate/delete slide actions
5. Highlight current slide

**Files to Create:**
- `components/editor/SlidesPanel.tsx`
- `components/editor/SlideThumbnail.tsx`

**Files to Update:**
- `app/presentations/[id]/edit/page.tsx`

**Code:**
```tsx
// components/editor/SlidesPanel.tsx
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export function SlidesPanel({ slides, currentSlide, onSlideSelect, onReorder, onDuplicate, onDelete }) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(active.id, over.id);
    }
  };

  return (
    <div className="w-64 border-r bg-gray-50 overflow-y-auto">
      <div className="p-3 border-b bg-white flex items-center justify-between">
        <h3 className="font-semibold text-sm">Slides ({slides.length})</h3>
        <button className="p-1.5 hover:bg-gray-100 rounded">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={slides.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="p-2 space-y-2">
            {slides.map((slide, index) => (
              <SlideThumbnail
                key={slide.id}
                slide={slide}
                index={index}
                isActive={currentSlide === index}
                onClick={() => onSlideSelect(index)}
                onDuplicate={() => onDuplicate(slide.id)}
                onDelete={() => onDelete(slide.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// components/editor/SlideThumbnail.tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SlideThumbnail({ slide, index, isActive, onClick, onDuplicate, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slide.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all
        ${isActive ? 'border-blue-600 shadow-lg' : 'border-gray-200 hover:border-blue-300'}
      `}
      onClick={onClick}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 p-1 bg-white/80 rounded cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-3 h-3 text-gray-600" />
      </div>

      {/* Slide Number */}
      <div className="absolute top-1 right-1 px-2 py-0.5 bg-black/70 text-white text-xs font-semibold rounded">
        {index + 1}
      </div>

      {/* Thumbnail */}
      <div className="aspect-video bg-white p-2 text-xs">
        <div className="font-bold text-gray-900 truncate">{slide.title || `Slide ${index + 1}`}</div>
        <div className="text-gray-600 text-[10px] line-clamp-2 mt-1">{slide.content?.substring(0, 60)}</div>
      </div>

      {/* Actions (show on hover) */}
      <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-1 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          className="flex-1 p-1 bg-white/20 hover:bg-white/30 rounded text-white"
          title="Duplicate slide"
        >
          <Copy className="w-3 h-3 mx-auto" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="flex-1 p-1 bg-white/20 hover:bg-red-500 rounded text-white"
          title="Delete slide"
        >
          <Trash className="w-3 h-3 mx-auto" />
        </button>
      </div>

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
      )}
    </div>
  );
}

// Update page.tsx layout
<div className="flex flex-1 overflow-hidden">
  {/* Slides Panel */}
  <SlidesPanel
    slides={presentation.slides}
    currentSlide={currentSlide}
    onSlideSelect={setCurrentSlide}
    onReorder={handleSlideReorder}
    onDuplicate={handleSlideDuplicate}
    onDelete={handleSlideDelete}
  />

  {/* Toolbar */}
  <div className="flex-1 flex flex-col">
    <EditorToolbar />
    {/* Canvas */}
  </div>

  {/* Properties Panel */}
  {activePanel && <PropertiesPanel />}
</div>
```

**Features:**
- Drag-and-drop reordering with @dnd-kit
- Visual thumbnails with slide preview
- Slide numbers and titles
- Duplicate/delete actions on hover
- Active slide highlighting
- Add new slide button

**Before/After:**
- Before: Only text "Slide 3 / 10" with arrows
- After: Visual thumbnails, drag-to-reorder, quick actions

---

### 9. Poor Focus States (4 hours)
**Problem:** Default browser focus ring (blue outline), not branded
**Impact:** Keyboard users have poor experience, accessibility issue

**Fix:**
1. Add custom focus ring styles to all interactive elements
2. Use brand colors (blue/purple)
3. Add focus-within states for containers
4. Ensure focus indicators are visible

**Files to Update:**
- `tailwind.config.ts`
- All button/input components

**Code:**
```ts
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      ringWidth: {
        '3': '3px',
      },
      ringColor: {
        'focus': '#3b82f6', // Blue
        'focus-accent': '#a855f7', // Purple
      },
    },
  },
};

// Global focus styles (app/globals.css)
@layer base {
  /* Remove default focus outline */
  *:focus {
    outline: none;
  }

  /* Custom focus ring for buttons */
  button:focus-visible,
  a:focus-visible {
    @apply ring-2 ring-blue-500 ring-offset-2;
  }

  /* Custom focus ring for inputs */
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible {
    @apply ring-2 ring-blue-500 border-blue-500;
  }

  /* Focus-within for containers */
  [role="group"]:focus-within {
    @apply ring-2 ring-blue-300 ring-offset-2;
  }
}

// Update Button component
<button className="
  px-4 py-2 bg-blue-600 text-white rounded-lg
  hover:bg-blue-700
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  active:scale-95
  transition-all duration-200
">
  Click me
</button>

// Update Input component
<input className="
  w-full px-3 py-2 border border-gray-300 rounded-lg
  focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500
  transition-all duration-200
" />

// AI Button custom focus (purple)
<button className="
  bg-gradient-to-r from-purple-600 to-blue-600
  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
">
  AI Tool
</button>

// Skip link for keyboard navigation
<a
  href="#main-content"
  className="
    sr-only focus:not-sr-only
    focus:absolute focus:top-4 focus:left-4
    focus:z-50 focus:px-4 focus:py-2
    focus:bg-blue-600 focus:text-white focus:rounded-lg
    focus:ring-2 focus:ring-white
  "
>
  Skip to main content
</a>
```

**Testing:**
- [ ] Tab through all interactive elements
- [ ] Verify focus ring is visible on all buttons
- [ ] Check focus ring is visible on inputs
- [ ] Test with keyboard-only navigation (unplug mouse)
- [ ] Verify skip link works (Tab on page load)

**Before/After:**
- Before: Default blue outline, not branded
- After: Blue ring for regular tools, purple ring for AI tools, 2px offset

---

### 10. Inconsistent Spacing (6 hours)
**Problem:** Components use different spacing values (p-3, p-4, irregular gaps)
**Impact:** Feels unpolished, inconsistent rhythm

**Fix:**
1. Standardize to 8px grid (Tailwind: 2, 4, 6, 8, 10, 12, 16)
2. Create spacing tokens
3. Update all components to use consistent padding/margins

**Files to Update:**
- All component files
- Create: `lib/spacing.ts` (spacing constants)

**Code:**
```ts
// lib/spacing.ts
export const spacing = {
  // Padding
  panel: 'p-6',          // All panel containers
  card: 'p-4',           // Card-like components
  section: 'space-y-6',  // Vertical spacing between sections
  tight: 'gap-2',        // Tight flex/grid gaps
  normal: 'gap-4',       // Normal gaps
  loose: 'gap-6',        // Loose gaps

  // Margins
  sectionMargin: 'mb-8', // Between major sections
  elementMargin: 'mb-4', // Between related elements

  // Components
  toolbar: 'px-4 py-3',
  button: 'px-4 py-2',
  input: 'px-3 py-2',
  modal: 'p-6',
};

// Update components to use tokens
// BEFORE (inconsistent)
<div className="p-4 space-y-4">         // AIImageGenerator
<div className="p-4 space-y-4">         // ColorPaletteSelector
<div className="p-4 space-y-4">         // VoiceNarrator
<div className="space-y-6">             // ThemesMarketplace

// AFTER (consistent)
import { spacing } from '@/lib/spacing';

<div className={spacing.panel + ' ' + spacing.section}>  // All panels
<div className={spacing.card + ' ' + spacing.normal}>    // All cards
<button className={spacing.button}>                      // All buttons

// Establish clear hierarchy
Panel Container:      p-6  (24px)
  Section:            space-y-6 (24px vertical)
    Card:             p-4 (16px)
      Element:        mb-4 (16px)
        Input:        px-3 py-2 (12px/8px)
          Icon gap:   gap-2 (8px)
```

**Spacing Rules:**
1. **Panel containers**: p-6 (24px)
2. **Sections**: space-y-6 (24px between)
3. **Cards**: p-4 (16px)
4. **Buttons**: px-4 py-2 (16px/8px)
5. **Inputs**: px-3 py-2 (12px/8px)
6. **Icon gaps**: gap-2 (8px)
7. **Tight spacing**: gap-2 or space-y-2 (8px)
8. **Normal spacing**: gap-4 or space-y-4 (16px)
9. **Loose spacing**: gap-6 or space-y-6 (24px)

**Before/After:**
- Before: Random spacing (p-3, p-4, space-y-3, inconsistent)
- After: Rhythmic 8px grid, consistent feel

---

## Medium Priority Issues

### 11. Inconsistent Button Styles (4 hours)
**Problem:** Mix of button styles (blue, purple, gradient, ghost)
**Impact:** Confusing visual language, unclear hierarchy

**Fix:** Create centralized Button component with variants

```tsx
// components/ui/Button.tsx
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'ai';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  children: React.ReactNode;
  // ... other props
}

export function Button({ variant = 'secondary', size = 'md', icon, children, ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    ghost: 'hover:bg-gray-100 text-gray-600',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ai: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/30',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
    xl: 'px-8 py-4 text-lg gap-3',
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-lg font-medium
        ${variants[variant]}
        ${sizes[size]}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        hover:scale-102 active:scale-95
      `}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

// Usage
<Button variant="primary" size="lg" icon={<Download />}>
  Export
</Button>

<Button variant="ai" icon={<Sparkles />}>
  Generate Image
</Button>

<Button variant="ghost" size="sm">
  Cancel
</Button>
```

### 12. No Empty States with Illustrations (3 hours)
**Problem:** Empty states just show text "No items available"
**Impact:** Feels unpolished, doesn't guide users

**Fix:** Add illustrations and helpful CTAs

```tsx
// components/ui/EmptyState.tsx
export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: {
  icon: React.ComponentType;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 max-w-sm mb-6">{description}</p>
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Usage in TemplateLibrary
{filteredTemplates.length === 0 && (
  <EmptyState
    icon={Search}
    title="No templates found"
    description="Try adjusting your search or filters to find what you're looking for."
    action={{ label: "Clear Filters", onClick: clearFilters }}
  />
)}
```

### 13. Missing Tooltips (4 hours)
**Problem:** No tooltips on toolbar icons
**Impact:** Users don't know what tools do

**Fix:** Add Radix UI Tooltip to all icon buttons

```tsx
import * as Tooltip from '@radix-ui/react-tooltip';

<Tooltip.Provider delayDuration={300}>
  <Tooltip.Root>
    <Tooltip.Trigger asChild>
      <button className="p-2 hover:bg-gray-100 rounded">
        <Layout className="w-5 h-5" />
      </button>
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content
        className="bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg"
        sideOffset={5}
      >
        Grid Layout (Ctrl+G)
        <Tooltip.Arrow className="fill-gray-900" />
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>
```

---

## Low Priority Issues

### 14. No Undo/Redo (8 hours)
**Fix:** Implement command pattern with history stack

### 15. No Keyboard Shortcuts Panel (4 hours)
**Fix:** Create modal showing all shortcuts (Ctrl+/ to open)

### 16. No Dark Mode (12 hours)
**Fix:** Add theme toggle, dark variants for all components

---

## Summary

**Total Estimated Effort:**
- Critical: 84 hours (10.5 days)
- High Priority: 64 hours (8 days)
- Medium Priority: 19 hours (2.5 days)
- Low Priority: 24 hours (3 days)

**Total: 191 hours (24 days) for all improvements**

**Minimum Viable:** Fix critical issues = 84 hours (10.5 days)

**Recommended Approach:**
1. Week 1: Fix #1-5 (critical accessibility and architecture)
2. Week 2: Fix #6-10 (polish and consistency)
3. Week 3: Fix #11-16 (nice-to-haves)

---

**Next Steps:**
1. Review this document with team
2. Prioritize based on business needs
3. Create refined component implementations (see REFINED_COMPONENTS/)
4. Test improvements with users
5. Iterate based on feedback

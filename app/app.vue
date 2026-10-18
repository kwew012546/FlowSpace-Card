<template>
  <NuxtPage :page-key="route => route.fullPath" />
</template>

<script setup>
const { initTheme } = useTheme()
onMounted(() => {
  initTheme()
})
</script>

<style>
/* ==========================================================================
   FlowSpace Design System (Three-Layer Tokens + Light/Dark SaaS Aesthetics)
   Skills Applied: design-system, ui-ux-pro-max, ui-styling
   ========================================================================== */
:root {
  --font-sans: 'Plus Jakarta Sans', 'Noto Sans Thai', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;

  /* Light Mode Semantic Tokens */
  --fs-canvas-from: #f8fafc;
  --fs-canvas-via: #fdfbf7;
  --fs-canvas-to: #f4efe6;
  --fs-surface: rgba(255, 255, 255, 0.88);
  --fs-card: #ffffff;
  --fs-card-subtle: #f8fafc;
  --fs-border: #e2e8f0;
  --fs-border-accent: rgba(245, 158, 11, 0.32);
  --fs-text-primary: #0f172a;
  --fs-text-secondary: #475569;
  --fs-text-muted: #64748b;
  --fs-grid-dot: rgba(148, 163, 184, 0.35);
}

html.dark {
  /* Dark Mode Semantic Tokens (Linear / Raycast Midnight Obsidian + Gold) */
  --fs-canvas-from: #070b14;
  --fs-canvas-via: #0b1120;
  --fs-canvas-to: #0f172a;
  --fs-surface: rgba(15, 23, 42, 0.86);
  --fs-card: #131c2e;
  --fs-card-subtle: #0f172a;
  --fs-border: rgba(51, 65, 85, 0.75);
  --fs-border-accent: rgba(245, 158, 11, 0.35);
  --fs-text-primary: #f8fafc;
  --fs-text-secondary: #cbd5e1;
  --fs-text-muted: #94a3b8;
  --fs-grid-dot: rgba(71, 85, 105, 0.35);
}

html, body {
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background-color 0.25s ease, color 0.2s ease;
}

code, pre, .font-mono {
  font-family: var(--font-mono);
}

/* Unified Dot Grid Canvas Pattern (Adapts automatically to Light & Dark) */
.bg-grid {
  background-image: radial-gradient(var(--fs-grid-dot) 1px, transparent 1px) !important;
  background-size: 24px 24px !important;
}

/* ==========================================================================
   Global Dark Mode Theme Engine for FlowSpace Surfaces & Components
   ========================================================================== */
html.dark body {
  background-color: #070b14;
  color: #f8fafc;
}

/* Page Canvases */
html.dark .from-\[\#fcf8f2\],
html.dark .bg-\[\#f7f2e7\] {
  background-color: #070b14 !important;
  background-image:
    radial-gradient(at 12% 10%, rgba(245, 158, 11, 0.12) 0px, transparent 45%),
    radial-gradient(at 88% 85%, rgba(99, 102, 241, 0.12) 0px, transparent 50%),
    linear-gradient(135deg, #070b14 0%, #0b1120 50%, #0f172a 100%) !important;
  color: #f1f5f9 !important;
}

/* Sticky Headers & Frosted Bars */
html.dark header.bg-\[\#fdfaf5\]\/90,
html.dark header.bg-\[\#fdfaf5\]\/95,
html.dark header.bg-white\/80,
html.dark header.bg-slate-900\/80 {
  background-color: rgba(11, 17, 32, 0.85) !important;
  border-color: rgba(51, 65, 85, 0.75) !important;
  box-shadow: 0 4px 24px -4px rgba(0, 0, 0, 0.5) !important;
}

/* Primary Cards, Modals, Columns & Containers */
html.dark .bg-\[\#fdfaf5\],
html.dark .bg-\[\#fdfaf5\]\/95,
html.dark .bg-\[\#fdfaf5\]\/90,
html.dark .bg-white\/85,
html.dark .bg-white\/80,
html.dark .bg-white\/90 {
  background-color: rgba(19, 28, 46, 0.92) !important;
  border-color: rgba(51, 65, 85, 0.8) !important;
  color: #f1f5f9 !important;
}

html.dark .bg-white {
  background-color: #162033 !important;
  border-color: rgba(51, 65, 85, 0.85) !important;
  color: #f1f5f9 !important;
}

/* Subtle Secondary Surfaces & Chips */
html.dark .bg-stone-50,
html.dark .bg-stone-50\/80,
html.dark .bg-stone-50\/50,
html.dark .bg-stone-50\/40,
html.dark .bg-\[\#f5ecdc\],
html.dark .bg-\[\#f3e9d7\] {
  background-color: #0f172a !important;
  border-color: rgba(51, 65, 85, 0.8) !important;
  color: #e2e8f0 !important;
}

html.dark .bg-stone-100,
html.dark .bg-stone-200\/70,
html.dark .bg-stone-200\/60,
html.dark .bg-stone-200\/80,
html.dark .bg-stone-200 {
  background-color: #1e293b !important;
  border-color: rgba(71, 85, 105, 0.6) !important;
  color: #cbd5e1 !important;
}

/* Inputs, Selects & Textareas in Dark Mode */
html.dark input:not([type="checkbox"]):not([type="radio"]):not([type="color"]),
html.dark select,
html.dark textarea {
  background-color: #0b1120 !important;
  border-color: rgba(71, 85, 105, 0.75) !important;
  color: #f8fafc !important;
}

html.dark input::placeholder,
html.dark textarea::placeholder {
  color: #64748b !important;
}

html.dark input:focus:not([type="checkbox"]):not([type="radio"]),
html.dark select:focus,
html.dark textarea:focus {
  border-color: #f59e0b !important;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2) !important;
}

/* Typography Hierarchy in Dark Mode */
html.dark .text-stone-900,
html.dark .text-stone-800,
html.dark .text-amber-950 {
  color: #f8fafc !important;
}

html.dark .text-stone-700,
html.dark .text-stone-600,
html.dark .text-amber-900 {
  color: #cbd5e1 !important;
}

html.dark .text-stone-500,
html.dark .text-stone-400 {
  color: #94a3b8 !important;
}

html.dark .text-amber-800,
html.dark .text-amber-700 {
  color: #fbbf24 !important;
}

/* Accent & Status Surfaces in Dark Mode */
html.dark .bg-amber-50,
html.dark .bg-amber-50\/90,
html.dark .bg-amber-50\/80,
html.dark .bg-amber-50\/60,
html.dark .bg-amber-50\/50,
html.dark .bg-amber-100,
html.dark .bg-amber-100\/90,
html.dark .bg-amber-100\/80 {
  background-color: rgba(245, 158, 11, 0.14) !important;
  border-color: rgba(245, 158, 11, 0.32) !important;
  color: #fde68a !important;
}

html.dark .bg-emerald-50,
html.dark .bg-emerald-50\/90,
html.dark .bg-emerald-100 {
  background-color: rgba(16, 185, 129, 0.14) !important;
  border-color: rgba(16, 185, 129, 0.32) !important;
  color: #6ee7b7 !important;
}

html.dark .bg-rose-50,
html.dark .bg-rose-50\/90,
html.dark .bg-rose-100 {
  background-color: rgba(244, 63, 94, 0.14) !important;
  border-color: rgba(244, 63, 94, 0.32) !important;
  color: #fda4af !important;
}

/* Borders & Dividers in Dark Mode */
html.dark .border-amber-100,
html.dark .border-amber-100\/80,
html.dark .border-amber-100\/90,
html.dark .border-amber-200,
html.dark .border-amber-200\/60,
html.dark .border-amber-200\/70,
html.dark .border-amber-200\/80,
html.dark .border-amber-200\/90,
html.dark .border-stone-100,
html.dark .border-stone-100\/80,
html.dark .border-stone-200,
html.dark .border-stone-200\/60,
html.dark .border-stone-200\/80,
html.dark .border-stone-200\/90 {
  border-color: rgba(51, 65, 85, 0.75) !important;
}

html.dark .divide-stone-100 > :not([hidden]) ~ :not([hidden]) {
  border-color: rgba(51, 65, 85, 0.6) !important;
}

/* Hover States in Dark Mode */
html.dark .hover\:bg-stone-50:hover,
html.dark .hover\:bg-stone-50\/60:hover,
html.dark .hover\:bg-amber-50:hover,
html.dark .hover\:bg-amber-50\/50:hover,
html.dark .hover\:bg-amber-50\/60:hover {
  background-color: rgba(30, 41, 59, 0.9) !important;
}

/* Custom Scrollbar for Kanban Columns & Modals */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.4);
  border-radius: 9999px;
}
html.dark ::-webkit-scrollbar-thumb {
  background: rgba(71, 85, 105, 0.6);
}
</style>
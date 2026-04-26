# Kidpen Spark of Joy v2.0 — Design System Extraction

**Source**: `kidpen-space` prototype — `globals.css`, `tailwind.config.ts`, `page.tsx`, `worklog.md`
**Date**: 2026-04-26
**Design philosophy**: "Spark of Joy" — warm, playful, Thai-culturally appropriate, accessibility-first

---

## Typography

### Font Stack

| Role | Font Family | Usage |
|------|------------|-------|
| **Display / Headlines** | Outfit, Nunito, sans-serif | h1-h6, `.font-display`, titles, cards |
| **Body** | IBM Plex Sans Thai, Noto Sans Thai, Sarabun, system-ui | Body text, paragraphs, labels, UI |
| **Monospace** | JetBrains Mono, monospace | Code blocks, math notation, formulas |

### Thai Text Styling

```css
.thai-text {
  line-height: 1.8;
  letter-spacing: 0.01em;
}
```

- Body line-height: 1.6
- Thai line-height: 1.8 (increased for readability of tone marks and complex characters)

---

## Color System

### Brand Palette

| Token | Hex | Role |
|-------|-----|------|
| **Brand Gold** | `#F5A623` | Primary CTAs, active states, brand identity |
| **Brand Gold Light** | `#FFF0D4` | Gold tints, hover backgrounds |
| **Brand Gold Dark** | `#C47A06` | Active/pressed gold states |
| **Warm Cream** | `#FFFCF7` | Background (light mode) |
| **Cream Dark** | `#F5F0E8` | Muted backgrounds |

### Light Mode CSS Variables

```css
:root {
  --background: #FFFCF7;          /* Warm cream */
  --foreground: #1A1B2E;          /* Deep navy */
  --card: #FFFFFF;
  --card-foreground: #1A1B2E;
  --primary: #F5A623;             /* Brand Gold */
  --primary-foreground: #FFFFFF;
  --secondary: #FFF0D4;           /* Gold tint */
  --secondary-foreground: #7A4B00;
  --muted: #FFF8EF;
  --muted-foreground: #5C5E7A;
  --accent: #FFE4A8;
  --accent-foreground: #7A4B00;
  --destructive: #EF4444;
  --border: rgba(0,0,0,0.08);
  --input: rgba(0,0,0,0.08);
  --ring: #F5A623;                /* Brand Gold focus ring */
}
```

### Dark Mode CSS Variables

```css
.dark {
  --background: #0F1019;          /* Deep dark blue-black */
  --foreground: #F0F1F5;
  --card: #252740;
  --card-foreground: #F0F1F5;
  --primary: #FFB940;             /* Warmer gold for dark */
  --primary-foreground: #1A1B2E;
  --secondary: #2D2F48;
  --secondary-foreground: #FFD166;
  --muted: #1F2133;
  --muted-foreground: #A8AABE;
  --accent: #2D2F48;
  --accent-foreground: #FFD166;
  --destructive: #F87171;
  --border: rgba(255,255,255,0.08);
  --input: rgba(255,255,255,0.08);
  --ring: #FFB940;
}
```

---

## Subject Color Worlds (5 + Data)

Each subject has a distinct color identity used for gradients, badges, icons, and UI accents.

| Subject | Primary Color | Hex | Emotion/Theme |
|---------|-------------|-----|---------------|
| **Math** | Confident Blue | `#2563EB` | Trust, logic, clarity |
| **Physics** | Energetic Orange | `#F97316` | Energy, motion, excitement |
| **Chemistry** | Living Green | `#10B981` | Growth, reactions, life |
| **Biology** | Creative Purple | `#8B5CF6` | Wonder, complexity, nature |
| **CS/Coding** | Creative Purple | `#8B5CF6` | Innovation, creativity (shares biology) |
| **Data** | Curious Teal | `#14B8A6` | Insight, discovery, patterns |

### Subject Color Scales

Each subject has a full 50-800 scale defined as CSS custom properties:

```
--color-math-50: #EEF4FF    → --color-math-800: #1E3A8A
--color-science-50: #ECFDF5 → --color-science-800: #065F46
--color-coding-50: #F5F3FF  → --color-coding-800: #5B21B6
--color-physics-50: #FFF7ED → --color-physics-800: #9A3412
--color-data-50: #F0FDFA    → --color-data-800: #115E59
```

### Subject Background Gradients

```css
/* Math */
from-blue-50/60 via-indigo-50/40 to-blue-50/60
dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-blue-950/30

/* Physics */
from-orange-50/60 via-amber-50/40 to-orange-50/60
dark:from-orange-950/30 dark:via-amber-950/20 dark:to-orange-950/30

/* Chemistry */
from-emerald-50/60 via-green-50/40 to-emerald-50/60
dark:from-emerald-950/30 dark:via-green-950/20 dark:to-emerald-950/30

/* Biology */
from-violet-50/60 via-purple-50/40 to-violet-50/60
dark:from-violet-950/30 dark:via-purple-950/20 dark:to-violet-950/30
```

### Role Colors

| Role | Color | Emoji |
|------|-------|-------|
| Student | `#F97316` (Orange) | 🧑‍🎓 |
| Teacher | `#22C55E` (Green) | 👨‍🏫 |
| Parent | `#A855F7` (Purple) | 👩 |
| Admin | `#06B6D4` (Cyan) | 🧑‍💼 |
| Super Admin | `#EF4444` (Red) | 🚀 |

---

## Border Radius Scale

```
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
--radius-xl: 20px
--radius-2xl: 24px
--radius-3xl: 32px
--radius-pill: 999px
```

Design favors rounded, friendly shapes consistent with education/children's UX.

---

## Animation System

### Design Principles

1. **Joyful but not distracting** — Micro-interactions enhance delight without overwhelming
2. **Reduced motion first** — All animations respect `prefers-reduced-motion: reduce`
3. **Staggered entrances** — List items animate with progressive delays (60-80ms)
4. **Subject-specific** — Animations can carry subject color identity

### Key Animation Patterns

| Animation | Purpose | Timing |
|-----------|---------|--------|
| `fade-in-up` | View/content entrance | opacity 0→1, translateY(20→0) |
| `slide-in-right` | Toast/message entrance | opacity 0→1, translateX(20→0) |
| `bounce-in` | Celebration/achievement | scale 0.3→1.05→0.9→1 |
| `float` | Ambient decoration | translateY(0→-10→0) loop |
| `pulse-glow` | Attention/CTA | box-shadow pulse |
| `typing-dot` | AI thinking indicator | 3-dot bounce stagger |
| `widget-gold-sweep` | Card hover highlight | Gold gradient sweep across card |
| `quiz-card-enter` | Quiz card stagger | 80ms delay per card |
| `toast-slide-in` | Toast notification | Slide from right edge |
| `ripple-expand` | Button click feedback | Circular wave expansion |
| `level-up` | Level celebration | Confetti + scale animation |

### Reduced Motion Policy

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

All 1,011 @keyframes are disabled under reduced-motion preference.

---

## Component Patterns

### Cards

- Glass morphism effect: `backdrop-filter: blur()` + semi-transparent backgrounds
- Hover: `translateY(-3px)` + `scale(1.005)` + layered shadows
- Active: Golden border glow (`0 0 0 3px rgba(245, 166, 35, 0.5)`)
- Subject-accent variants: Colored top border + subject gradient background

### Buttons

- Primary: Orange-to-gold gradient + shadow + hover lift
- Ripple: Circular wave animation on click
- Loading: Hidden text + shimmer overlay + spinner
- Ghost: Transparent → gold hover background
- Touch targets: 44px minimum

### Input Fields

- Focus: Gradient ring + glow via `::after` pseudo-element with blur
- Float labels: Smooth transition upward on focus/content
- Error: Shake animation + red focus ring + error message fade-in
- Success: Green border + checkmark pop
- Mobile: 16px font-size to prevent iOS zoom

### Toast Notifications

- Position: Fixed top-right, stacked with gap
- Entrance: Slide-in from right
- Exit: Slide-out + opacity fade
- Variants: Success (green), Error (red), Info (blue), Warning (amber)
- Auto-dismiss: Progress bar animation (4s/5s/7s durations)

### Scrollbars

- Chat: 3-4px, hidden until hover, warm gold color
- Sidebar: 3px minimal
- Content: 6px with transparent border gap
- All: Firefox `scrollbar-width` support + dark mode variants

---

## Mobile Patterns

### Bottom Navigation

- 6 tabs (Home, Ask AI, Progress, Settings, Profile, More)
- Fixed bottom with `backdrop-filter: blur()` glass morphism
- Active indicator: Dot + icon bounce animation
- Safe area: `padding-bottom: max(0.375rem, env(safe-area-inset-bottom))`

### Responsive Breakpoints

- 480px: Small mobile
- 640px: Large mobile / small tablet
- 768px: Tablet (sidebar collapses)
- 1024px: Desktop (full sidebar)

### Mobile-Specific Patterns

- Sidebar as slide-over drawer (Sheet component)
- "More" menu as bottom sheet drawer
- Horizontal scroll with `scroll-snap` for card carousels
- Input font-size 16px prevention for iOS zoom
- Landscape adjustments

---

## Accessibility

- Reduced motion fully respected
- Focus-visible outlines on all interactive elements
- Thai language line-height optimization
- Skip-link for keyboard navigation
- Semantic heading hierarchy
- Color contrast: Gold on white may need attention for WCAG AA (4.5:1). Dark mode has better contrast.

---

## Design Tokens Summary

| Token Category | Count |
|---------------|-------|
| CSS custom properties | 100+ |
| @keyframes | 1,011 |
| Subject color scales | 5 × 8 shades |
| Role colors | 5 |
| Border radius tokens | 6 |
| Responsive breakpoints | 4 |
| Animation patterns | 10+ categories |
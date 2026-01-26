# Visual Design Standards for BMAD-CYBER2 Documentation
*Professional UI/UX Presentation Guidelines*

*Version 1.0 | January 2026 | Sally (UX Designer)*

---

## 🎨 Design Philosophy: "Professional Intuition"

Our visual design creates **trust through clarity**—every visual choice builds confidence in both the platform's capabilities and the user's ability to succeed. We combine enterprise-grade professionalism with approachable, human-centered design.

### Core Design Principles

1. **Clarity Over Cleverness**: Information is always more important than decoration
2. **Progressive Sophistication**: Simple entry points that scale to expert complexity
3. **Consistent Excellence**: Every touchpoint reinforces professional credibility
4. **Accessible Beauty**: Stunning design that works for everyone
5. **Purposeful Motion**: Animations guide and delight, never distract

---

## 🌈 Complete Color System

### Primary Brand Palette

```css
:root {
  /* Core Brand Colors */
  --bmad-primary: #1a365d;        /* Deep Navy - Trust, Stability */
  --bmad-secondary: #2d3748;      /* Dark Gray - Professional Balance */
  --bmad-accent: #3182ce;         /* Professional Blue - Action, Reliability */
  --bmad-accent-light: #63b3ed;   /* Light Blue - Hover States */
  --bmad-accent-dark: #2c5aa0;    /* Dark Blue - Active States */

  /* System Colors */
  --success: #38a169;             /* Forest Green - Completion */
  --success-light: #68d391;       /* Light Green - Success States */
  --success-dark: #2f855a;        /* Dark Green - Success Emphasis */

  --warning: #d69e2e;             /* Amber - Caution */
  --warning-light: #f6e05e;       /* Light Amber - Warning Background */
  --warning-dark: #b7791f;        /* Dark Amber - Warning Emphasis */

  --danger: #e53e3e;              /* Red - Critical/Urgent */
  --danger-light: #fc8181;        /* Light Red - Error Background */
  --danger-dark: #c53030;         /* Dark Red - Critical Emphasis */

  --info: #3182ce;                /* Blue - Information */
  --info-light: #90cdf4;          /* Light Blue - Info Background */
  --info-dark: #2c5aa0;           /* Dark Blue - Info Emphasis */
}
```

### Team-Specific Color Palette

```css
:root {
  /* Module Identity Colors */
  --cybersec-primary: #c53030;    /* Security Red - Urgency, Protection */
  --cybersec-secondary: #feb2b2;   /* Light Red - Background Use */
  --cybersec-accent: #9b2c2c;     /* Dark Red - Emphasis */

  --intel-primary: #2b6cb0;       /* Intelligence Blue - Analysis, Depth */
  --intel-secondary: #bee3f8;     /* Light Blue - Background Use */
  --intel-accent: #2c5aa0;        /* Dark Blue - Emphasis */

  --strategy-primary: #805ad5;    /* Strategic Purple - Planning, Vision */
  --strategy-secondary: #d6bcfa;   /* Light Purple - Background Use */
  --strategy-accent: #6b46c1;     /* Dark Purple - Emphasis */

  --legal-primary: #d69e2e;       /* Legal Gold - Authority, Compliance */
  --legal-secondary: #faf089;     /* Light Gold - Background Use */
  --legal-accent: #b7791f;        /* Dark Gold - Emphasis */

  --development-primary: #38a169; /* Development Green - Growth, Building */
  --development-secondary: #9ae6b4; /* Light Green - Background Use */
  --development-accent: #2f855a;  /* Dark Green - Emphasis */
}
```

### Semantic Color Applications

```css
/* State Colors */
.status-active { color: var(--success); }
.status-pending { color: var(--warning); }
.status-error { color: var(--danger); }
.status-info { color: var(--info); }

/* Module-Specific Theming */
.cybersec-theme {
  --primary: var(--cybersec-primary);
  --secondary: var(--cybersec-secondary);
  --accent: var(--cybersec-accent);
}

.intel-theme {
  --primary: var(--intel-primary);
  --secondary: var(--intel-secondary);
  --accent: var(--intel-accent);
}

.strategy-theme {
  --primary: var(--strategy-primary);
  --secondary: var(--strategy-secondary);
  --accent: var(--strategy-accent);
}

.legal-theme {
  --primary: var(--legal-primary);
  --secondary: var(--legal-secondary);
  --accent: var(--legal-accent);
}

.development-theme {
  --primary: var(--development-primary);
  --secondary: var(--development-secondary);
  --accent: var(--development-accent);
}
```

### Neutral Gray Scale

```css
:root {
  /* Comprehensive Gray Scale */
  --gray-50: #f7fafc;   /* Backgrounds, subtle highlights */
  --gray-100: #edf2f7;  /* Card backgrounds, containers */
  --gray-200: #e2e8f0;  /* Borders, dividers, inactive elements */
  --gray-300: #cbd5e0;  /* Form borders, disabled text */
  --gray-400: #a0aec0;  /* Placeholder text, secondary borders */
  --gray-500: #718096;  /* Secondary text, icons */
  --gray-600: #4a5568;  /* Primary text, important icons */
  --gray-700: #2d3748;  /* Headers, emphasis text */
  --gray-800: #1a202c;  /* High emphasis, dark theme backgrounds */
  --gray-900: #171923;  /* Maximum contrast, headers */
}

/* Semantic Applications */
.text-primary { color: var(--gray-700); }
.text-secondary { color: var(--gray-500); }
.text-tertiary { color: var(--gray-400); }
.text-emphasis { color: var(--gray-900); }

.bg-subtle { background-color: var(--gray-50); }
.bg-muted { background-color: var(--gray-100); }
.bg-elevated { background-color: var(--gray-200); }

.border-subtle { border-color: var(--gray-200); }
.border-default { border-color: var(--gray-300); }
.border-emphasis { border-color: var(--gray-400); }
```

---

## 🔤 Typography System

### Font Stack Selection

```css
:root {
  /* Primary Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'Fira Code', 'SF Mono', Monaco, 'Cascadia Code', monospace;
  --font-serif: Georgia, 'Times New Roman', serif; /* For documentation quotes */

  /* Font Weights */
  --font-thin: 100;
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  --font-black: 900;
}
```

### Type Scale & Hierarchy

```css
/* Harmonious Type Scale (1.25 - Major Third) */
:root {
  --text-xs: 0.75rem;     /* 12px - Captions, metadata, timestamps */
  --text-sm: 0.875rem;    /* 14px - Secondary text, labels */
  --text-base: 1rem;      /* 16px - Body text, primary content */
  --text-lg: 1.125rem;    /* 18px - Subheadings, callouts */
  --text-xl: 1.25rem;     /* 20px - Section headers */
  --text-2xl: 1.5rem;     /* 24px - Page headers */
  --text-3xl: 1.875rem;   /* 30px - Hero headings */
  --text-4xl: 2.25rem;    /* 36px - Display headings */
  --text-5xl: 3rem;       /* 48px - Hero displays */
  --text-6xl: 3.75rem;    /* 60px - Marketing headers */

  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;   /* Headers, tight spacing */
  --leading-snug: 1.375;   /* Subheadings */
  --leading-normal: 1.5;   /* Body text */
  --leading-relaxed: 1.625; /* Long-form content */
  --leading-loose: 2;      /* Spacious layouts */
}
```

### Typography Classes

```css
/* Header Styles */
.text-display {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--gray-900);
  letter-spacing: -0.025em;
}

.text-heading {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--gray-800);
}

.text-subheading {
  font-size: var(--text-xl);
  font-weight: var(--font-medium);
  line-height: var(--leading-snug);
  color: var(--gray-700);
}

/* Body Text Styles */
.text-body {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--gray-600);
}

.text-body-lg {
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--gray-600);
}

.text-caption {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--gray-500);
}

/* Code and Technical Text */
.text-code {
  font-family: var(--font-mono);
  font-size: 0.875em;
  background: var(--gray-100);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  color: var(--gray-700);
}

.text-code-block {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  background: var(--gray-800);
  color: var(--gray-100);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}
```

---

## 📏 Spacing & Layout System

### Consistent Spacing Scale

```css
:root {
  /* 8px Base Unit Scale */
  --space-0: 0;
  --space-px: 1px;
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
  --space-24: 6rem;    /* 96px */
  --space-32: 8rem;    /* 128px */
  --space-40: 10rem;   /* 160px */
  --space-48: 12rem;   /* 192px */
  --space-56: 14rem;   /* 224px */
  --space-64: 16rem;   /* 256px */
}
```

### Layout Specifications

```css
/* Content Width Constraints */
:root {
  --content-narrow: 42rem;   /* 672px - Optimal reading width */
  --content-medium: 56rem;   /* 896px - Form layouts */
  --content-wide: 72rem;     /* 1152px - Dashboard layouts */
  --content-full: 100%;      /* Full width layouts */

  /* Container Sizes */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1536px;
}

/* Layout Components */
.container {
  width: 100%;
  margin: 0 auto;
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}

@media (min-width: 640px) { .container { max-width: 640px; } }
@media (min-width: 768px) { .container { max-width: 768px; } }
@media (min-width: 1024px) { .container { max-width: 1024px; } }
@media (min-width: 1280px) { .container { max-width: 1280px; } }

.content-area {
  max-width: var(--content-narrow);
  margin: 0 auto;
  padding: var(--space-6);
}

.sidebar-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-8);
  min-height: 100vh;
}

@media (max-width: 1024px) {
  .sidebar-layout {
    grid-template-columns: 1fr;
  }
}
```

### Border Radius System

```css
:root {
  /* Border Radius Scale */
  --radius-none: 0;
  --radius-sm: 0.125rem;    /* 2px - Small elements */
  --radius-base: 0.25rem;   /* 4px - Buttons, badges */
  --radius-md: 0.375rem;    /* 6px - Input fields */
  --radius-lg: 0.5rem;      /* 8px - Cards, containers */
  --radius-xl: 0.75rem;     /* 12px - Major containers */
  --radius-2xl: 1rem;       /* 16px - Feature cards */
  --radius-full: 50%;       /* Circular elements */
}
```

---

## 🎛️ Component Design System

### Button Components

```css
/* Base Button Styles */
.btn-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-medium);
  line-height: 1;
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  transition: all 150ms ease;
  cursor: pointer;
  white-space: nowrap;
}

/* Button Sizes */
.btn-xs {
  font-size: var(--text-xs);
  padding: var(--space-1) var(--space-2);
  min-height: 1.5rem;
}

.btn-sm {
  font-size: var(--text-sm);
  padding: var(--space-2) var(--space-3);
  min-height: 2rem;
}

.btn-md {
  font-size: var(--text-base);
  padding: var(--space-3) var(--space-4);
  min-height: 2.5rem;
}

.btn-lg {
  font-size: var(--text-lg);
  padding: var(--space-4) var(--space-6);
  min-height: 3rem;
}

/* Button Variants */
.btn-primary {
  background-color: var(--bmad-accent);
  color: white;
  border-color: var(--bmad-accent);
}

.btn-primary:hover {
  background-color: var(--bmad-accent-dark);
  border-color: var(--bmad-accent-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(49, 130, 206, 0.3);
}

.btn-secondary {
  background-color: white;
  color: var(--bmad-accent);
  border-color: var(--bmad-accent);
}

.btn-secondary:hover {
  background-color: var(--bmad-accent);
  color: white;
}

.btn-ghost {
  background-color: transparent;
  color: var(--gray-600);
  border-color: transparent;
}

.btn-ghost:hover {
  background-color: var(--gray-100);
  color: var(--gray-700);
}
```

### Card Components

```css
.card {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-xl);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 200ms ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--gray-200);
}

.card-body {
  padding: var(--space-6);
}

.card-footer {
  padding: var(--space-6);
  border-top: 1px solid var(--gray-200);
  background: var(--gray-50);
}

/* Card Variants */
.card-module {
  position: relative;
  overflow: visible;
}

.card-module::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary, var(--bmad-accent));
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.card-feature {
  background: linear-gradient(135deg, var(--gray-50) 0%, white 100%);
  border: 2px solid var(--gray-200);
}

.card-testimonial {
  background: var(--info-light);
  border-color: var(--info);
  color: var(--info-dark);
}
```

### Form Components

```css
/* Input Base Styles */
.input {
  appearance: none;
  background: white;
  border: 2px solid var(--gray-300);
  border-radius: var(--radius-md);
  color: var(--gray-700);
  font-size: var(--text-base);
  line-height: 1.5;
  padding: var(--space-3) var(--space-4);
  transition: all 150ms ease;
  width: 100%;
}

.input:focus {
  border-color: var(--bmad-accent);
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  outline: none;
}

.input::placeholder {
  color: var(--gray-400);
}

/* Input Sizes */
.input-sm {
  font-size: var(--text-sm);
  padding: var(--space-2) var(--space-3);
}

.input-lg {
  font-size: var(--text-lg);
  padding: var(--space-4) var(--space-6);
}

/* Input States */
.input-error {
  border-color: var(--danger);
}

.input-error:focus {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.input-success {
  border-color: var(--success);
}

/* Label Styles */
.label {
  color: var(--gray-700);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-bottom: var(--space-2);
  display: block;
}

.label-required::after {
  content: ' *';
  color: var(--danger);
}
```

---

## 🎭 State & Feedback Design

### Loading States

```css
/* Skeleton Loaders */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--gray-200) 0%,
    var(--gray-300) 50%,
    var(--gray-200) 100%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-base);
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-text {
  height: 1rem;
  margin: var(--space-2) 0;
}

.skeleton-text:last-child {
  width: 60%;
}

.skeleton-title {
  height: 1.5rem;
  margin-bottom: var(--space-4);
}

/* Progress Indicators */
.progress-bar {
  background: var(--gray-200);
  border-radius: var(--radius-full);
  height: 8px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  background: var(--bmad-accent);
  border-radius: var(--radius-full);
  height: 100%;
  transition: width 300ms ease;
}

.progress-indeterminate .progress-fill {
  animation: progress-indeterminate 2s linear infinite;
  width: 30%;
}

@keyframes progress-indeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}

/* Spinner Component */
.spinner {
  border: 2px solid var(--gray-300);
  border-top: 2px solid var(--bmad-accent);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### Alert & Notification Components

```css
.alert {
  border: 1px solid;
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.alert-success {
  background: rgba(56, 161, 105, 0.1);
  border-color: var(--success);
  color: var(--success-dark);
}

.alert-warning {
  background: rgba(214, 158, 46, 0.1);
  border-color: var(--warning);
  color: var(--warning-dark);
}

.alert-error {
  background: rgba(229, 62, 62, 0.1);
  border-color: var(--danger);
  color: var(--danger-dark);
}

.alert-info {
  background: rgba(49, 130, 206, 0.1);
  border-color: var(--info);
  color: var(--info-dark);
}

.alert-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-1);
}

.alert-description {
  font-size: var(--text-sm);
  opacity: 0.9;
}
```

### Status Indicators

```css
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-active {
  background: rgba(56, 161, 105, 0.1);
  color: var(--success-dark);
}

.status-pending {
  background: rgba(214, 158, 46, 0.1);
  color: var(--warning-dark);
}

.status-error {
  background: rgba(229, 62, 62, 0.1);
  color: var(--danger-dark);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
```

---

## 🎬 Animation & Motion Design

### Animation Principles

1. **Purposeful**: Every animation serves a functional purpose
2. **Smooth**: 60fps performance across all devices
3. **Subtle**: Enhances without overwhelming
4. **Accessible**: Respects prefers-reduced-motion
5. **Contextual**: Appropriate for the interaction type

### Timing Functions

```css
:root {
  /* Easing Functions */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0.0, 1, 1);
  --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);

  /* Custom Eases */
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  --ease-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Duration Scale */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  --duration-slower: 500ms;
}
```

### Hover Animations

```css
.hover-lift {
  transition: transform var(--duration-normal) var(--ease-out);
}

.hover-lift:hover {
  transform: translateY(-2px);
}

.hover-scale {
  transition: transform var(--duration-fast) var(--ease-out);
}

.hover-scale:hover {
  transform: scale(1.02);
}

.hover-glow {
  transition: box-shadow var(--duration-normal) var(--ease-out);
}

.hover-glow:hover {
  box-shadow: 0 0 20px rgba(49, 130, 206, 0.3);
}
```

### Page Transitions

```css
.page-enter {
  opacity: 0;
  transform: translateY(10px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity var(--duration-normal) var(--ease-out),
              transform var(--duration-normal) var(--ease-out);
}

.slide-in-from-right {
  animation: slideInFromRight var(--duration-normal) var(--ease-out);
}

@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### Loading Animations

```css
.pulse {
  animation: pulse 2s var(--ease-in-out) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.fade-in {
  animation: fadeIn var(--duration-slow) var(--ease-out);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.stagger-children > * {
  animation: fadeInUp var(--duration-normal) var(--ease-out);
  animation-fill-mode: both;
}

.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 50ms; }
.stagger-children > *:nth-child(3) { animation-delay: 100ms; }
.stagger-children > *:nth-child(4) { animation-delay: 150ms; }
.stagger-children > *:nth-child(5) { animation-delay: 200ms; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Accessibility Considerations

```css
/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .skeleton {
    background: var(--gray-300);
  }
}
```

---

## 📱 Responsive Design Standards

### Mobile-First Breakpoint System

```css
:root {
  /* Breakpoints */
  --bp-xs: 320px;   /* Small phones */
  --bp-sm: 480px;   /* Large phones */
  --bp-md: 768px;   /* Tablets */
  --bp-lg: 1024px;  /* Laptops */
  --bp-xl: 1280px;  /* Desktops */
  --bp-2xl: 1536px; /* Large displays */
}

/* Mobile First Media Queries */
/* Base styles apply to mobile */

@media (min-width: 480px) {
  /* Large phones and up */
  .container { padding-left: var(--space-6); padding-right: var(--space-6); }
}

@media (min-width: 768px) {
  /* Tablets and up */
  .grid-responsive { grid-template-columns: repeat(2, 1fr); }
  .text-responsive { font-size: var(--text-lg); }
}

@media (min-width: 1024px) {
  /* Laptops and up */
  .grid-responsive { grid-template-columns: repeat(3, 1fr); }
  .sidebar-layout { grid-template-columns: 280px 1fr; }
}

@media (min-width: 1280px) {
  /* Desktops and up */
  .grid-responsive { grid-template-columns: repeat(4, 1fr); }
  .content-wide { max-width: var(--content-wide); }
}
```

### Touch-Friendly Design

```css
/* Minimum Touch Target Sizes */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Mobile Navigation */
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid var(--gray-200);
  padding: var(--space-2);
  display: flex;
  justify-content: space-around;
}

@media (min-width: 768px) {
  .mobile-nav {
    display: none;
  }
}

/* Swipe Gestures */
.swipeable {
  touch-action: pan-y pinch-zoom;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.swipeable > * {
  scroll-snap-align: start;
}
```

---

## 🎨 Icon System

### Icon Guidelines

```css
/* Consistent Icon Sizing */
.icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
  fill: currentColor;
}

.icon-xs { font-size: 0.75rem; }
.icon-sm { font-size: 1rem; }
.icon-md { font-size: 1.25rem; }
.icon-lg { font-size: 1.5rem; }
.icon-xl { font-size: 2rem; }

/* Icon Colors */
.icon-primary { color: var(--bmad-accent); }
.icon-success { color: var(--success); }
.icon-warning { color: var(--warning); }
.icon-danger { color: var(--danger); }
.icon-muted { color: var(--gray-400); }
```

### Module-Specific Icons

```css
/* Team Identity Icons */
.icon-cybersec { color: var(--cybersec-primary); }
.icon-intel { color: var(--intel-primary); }
.icon-strategy { color: var(--strategy-primary); }
.icon-legal { color: var(--legal-primary); }
.icon-development { color: var(--development-primary); }

/* Status Icons */
.icon-active {
  color: var(--success);
  animation: pulse 2s ease-in-out infinite;
}

.icon-warning {
  color: var(--warning);
  animation: attention 3s ease-in-out infinite;
}

@keyframes attention {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

---

## 🏗️ Layout Templates

### Page Layout Structure

```html
<!-- Standard Documentation Page -->
<div class="page-layout">
  <header class="page-header">
    <nav class="nav-primary">
      <!-- Primary navigation -->
    </nav>
  </header>

  <div class="page-content">
    <aside class="sidebar">
      <!-- Secondary navigation -->
    </aside>

    <main class="main-content">
      <article class="content-area">
        <!-- Main content -->
      </article>
    </main>

    <aside class="page-toc">
      <!-- Table of contents -->
    </aside>
  </div>

  <footer class="page-footer">
    <!-- Footer content -->
  </footer>
</div>
```

```css
.page-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-header {
  background: white;
  border-bottom: 1px solid var(--gray-200);
  position: sticky;
  top: 0;
  z-index: 50;
}

.page-content {
  flex: 1;
  display: grid;
  grid-template-columns: 280px 1fr 240px;
  gap: var(--space-8);
  max-width: 1440px;
  margin: 0 auto;
  padding: var(--space-8);
}

@media (max-width: 1024px) {
  .page-content {
    grid-template-columns: 1fr;
    padding: var(--space-4);
  }

  .sidebar,
  .page-toc {
    display: none;
  }
}

.main-content {
  min-width: 0; /* Prevent grid overflow */
}

.content-area {
  max-width: var(--content-narrow);
  margin: 0 auto;
}
```

---

## ♿ Accessibility Standards Implementation

### Focus Management

```css
/* Enhanced Focus Indicators */
*:focus {
  outline: 3px solid var(--bmad-accent);
  outline-offset: 2px;
  border-radius: var(--radius-base);
}

/* Skip Links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--bmad-accent);
  color: white;
  padding: 8px;
  text-decoration: none;
  transition: top 0.3s;
  z-index: 100;
}

.skip-link:focus {
  top: 6px;
}

/* Focus Trap for Modals */
.modal[aria-hidden="true"] {
  display: none;
}

.modal[aria-hidden="false"] {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}
```

### Screen Reader Optimization

```css
/* Screen Reader Only Content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Live Region Styling */
.live-region {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

/* High Contrast Support */
@media (prefers-contrast: high) {
  :root {
    --gray-200: #000000;
    --gray-300: #000000;
    --gray-600: #000000;
    --gray-700: #000000;
  }

  .card {
    border: 2px solid;
  }

  button {
    border: 2px solid;
  }
}
```

---

## 📊 Performance Standards

### CSS Optimization

```css
/* CSS Performance Best Practices */

/* Use will-change sparingly */
.animated-element {
  will-change: transform;
}

.animation-complete {
  will-change: auto;
}

/* Optimize reflows/repaints */
.transform-only {
  /* Use transform and opacity for animations */
  transform: translateZ(0); /* Create compositing layer */
}

/* Efficient selectors */
.specific-class {
  /* Avoid deep nesting */
  /* Use specific classes over complex selectors */
}

/* Minimize font loading impact */
@font-face {
  font-family: 'Inter';
  font-display: swap; /* Show fallback while loading */
  src: url('/fonts/inter.woff2') format('woff2');
}
```

### Critical CSS Strategy

```css
/* Inline Critical CSS */
/* Above-the-fold styles should be inlined */

/* Base typography and layout */
body {
  font-family: var(--font-sans);
  line-height: var(--leading-normal);
  color: var(--gray-600);
}

/* Essential layout */
.header,
.nav,
.main {
  /* Critical layout styles only */
}

/* Load non-critical CSS asynchronously */
/* <link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'"> */
```

---

## 🔍 Quality Assurance Checklist

### Visual Design QA

- [ ] **Color contrast** meets WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large)
- [ ] **Typography scales** appropriately across all breakpoints
- [ ] **Spacing consistency** follows the defined scale system
- [ ] **Component variants** maintain visual hierarchy and brand consistency
- [ ] **Hover and focus states** provide clear interactive feedback
- [ ] **Loading states** prevent layout shift and maintain user context
- [ ] **Error states** provide helpful guidance without blame
- [ ] **Success states** celebrate user achievements appropriately

### Responsive Design QA

- [ ] **Mobile navigation** works intuitively with touch gestures
- [ ] **Touch targets** meet minimum 44px size requirements
- [ ] **Content adaptation** maintains readability across screen sizes
- [ ] **Performance** remains smooth on lower-end devices
- [ ] **Orientation changes** handled gracefully
- [ ] **Zoom levels** up to 200% maintain usability

### Animation QA

- [ ] **Performance** maintains 60fps across all target devices
- [ ] **Reduced motion** preferences respected with appropriate fallbacks
- [ ] **Animation purpose** enhances rather than distracts from content
- [ ] **Duration and easing** feel natural and professional
- [ ] **Loading animations** prevent perceived performance issues

### Accessibility QA

- [ ] **Keyboard navigation** complete and logical throughout interface
- [ ] **Screen reader** compatibility verified with actual assistive technology
- [ ] **Focus management** appropriate for single-page applications
- [ ] **Color dependency** avoided for conveying critical information
- [ ] **Alternative text** provided for all informational images
- [ ] **Form labels** properly associated with their input fields
- [ ] **Error announcements** accessible to assistive technology users

---

## 🚀 Implementation Guidelines

### CSS Architecture

```
styles/
├── base/
│   ├── reset.css
│   ├── typography.css
│   └── layout.css
├── components/
│   ├── buttons.css
│   ├── cards.css
│   ├── forms.css
│   └── navigation.css
├── utilities/
│   ├── spacing.css
│   ├── colors.css
│   └── responsive.css
├── themes/
│   ├── light.css
│   ├── dark.css
│   └── high-contrast.css
└── main.css
```

### CSS Custom Properties Strategy

```css
/* Layer custom properties for maintainability */
:root {
  /* Design tokens (primitive values) */
  --color-blue-500: #3182ce;
  --space-4: 1rem;
  --font-weight-medium: 500;

  /* Semantic tokens (meaning-based) */
  --color-primary: var(--color-blue-500);
  --space-button-padding: var(--space-4);
  --font-weight-button: var(--font-weight-medium);

  /* Component tokens (component-specific) */
  --button-background: var(--color-primary);
  --button-padding: var(--space-button-padding);
  --button-font-weight: var(--font-weight-button);
}
```

### Component Development Workflow

1. **Design Review**: Ensure component meets visual standards
2. **Accessibility Check**: Verify keyboard and screen reader support
3. **Responsive Testing**: Test across all supported breakpoints
4. **Performance Validation**: Check animation performance and paint times
5. **Documentation**: Update component library with usage examples
6. **User Testing**: Validate with actual users before production deployment

---

## 📈 Success Metrics for Visual Design

### Quantitative Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Visual Design Rating** | >4.2/5.0 | User satisfaction surveys |
| **First Contentful Paint** | <1.5s | Web Vitals monitoring |
| **Time to Interactive** | <3.0s | Performance monitoring |
| **Cumulative Layout Shift** | <0.1 | Core Web Vitals |
| **Color Contrast Compliance** | 100% | Automated accessibility testing |

### Qualitative Metrics

- **Brand Perception**: Professional, trustworthy, innovative
- **User Confidence**: Users feel capable and supported
- **Task Completion**: Smooth, efficient workflows
- **Emotional Response**: Positive, engaging, memorable
- **Accessibility Feedback**: Inclusive, barrier-free experience

---

## 🔮 Future Evolution

### Emerging Design Trends

- **Advanced Color Systems**: P3 color gamut support for modern displays
- **Variable Fonts**: Optimize typography performance and expressiveness
- **CSS Container Queries**: Component-based responsive design
- **CSS Houdini**: Custom CSS properties and paint worklets
- **Design Tokens**: Automated design system maintenance

### Scalability Considerations

- **Component Versioning**: Manage design system evolution
- **Theme Variants**: Support for custom organizational branding
- **Performance Budgets**: Maintain speed as design complexity grows
- **Accessibility Advances**: Stay ahead of evolving WCAG standards
- **International Design**: Support for RTL languages and cultural adaptations

---

## 🎯 Conclusion: Visual Excellence Standards

This visual design system creates a foundation for exceptional user experiences that build trust, reduce cognitive load, and empower users to accomplish their goals efficiently. Every visual choice serves both aesthetic and functional purposes, creating a cohesive system that scales elegantly across the entire BMAD-CYBER2 documentation ecosystem.

**The experience we deliver:**
- **Professional confidence** through consistent, polished design
- **Cognitive ease** through clear visual hierarchy and familiar patterns
- **Inclusive access** through thoughtful accessibility implementations
- **Delightful interactions** through purposeful animation and feedback
- **Scalable consistency** through systematic design token architecture

**Ready to transform documentation design from functional to exceptional.**

---

*This visual design system ensures every user interaction with BMAD-CYBER2 documentation reinforces the platform's enterprise-grade quality while remaining approachable and empowering for users at every skill level.*
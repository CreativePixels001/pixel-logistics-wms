# 🎨 Pixel Ecosystem Design System

**Version:** 1.0.0  
**Last Updated:** 11 December 2025  
**Status:** Production Ready

A comprehensive, modern design system for all Pixel Ecosystem frontend applications.

---

## 📦 What's Included

### 1. **Design Tokens** (`styles/design-tokens.css`)
- Complete CSS custom properties
- Color palette (primary, neutral, semantic)
- Typography system
- Spacing scale
- Border radius
- Shadows
- Transitions & animations
- Z-index layers
- Dark mode support

### 2. **Tailwind Configuration** (`tailwind.config.js`)
- Extended Tailwind theme
- Custom colors matching design tokens
- Font families (Inter, JetBrains Mono, Clash Display)
- Custom animations
- Plugin support (forms, typography, aspect-ratio, container-queries)

### 3. **Component Library** (`components/`)
- Reusable React components
- Fully typed with TypeScript
- Accessible (WCAG 2.1 AA)
- Responsive
- Dark mode compatible

---

## 🎨 Design Philosophy

### Modern & Professional
- Clean, minimal interfaces inspired by Dribbble/UI8
- Ample white space
- Consistent visual hierarchy
- Micro-interactions for better UX

### Accessibility First
- Semantic HTML
- Keyboard navigation
- Screen reader support
- High contrast ratios
- Focus indicators

### Performance Optimized
- Minimal CSS bundle
- Tree-shakable components
- Lazy loading support
- Optimized animations

---

## 🚀 Getting Started

### Installation

```bash
# Navigate to any Pixel Ecosystem module
cd frontend/[module-name]

# Install dependencies
npm install

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer

# Install Tailwind plugins
npm install -D @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio @tailwindcss/container-queries

# Install React dependencies (if using React)
npm install react react-dom

# Install Next.js (if building new module)
npx create-next-app@latest
```

### Configuration

1. **Copy Tailwind config:**
```bash
cp ../shared/tailwind.config.js ./tailwind.config.js
```

2. **Import design tokens in your CSS:**
```css
@import '../shared/styles/design-tokens.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

3. **Import shared components:**
```javascript
import { Button, Card, Input } from '../shared/components';
```

---

## 🎨 Color Palette

### Primary Brand Colors
```
Primary 500: #0ea5e9 (Sky Blue)
Primary 600: #0284c7 (Deep Sky)
Primary 700: #0369a1 (Ocean Blue)
```

### Neutral Colors
```
Neutral 0: #ffffff (Pure White)
Neutral 50: #fafafa (Off White)
Neutral 100-900: Gray scale
Neutral 950: #0a0a0a (Near Black)
```

### Semantic Colors
- **Success:** Green (#22c55e)
- **Warning:** Amber (#f59e0b)
- **Error:** Red (#ef4444)
- **Info:** Blue (#3b82f6)

---

## 📐 Typography

### Font Families
- **Sans-serif:** Inter (UI text)
- **Monospace:** JetBrains Mono (code)
- **Display:** Clash Display (headings)

### Font Sizes
```
xs:   12px
sm:   14px
base: 16px
lg:   18px
xl:   20px
2xl:  24px
3xl:  30px
4xl:  36px
5xl:  48px
6xl:  60px
7xl:  72px
```

### Font Weights
- Light: 300
- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## 📏 Spacing Scale

```
1:  4px
2:  8px
3:  12px
4:  16px
5:  20px
6:  24px
8:  32px
10: 40px
12: 48px
16: 64px
20: 80px
24: 96px
32: 128px
```

---

## 🎯 Components

### Available Components

#### Basic Components
- ✅ Button (primary, secondary, outline, ghost)
- ✅ Input (text, email, password, number)
- ✅ Textarea
- ✅ Select / Dropdown
- ✅ Checkbox
- ✅ Radio Button
- ✅ Switch / Toggle
- ✅ Badge
- ✅ Avatar
- ✅ Chip / Tag

#### Layout Components
- ✅ Card
- ✅ Container
- ✅ Grid
- ✅ Stack
- ✅ Divider
- ✅ Spacer

#### Navigation
- ✅ Navbar
- ✅ Sidebar
- ✅ Breadcrumb
- ✅ Tabs
- ✅ Pagination
- ✅ Steps / Stepper

#### Feedback
- ✅ Alert
- ✅ Toast / Notification
- ✅ Modal / Dialog
- ✅ Popover
- ✅ Tooltip
- ✅ Progress Bar
- ✅ Spinner / Loader
- ✅ Skeleton

#### Data Display
- ✅ Table (sortable, filterable)
- ✅ List
- ✅ Empty State
- ✅ Stat Card
- ✅ Timeline

#### Charts (using Recharts)
- ✅ Line Chart
- ✅ Bar Chart
- ✅ Area Chart
- ✅ Pie Chart
- ✅ Donut Chart

---

## 🌓 Dark Mode

### Implementation

```javascript
// Toggle dark mode
function toggleDarkMode() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// Initialize theme
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}
```

### Usage in Components

```jsx
<div className="bg-neutral-0 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">
  Content adapts to theme
</div>
```

---

## 📱 Responsive Design

### Breakpoints
```
sm:  640px  (Mobile landscape)
md:  768px  (Tablet)
lg:  1024px (Desktop)
xl:  1280px (Large desktop)
2xl: 1536px (Extra large)
```

### Mobile-First Approach
```jsx
<div className="w-full md:w-1/2 lg:w-1/3">
  Responsive width
</div>
```

---

## ✨ Animations

### Built-in Animations
- `animate-fade-in` - Fade in
- `animate-slide-in-up` - Slide from bottom
- `animate-slide-in-down` - Slide from top
- `animate-scale-in` - Scale up
- `animate-pulse-subtle` - Gentle pulse
- `animate-shimmer` - Loading shimmer

### Usage
```jsx
<div className="animate-fade-in">
  Fades in smoothly
</div>
```

---

## 🎭 Design Patterns

### Card Pattern
```jsx
<div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
  <h3 className="text-xl font-semibold mb-2">Title</h3>
  <p className="text-neutral-600 dark:text-neutral-400">Content</p>
</div>
```

### Glass Effect
```jsx
<div className="glass-effect rounded-2xl p-6">
  Glassmorphism effect
</div>
```

### Hover Lift
```jsx
<button className="hover-lift rounded-lg p-4 bg-primary-500">
  Lifts on hover
</button>
```

---

## 🧩 Component Usage Examples

### Button Component

```jsx
import { Button } from '@/shared/components/Button';

// Primary button
<Button variant="primary" size="md">
  Click me
</Button>

// Secondary with icon
<Button variant="secondary" leftIcon={<IconCheck />}>
  Saved
</Button>

// Loading state
<Button loading disabled>
  Saving...
</Button>
```

### Input Component

```jsx
import { Input } from '@/shared/components/Input';

<Input
  type="email"
  label="Email Address"
  placeholder="you@example.com"
  error="Invalid email format"
  required
/>
```

### Card Component

```jsx
import { Card } from '@/shared/components/Card';

<Card
  title="Dashboard Stats"
  subtitle="Last 30 days"
  footer={<Button>View Details</Button>}
>
  <p>Card content here</p>
</Card>
```

---

## 📂 File Structure

```
frontend/shared/
├── components/
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Card.jsx
│   ├── Modal.jsx
│   ├── Table.jsx
│   └── ... (more components)
├── hooks/
│   ├── useTheme.js
│   ├── useMediaQuery.js
│   └── useLocalStorage.js
├── utils/
│   ├── cn.js (className utility)
│   ├── formatters.js
│   └── validators.js
├── constants/
│   ├── routes.js
│   └── config.js
├── styles/
│   ├── design-tokens.css
│   └── globals.css
└── tailwind.config.js
```

---

## 🔧 Utility Functions

### className Utility (cn)
```javascript
import { cn } from '@/shared/utils/cn';

<div className={cn(
  'base-classes',
  condition && 'conditional-class',
  'always-applied'
)} />
```

### Format Utilities
```javascript
import { formatDate, formatCurrency } from '@/shared/utils/formatters';

formatDate('2025-12-11') // "Dec 11, 2025"
formatCurrency(1234.56)  // "$1,234.56"
```

---

## 🎯 Best Practices

### Component Structure
```jsx
// 1. Imports
import React from 'react';
import { cn } from '@/shared/utils/cn';

// 2. Types (if TypeScript)
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

// 3. Component
export const Button = ({ children, variant = 'primary' }: ButtonProps) => {
  return (
    <button className={cn(
      'base-styles',
      variant === 'primary' && 'primary-styles',
      variant === 'secondary' && 'secondary-styles'
    )}>
      {children}
    </button>
  );
};
```

### Styling Best Practices
1. Use Tailwind classes first
2. Extract repeated patterns into components
3. Use design tokens for consistency
4. Keep responsive design mobile-first
5. Test dark mode thoroughly

---

## 🚀 Next Steps

1. **Choose your module** (e.g., WMS, PixelCloud, PixelNotes)
2. **Set up React/Next.js** (if not already)
3. **Copy shared configuration**
4. **Import design system**
5. **Start building components**
6. **Reference this documentation**

---

## 📚 Resources

### Design Inspiration
- [Dribbble](https://dribbble.com/tags/dashboard)
- [UI8](https://ui8.net)
- [Behance](https://behance.net)

### Component Libraries (Reference)
- [shadcn/ui](https://ui.shadcn.com)
- [Headless UI](https://headlessui.com)
- [Radix UI](https://radix-ui.com)

### Documentation
- [Tailwind CSS](https://tailwindcss.com)
- [React](https://react.dev)
- [Next.js](https://nextjs.org)

---

## 📞 Support

For questions or issues with the design system:
- Check this documentation
- Review component examples
- Ask the Frontend Development Agent

---

**Built with ❤️ for Pixel Ecosystem**  
Version 1.0.0 | December 2025

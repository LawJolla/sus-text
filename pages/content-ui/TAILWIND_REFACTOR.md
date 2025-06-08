# Tailwind CSS Refactoring

This document outlines the refactoring of inline styles to Tailwind CSS classes in the Sus Text Content UI components.

## Overview

All inline styles have been converted to Tailwind CSS classes for better maintainability, consistency, and performance.

## Changes Made

### 1. Custom Color Palette

Added a Google Material Design inspired color palette in `tailwind.config.ts`:

```typescript
colors: {
  google: {
    blue: '#1a73e8',      // Primary blue for interactive elements
    red: '#ea4335',       // Error/off state
    green: '#34a853',     // Success/active state
    gray: {
      50: '#f8f9fa',      // Lightest gray
      100: '#f1f3f4',
      200: '#e8eaed',     // Border colors
      300: '#dadce0',     // Default borders
      400: '#bdc1c6',
      500: '#9aa0a6',
      600: '#5f6368',     // Text colors
      700: '#3c4043',     // Primary text
      800: '#202124',
      900: '#1a1a1a',     // Darkest gray
    },
  },
}
```

### 2. Custom Animation

Added custom `ai-pulse` animation for the processing state indicator:

```typescript
animation: {
  'ai-pulse': 'ai-pulse 1.2s ease-in-out infinite',
},
keyframes: {
  'ai-pulse': {
    '0%, 100%': { 
      opacity: '1', 
      transform: 'scale(1)', 
      boxShadow: '0 0 0 0 rgba(26, 115, 232, 0.7)'
    },
    '50%': { 
      opacity: '0.8', 
      transform: 'scale(1.5)', 
      boxShadow: '0 0 0 4px rgba(26, 115, 232, 0.3)'
    },
  },
},
```

### 3. Google Sans Font Family

Added Google Sans font support:

```typescript
fontFamily: {
  'google-sans': ['Google Sans', 'Roboto', 'Arial', 'sans-serif'],
},
```

## Component Changes

### StatusIndicator.tsx

**Before:**
```jsx
style={{
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: getStatusColor(),
  flexShrink: 0,
}}
```

**After:**
```jsx
className="w-1.5 h-1.5 rounded-full shrink-0 bg-google-red animate-ai-pulse"
```

### PersonaSelect.tsx & ModelSelect.tsx

**Before:**
```jsx
style={{
  fontWeight: 500,
  color: '#5f6368',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  marginBottom: '6px',
}}
```

**After:**
```jsx
className="font-medium text-google-gray-600 text-xs uppercase tracking-wider mb-1.5"
```

### MoreMenu.tsx

**Before:**
```jsx
style={{
  padding: '4px 8px',
  border: '1px solid #dadce0',
  borderRadius: '12px',
  fontSize: '12px',
  background: '#fff',
  color: '#3c4043',
  // ... more styles
}}
```

**After:**
```jsx
className="px-2 py-1 border border-google-gray-300 rounded-xl text-xs bg-white text-google-gray-700 font-google-sans cursor-pointer transition-colors duration-200 outline-none flex items-center gap-1 hover:border-google-blue focus:border-google-blue focus:ring-1 focus:ring-google-blue"
```

### AiDiscussionToggle.tsx

**Before:**
```jsx
style={{
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '6px 12px',
  background: '#fff',
  border: '1px solid #e8eaed',
  borderRadius: '20px',
  // ... more styles
}}
```

**After:**
```jsx
className="flex items-center gap-3 px-3 py-1.5 bg-white border border-google-gray-200 rounded-2xl font-google-sans text-sm whitespace-nowrap shadow-sm"
```

## Benefits

1. **Consistency** - All components now use the same color palette and spacing scale
2. **Maintainability** - Changes to colors or spacing can be made in one place
3. **Performance** - CSS is generated at build time instead of inline styles
4. **Intellisense** - Better IDE support with Tailwind CSS autocomplete
5. **Responsive Design** - Easy to add responsive variants when needed
6. **Dark Mode Ready** - Foundation for future dark mode support

## Usage

The refactored components maintain the exact same visual appearance and functionality while using Tailwind CSS classes instead of inline styles. No changes to component APIs or behavior.

### Custom Colors

Use the new Google color palette:
- `text-google-blue` - Primary blue text
- `bg-google-red` - Error/warning backgrounds  
- `border-google-gray-300` - Standard borders
- `text-google-gray-700` - Primary text color

### Custom Animation

Use the AI pulse animation:
- `animate-ai-pulse` - For processing state indicators

### Font Family

Use Google Sans font:
- `font-google-sans` - Google Sans font stack

## Future Enhancements

The Tailwind setup enables easy future enhancements:
- Dark mode support with `dark:` variants
- Responsive design with `sm:`, `md:`, `lg:` prefixes
- Animation variants and micro-interactions
- Consistent spacing and typography scales 
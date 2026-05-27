---
title: Customising Lipi
description: Learn how to customize Lipi themes, typography, and appearance.
published: 2026-05-22
tags:
  - themes
  - customization
  - design
---

Lipi ships with a lightweight theme system built around CSS variables.

## Theme Modes

Lipi supports:

- light mode
- dark mode
- system preference detection

Theme preference is automatically persisted using localStorage.

## Enabling Theme Toggle

Inside `lipi.config.ts`:

```ts
showThemeToggle: true
```

## Disabling Theme Toggle

```ts
showThemeToggle: false
```

## Theme Variables

Colors are controlled through CSS variables:

```css
:root {
  --background: #F5F4ED;
  --foreground: #22201C;
  --accent: #7B5C42;
}
```

## Creating a Custom Theme

Create a new theme section:

```css
[data-theme="forest"] {
  --background: #F3F5EF;
  --foreground: #1D241B;
  --accent: #5A7A57;
}
```

## Typography

Lipi uses:

- Noto Serif for content
- Noto Sans for interface elements

These can be replaced with any web font.

## Minimal Styling Philosophy

Lipi avoids:

- heavy gradients
- glassmorphism
- large shadows
- excessive motion

The focus remains on reading comfort and typography.

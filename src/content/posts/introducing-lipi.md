---
title: Introducing Lipi
description: A minimal editorial theme for Astro focused on typography, chronology, and longform publishing.
published: 2026-05-26
tags:
  - astro
  - themes
  - publishing
  - typography
---

Lipi is a minimal editorial theme for Astro built for writers, developers, and publishers who prefer calm interfaces over noisy layouts.

Instead of cards, dashboards, and content-heavy grids, Lipi focuses on:

- typography-first reading
- lightweight performance
- chronological publishing
- restrained interactions
- markdown-native workflows

The design philosophy behind Lipi is simple: writing should remain the primary interface.

---

## Why Lipi?

Many modern blog themes optimize for:

- engagement widgets
- content discovery
- visual density
- app-like interactions

Lipi intentionally moves in the opposite direction.

It is designed for:

- essays
- travel writing
- developer journals
- notes
- digital publications
- personal archives

## Core Features

- Astro + Tailwind CSS v4
- Light and dark themes
- Timeline-based post feed
- Minimal archive view
- Responsive editorial layout
- Shiki syntax highlighting
- Markdown and MDX support
- Reading progress indicator
- Dynamic OG image support
- RSS and sitemap ready

## Design Principles

Lipi tries to stay:

- calm
- minimal
- literary
- filesystem-oriented
- dependency-light

The theme avoids:

- excessive animations
- card-heavy layouts
- dashboard aesthetics
- documentation-style complexity

## Built for Markdown

Content in Lipi lives inside the filesystem and uses Astro content collections.

Example structure:

```txt
src/content/posts/
├── introducing-lipi.md
├── _2026/
│   └── japan-beyond-places.md
└── notes/
    └── building-quiet-software.md
```

Folders beginning with `_` are ignored while generating URLs.

## Final Thoughts

Lipi is intentionally small in scope.

It does not try to become a CMS, page builder, or documentation framework.

It is simply a quiet publishing system for people who enjoy writing.

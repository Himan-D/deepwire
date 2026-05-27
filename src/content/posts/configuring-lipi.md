---
title: Configuring Lipi
description: Learn how to configure Lipi using lipi.config.ts.
published: 2026-05-24
tags:
  - configuration
  - astro
  - guide
---

Lipi uses a single configuration file named `lipi.config.ts`.

This file controls:

- site metadata
- navigation
- social links
- theme preferences
- pagination
- SEO defaults

## Example Configuration

```ts
export const siteConfig = {
  title: "Lipi",
  description: "A minimal editorial theme",
  url: "https://example.com",
  author: "Your Name",
  lang: "en",
  theme: {
    default: "system",
  },
  postsPerPage: 10,
};
```

## Available Options

| Option | Type | Description |
|---|---|---|
| title | string | Website title |
| description | string | Default site description |
| url | string | Canonical website URL |
| author | string | Author name |
| lang | string | Default language |
| postsPerPage | number | Pagination size |
| showThemeToggle | boolean | Enable theme switcher |
| showReadingTime | boolean | Show reading time in posts |
| social | array | Social profile links |
| navigation | array | Header navigation items |

## Editing Values

Open:

```txt
src/lipi.config.ts
```

and modify the exported configuration object.

Changes are reflected automatically during development.

## Navigation Example

```ts
navigation: [
  {
    title: "Posts",
    href: "/posts",
  },
  {
    title: "About",
    href: "/about",
  },
]
```

## Social Links Example

```ts
social: [
  {
    title: "GitHub",
    url: "https://github.com/example",
  },
]
```

## Final Notes

Lipi intentionally keeps configuration simple and centralized.

Most customizations can be handled through:

- configuration
- markdown content
- CSS variables

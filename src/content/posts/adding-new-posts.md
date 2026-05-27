---
title: Adding New Posts
description: Create new posts and understand Lipi frontmatter structure.
published: 2026-05-20
tags:
  - markdown
  - content
  - astro
---

Posts in Lipi live inside:

```txt
src/content/posts/
```

## Creating a Post

Create a new markdown file:

```txt
src/content/posts/hello-world.md
```

## Nested Folders

Lipi supports nested directories.

Example:

```txt
src/content/posts/travel/kyoto.md
```

becomes:

```txt
/posts/travel/kyoto
```

## Ignoring Folders in URLs

Folders beginning with `_` are ignored while generating URLs.

Example:

```txt
src/content/posts/_2026/japan-beyond-places.md
```

becomes:

```txt
/posts/japan-beyond-places
```

## Frontmatter Reference

| Field | Type | Required | Description |
|---|---|---|---|
| title | string | Yes | Post title |
| description | string | No | Short excerpt |
| published | date | Yes | Publish date |
| updated | date | No | Updated date |
| tags | array | No | Post tags |
| cover | string | No | Cover image |
| draft | boolean | No | Draft visibility |

## Sample Frontmatter

```yaml
---
title: Tokyo Beyond Places
description: Wandering through quieter corners of Tokyo.
published: 2026-01-14
updated: 2026-01-18
tags:
  - travel
  - japan
cover: ./cover.jpg
draft: false
---
```

## Writing Content

Lipi supports:

- Markdown
- MDX
- syntax highlighting
- KaTeX math
- GitHub-flavored markdown

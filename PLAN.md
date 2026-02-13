# Wonspo — Design Inspiration Collector

## Vision

A frictionless, drag-and-drop web app for collecting design inspiration from your daily workflow. Drop images, paste links, embed videos — everything lands in one beautiful, browsable space with zero hassle.

---

## Core Principles

- **Zero friction** — drag, drop, done. No forms, no menus, no extra clicks.
- **Everything is droppable** — images, URLs, videos, text snippets, files.
- **Visual-first** — the board should look and feel like a mood board, not a spreadsheet.
- **Fast** — instant uploads, optimistic UI, no loading spinners blocking your flow.

---

## Core Features

### 1. Drop Zone (The Heart)
- Full-page drag-and-drop area that accepts:
  - **Images** (PNG, JPG, GIF, SVG, WebP) — uploaded and displayed inline
  - **URLs** — auto-fetched with Open Graph preview (title, image, description)
  - **Videos** — YouTube/Vimeo links auto-embed; raw video files uploaded
  - **Text snippets** — pasted text saved as styled cards
  - **Files** (PDF, Figma links, etc.) — stored with icon + filename preview
- Paste from clipboard support (Ctrl+V / Cmd+V anywhere)
- Browser extension (future) for one-click save from any page

### 2. Board View
- **Masonry grid layout** — Pinterest-style, responsive, auto-fitting
- Cards show rich previews: image thumbnails, link metadata, video embeds
- Hover to see quick actions (delete, tag, move)
- Infinite scroll with virtualized rendering for performance

### 3. Organization (Lightweight)
- **Tags** — quick-add color-coded tags (click a card, type a tag)
- **Boards/Collections** — group items into named boards
- **Search** — full-text search across titles, URLs, tags, notes
- **Filter** — by type (image/link/video/text), by tag, by date

### 4. Item Detail
- Click a card to expand it full-screen
- Add a personal note / annotation
- See metadata (date added, source URL, dimensions, file size)
- Edit tags

### 5. Sharing (v2)
- Public/private board toggle
- Shareable link for a board
- Optional password protection

---

## Tech Stack

### Frontend
| Choice | Why |
|---|---|
| **Next.js 14 (App Router)** | Full-stack React framework, great DX, built-in API routes, image optimization, SSR for fast initial load |
| **TypeScript** | Type safety across the entire stack |
| **Tailwind CSS** | Rapid styling, consistent design system |
| **React DnD / native Drag API** | Drag-and-drop handling |
| **Masonry layout** (CSS columns or react-masonry-css) | Pinterest-style grid |

### Backend & Data
| Choice | Why |
|---|---|
| **Next.js API Routes** | Co-located backend, no separate server to deploy |
| **Supabase** | Postgres database + Auth + Realtime + Storage in one hosted service. Generous free tier. Alternatively: **SQLite via Turso** for a lighter setup |
| **Supabase Storage / Cloudflare R2** | File/image storage with CDN. R2 has zero egress fees |

### Infrastructure
| Choice | Why |
|---|---|
| **Vercel** | Zero-config deployment for Next.js, global edge network, preview deploys |
| **Supabase (hosted)** | Managed Postgres, auth, storage — no server management |

### Key Libraries
- `sharp` — server-side image processing (thumbnails, resize)
- `open-graph-scraper` — fetch OG metadata from URLs
- `nanoid` — short unique IDs
- `zustand` — lightweight client state management
- `react-hot-toast` — non-intrusive upload feedback

---

## Data Model

```
boards
  id          UUID (PK)
  user_id     UUID (FK → auth.users)
  name        TEXT
  is_public   BOOLEAN default false
  created_at  TIMESTAMPTZ
  updated_at  TIMESTAMPTZ

items
  id          UUID (PK)
  board_id    UUID (FK → boards)
  user_id     UUID (FK → auth.users)
  type        ENUM ('image', 'link', 'video', 'text', 'file')
  title       TEXT (nullable — auto-generated from OG/filename)
  content     TEXT (the URL, text snippet, or storage path)
  thumbnail   TEXT (path to generated thumbnail)
  metadata    JSONB (og data, dimensions, file size, etc.)
  note        TEXT (personal annotation)
  position    INTEGER (sort order within board)
  created_at  TIMESTAMPTZ

tags
  id          UUID (PK)
  user_id     UUID (FK → auth.users)
  name        TEXT
  color       TEXT

item_tags
  item_id     UUID (FK → items)
  tag_id      UUID (FK → tags)
```

---

## Upload / Ingest Flow

```
User drops file/URL/text
        │
        ▼
  Client detects type
        │
  ┌─────┴──────────┐
  │                 │
  ▼                 ▼
FILE/IMAGE        URL/TEXT
  │                 │
  ▼                 ▼
Upload to        Send to API
Storage          route
  │                 │
  ▼                 ▼
Generate         Fetch OG data /
thumbnail        parse content
  │                 │
  └────────┬────────┘
           ▼
  Create item record
  in database
           │
           ▼
  Optimistic UI shows
  card immediately
```

---

## Implementation Phases

### Phase 1 — MVP (get it working)
- [ ] Project setup (Next.js + Tailwind + TypeScript + Supabase)
- [ ] Auth (Supabase Auth — email/magic link)
- [ ] Single default board per user
- [ ] Drag-and-drop zone for images + URLs
- [ ] Image upload to Supabase Storage
- [ ] URL metadata fetching (OG scraper)
- [ ] Masonry grid display
- [ ] Delete items

### Phase 2 — Organization
- [ ] Multiple boards (create, rename, delete)
- [ ] Tags (create, assign, filter)
- [ ] Search
- [ ] Video embed support (YouTube, Vimeo)
- [ ] Text snippet cards
- [ ] Clipboard paste support

### Phase 3 — Polish
- [ ] Drag-to-reorder within a board
- [ ] Item detail modal with notes
- [ ] Responsive mobile layout
- [ ] Dark mode
- [ ] Keyboard shortcuts

### Phase 4 — Sharing & Beyond
- [ ] Public board sharing
- [ ] Browser extension
- [ ] Bulk operations (multi-select, bulk tag, bulk delete)
- [ ] Import from Pinterest / Are.na / Raindrop

---

## Alternative Approaches Considered

| Approach | Tradeoff |
|---|---|
| **Static site + GitHub as CMS** | No real-time, poor for media-heavy use |
| **Firebase instead of Supabase** | Works well, but Supabase gives you raw Postgres which is more flexible |
| **Separate Express/Fastify backend** | Extra deployment target, more infra to manage. Not worth it for a personal tool |
| **S3 instead of Supabase Storage** | More setup, needs IAM config. Supabase Storage is simpler for this scale |
| **Remix instead of Next.js** | Good framework, but Next.js has stronger ecosystem for image handling and Vercel deployment |

---

## Summary

**Next.js + Supabase + Vercel** gives you a fully managed, low-maintenance stack that can go from zero to deployed in a single session. The entire app is one repo, one deployment target, one database. The UX priority is the drop zone — making it effortless to capture inspiration the moment you find it.

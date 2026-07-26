# 🐾 RanzzNeko

A modern, fast, mobile-first **catalog** front-end for hentai & JAV content —
built with Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui-style
components, Framer Motion, Zustand, and TanStack Query.

> **18+ only.** RanzzNeko is a catalog/browse interface. It does **not** host,
> store, or provide direct downloads of any media. All content belongs to its
> respective owners. The `loli` and `shota` genres are permanently removed for
> legal reasons.

---

## ✨ Features

- **Home / Latest** — newest releases from the `/recent` endpoint.
- **Search** — debounced input, search history (localStorage), pagination.
- **Browse by Letter** (`0-9`, `A–Z`) **+ Type** (`hentai`, `2d_animation`,
  `3d_hentai`, `jav`, `jav_cosplay`).
- **Browse by Genre** — legal/adult genres only (loli & shota filtered out).
- **Post detail** — poster, synopsis, genres, screenshots, metadata, series link.
- **Series** — series info + episode grid.
- **Pagination** everywhere it applies.
- **Skeleton loading** + polished **empty / error states**.
- **Responsive**, mobile-first UI with a bottom nav + filter bottom sheet.
- **Search history** & **recently viewed** & **favorites** (all localStorage).
- **Simple sort** (Default, Title A–Z / Z–A) on list views.
- **Dark theme only**, pink/magenta accent, smooth page transitions.

---

## 🧱 Tech stack

| Layer      | Choice                                             |
| ---------- | -------------------------------------------------- |
| Framework  | Next.js 14 (App Router) + TypeScript               |
| Styling    | Tailwind CSS + shadcn/ui-style primitives          |
| Animation  | Framer Motion                                      |
| Data       | TanStack Query (React Query)                       |
| State      | Zustand (persisted to localStorage)                |
| Icons      | Lucide React                                       |
| Toasts     | Sonner                                             |
| Fonts      | Inter + Geist Sans                                 |

---

## 🔐 How data flows (credentials never reach the client)

```
Browser ──▶ /api/* (Next.js Route Handlers) ──▶ lib/nekopoi.ts ──▶ Upstream API
```

- `lib/nekopoi.ts` is marked **`server-only`** — importing it into a client
  component throws at build time. The upstream `token`, `baseURL`, and
  signatures live here and are never bundled into client JS.
- The browser only ever calls our own `/api/*` routes (`lib/api.ts`).
- Responses are **normalized** on the server (`lib/normalize.ts`) into stable
  shapes (see `types/index.ts`), so the UI is resilient to upstream field-name
  differences.

### API routes

| Route                | Upstream            | Notes                          |
| -------------------- | ------------------- | ------------------------------ |
| `GET /api/latest`    | `/recent`           | Home feed                      |
| `GET /api/search`    | `/search`           | `?q=&page=`                    |
| `GET /api/indeks`    | `/listall`          | `?letter=&type=&page=`         |
| `GET /api/genre`     | `/searchByGenre`    | `?genre=` (mapped to term idx) |
| `GET /api/post/[id]` | `/post`             | Post detail                    |
| `GET /api/series/[id]` | `/series`         | Series detail                  |

---

## 🚀 Getting started

**Requirements:** Node.js 18.18+ (Node 20+ recommended).

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev

# 3. Open http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run start      # run the production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

---

## ⚙️ Environment variables (optional)

The upstream credentials are currently **hardcoded on the server** in
`lib/nekopoi.ts` so the app runs out-of-the-box, exactly as specified.

When you want to move secrets out of source, copy `.env.example` to
`.env.local` and fill in the values — `lib/nekopoi.ts` already reads
`process.env.NEKO_*` and falls back to the hardcoded defaults:

```env
NEKO_BASE_URL="..."
NEKO_TOKEN="..."
NEKO_APP_BUILD_CODE="25301"
NEKO_APP_SIGNATURE="..."
```

> ⚠️ Never prefix these with `NEXT_PUBLIC_` — that would leak them to the browser.

---

## ▲ Deploy to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import it in [vercel.com/new](https://vercel.com/new).
3. Framework preset: **Next.js** (auto-detected). No build config needed.
4. (Optional) Add the `NEKO_*` environment variables in
   **Project → Settings → Environment Variables**.
5. Deploy. That's it.

The API routes run as serverless functions, so the upstream token stays
server-side in production.

---

## 📁 Project structure

```
app/
├── (main)/            # public pages (share Navbar/Sidebar/Footer/MobileNav)
│   ├── page.tsx                     # Home / Latest
│   ├── search/                      # Search
│   ├── index/[letter]/[type]/       # Browse by letter + type
│   ├── genre/[genre]/               # Browse by genre
│   ├── post/[id]/                   # Post detail
│   ├── series/[id]/                 # Series detail
│   ├── favorites/                   # Saved (localStorage)
│   ├── loading.tsx / error.tsx
│   └── layout.tsx
├── api/               # Route Handlers (server-only wrappers)
├── layout.tsx         # root layout (fonts, providers, metadata)
├── globals.css
└── not-found.tsx
components/
├── ui/                # button, input, badge, skeleton, sheet, select
├── layout/            # Navbar, Sidebar, Footer, MobileNav, Logo
├── cards/             # PostCard, SeriesCard, skeletons
├── filters/           # LetterFilter, TypeFilter, GenreFilter
├── search/            # SearchBar, SearchHistory
├── shared/            # Pagination, EmptyState, ErrorMessage, ContentSection…
└── views/             # page-level client views
lib/
├── nekopoi.ts         # NekoPoi data layer (server-only)
├── normalize.ts       # upstream → normalized shapes (server-only)
├── api.ts             # client fetch helpers (→ /api/*)
├── apiHandler.ts      # route error handling
├── constants.ts       # letters, types, genres (loli/shota removed)
├── store.ts           # Zustand (recent, history, favorites)
└── utils.ts
types/
└── index.ts
```

---

## 🛡️ Content & legal notes

- `loli` and `shota` are removed from the public genre list **and** refused by
  the server (`lib/nekopoi.ts` → `BLOCKED_GENRES`) and the genre route.
- No direct download features are implemented — this is a catalog + detail UI.
- `robots.ts` disallows indexing by default.

---

Made with 🐾 for RanzzNeko.

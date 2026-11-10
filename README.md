# SavePoint — Personal Game Tracker

**SavePoint** is a minimal, fast, responsive, and local-first personal video game tracking web application. It provides gamers with a beautiful, distraction-free library to track games they own, are currently playing, have completed, or have wishlisted for future playthroughs.

Built with **React**, **TypeScript**, **Tailwind CSS**, **Dexie.js (IndexedDB)**, **Lucide Icons**, **RAWG API**, and **Recharts**.

---

## 🎮 Core Product Highlights

- **Local-First & Offline-Ready**: All data is stored directly in your browser's IndexedDB using Dexie.js. The app never forces online connectivity, logins, or cloud synchronization.
- **RAWG API Integration**: Search through thousands of games and automatically import artwork, genres, release dates, platforms, and developers with debounced queries.
- **Offline Fallback Catalog**: If offline or without an API key, SavePoint includes sample titles and fully supports 100% manual entry.
- **Playtime Tracking**: Log gameplay sessions with hours, minutes, and personal notes. Total game playtimes and monthly trends are automatically calculated from actual logged sessions.
- **Material 3 Design System**: Clean charcoal aesthetic, warm amber accents, subtle borders, responsive cover-art cards, and dark/light mode toggle.
- **Complete Data Freedom**: One-click JSON backup export and import with structure validation.
- **Future Platform Extensibility**: Architecture cleanly decouples data repositories and services, ready for future packaging into a Windows desktop executable via **Tauri 2** and an Android APK via **Capacitor**.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or newer recommended, tested on Node v24)
- **npm** or **pnpm** / **yarn**

### 1. Installation

Clone or navigate to the project directory:

```bash
cd "d:\MYPROJECTS\Completed Projects\SAVEPOINT"
npm install
```

### 2. Environment Variables (Optional)

SavePoint works out of the box without any configuration! If you have a free personal API key from [RAWG.io](https://rawg.io/apidocs), you can configure it either in `.env` or directly in the app's **Settings** screen.

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

And set your key:

```env
VITE_RAWG_API_KEY=your_rawg_api_key_here
```

*(Note: You can also update, test, or remove your RAWG API key anytime inside the in-app Settings page without touching code or restarting).*

### 3. Development Server

Start the local Vite development server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### 4. Production Build

Build the optimized, minified production assets:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 📁 Project Architecture & Structure

```
SAVEPOINT/
├── public/
│   ├── favicon.svg             # Glowing memory card/savepoint icon
│   └── ...
├── src/
│   ├── components/
│   │   ├── common/             # Reusable UI elements (ConfirmDialog, EmptyState, GameCoverImage)
│   │   ├── games/              # Game cards, list items, AddGameModal, PlaySessionModal
│   │   ├── layout/             # Sidebar (collapsible), Header, BottomNav (mobile), AppLayout
│   │   └── ui/                 # Buttons, Badges, Modals, RatingStars, StatusSelect
│   ├── contexts/
│   │   ├── SettingsContext.tsx # User preferences (theme, view mode, default sort, API key)
│   │   └── ToastContext.tsx    # Non-intrusive toast notifications portal
│   ├── database/
│   │   ├── db.ts               # Dexie.js database definition and version schema
│   │   └── repositories/       # Decoupled storage repositories (GameRepository, SessionRepository)
│   ├── hooks/
│   │   ├── useGames.ts         # Live reactive querying for library games with sorting/filtering
│   │   ├── useStats.ts         # Live calculated statistics and charts data
│   │   ├── useSettings.ts      # Settings hook
│   │   └── useToast.ts         # Toast dispatch hook
│   ├── pages/
│   │   ├── Home/               # Dashboard (Currently Playing, Recently Played, Quick Stats)
│   │   ├── Library/            # Full collection with search, status pills, platforms & grid/list views
│   │   ├── Wishlist/           # Dedicated wishlist with quick "Move to Backlog" / "Start Playing"
│   │   ├── Statistics/         # Real metrics (completion rate, most played, charts by status/platform/month)
│   │   ├── Settings/           # Theme, defaults, RAWG API key connection tester, JSON export/import
│   │   └── GameDetails/        # Game overview, rating, playtime logs, notes, edit/delete
│   ├── services/
│   │   └── rawg/               # RAWG service client, query caching, offline sample fallbacks
│   ├── types/                  # TypeScript interfaces (Game, PlaySession, Status, Stats)
│   ├── utils/                  # Formatting, UUID generator, data transfer (JSON export/import), status configs
│   ├── App.tsx                 # Root layout, routing, modals
│   ├── index.css               # Tailwind CSS directives & CSS color theme tokens
│   └── main.tsx                # React root mount
├── tailwind.config.js          # Material 3 dark/light design system tokens
├── vite.config.ts              # Vite configuration
└── package.json
```

---

## 🎯 Key Workflows

### Adding a Game
1. Click **Add Game** in the sidebar, header, or dashboard.
2. Search for any game using RAWG's database (or pick from the offline curated samples).
3. If the game is already in your library, duplicate detection prevents duplicate additions.
4. Customize your platform (PC, PS5, Switch, Steam Deck, etc.), initial status, personal rating, and notes.
5. Alternatively, switch to **Manual Entry** to add any unlisted or custom game with your own cover artwork URL.

### Logging Play Sessions
1. Click on any game card to open its detail page.
2. Click **Log Time** or **Log Session**.
3. Select date and enter hours & minutes (or use quick preset buttons `+30m`, `+1h`, `+2h`).
4. Total playtime is dynamically derived from recorded sessions—never hardcoded or manually desynchronized.
5. Edit or delete any session anytime.

### Moving From Wishlist
- Games in your Wishlist feature quick one-click actions: **Backlog** (marks acquired) or **Play** (marks currently playing).

### Data Backup & Portability
- Navigate to **Settings** > **Data Management & Backup**.
- Click **Export Backup (.json)** to save your entire library.
- Click **Import Backup (.json)** to restore your library on any machine or browser.

---

## 🛡️ Future Platform Roadmap

SavePoint is designed from the ground up to be packaged without refactoring:
- **Tauri 2**: Simply wrap the Vite dist bundle with Tauri to produce a lightweight native Windows executable.
- **Capacitor**: The responsive layout and safe-area insets seamlessly adapt to Android APK packaging.
- **Local Isolation**: No Node-only or browser-locked APIs are used without abstraction.

---

## 📄 License

MIT. Created with dedication to clean, minimal, distraction-free game tracking.
Attribution: Game metadata and artwork provided by [RAWG Video Games Database](https://rawg.io/).

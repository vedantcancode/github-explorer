# GitScope — GitHub Repository Explorer

GitScope is a production-ready, highly polished, and fully responsive frontend React application powered by Vite, Tailwind CSS, Recharts, and Lucide React. It allows developers to search for GitHub repositories and visualize key metrics like language distributions, commit trends, and top contributors in a developer console dashboard.

The application incorporates a **Google Gemini-inspired Search Homepage** and an **Antigravity Developer Console Details Page**, combined with a comprehensive comparison suite, local bookmarks, dark/light theme switching, caching layer, unit testing, and dynamic bundle optimization.

---

## 🚀 Live Demo & Setup

### Setup Instructions
1. **Clone & Navigate**:
   ```bash
   cd github-explorer
   ```
2. **Install Dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```
3. **Start Local Development Server**:
   ```bash
   npm run dev
   ```
   *Vite server will start locally, usually at `http://localhost:5173/`.*

4. **Run Unit Tests**:
   ```bash
   npx vitest run
   ```

---

## ✨ Features Implemented

### 🔍 1. Google Gemini-Inspired Search View
- **Debounced Search**: Integrates a custom 500ms delay debouncing hook to protect API usage.
- **Gemini Aesthetics**: Gradient headings, smooth backdrop auroral glows, pill-shaped inputs with floating highlight rings, and suggestion cards for single-click search.
- **Feedback & States**: Skeleton loader shimmers for loading results, empty state alerts, and clean HTTP 403 (Rate Limit) and 404 (Not Found) banners.

### 📊 2. Antigravity-Inspired Repository Details View
- **IDE Telemetry Panels**: Console dashboards showing Stars, Forks, Open Issues, License info, Creation Dates, and Last Updated Dates.
- **Blinking Activity Indicator**: Real-time style blinking beacon to match advanced console interfaces.
- **API Token Modal**: Settings modal allowing users to supply an optional GitHub Personal Access Token (PAT) to bypass standard GitHub API limits (increasing limit from 60 to 5,000 requests/hour).

### 🍩 3. Language Statistics Visualization
- **Dynamic Percentage Calculations**: Automatically transforms raw language bytes returned from `/repos/{owner}/{repo}/languages` into usage percentages.
- **Recharts Pie/Donut Visualizer**: Custom-legend donut chart with interactive hover tooltips, neon colors, and empty state fallbacks.

### 📈 4. Commit Activity & Trends
- **Area Chart Trendlines**: Area chart with a monotone interpolation curve, custom gridlines, and soft gradient cyan fills displaying activity levels over the last 52 weeks.
- **Fail-safe Cascades**: Attempts `/stats/commit_activity` first. If pending (HTTP 202) or empty, falls back to `/stats/participation`. If participation is empty, groups recent `/commits` into weeks.

### 👥 5. Contributors List
- **Engagement Bar**: Displays the top 20 contributors with relative percentage progress bars representing commit contribution ratio.
- **Expandable Pane**: Interactive toggle allowing users to swap between the Top 5 and Top 20 contributors.

### 🌟 6. Bookmarks (Optional Bonus)
- **Local Persistence**: Ability to bookmark repositories. Bookmarked repositories are saved to browser `localStorage` as complete repository metadata objects.
- **Bookmark Launcher Grid**: Bookmarks are rendered as a custom card deck on the Gemini homepage when the search bar is empty, allowing instant navigation back to favorite repositories.

### ⚔️ 7. Repository Comparison (Optional Bonus)
- **Visual Analytics comparisons**: Bar charts comparing Stars, Forks, and Open Issues side-by-side.
- **Dual commit trends**: Plots both the primary and compared repositories on a dual-line chart to compare commit frequency.
- **Side-by-side Languages**: Compares language breakdowns of both repositories side-by-side.

### 🌓 8. Dark & Light Mode Switch (Optional Bonus)
- Manual toggle in the header persistent in `localStorage`.
- Tailwind configuration using `.dark` class injection. Fully themed for clean typography and high contrast in both modes.

### 🧪 9. Unit Testing (Optional Bonus)
- Automated testing using **Vitest**, `@testing-library/react`, and `jsdom`.
- Tests cover `useDebounce` delay times and the `githubApi` client caching/errors.

---

## 🛠️ Performance Optimizations

1. **Client-side Caching Layer**:
   - In-memory cache layer in the API client cache GET requests for 5 minutes (`CACHE_TTL = 300,000ms`). Repeated visits load instantly without hitting GitHub rate limits.
2. **Code Splitting (Lazy Loading)**:
   - Dynamic imports for Recharts and other heavy components (`LanguageChart`, `CommitChart`) so chart rendering code only loads when Details view is accessed.
3. **Manual Chunks Split**:
   - Split core vendors, recharts, and icons into separate chunks in `vite.config.js` to ensure the core chunk remains tiny (**49.49 kB**), leading to extremely fast initial paint times.

---

## 📂 Project Structure

```text
github-explorer/
├── dist/                      # Production build assets
├── src/
│   ├── api/
│   │   └── github.js          # API client with client-side cache & error logic
│   ├── components/
│   │   ├── CommitChart.jsx    # Area chart component
│   │   ├── ContributorList.jsx# Contributors lists
│   │   ├── LanguageChart.jsx  # Language donut chart
│   │   ├── RepoCard.jsx       # Custom repository card
│   │   ├── RepoCompare.jsx    # Repo comparison dashboards
│   │   ├── SearchBar.jsx      # Gemini-style search pill
│   │   └── Skeleton.jsx       # Skeleton shimmers
│   ├── hooks/
│   │   └── useDebounce.js     # 500ms delay input hook
│   ├── pages/
│   │   ├── Home.jsx           # Google Gemini-style Search view
│   │   └── RepoDetails.jsx    # Antigravity developer details dashboard
│   ├── tests/
│   │   ├── github.test.js     # API caching unit tests
│   │   ├── setup.js           # Vitest environment setup
│   │   └── useDebounce.test.js# useDebounce hook unit tests
│   ├── App.jsx                # Orchestrator & state controller
│   ├── index.css              # Custom styling auras, scrollbars
│   └── main.jsx
├── index.html                 # Index file with Outfit/Inter typography
├── package.json               # Config & dependency definitions
├── postcss.config.js          # PostCSS configurations
├── tailwind.config.js         # Custom Tailwind configs (class-mode theme toggle)
└── vite.config.js             # Vite & Vitest configuration options
```

---

## 📦 Technologies Used
- **Vite** (Next-generation build tool)
- **React 19**
- **Tailwind CSS v3** (Utility-first styling framework)
- **Recharts** (Interactive SVG charts library)
- **Lucide React** (Vector icons library)
- **Vitest & React Testing Library** (Testing suite)
- **jsdom** (Simulated browser DOM)

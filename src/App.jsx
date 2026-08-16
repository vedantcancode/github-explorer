import React, { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { RepoDetails } from './pages/RepoDetails';
import { Settings, Key, X, ShieldAlert, Sun, Moon } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('home'); // 'home' | 'details'
  const [selectedOwner, setSelectedOwner] = useState('');
  const [selectedRepo, setSelectedRepo] = useState('');
  const [savedQuery, setSavedQuery] = useState('');
  
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [hasToken, setHasToken] = useState(false);

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gitscope_bookmarks') || '[]');
    } catch {
      return [];
    }
  });

  // Sync theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('github_pat') || '';
    setTokenInput(savedToken);
    setHasToken(!!savedToken.trim());
  }, []);

  const handleSelectRepo = (owner, repoName) => {
    setSelectedOwner(owner);
    setSelectedRepo(repoName);
    setView('details');
  };

  const handleBackToSearch = () => {
    setView('home');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSaveToken = (e) => {
    e.preventDefault();
    localStorage.setItem('github_pat', tokenInput.trim());
    setHasToken(!!tokenInput.trim());
    setTokenModalOpen(false);
    window.location.reload();
  };

  // Bookmark handlers
  const toggleBookmark = (repo) => {
    setBookmarks((prev) => {
      const isBookmarked = prev.some((b) => b.id === repo.id);
      let updated;
      if (isBookmarked) {
        updated = prev.filter((b) => b.id !== repo.id);
      } else {
        updated = [...prev, repo];
      }
      localStorage.setItem('gitscope_bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  const isBookmarked = (repoId) => {
    return bookmarks.some((b) => b.id === repoId);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#080809] text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-300">
      {/* Header bar */}
      <header className="sticky top-0 z-45 border-b border-gray-200 dark:border-gray-800/80 bg-white/80 dark:bg-[#080809]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setView('home')}>
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-600 text-white shadow-md shadow-purple-500/10">
            <svg
              role="img"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
          </div>
          <span className="font-extrabold text-base md:text-lg tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            GitScope
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Token Indicator */}
          {hasToken ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono border border-emerald-500/20 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-md font-semibold">
              <Key className="w-3 h-3" />
              PAT Configured
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono border border-amber-500/20 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-md font-semibold">
              <ShieldAlert className="w-3 h-3" />
              Rate Limited (60/hr)
            </span>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-800/80 bg-gray-50 dark:bg-gray-900/10 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-amber-500 dark:hover:text-amber-400 text-gray-500 dark:text-gray-400 transition-all flex items-center justify-center h-10 w-10"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          {/* Settings button */}
          <button
            onClick={() => setTokenModalOpen(true)}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-800/80 bg-gray-50 dark:bg-gray-900/10 hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-500 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white transition-all flex items-center justify-center h-10 w-10"
            title="Configure GitHub Token"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {view === 'home' ? (
          <Home
            onSelectRepo={handleSelectRepo}
            savedQuery={savedQuery}
            setSavedQuery={setSavedQuery}
            bookmarks={bookmarks}
          />
        ) : (
          <RepoDetails
            owner={selectedOwner}
            repoName={selectedRepo}
            onBack={handleBackToSearch}
            toggleBookmark={toggleBookmark}
            isBookmarked={isBookmarked}
          />
        )}
      </main>

      {/* Settings Modal */}
      {tokenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={() => setTokenModalOpen(false)} />
          
          {/* Modal box */}
          <div className="relative w-full max-w-md bg-white dark:bg-[#131314] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-2xl glass-panel z-10">
            <button
              onClick={() => setTokenModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">API Credentials</h3>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-sans">
                To explore repositories without hitting the GitHub API rate limit (60 requests/hour), configure a Personal Access Token. Tokens are stored securely in your local browser storage.
              </p>

              <form onSubmit={handleSaveToken} className="space-y-3.5 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    GitHub Personal Access Token (PAT)
                  </label>
                  <input
                    type="password"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="ghp_..."
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 font-mono"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 text-[11px]">
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=GitScope"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 hover:underline flex items-center gap-1 font-semibold"
                  >
                    Generate a token
                  </a>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setTokenModalOpen(false)}
                      className="px-3.5 py-2 rounded-lg bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-purple-500/10"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

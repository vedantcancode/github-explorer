import React, { useState, useEffect, useRef } from 'react';
import { SearchBar } from '../components/SearchBar';
import { RepoCard } from '../components/RepoCard';
import { RepoCardSkeleton } from '../components/Skeleton';
import { useDebounce } from '../hooks/useDebounce';
import { githubApi } from '../api/github';
import { AlertCircle, Terminal, HelpCircle, Bookmark } from 'lucide-react';

export function Home({ onSelectRepo, savedQuery, setSavedQuery, bookmarks = [] }) {
  const [query, setQuery] = useState(savedQuery || '');
  const debouncedQuery = useDebounce(query, 500);
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Keep track of the active request to avoid race conditions
  const activeRequestRef = useRef(null);

  // Trigger search when debounced query changes
  useEffect(() => {
    setSavedQuery(query); // Save query in app state to preserve it when going back
    
    if (!debouncedQuery.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    const fetchRepos = async () => {
      setLoading(true);
      setError(null);
      
      const requestId = Math.random().toString(36).substring(7);
      activeRequestRef.current = requestId;

      try {
        const data = await githubApi.searchRepos(debouncedQuery);
        if (activeRequestRef.current === requestId) {
          setResults(data.items || []);
        }
      } catch (err) {
        if (activeRequestRef.current === requestId) {
          setError(err.message);
          setResults([]);
        }
      } finally {
        if (activeRequestRef.current === requestId) {
          setLoading(false);
        }
      }
    };

    fetchRepos();
  }, [debouncedQuery]);

  const handleSuggestionClick = (label) => {
    setQuery(label);
  };

  const hasSearch = query.trim().length > 0;

  return (
    <div className="relative min-h-[calc(100vh-76px)] flex flex-col justify-between py-12 px-4 md:px-8">
      {/* Background Ambient Auras (Gemini Style) */}
      {!hasSearch && (
        <>
          <div className="aura-glow-1" />
          <div className="aura-glow-2" />
          <div className="aura-glow-3" />
        </>
      )}

      {/* Main Container */}
      <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col justify-center">
        {/* Gemini Homepage Welcoming Screen */}
        {!hasSearch && (
          <div className="text-center space-y-4 mb-10 z-10 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent font-sans">
              Hello, Developer
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg max-w-md mx-auto leading-relaxed [animation-delay:200ms]">
              What repository would you like to explore today? Get deep insights and trends instantly.
            </p>
          </div>
        )}

        {/* Search Bar section */}
        <div className="mb-10 z-10">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSuggestionClick={handleSuggestionClick}
          />
        </div>

        {/* Bookmarks Section (Only when not searching) */}
        {!hasSearch && bookmarks && bookmarks.length > 0 && (
          <div className="mt-8 space-y-5 z-10 animate-fade-in [animation-delay:300ms]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 pl-1 border-b border-gray-200 dark:border-gray-800 pb-2">
              <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500/10" />
              Bookmarked Repositories
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {bookmarks.map((repo) => (
                <RepoCard
                  key={repo.id}
                  repo={repo}
                  onClick={() => onSelectRepo(repo.owner.login, repo.name)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="max-w-2xl mx-auto w-full mb-8 p-4 rounded-xl border border-red-500/20 bg-red-950/20 flex items-start gap-3 text-red-300 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Search failed</span>
              <p className="text-red-400/90 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Content View: Loading Skeleton / Results Grid */}
        {hasSearch && (
          <div className="space-y-6 animate-fade-in [animation-delay:100ms] z-10">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-500" />
                Search Results {results.length > 0 && `(${results.length})`}
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <RepoCardSkeleton key={i} />
                  ))}
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.map((repo) => (
                  <RepoCard
                    key={repo.id}
                    repo={repo}
                    onClick={() => onSelectRepo(repo.owner.login, repo.name)}
                  />
                ))}
              </div>
            ) : (
              !error && (
                <div className="text-center py-20 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                  <p className="text-gray-500">No repositories found matching your query.</p>
                  <p className="text-xs text-gray-600 mt-1">Try entering another keyword or owner/repo path.</p>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {!hasSearch && (
        <div className="text-center text-xs text-gray-600 mt-12 flex items-center justify-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          GitScope uses the GitHub REST API. Rate limits apply to unauthenticated users.
        </div>
      )}
    </div>
  );
}

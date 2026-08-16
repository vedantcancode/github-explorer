import React, { useState, lazy, Suspense } from 'react';
import { Search, X, Star, GitFork, AlertCircle, RefreshCw, BarChart2 } from 'lucide-react';
import { githubApi } from '../api/github';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LineChart, Line } from 'recharts';

const LanguageChart = lazy(() => import('./LanguageChart').then(m => ({ default: m.LanguageChart })));

export function RepoCompare({ primaryRepo, primaryLanguages, primaryCommits, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [secondaryRepo, setSecondaryRepo] = useState(null);
  const [secondaryLanguages, setSecondaryLanguages] = useState({});
  const [secondaryCommits, setSecondaryCommits] = useState([]);
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [compareError, setCompareError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoadingSearch(true);
    setSearchError(null);
    try {
      const data = await githubApi.searchRepos(query);
      setResults(data.items || []);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSelectSecondary = async (owner, repoName) => {
    setLoadingCompare(true);
    setCompareError(null);
    setResults([]);
    setQuery('');
    try {
      const details = await githubApi.getRepoDetails(owner, repoName);
      setSecondaryRepo(details);

      const [langData, commitData] = await Promise.allSettled([
        githubApi.getRepoLanguages(owner, repoName),
        githubApi.getRepoCommits(owner, repoName),
      ]);

      if (langData.status === 'fulfilled') setSecondaryLanguages(langData.value);
      if (commitData.status === 'fulfilled') setSecondaryCommits(commitData.value);
    } catch (err) {
      setCompareError(err.message || 'Failed to fetch secondary repository stats.');
    } finally {
      setLoadingCompare(false);
    }
  };

  const handleResetSecondary = () => {
    setSecondaryRepo(null);
    setSecondaryLanguages({});
    setSecondaryCommits([]);
  };

  // Combine stats for Bar Chart
  const telemetryData = secondaryRepo ? [
    {
      metric: 'Stars',
      [primaryRepo.name]: primaryRepo.stargazers_count,
      [secondaryRepo.name]: secondaryRepo.stargazers_count,
    },
    {
      metric: 'Forks',
      [primaryRepo.name]: primaryRepo.forks_count,
      [secondaryRepo.name]: secondaryRepo.forks_count,
    },
    {
      metric: 'Open Issues',
      [primaryRepo.name]: primaryRepo.open_issues_count,
      [secondaryRepo.name]: secondaryRepo.open_issues_count,
    }
  ] : [];

  // Combine commits for Line/Area Chart
  const combinedCommits = (secondaryRepo && primaryCommits.length > 0)
    ? primaryCommits.map((item, idx) => {
        const secItem = secondaryCommits[idx] || { total: 0 };
        return {
          weekLabel: new Date(item.week * 1000).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
          [primaryRepo.name]: item.total,
          [secondaryRepo.name]: secItem.total,
        };
      })
    : [];

  const CustomCommitTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0c0f17] border border-[#1b2234] p-3.5 rounded-lg shadow-xl text-xs space-y-2">
          <p className="font-semibold text-gray-400">{payload[0].payload.weekLabel}</p>
          {payload.map((p, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
              <span className="text-gray-300 font-bold">{p.name}: <span className="font-mono">{p.value} commits</span></span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="border border-antigravity-border bg-antigravity-panel rounded-2xl p-6 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-gray-800/50 pb-4">
        <h3 className="text-base font-extrabold tracking-wide uppercase text-[#00f2fe] flex items-center gap-2">
          <BarChart2 className="w-5 h-5" />
          Repository Comparison
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          title="Exit comparison"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Select Secondary Repository View */}
      {!secondaryRepo && !loadingCompare && (
        <div className="space-y-6">
          <div className="text-center max-w-md mx-auto space-y-2">
            <h4 className="text-sm font-bold text-gray-200">Select a Repository to compare with</h4>
            <p className="text-xs text-gray-500">
              Enter any repository path (e.g. vuejs/core, tailwindlabs/tailwindcss) or owner name.
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search repository..."
                className="w-full bg-gray-950 dark:bg-gray-950/60 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20"
              />
            </div>
            <button
              type="submit"
              disabled={loadingSearch || !query.trim()}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-[#00f2fe] text-gray-950 text-xs font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              Search
            </button>
          </form>

          {searchError && (
            <div className="max-w-md mx-auto p-3.5 rounded-xl border border-red-500/10 bg-red-950/10 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {searchError}
            </div>
          )}

          {/* Search results list */}
          {loadingSearch ? (
            <div className="max-w-md mx-auto text-center py-8">
              <div className="animate-spin w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2" />
              <span className="text-xs text-gray-500">Searching GitHub...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="max-w-md mx-auto border border-gray-800 rounded-xl overflow-hidden bg-gray-950/40 divide-y divide-gray-800/60">
              {results.slice(0, 5).map((repo) => (
                <div
                  key={repo.id}
                  onClick={() => handleSelectSecondary(repo.owner.login, repo.name)}
                  className="p-3 hover:bg-gray-900/60 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <p className="font-bold text-gray-200">{repo.name}</p>
                    <p className="text-[10px] text-gray-500">by {repo.owner.login}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md border border-gray-800 bg-gray-900 text-gray-400 text-[10px] font-mono">
                    ★ {repo.stargazers_count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            query.trim() && !loadingSearch && (
              <p className="text-center text-xs text-gray-600">No results found.</p>
            )
          )}
        </div>
      )}

      {loadingCompare && (
        <div className="text-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs text-gray-400">Fetching comparison data...</p>
        </div>
      )}

      {compareError && (
        <div className="max-w-md mx-auto p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-xs text-red-300">{compareError}</p>
          <button
            onClick={handleResetSecondary}
            className="px-3.5 py-1.5 bg-red-900/30 text-red-300 text-[11px] font-bold rounded-lg border border-red-500/30 hover:bg-red-900/50 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Comparison Loaded View */}
      {secondaryRepo && !loadingCompare && !compareError && (
        <div className="space-y-8 animate-fade-in">
          {/* Header comparison row */}
          <div className="flex items-center justify-between gap-4 border-b border-gray-800/50 pb-4">
            <div className="flex items-center gap-6 text-sm md:text-base font-black">
              {/* Primary */}
              <div className="flex items-center gap-2">
                <img src={primaryRepo.owner.avatar_url} alt="" className="w-6 h-6 rounded-md border border-gray-800" />
                <span className="text-[#00f2fe]">{primaryRepo.name}</span>
              </div>
              <span className="text-gray-500 font-mono text-xs">VS</span>
              {/* Secondary */}
              <div className="flex items-center gap-2">
                <img src={secondaryRepo.owner.avatar_url} alt="" className="w-6 h-6 rounded-md border border-gray-800" />
                <span className="text-[#ff007f]">{secondaryRepo.name}</span>
              </div>
            </div>
            
            <button
              onClick={handleResetSecondary}
              className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-gray-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-gray-800 bg-gray-900/40"
            >
              <RefreshCw className="w-3 h-3" /> Change Target
            </button>
          </div>

          {/* Stats quick card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Stars */}
            <div className="p-4 bg-gray-950/45 border border-gray-900 rounded-xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500" /> Star comparison
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className={`p-2 rounded-lg ${primaryRepo.stargazers_count >= secondaryRepo.stargazers_count ? 'border border-emerald-500/20 bg-emerald-950/10' : ''}`}>
                  <p className="text-gray-500 truncate">{primaryRepo.name}</p>
                  <p className="font-bold text-gray-200">{primaryRepo.stargazers_count.toLocaleString()}</p>
                </div>
                <div className={`p-2 rounded-lg ${secondaryRepo.stargazers_count >= primaryRepo.stargazers_count ? 'border border-emerald-500/20 bg-emerald-950/10' : ''}`}>
                  <p className="text-gray-500 truncate">{secondaryRepo.name}</p>
                  <p className="font-bold text-gray-200">{secondaryRepo.stargazers_count.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Forks */}
            <div className="p-4 bg-gray-950/45 border border-gray-900 rounded-xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1.5">
                <GitFork className="w-3.5 h-3.5 text-blue-500" /> Fork comparison
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className={`p-2 rounded-lg ${primaryRepo.forks_count >= secondaryRepo.forks_count ? 'border border-emerald-500/20 bg-emerald-950/10' : ''}`}>
                  <p className="text-gray-500 truncate">{primaryRepo.name}</p>
                  <p className="font-bold text-gray-200">{primaryRepo.forks_count.toLocaleString()}</p>
                </div>
                <div className={`p-2 rounded-lg ${secondaryRepo.forks_count >= primaryRepo.forks_count ? 'border border-emerald-500/20 bg-emerald-950/10' : ''}`}>
                  <p className="text-gray-500 truncate">{secondaryRepo.name}</p>
                  <p className="font-bold text-gray-200">{secondaryRepo.forks_count.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Open Issues */}
            <div className="p-4 bg-gray-950/45 border border-gray-900 rounded-xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-500" /> Open Issues (Fewer is better)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className={`p-2 rounded-lg ${primaryRepo.open_issues_count <= secondaryRepo.open_issues_count ? 'border border-emerald-500/20 bg-emerald-950/10' : ''}`}>
                  <p className="text-gray-500 truncate">{primaryRepo.name}</p>
                  <p className="font-bold text-gray-200">{primaryRepo.open_issues_count.toLocaleString()}</p>
                </div>
                <div className={`p-2 rounded-lg ${secondaryRepo.open_issues_count <= primaryRepo.open_issues_count ? 'border border-emerald-500/20 bg-emerald-950/10' : ''}`}>
                  <p className="text-gray-500 truncate">{secondaryRepo.name}</p>
                  <p className="font-bold text-gray-200">{secondaryRepo.open_issues_count.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bar Chart comparing metrics */}
          <div className="border border-antigravity-border bg-antigravity-panel p-5 rounded-2xl h-[320px] transition-all duration-300 hover:border-gray-800">
            <h4 className="text-[13px] font-bold tracking-wider uppercase text-gray-400 border-b border-gray-800/50 pb-3 mb-4">
              Visual Metric Comparison
            </h4>
            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={telemetryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#1b2234" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="metric" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#0c0f17', borderColor: '#1b2234', borderRadius: '8px' }} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', color: '#9e9e9e' }} />
                  <Bar dataKey={primaryRepo.name} fill="#00f2fe" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={secondaryRepo.name} fill="#ff007f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dual Commit Trends Chart */}
          {combinedCommits.length > 0 && (
            <div className="border border-antigravity-border bg-antigravity-panel p-5 rounded-2xl h-[320px] transition-all duration-300 hover:border-gray-800">
              <h4 className="text-[13px] font-bold tracking-wider uppercase text-gray-400 border-b border-gray-800/50 pb-3 mb-4">
                Dual Commit Activity Comparison (Last 52 Weeks)
              </h4>
              <div className="h-[210px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={combinedCommits} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid stroke="#1b2234" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="weekLabel" stroke="#4b5563" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#4b5563" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomCommitTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', color: '#9e9e9e' }} />
                    <Line type="monotone" dataKey={primaryRepo.name} stroke="#00f2fe" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey={secondaryRepo.name} stroke="#ff007f" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Side by side language breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Suspense fallback={<div className="h-[320px] bg-antigravity-panel animate-pulse rounded-2xl" />}>
              <div className="space-y-2">
                <h5 className="text-xs font-mono uppercase text-gray-500 tracking-wider pl-1">{primaryRepo.name} Languages</h5>
                <LanguageChart languages={primaryLanguages} />
              </div>
            </Suspense>
            <Suspense fallback={<div className="h-[320px] bg-antigravity-panel animate-pulse rounded-2xl" />}>
              <div className="space-y-2">
                <h5 className="text-xs font-mono uppercase text-gray-500 tracking-wider pl-1">{secondaryRepo.name} Languages</h5>
                <LanguageChart languages={secondaryLanguages} />
              </div>
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}

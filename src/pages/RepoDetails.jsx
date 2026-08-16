import React, { useState, useEffect, lazy, Suspense } from 'react';
import { ArrowLeft, AlertCircle, Calendar, Shield, ExternalLink, RotateCcw, GitCompare, Bookmark } from 'lucide-react';
import { githubApi } from '../api/github';
import { ContributorList } from '../components/ContributorList';
import { DetailsSkeleton } from '../components/Skeleton';
import { RepoCompare } from '../components/RepoCompare';

// Performance optimization: Lazy loading Recharts components to reduce initial bundle footprint
const LanguageChart = lazy(() => import('../components/LanguageChart').then(m => ({ default: m.LanguageChart })));
const CommitChart = lazy(() => import('../components/CommitChart').then(m => ({ default: m.CommitChart })));

export function RepoDetails({ owner, repoName, onBack, toggleBookmark, isBookmarked }) {
  const [repoDetails, setRepoDetails] = useState(null);
  const [languages, setLanguages] = useState({});
  const [commits, setCommits] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Repo comparison feature state
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch repo details first (critical path)
        const details = await githubApi.getRepoDetails(owner, repoName);
        setRepoDetails(details);

        // Fetch remaining metrics in parallel (non-blocking errors)
        const [langData, commitData, contribData] = await Promise.allSettled([
          githubApi.getRepoLanguages(owner, repoName),
          githubApi.getRepoCommits(owner, repoName),
          githubApi.getRepoContributors(owner, repoName)
        ]);

        if (langData.status === 'fulfilled') setLanguages(langData.value);
        if (commitData.status === 'fulfilled') setCommits(commitData.value);
        if (contribData.status === 'fulfilled') setContributors(contribData.value);

      } catch (err) {
        setError(err.message || 'An unexpected error occurred while fetching details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [owner, repoName]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 md:px-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-200 transition-colors uppercase font-mono tracking-wider mb-6 bg-antigravity-panel/20 px-3.5 py-1.5 rounded-lg border border-antigravity-border"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to search
        </button>
        <DetailsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 md:px-8 space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors uppercase font-mono tracking-wider bg-antigravity-panel/20 px-3.5 py-1.5 rounded-lg border border-antigravity-border"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to search
        </button>

        <div className="max-w-xl mx-auto p-6 border border-red-500/20 bg-red-950/20 rounded-2xl space-y-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-red-300">Failed to load repository</h3>
            <p className="text-xs text-red-400/90 leading-relaxed max-w-sm mx-auto">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-300 text-xs font-bold rounded-lg border border-red-500/30 transition-all flex items-center gap-1.5 mx-auto mt-2"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Retry Request
          </button>
        </div>
      </div>
    );
  }

  const formatNumber = (num) => {
    return num?.toLocaleString() || '0';
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 md:px-8 space-y-6 animate-fade-in">
      {/* Navigation bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase font-mono tracking-wider bg-gray-100 dark:bg-antigravity-panel/80 hover:bg-gray-200 dark:hover:bg-antigravity-panel px-3.5 py-1.5 rounded-lg border border-gray-200 dark:border-antigravity-border"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to search
        </button>
        
        {/* Blinking Live Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-antigravity-border bg-gray-50 dark:bg-antigravity-panel/50 text-[11px] font-mono font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest transition-colors duration-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f2fe] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00f2fe]"></span>
          </span>
          Explorer Console
        </div>
      </div>

      {/* Repository Main Info Header */}
      <div className="p-6 border border-gray-200 dark:border-antigravity-border bg-gray-50 dark:bg-antigravity-panel rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors duration-300">
        <div className="flex items-start gap-4">
          <img
            src={repoDetails.owner.avatar_url}
            alt={repoDetails.owner.login}
            className="w-14 h-14 rounded-xl border border-gray-200 dark:border-gray-800 flex-shrink-0"
          />
          <div className="space-y-1.5 min-w-0">
            <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white font-sans flex items-center flex-wrap gap-2.5">
              {repoDetails.name}
              {repoDetails.license && (
                <span className="px-2 py-0.5 text-[10px] font-mono border border-emerald-500/20 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-md font-semibold flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {repoDetails.license.spdx_id || repoDetails.license.name}
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              Owner: <a href={repoDetails.owner.html_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-[#00f2fe] underline">{repoDetails.owner.login}</a>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
              {repoDetails.description || 'No description provided.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0 self-start md:self-auto">
          {/* Bookmark toggle button */}
          <button
            onClick={() => toggleBookmark(repoDetails)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border transition-all text-xs font-bold shadow-md shadow-amber-500/[0.02] ${
              isBookmarked(repoDetails.id)
                ? 'border-amber-500/20 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-amber-500 dark:hover:text-amber-400'
            }`}
            title={isBookmarked(repoDetails.id) ? 'Remove Bookmark' : 'Bookmark Repository'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked(repoDetails.id) ? 'fill-amber-500/10' : ''}`} />
            {isBookmarked(repoDetails.id) ? 'Bookmarked' : 'Bookmark'}
          </button>

          {/* Comparison Trigger button */}
          <button
            onClick={() => setCompareMode(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-purple-500/20 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/10 text-xs font-bold transition-all shadow-md shadow-purple-500/[0.02]"
          >
            <GitCompare className="w-3.5 h-3.5" />
            Compare
          </button>

          <a
            href={repoDetails.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-[#00f2fe] hover:scale-[1.02] active:scale-[0.98] transition-all text-xs font-bold text-gray-955 shadow-lg shadow-[#00f2fe]/10"
          >
            View on GitHub
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Comparison View vs Details Dashboard Grid */}
      {compareMode ? (
        <RepoCompare
          primaryRepo={repoDetails}
          primaryLanguages={languages}
          primaryCommits={commits}
          onClose={() => setCompareMode(false)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Side Panel: Repository Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Metrics Widget */}
            <div className="border border-gray-200 dark:border-antigravity-border bg-gray-50 dark:bg-antigravity-panel rounded-2xl p-5 space-y-4 transition-colors duration-300">
              <h4 className="text-[14.5px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-200 dark:border-gray-800/50 pb-2">
                Console Telemetry
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-white dark:bg-gray-950/45 border border-gray-200/60 dark:border-gray-900 rounded-xl space-y-1 transition-colors duration-300">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Stars</span>
                  <p className="text-lg font-black text-gray-955 dark:text-gray-100 font-mono">{formatNumber(repoDetails.stargazers_count)}</p>
                </div>
                <div className="p-3.5 bg-white dark:bg-gray-950/45 border border-gray-200/60 dark:border-gray-900 rounded-xl space-y-1 transition-colors duration-300">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Forks</span>
                  <p className="text-lg font-black text-gray-955 dark:text-gray-100 font-mono">{formatNumber(repoDetails.forks_count)}</p>
                </div>
                <div className="p-3.5 bg-white dark:bg-gray-950/45 border border-gray-200/60 dark:border-gray-900 rounded-xl space-y-1 transition-colors duration-300">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Open Issues</span>
                  <p className="text-lg font-black text-gray-955 dark:text-gray-100 font-mono">{formatNumber(repoDetails.open_issues_count)}</p>
                </div>
                <div className="p-3.5 bg-white dark:bg-gray-950/45 border border-gray-200/60 dark:border-gray-900 rounded-xl space-y-1 transition-colors duration-300">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Language</span>
                  <p className="text-sm font-black text-purple-600 dark:text-[#00f2fe] truncate">{repoDetails.language || 'None'}</p>
                </div>
              </div>
            </div>

            {/* Dates Widget */}
            <div className="border border-gray-200 dark:border-antigravity-border bg-gray-50 dark:bg-antigravity-panel rounded-2xl p-5 space-y-3.5 transition-colors duration-300">
              <h4 className="text-[14.5px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-200 dark:border-gray-800/50 pb-2">
                Timeline Meta
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                    Created
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium font-mono">{formatDate(repoDetails.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                    Last Updated
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium font-mono">{formatDate(repoDetails.updated_at)}</span>
                </div>
              </div>
            </div>

            {/* Contributor List Widget */}
            <ContributorList contributors={contributors} />
          </div>

          {/* Visualizations Panel with Suspense fallback loading screens */}
          <div className="lg:col-span-2 space-y-6">
            <Suspense fallback={
              <div className="border border-gray-200 dark:border-antigravity-border bg-gray-50 dark:bg-antigravity-panel rounded-2xl p-5 h-[320px] flex items-center justify-center">
                <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full" />
              </div>
            }>
              <LanguageChart languages={languages} />
            </Suspense>

            <Suspense fallback={
              <div className="border border-gray-200 dark:border-antigravity-border bg-gray-50 dark:bg-antigravity-panel rounded-2xl p-5 h-[320px] flex items-center justify-center">
                <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full" />
              </div>
            }>
              <CommitChart commitData={commits} />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}

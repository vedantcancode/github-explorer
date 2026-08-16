import React, { useState } from 'react';
import { Users, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

export function ContributorList({ contributors = [] }) {
  const [showAll, setShowAll] = useState(false);

  if (contributors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[260px] border border-antigravity-border bg-antigravity-panel/50 rounded-2xl p-6">
        <p className="text-gray-400 text-sm">No contributor data found.</p>
      </div>
    );
  }

  // Display top 5 or all (capped at 20)
  const displayedContributors = showAll ? contributors.slice(0, 20) : contributors.slice(0, 5);
  const maxContributions = contributors[0]?.contributions || 1;

  return (
    <div className="border border-antigravity-border bg-antigravity-panel rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:border-gray-800">
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-gray-800/50 pb-3">
          <h4 className="text-[14.5px] font-bold tracking-wide uppercase text-gray-400 flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-[#00f2fe]" />
            Top Contributors
          </h4>
          <span className="text-xs text-gray-500 font-mono">
            {contributors.length} Total
          </span>
        </div>

        <div className="space-y-3.5">
          {displayedContributors.map((c, idx) => {
            const percentage = Math.max(5, (c.contributions / maxContributions) * 100);
            return (
              <div key={c.id} className="flex items-center gap-3.5 group">
                {/* Ranking index */}
                <span className="text-xs font-mono font-bold text-gray-500 w-4">
                  {idx + 1}
                </span>

                {/* Avatar */}
                <img
                  src={c.avatar_url}
                  alt={c.login}
                  className="w-9 h-9 rounded-full border border-gray-800"
                />

                {/* Info & Progress bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <a
                      href={c.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-gray-300 hover:text-[#00f2fe] flex items-center gap-1 transition-colors truncate"
                    >
                      {c.login}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <span className="font-mono text-gray-400 font-semibold">
                      {c.contributions} {c.contributions === 1 ? 'commit' : 'commits'}
                    </span>
                  </div>

                  {/* Visual progress bar */}
                  <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-[#00f2fe] rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {contributors.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-5 w-full py-2.5 rounded-lg border border-gray-800 bg-gray-950/20 hover:bg-gray-900/40 text-xs text-gray-400 hover:text-white transition-all flex items-center justify-center gap-1.5"
        >
          {showAll ? (
            <>
              Show Less <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Show More <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      )}
    </div>
  );
}

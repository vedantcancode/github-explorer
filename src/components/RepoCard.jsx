import React from 'react';
import { Star, GitFork } from 'lucide-react';

export function RepoCard({ repo, onClick }) {
  const formatStars = (count) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count;
  };

  // Simple language color helper
  const getLangColor = (lang) => {
    if (!lang) return 'bg-gray-600';
    const colors = {
      javascript: 'bg-yellow-500',
      typescript: 'bg-blue-500',
      python: 'bg-green-500',
      html: 'bg-orange-500',
      css: 'bg-purple-500',
      rust: 'bg-red-500',
      go: 'bg-cyan-500',
      java: 'bg-amber-600',
      c: 'bg-zinc-500',
      'c++': 'bg-pink-500',
      ruby: 'bg-rose-600',
      php: 'bg-indigo-500',
    };
    return colors[lang.toLowerCase()] || 'bg-blue-400';
  };

  return (
    <div
      onClick={onClick}
      className="group p-5 rounded-2xl border border-gray-800/80 bg-gray-900/10 hover:bg-gray-900/30 hover:border-gray-700/80 cursor-pointer flex flex-col justify-between h-[190px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/[0.03] animate-fade-in relative overflow-hidden"
    >
      {/* Decorative aura subtle lines */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-tr-2xl" />

      <div>
        <div className="flex items-center gap-3 mb-2.5">
          <img
            src={repo.owner.avatar_url}
            alt={repo.owner.login}
            className="w-7 h-7 rounded-full border border-gray-800"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-gray-100 group-hover:text-purple-400 transition-colors truncate">
              {repo.name}
            </h3>
            <p className="text-[11.5px] text-gray-500 truncate -mt-0.5">
              by {repo.owner.login}
            </p>
          </div>
        </div>
        <p className="text-[13px] text-gray-400 line-clamp-2 leading-relaxed">
          {repo.description || 'No description provided.'}
        </p>
      </div>

      <div className="flex items-center justify-between mt-3 text-[13px] text-gray-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5" title={`${repo.stargazers_count} stars`}>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400/10" />
            <span className="font-semibold text-gray-300">{formatStars(repo.stargazers_count)}</span>
          </div>
          
          <div className="flex items-center gap-1.5" title={`${repo.forks_count} forks`}>
            <GitFork className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-gray-300">{formatStars(repo.forks_count)}</span>
          </div>
        </div>

        {repo.language && (
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${getLangColor(repo.language)}`} />
            <span className="text-xs text-gray-300">{repo.language}</span>
          </div>
        )}
      </div>
    </div>
  );
}

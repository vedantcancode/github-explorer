const BASE_URL = 'https://api.github.com';
const cache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

function getHeaders() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
  };
  const token = localStorage.getItem('github_pat');
  if (token && token.trim()) {
    headers['Authorization'] = `token ${token.trim()}`;
  }
  return headers;
}

export function clearCache() {
  for (const key in cache) {
    delete cache[key];
  }
}

async function request(url, options = {}) {
  // Client-side Caching Logic
  const isGet = options.method === 'GET' || !options.method;
  const cacheKey = `${url}_${options.method || 'GET'}`;
  const now = Date.now();
  
  if (isGet) {
    if (cache[cacheKey] && (now - cache[cacheKey].timestamp < CACHE_TTL)) {
      return cache[cacheKey].value;
    }
  }

  const headers = { ...getHeaders(), ...options.headers };
  const res = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  
  if (res.status === 403) {
    const rateLimitRemaining = res.headers.get('x-ratelimit-remaining');
    if (rateLimitRemaining === '0') {
      throw new Error('GitHub API rate limit exceeded. Please add a Personal Access Token in the settings (top-right) to increase your rate limits.');
    }
    throw new Error('Access Forbidden (403). Your request might have been rate-limited or requires authentication.');
  }
  
  if (res.status === 404) {
    throw new Error('Resource not found (404). Please check that the repository or owner exists.');
  }

  if (res.status === 202) {
    // 202 Accepted means GitHub is calculating stats. Return a status to handle it.
    return { isPending: true };
  }

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.statusText} (${res.status})`);
  }

  const data = await res.json();
  
  // Cache the response if it was a successful GET request and not pending
  if (isGet && !data.isPending) {
    cache[cacheKey] = {
      value: data,
      timestamp: now
    };
  }

  return data;
}

export const githubApi = {
  async searchRepos(query) {
    if (!query) return { items: [] };
    const data = await request(`/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc`);
    return data;
  },

  async getRepoDetails(owner, repo) {
    return await request(`/repos/${owner}/${repo}`);
  },

  async getRepoLanguages(owner, repo) {
    try {
      const data = await request(`/repos/${owner}/${repo}/languages`);
      if (data.isPending) return {};
      return data;
    } catch (err) {
      console.error('Error fetching languages:', err);
      throw err;
    }
  },

  async getRepoCommits(owner, repo) {
    try {
      let data = await request(`/repos/${owner}/${repo}/stats/commit_activity`);
      
      // Retry if pending (calculation queued) or fallback
      if (data && data.isPending) {
        // Fallback to participation stats which is faster/less likely to queue
        const participation = await request(`/repos/${owner}/${repo}/stats/participation`);
        if (participation && !participation.isPending && Array.isArray(participation.all)) {
          const now = Date.now();
          return participation.all.map((count, index) => {
            const weekTimestamp = Math.floor((now - (51 - index) * 7 * 24 * 60 * 60 * 1000) / 1000);
            return {
              total: count,
              week: weekTimestamp,
              days: Array(7).fill(0)
            };
          });
        }
      }
      
      // If we got nothing back or it's empty, try fetching recent commits list
      if (!data || data.isPending || (Array.isArray(data) && data.length === 0)) {
        try {
          const commits = await request(`/repos/${owner}/${repo}/commits?per_page=100`);
          if (Array.isArray(commits)) {
            // Group the commits by week (simplistic mockup)
            const grouped = {};
            commits.forEach(c => {
              const date = new Date(c.commit.author.date);
              const weekStart = new Date(date.setDate(date.getDate() - date.getDay())).toLocaleDateString();
              grouped[weekStart] = (grouped[weekStart] || 0) + 1;
            });
            
            return Object.keys(grouped).map(week => {
              return {
                total: grouped[week],
                week: Math.floor(new Date(week).getTime() / 1000),
                days: Array(7).fill(0)
              };
            }).reverse();
          }
        } catch {
          // If commits fetch also fails (e.g. empty repo), return empty array
          return [];
        }
        return [];
      }
      
      return data;
    } catch (err) {
      console.error('Error fetching commit activity:', err);
      // Don't let stats failure crash the app
      return [];
    }
  },

  async getRepoContributors(owner, repo) {
    try {
      const data = await request(`/repos/${owner}/${repo}/contributors?per_page=20`);
      if (data && data.isPending) return [];
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Error fetching contributors:', err);
      // Fallback
      return [];
    }
  }
};

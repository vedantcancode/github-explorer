import { githubApi, clearCache } from '../api/github';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('GitHub API Wrapper with Client Caching', () => {
  beforeEach(() => {
    clearCache();
    vi.stubGlobal('fetch', vi.fn());
    localStorage.removeItem('github_pat');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch repository details successfully and cache subsequent calls', async () => {
    const mockRepo = { id: 1234, name: 'react', stargazers_count: 200000, owner: { login: 'facebook' } };
    
    // Mock fetch resolution
    fetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: async () => mockRepo
    });

    const firstCall = await githubApi.getRepoDetails('facebook', 'react');
    expect(firstCall.name).toBe('react');
    expect(fetch).toHaveBeenCalledTimes(1);

    // Second call should load from cache, fetch should NOT be called again
    const secondCall = await githubApi.getRepoDetails('facebook', 'react');
    expect(secondCall.name).toBe('react');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should throw an error on 404', async () => {
    fetch.mockResolvedValueOnce({
      status: 404,
      ok: false
    });

    await expect(githubApi.getRepoDetails('invalid', 'repo')).rejects.toThrow('Resource not found (404)');
  });

  it('should clear cache correctly', async () => {
    const mockData = { items: [] };
    
    fetch.mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => mockData
    });

    await githubApi.searchRepos('test');
    expect(fetch).toHaveBeenCalledTimes(1);

    // Clears cache
    clearCache();

    await githubApi.searchRepos('test');
    // Fetch should be hit again
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const sweepstakesAPI = {
  // Sweepstakes
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/api/sweepstakes${query ? '?' + query : ''}`);
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/api/sweepstakes/${id}`);
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_URL}/api/sweepstakes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_URL}/api/sweepstakes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/sweepstakes/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Entries
  submitEntry: async (data) => {
    const response = await fetch(`${API_URL}/api/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getEntries: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/api/entries${query ? '?' + query : ''}`);
    return response.json();
  },

  // User Info
  getUserInfo: async () => {
    const response = await fetch(`${API_URL}/api/user-info`);
    return response.json();
  },

  saveUserInfo: async (data) => {
    const response = await fetch(`${API_URL}/api/user-info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Stats
  getStats: async () => {
    const response = await fetch(`${API_URL}/api/stats`);
    return response.json();
  },

  getStatsBySource: async () => {
    const response = await fetch(`${API_URL}/api/stats/by-source`);
    return response.json();
  },

  // Scraping
  scrapeReddit: async () => {
    const response = await fetch(`${API_URL}/api/scrape/reddit`, {
      method: 'POST',
    });
    return response.json();
  },

  scrapeTwitter: async () => {
    const response = await fetch(`${API_URL}/api/scrape/twitter`, {
      method: 'POST',
    });
    return response.json();
  },

  scrapeAll: async () => {
    const response = await fetch(`${API_URL}/api/scrape/all`, {
      method: 'POST',
    });
    return response.json();
  },
};

export default sweepstakesAPI;

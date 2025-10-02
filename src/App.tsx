import React, { useState, useEffect } from 'react';

type GithubUser = {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
};

const API = 'https://api.github.com';

export default function App() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<GithubUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setUsers([]);
      return;
    }
    setLoading(true);
    fetch(`${API}/search/users?q=${query}&per_page=5`)
      .then(res => res.json())
      .then(data => {
        setUsers(data.items || []);
        setError(null);
      })
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20 }}>
      <h1>GitHub Repositories Explorer</h1>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search username..."
      />
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <img src={user.avatar_url} alt={user.login} width={30} />
            <a href={user.html_url} target="_blank" rel="noreferrer">{user.login}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

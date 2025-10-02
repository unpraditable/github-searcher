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
  const [activeIndex, setActiveIndex] = useState(-1);

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
        setActiveIndex(-1);
      })
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false));
  }, [query]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
    if (!users.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, users.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      window.open(users[activeIndex].html_url, '_blank');
    } else if (e.key === 'Escape') {
      setUsers([]);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20 }}>
      <h1>GitHub Repositories Explorer</h1>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search username..."
      />
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul>
        {users.map((user, i) => (
          <li
            key={user.id}
            style={{
              background: activeIndex === i ? '#e6f0ff' : 'transparent',
            }}
          >
            <img src={user.avatar_url} alt={user.login} width={30} />
            <a href={user.html_url} target="_blank" rel="noreferrer">{user.login}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

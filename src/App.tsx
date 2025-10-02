import React, { useState, useEffect } from 'react';

type GithubUser = {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
};

type Repo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
};

const API = 'https://api.github.com';

export default function App() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<GithubUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const [repos, setRepos] = useState<Repo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [selectedUser, setSelectedUser] = useState<GithubUser | null>(null);

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

  const fetchRepos = (username: string) => {
    setLoadingRepos(true);
    setRepos([]);
    fetch(`${API}/users/${username}/repos?per_page=100`)
      .then(res => res.json())
      .then(data => setRepos(data))
      .catch(() => setError('Failed to load repositories'))
      .finally(() => setLoadingRepos(false));
  };

  const handleSelectUser = (user: GithubUser) => {
    setSelectedUser(user);
    setUsers([]);
    setQuery(user.login);
    fetchRepos(user.login);
  };

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
      handleSelectUser(users[activeIndex]);
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
        style={{ padding: '8px 12px', fontSize: 16 }}
      />
      {loading && <div>Loading users...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul>
        {users.map((user, i) => (
          <li
            key={user.id}
            onClick={() => handleSelectUser(user)}
            style={{
              cursor: 'pointer',
              background: activeIndex === i ? '#e6f0ff' : 'transparent',
              padding: '4px 8px',
            }}
          >
            <img src={user.avatar_url} alt={user.login} width={30} />
            {user.login}
          </li>
        ))}
      </ul>

      {selectedUser && (
        <div style={{ marginTop: 20 }}>
          <h2>
            Repositories of <a href={selectedUser.html_url} target="_blank" rel="noreferrer">{selectedUser.login}</a>
          </h2>
          {loadingRepos && <div>Loading repositories...</div>}
          <ul>
            {repos.map(r => (
              <li key={r.id}>
                <a href={r.html_url} target="_blank" rel="noreferrer">
                  {r.name}
                </a>{' '}
                ⭐{r.stargazers_count}
                {r.description && <p>{r.description}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

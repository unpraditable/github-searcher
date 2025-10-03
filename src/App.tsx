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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">GitHub Repositories Explorer</h1>

      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search username..."
        className="w-full p-2 border rounded mb-2"
      />

      {loading && <div className="text-gray-500">Loading users...</div>}
      {error && <div className="text-red-500">{error}</div>}

      <ul className="border rounded divide-y mb-4">
        {users.map((user, i) => (
          <li
            key={user.id}
            onClick={() => handleSelectUser(user)}
            className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 ${
              activeIndex === i ? 'bg-blue-100' : ''
            }`}
          >
            <img src={user.avatar_url} alt={user.login} className="w-8 h-8 rounded-full" />
            <span>{user.login}</span>
          </li>
        ))}
      </ul>

      {selectedUser && (
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Repositories of{' '}
            <a
              href={selectedUser.html_url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600"
            >
              {selectedUser.login}
            </a>
          </h2>
          {loadingRepos && <div>Loading repositories...</div>}
          <ul className="space-y-2">
            {repos.map(r => (
              <li
                key={r.id}
                className="border rounded p-2 hover:shadow-sm bg-white"
              >
                <a
                  href={r.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-blue-600"
                >
                  {r.name}
                </a>{' '}
                <span className="text-sm text-gray-500">⭐ {r.stargazers_count}</span>
                {r.description && <p className="text-sm text-gray-700">{r.description}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

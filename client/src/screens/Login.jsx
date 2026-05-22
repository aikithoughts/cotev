import { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(false);
    setLoading(true);
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (res.ok) {
      onLogin();
    } else {
      setError(true);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.mark}>כ</div>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          type="text"
          placeholder="username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoFocus
          autoComplete="username"
        />
        <input
          style={styles.input}
          type="password"
          placeholder="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error && <p style={styles.error}>Try again.</p>}
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? '…' : 'enter'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2rem',
  },
  mark: {
    fontSize: '3rem',
    color: 'var(--ink-faint)',
    letterSpacing: '-0.02em',
    userSelect: 'none',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    width: '220px',
  },
  input: {
    width: '100%',
    borderBottom: '1px solid var(--ink-ghost)',
    padding: '0.25rem 0',
    fontSize: '0.9rem',
    textAlign: 'center',
    transition: 'border-color 200ms ease',
  },
  error: {
    fontSize: '0.8rem',
    color: 'var(--ink-faint)',
  },
  button: {
    marginTop: '0.5rem',
    fontSize: '0.85rem',
    color: 'var(--ink-faint)',
    letterSpacing: '0.08em',
    padding: '0.25rem 0',
    transition: 'color 200ms ease',
  },
};

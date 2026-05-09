import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

interface Props {
  onLogin: (username: string) => void;
}

export default function Login({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    // Simulate async auth — swap for a real API call
    await new Promise(r => setTimeout(r, 800));

    // Demo credentials: any username + password "red"
    if (password === 'red') {
      onLogin(username.trim());
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. (Hint: password is "red")');
    }
    setLoading(false);
  };

  return (
    <div className="login-root">
      {/* Ambient glow blobs */}
      <div className="login-blob login-blob-1" aria-hidden="true" />
      <div className="login-blob login-blob-2" aria-hidden="true" />

      <div className="login-card" role="main">
        {/* Logo */}
        <div className="login-logo" aria-label="RED AI logo">
          <span className="login-logo-ring" />
          <span className="login-logo-text">R</span>
        </div>

        <h1 className="login-title">Welcome to RED</h1>
        <p className="login-subtitle">Sign in to access the AI dashboard</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="login-username" className="field-label">Username</label>
            <input
              id="login-username"
              className="field-input"
              type="text"
              autoComplete="username"
              placeholder="your name"
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="login-password" className="field-label">Password</label>
            <input
              id="login-password"
              className="field-input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <p className="login-error" role="alert">{error}</p>}

          <button
            id="login-submit"
            className="login-btn"
            type="submit"
            disabled={loading}
          >
            {loading
              ? <span className="login-spinner" aria-label="Signing in…" />
              : 'Sign in'}
          </button>
        </form>

        <p className="login-hint">Demo: any username · password <code>red</code></p>
      </div>
    </div>
  );
}

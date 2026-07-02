import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <ScreenHeader title="" onBack={() => navigate('/')} />
      <div className="screen-content px-6">
        <h1 className="font-display text-2xl font-semibold mb-2">Welcome Back</h1>
        <p className="text-muted text-sm mb-8">Login to continue your fitness journey</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full card px-4 py-3.5 text-sm outline-none"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full card px-4 py-3.5 text-sm outline-none"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-sm mt-2">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-xs text-muted my-6">or continue with</p>
        <div className="space-y-3">
          <button className="btn-secondary w-full py-3.5 text-sm" disabled title="Demo build">
            Continue with Google
          </button>
          <button className="btn-secondary w-full py-3.5 text-sm" disabled title="Demo build">
            Continue with Apple
          </button>
        </div>

        <p className="text-center text-sm text-muted mt-8">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-ink font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

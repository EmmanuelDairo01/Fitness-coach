import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(name, email, password);
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
        <h1 className="font-display text-2xl font-semibold mb-2">Create Account</h1>
        <p className="text-muted text-sm mb-8">Start your fitness journey with an AI coach in your pocket</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full card px-4 py-3.5 text-sm outline-none"
          />
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
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full card px-4 py-3.5 text-sm outline-none"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-sm mt-2">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-ink font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

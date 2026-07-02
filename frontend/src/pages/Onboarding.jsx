import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="app-shell justify-between">
      <div className="flex justify-end px-5 pt-6">
        <button onClick={() => navigate('/login')} className="text-sm text-muted">
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-28 h-28 rounded-2xl bg-volt flex items-center justify-center mb-8">
          <Sparkles size={44} strokeWidth={1.6} />
        </div>
        <h1 className="font-display text-3xl font-semibold leading-tight mb-3">
          Your AI Fitness Companion
        </h1>
        <p className="text-muted text-sm leading-relaxed">
          Track workouts, scan food, and get smarter every day.
        </p>
      </div>

      <div className="px-6 pb-10 space-y-4">
        <button onClick={() => navigate('/signup')} className="btn-primary w-full py-4 text-sm">
          Get Started
        </button>
        <p className="text-center text-sm text-muted">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-ink font-semibold">
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

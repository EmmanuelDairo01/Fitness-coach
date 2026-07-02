import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Camera, Dumbbell, Bot, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import BottomNav from '../components/BottomNav';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [today, setToday] = useState({ calories: 0 });
  const [summary, setSummary] = useState({ workoutsThisWeek: 0, lastSession: null });
  const [tip, setTip] = useState('');
  const [loadingTip, setLoadingTip] = useState(true);

  useEffect(() => {
    api.get('/api/food/today').then((d) => setToday(d.today)).catch(() => {});
    api.get('/api/workouts/summary').then(setSummary).catch(() => {});
    api
      .get('/api/coach/insights')
      .then((d) => setTip(d.tips?.[0] || ''))
      .catch(() => setTip(''))
      .finally(() => setLoadingTip(false));
  }, []);

  const calorieGoal = user?.dailyCalorieGoal || 2300;
  const workoutGoal = user?.weeklyWorkoutGoal || 5;
  const caloriePct = Math.min(100, Math.round(((today.calories || 0) / calorieGoal) * 100));

  return (
    <div className="app-shell">
      <div className="screen-content px-5 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-xl font-semibold">
            Good {timeOfDay()}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <button className="w-9 h-9 rounded-full border border-line flex items-center justify-center">
            <Bell size={16} />
          </button>
        </div>

        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Today&apos;s Summary</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card p-4">
            <p className="text-xs text-muted mb-2">Calories Intake</p>
            <p className="font-display text-xl font-semibold">{today.calories || 0}</p>
            <p className="text-xs text-muted">/ {calorieGoal} kcal</p>
            <div className="h-1.5 bg-line rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-volt" style={{ width: `${caloriePct}%` }} />
            </div>
          </div>
          <div className="card p-4">
            <p className="text-xs text-muted mb-2">Workouts</p>
            <p className="font-display text-xl font-semibold">
              {summary.workoutsThisWeek} / {workoutGoal}
            </p>
            <p className="text-xs text-muted">this week</p>
          </div>
        </div>

        <div className="card p-4 mb-6 flex gap-3">
          <div className="w-10 h-10 rounded-full bg-volt flex items-center justify-center shrink-0">
            <Bot size={18} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">AI Coach</p>
            <p className="text-sm leading-snug mb-2">
              {loadingTip ? 'Looking at your recent logs...' : tip || 'Log a workout or meal to get your first tip.'}
            </p>
            <button onClick={() => navigate('/coach')} className="text-xs font-semibold underline">
              View tips
            </button>
          </div>
        </div>

        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Quick Actions</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <QuickAction icon={Camera} label="Scan Food" onClick={() => navigate('/scan')} />
          <QuickAction icon={Dumbbell} label="Log Workout" onClick={() => navigate('/workout/log')} />
          <QuickAction icon={Bot} label="AI Coach" onClick={() => navigate('/coach')} />
        </div>

        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Today&apos;s Workout</p>
        <button
          onClick={() => navigate('/workout/log')}
          className="card p-4 w-full flex items-center justify-between text-left"
        >
          <div>
            <p className="text-sm font-semibold">{summary.lastSession?.name || 'No workout yet'}</p>
            <p className="text-xs text-muted mt-1">
              {summary.lastSession?.completed_at ? 'Completed' : summary.lastSession ? 'In progress' : 'Tap to start one'}
            </p>
          </div>
          <ChevronRight size={18} className="text-muted" />
        </button>
      </div>
      <BottomNav />
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="card p-3 flex flex-col items-center gap-2">
      <div className="w-9 h-9 rounded-full bg-paper border border-line flex items-center justify-center">
        <Icon size={16} />
      </div>
      <span className="text-[11px] font-medium text-center leading-tight">{label}</span>
    </button>
  );
}

function timeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

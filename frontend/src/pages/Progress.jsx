import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { api } from '../api/client';
import BottomNav from '../components/BottomNav';

const RANGES = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: '3months', label: '3 Months' },
  { key: 'year', label: 'Year' },
];

export default function Progress() {
  const [topLifts, setTopLifts] = useState([]);
  const [exercise, setExercise] = useState('');
  const [range, setRange] = useState('month');
  const [progress, setProgress] = useState({ points: [], summary: { total_volume: 0, total_reps: 0 } });
  const [allExercises, setAllExercises] = useState([]);

  useEffect(() => {
    api.get('/api/workouts/top-lifts').then((d) => {
      setTopLifts(d.topLifts);
      if (d.topLifts.length) setExercise((prev) => prev || d.topLifts[0].exercise);
    });
    api.get('/api/exercises').then((d) => setAllExercises(d.exercises));
  }, []);

  useEffect(() => {
    if (!exercise) return;
    api
      .get(`/api/workouts/progress?exercise=${encodeURIComponent(exercise)}&range=${range}`)
      .then(setProgress);
  }, [exercise, range]);

  const points = progress.points.map((p) => ({ ...p, volume: Number(p.volume) }));
  const change = computeChange(points);

  return (
    <div className="app-shell">
      <div className="screen-content px-5 pt-6">
        <h1 className="font-display text-xl font-semibold mb-5">Progress</h1>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
                range === r.key ? 'bg-ink text-paper border-ink' : 'border-line text-muted'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <select
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          className="w-full card px-4 py-3 text-sm font-medium mb-4 outline-none"
        >
          {allExercises.map((ex) => (
            <option key={ex.id} value={ex.name}>
              {ex.name}
            </option>
          ))}
        </select>

        <div className="card p-4 mb-4">
          <p className="text-xs text-muted mb-1">{exercise} (Total Volume)</p>
          <div className="flex items-baseline gap-2 mb-4">
            <p className="font-display text-2xl font-semibold">
              {Math.round(progress.summary.total_volume || 0).toLocaleString()} kg
            </p>
            {change !== null && (
              <span className={`text-xs font-semibold ${change >= 0 ? 'text-voltDark' : 'text-red-500'}`}>
                {change >= 0 ? '+' : ''}
                {change}%
              </span>
            )}
          </div>
          <div style={{ width: '100%', height: 140 }}>
            <ResponsiveContainer>
              <LineChart data={points}>
                <XAxis dataKey="date" hide />
                <Tooltip
                  formatter={(v) => [`${v} kg`, 'Volume']}
                  labelFormatter={(l) => l}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Line type="monotone" dataKey="volume" stroke="#101010" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {points.length === 0 && (
            <p className="text-xs text-muted text-center py-6">No sets logged for this exercise yet.</p>
          )}
        </div>

        <div className="card p-4 mb-4 flex gap-3 items-start">
          <div className="w-9 h-9 rounded-full bg-volt flex items-center justify-center shrink-0">
            <TrendingUp size={16} />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Performance</p>
            <p className="text-sm leading-snug">
              {points.length < 2
                ? 'Log a couple more sessions to see your trend here.'
                : change >= 0
                ? `Nice! Your total volume on ${exercise} is up ${change}% over this period.`
                : `Your volume on ${exercise} dipped ${Math.abs(change)}% — consider a deload or extra recovery.`}
            </p>
          </div>
        </div>

        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Top Lifts</p>
        <div className="card divide-y divide-line mb-4">
          {topLifts.map((lift) => (
            <div key={lift.exercise} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium">{lift.exercise}</span>
              <span className="text-sm text-muted">{lift.top_weight} kg</span>
            </div>
          ))}
          {topLifts.length === 0 && <p className="text-sm text-muted text-center py-8">No lifts logged yet.</p>}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function computeChange(points) {
  if (points.length < 2) return null;
  const first = points[0].volume;
  const last = points[points.length - 1].volume;
  if (!first) return null;
  return Math.round(((last - first) / first) * 100);
}

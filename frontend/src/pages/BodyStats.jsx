import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import ScreenHeader from '../components/ScreenHeader';
import { api } from '../api/client';

export default function BodyStats() {
  const [entries, setEntries] = useState([]);
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    api.get('/api/users/body-weight').then((d) => setEntries(d.entries));
  }

  useEffect(load, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!weight) return;
    setSaving(true);
    try {
      await api.post('/api/users/body-weight', { weightKg: parseFloat(weight) });
      setWeight('');
      load();
    } finally {
      setSaving(false);
    }
  }

  const points = entries.map((e) => ({ date: e.logged_at.slice(0, 10), weight: Number(e.weight_kg) }));
  const latest = points[points.length - 1]?.weight;
  const change = points.length > 1 ? Math.round((latest - points[0].weight) * 10) / 10 : null;

  return (
    <div className="app-shell">
      <ScreenHeader title="Body Stats" />
      <div className="screen-content px-5">
        <div className="card p-4 mb-5">
          <p className="text-xs text-muted mb-1">Current Weight</p>
          <div className="flex items-baseline gap-2">
            <p className="font-display text-3xl font-semibold">{latest ?? '—'} kg</p>
            {change !== null && (
              <span className={`text-xs font-semibold ${change <= 0 ? 'text-voltDark' : 'text-red-500'}`}>
                {change > 0 ? '+' : ''}
                {change} kg total
              </span>
            )}
          </div>
          <div style={{ width: '100%', height: 120 }} className="mt-3">
            <ResponsiveContainer>
              <LineChart data={points}>
                <XAxis dataKey="date" hide />
                <Tooltip formatter={(v) => [`${v} kg`, 'Weight']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="weight" stroke="#101010" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input
            type="number"
            step="0.1"
            placeholder="Log today's weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="flex-1 card px-4 py-3 text-sm outline-none"
          />
          <button type="submit" disabled={saving} className="btn-primary px-5 text-sm">
            {saving ? '...' : 'Add'}
          </button>
        </form>

        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">History</p>
        <div className="card divide-y divide-line">
          {[...entries].reverse().map((e) => (
            <div key={e.id} className="flex justify-between px-4 py-3 text-sm">
              <span className="text-muted">{e.logged_at.slice(0, 10)}</span>
              <span className="font-medium">{e.weight_kg} kg</span>
            </div>
          ))}
          {entries.length === 0 && <p className="text-sm text-muted text-center py-8">No weight logged yet.</p>}
        </div>
      </div>
    </div>
  );
}

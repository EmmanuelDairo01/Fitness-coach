import React, { useEffect, useState } from 'react';
import ScreenHeader from '../components/ScreenHeader';
import { api } from '../api/client';

export default function FoodLog() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    api.get('/api/food?limit=50').then((d) => setEntries(d.entries));
  }, []);

  async function handleDelete(id) {
    await api.delete(`/api/food/${id}`);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="app-shell">
      <ScreenHeader title="Food Log" />
      <div className="screen-content px-5">
        <div className="space-y-3">
          {entries.map((e) => (
            <div key={e.id} className="card p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{e.name}</p>
                <p className="text-xs text-muted">
                  {e.serving_description} &middot; {new Date(e.logged_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display font-semibold text-sm">{e.calories} kcal</p>
                <button onClick={() => handleDelete(e.id)} className="text-xs text-muted underline mt-1">
                  Remove
                </button>
              </div>
            </div>
          ))}
          {entries.length === 0 && <p className="text-sm text-muted text-center py-12">No meals logged yet.</p>}
        </div>
      </div>
    </div>
  );
}

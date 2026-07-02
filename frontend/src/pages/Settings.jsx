import React, { useState } from 'react';
import ScreenHeader from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [calorieGoal, setCalorieGoal] = useState(user?.dailyCalorieGoal || 2300);
  const [workoutGoal, setWorkoutGoal] = useState(user?.weeklyWorkoutGoal || 5);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const { user: updated } = await api.patch('/api/users/me', {
        name,
        dailyCalorieGoal: parseInt(calorieGoal, 10),
        weeklyWorkoutGoal: parseInt(workoutGoal, 10),
      });
      updateUser(updated);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-shell">
      <ScreenHeader title="Settings" />
      <div className="screen-content px-5">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full card px-4 py-3 text-sm outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">
              Daily Calorie Goal
            </label>
            <input
              type="number"
              value={calorieGoal}
              onChange={(e) => setCalorieGoal(e.target.value)}
              className="w-full card px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">
              Weekly Workout Goal
            </label>
            <input
              type="number"
              value={workoutGoal}
              onChange={(e) => setWorkoutGoal(e.target.value)}
              className="w-full card px-4 py-3 text-sm outline-none"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-3.5 text-sm mt-2">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {saved && <p className="text-xs text-voltDark text-center">Saved.</p>}
        </form>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { api } from '../api/client';

const ACTIVE_SESSION_KEY = 'fitai_active_session';

export default function WorkoutTracker() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [sessionId, setSessionId] = useState(null);
  const [workoutName, setWorkoutName] = useState('Workout');
  const [notes, setNotes] = useState('');
  const [allSets, setAllSets] = useState([]);
  const [exercise, setExercise] = useState(null); // { id, name }
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);

  // Bootstrap or resume a session
  useEffect(() => {
    async function init() {
      let id = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (!id) {
        const { session } = await api.post('/api/workouts/sessions', { name: 'Workout' });
        id = session.id;
        localStorage.setItem(ACTIVE_SESSION_KEY, id);
      }
      setSessionId(id);
      const data = await api.get(`/api/workouts/sessions/${id}`);
      setWorkoutName(data.session.name);
      setNotes(data.session.notes || '');
      setAllSets(data.sets);
      setLoading(false);
    }
    init().catch(() => setLoading(false));
  }, []);

  // Picked an exercise from the Select Exercise screen
  useEffect(() => {
    if (state?.selectedExercise) {
      setExercise(state.selectedExercise);
    }
  }, [state]);

  const currentSets = exercise ? allSets.filter((s) => s.exercise_id === exercise.id) : [];

  async function handleAddSet() {
    if (!exercise || !weight || !reps) return;
    const { set } = await api.post(`/api/workouts/sessions/${sessionId}/sets`, {
      exerciseId: exercise.id,
      setNumber: currentSets.length + 1,
      weightKg: parseFloat(weight),
      reps: parseInt(reps, 10),
    });
    setAllSets((prev) => [...prev, { ...set, exercise_name: exercise.name }]);
    setWeight('');
    setReps('');
  }

  async function handleDeleteSet(setId) {
    await api.delete(`/api/workouts/sets/${setId}`);
    setAllSets((prev) => prev.filter((s) => s.id !== setId));
  }

  async function handleFinish() {
    setFinishing(true);
    try {
      await api.patch(`/api/workouts/sessions/${sessionId}`, { name: workoutName, notes, complete: true });
      localStorage.removeItem(ACTIVE_SESSION_KEY);
      navigate('/progress');
    } finally {
      setFinishing(false);
    }
  }

  const exercisesInWorkout = [...new Map(allSets.map((s) => [s.exercise_id, s.exercise_name])).entries()];

  if (loading) {
    return (
      <div className="app-shell items-center justify-center">
        <p className="text-sm text-muted">Loading workout...</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <button onClick={() => navigate('/dashboard')} className="w-9 h-9 flex items-center justify-center rounded-full border border-line">
          <ChevronLeft size={18} />
        </button>
        <h1 className="font-display text-base font-semibold">Log Workout</h1>
        <button onClick={handleFinish} disabled={finishing} className="text-sm font-semibold">
          {finishing ? '...' : 'Finish'}
        </button>
      </div>

      <div className="screen-content px-5">
        <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">Workout Name</label>
        <input
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          className="w-full card px-4 py-3 text-sm outline-none mb-5"
        />

        <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">Exercise</label>
        <button
          onClick={() => navigate('/workout/select-exercise')}
          className="w-full card px-4 py-3.5 flex items-center justify-between mb-5"
        >
          <span className="text-sm font-medium">{exercise ? exercise.name : 'Select an exercise'}</span>
          <ChevronRight size={16} className="text-muted" />
        </button>

        {exercise && (
          <>
            <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">Sets</label>
            <div className="space-y-2 mb-3">
              {currentSets.map((s, i) => (
                <div key={s.id} className="card px-4 py-2.5 flex items-center justify-between text-sm">
                  <span className="text-muted w-12">Set {i + 1}</span>
                  <span>{s.weight_kg} kg</span>
                  <span>x</span>
                  <span>{s.reps} reps</span>
                  <button onClick={() => handleDeleteSet(s.id)} className="text-muted">
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-6">
              <input
                type="number"
                placeholder="kg"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-1/3 card px-3 py-2.5 text-sm outline-none"
              />
              <input
                type="number"
                placeholder="reps"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="w-1/3 card px-3 py-2.5 text-sm outline-none"
              />
              <button
                onClick={handleAddSet}
                className="flex-1 btn-primary text-sm flex items-center justify-center gap-1"
              >
                <Plus size={15} /> Add Set
              </button>
            </div>
          </>
        )}

        {exercisesInWorkout.length > 0 && (
          <>
            <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">
              In this workout
            </label>
            <div className="flex flex-wrap gap-2 mb-6">
              {exercisesInWorkout.map(([id, name]) => (
                <button
                  key={id}
                  onClick={() => setExercise({ id, name })}
                  className={`px-3 py-1.5 rounded-full text-xs border ${
                    exercise?.id === id ? 'bg-ink text-paper border-ink' : 'border-line text-muted'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </>
        )}

        <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did it feel?"
          rows={3}
          className="w-full card px-4 py-3 text-sm outline-none resize-none"
        />
      </div>
    </div>
  );
}

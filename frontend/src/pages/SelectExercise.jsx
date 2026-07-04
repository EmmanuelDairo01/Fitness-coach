import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Info } from 'lucide-react';
import { api } from '../api/client';
import ExerciseDetailModal from '../components/ExerciseDetailModal';

const CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Shoulder', 'Arms', 'Core'];

export default function SelectExercise() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [exercises, setExercises] = useState([]);
  const [detailExercise, setDetailExercise] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category !== 'All') params.set('category', category);
    api.get(`/api/exercises?${params.toString()}`).then((d) => setExercises(d.exercises));
  }, [search, category]);

  function pick(ex) {
    navigate('/workout/log', { state: { selectedExercise: { id: ex.id, name: ex.name } } });
  }

  const CATEGORY_COLORS = {
    Chest: 'bg-red-100 text-red-600',
    Back: 'bg-blue-100 text-blue-600',
    Legs: 'bg-green-100 text-green-600',
    Shoulder: 'bg-purple-100 text-purple-600',
    Arms: 'bg-orange-100 text-orange-600',
    Core: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <div className="app-shell">
      <div className="flex items-center px-5 pt-6 pb-4 gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full border border-line">
          <ChevronLeft size={18} />
        </button>
        <h1 className="font-display text-base font-semibold">Select Exercise</h1>
      </div>

      <div className="px-5">
        <div className="card flex items-center gap-2 px-4 py-3 mb-4">
          <Search size={16} className="text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises"
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-1 -mx-1 px-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
                category === c ? 'bg-ink text-paper border-ink' : 'border-line text-muted'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="screen-content px-5">
        <div className="space-y-1">
          {exercises.map((ex) => (
            <button
              key={ex.id}
              onClick={() => pick(ex)}
              className="w-full flex items-center gap-3 py-3 border-b border-line text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-line shrink-0 overflow-hidden flex items-center justify-center">
                {ex.image_url ? (
                  <img
                    src={ex.image_url}
                    alt={ex.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.classList.add(CATEGORY_COLORS[ex.category] || 'bg-line');
                    }}
                  />
                ) : (
                  <span className={`text-xs font-bold ${CATEGORY_COLORS[ex.category] || ''}`}>
                    {ex.category?.[0] ?? '?'}
                  </span>
                )}
              </div>
              <span className="flex-1 text-sm font-medium">{ex.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setDetailExercise(ex); }}
                className="w-7 h-7 flex items-center justify-center rounded-full text-muted hover:bg-line"
              >
                <Info size={15} />
              </button>
            </button>
          ))}
          {exercises.length === 0 && (
            <p className="text-sm text-muted text-center py-12">No exercises match your search.</p>
          )}
        </div>
      </div>
      <ExerciseDetailModal exercise={detailExercise} onClose={() => setDetailExercise(null)} />
    </div>
  );
}

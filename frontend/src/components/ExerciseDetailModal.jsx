import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../api/client';

export default function ExerciseDetailModal({ exercise, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!exercise) return;
    setLoading(true);
    api.get(`/api/exercises/${exercise.id}/details`)
      .then(setDetails)
      .finally(() => setLoading(false));
  }, [exercise?.id]);

  if (!exercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-paper w-full max-w-md rounded-t-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-line z-10"
        >
          <X size={16} />
        </button>

        {details?.image_url && (
          <div className="w-full h-52 bg-line overflow-hidden rounded-t-2xl">
            <img
              src={details.secondImage || details.image_url}
              alt={exercise.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = details.image_url; }}
            />
          </div>
        )}

        <div className="p-5">
          <h2 className="font-display text-lg font-semibold mb-1">{exercise.name}</h2>

          {loading ? (
            <p className="text-sm text-muted py-4">Loading details...</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {details?.level && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-line capitalize">
                    {details.level}
                  </span>
                )}
                {details?.equipment && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-line capitalize">
                    {details.equipment}
                  </span>
                )}
                {details?.primaryMuscles?.map((m) => (
                  <span key={m} className="px-2 py-1 rounded-full text-xs font-medium bg-ink text-paper capitalize">
                    {m}
                  </span>
                ))}
              </div>

              {details?.instructions?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">How to do it</h3>
                  <ol className="space-y-3">
                    {details.instructions.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-ink text-paper text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm text-muted leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {details?.secondaryMuscles?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-line">
                  <p className="text-xs text-muted">
                    <span className="font-medium text-ink">Also works: </span>
                    {details.secondaryMuscles.join(', ')}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

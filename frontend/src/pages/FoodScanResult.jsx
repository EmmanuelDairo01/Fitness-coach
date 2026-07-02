import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ThumbsUp, ThumbsDown, ImageOff } from 'lucide-react';
import { api } from '../api/client';

export default function FoodScanResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const imageBase64 = state?.imageBase64;

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!imageBase64) {
      navigate('/scan', { replace: true });
      return;
    }
    api
      .post('/api/food/analyze', { imageBase64 })
      .then((d) => setAnalysis(d.analysis))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [imageBase64]);

  async function handleSave() {
    if (!analysis) return;
    setSaving(true);
    try {
      await api.post('/api/food', {
        name: analysis.name,
        servingDescription: analysis.serving_description,
        calories: analysis.calories,
        proteinG: analysis.protein_g,
        carbsG: analysis.carbs_g,
        fatsG: analysis.fats_g,
        breakdown: analysis.breakdown,
        confidence: analysis.confidence,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <button onClick={() => navigate('/scan')} className="w-9 h-9 flex items-center justify-center rounded-full border border-line">
          <ChevronLeft size={18} />
        </button>
        <h1 className="font-display text-base font-semibold">Scan Result</h1>
        <button
          onClick={handleSave}
          disabled={!analysis || saving || analysis?.demo_mode}
          className="text-sm font-semibold disabled:text-muted"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="screen-content px-5">
        {loading && <LoadingState />}

        {!loading && error && (
          <p className="text-sm text-red-600 mb-4">{error}</p>
        )}

        {!loading && analysis && (
          <>
            {analysis.demo_mode && (
              <div className="card p-3 mb-4 bg-volt/30 border-voltDark text-xs leading-relaxed">
                Demo mode: add an Anthropic API key to ai-service/.env to get real calorie estimates from this
                photo.
              </div>
            )}

            <div className="flex gap-3 mb-6">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-line flex items-center justify-center shrink-0">
                {imageBase64 ? (
                  <img src={imageBase64} alt="Scanned food" className="w-full h-full object-cover" />
                ) : (
                  <ImageOff size={20} className="text-muted" />
                )}
              </div>
              <div>
                <p className="font-display font-semibold leading-tight">{analysis.name}</p>
                <p className="text-xs text-muted mt-1">{analysis.serving_description}</p>
              </div>
            </div>

            <div className="card p-4 mb-4">
              <p className="text-xs text-muted mb-1">Total Calories</p>
              <p className="font-display text-3xl font-semibold mb-4">
                {analysis.calories} <span className="text-base font-normal text-muted">kcal</span>
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Macro label="Protein" value={`${analysis.protein_g}g`} />
                <Macro label="Carbs" value={`${analysis.carbs_g}g`} />
                <Macro label="Fats" value={`${analysis.fats_g}g`} />
              </div>
            </div>

            {analysis.breakdown?.length > 0 && (
              <div className="card p-4 mb-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Breakdown</p>
                <div className="space-y-2">
                  {analysis.breakdown.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{item.item}</span>
                      <span className="text-muted">{item.calories} kcal</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card p-4 mb-4 flex items-center justify-between">
              <span className="text-sm font-medium">Is this correct?</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFeedback('up')}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center ${feedback === 'up' ? 'bg-volt border-voltDark' : 'border-line'}`}
                >
                  <ThumbsUp size={15} />
                </button>
                <button
                  onClick={() => setFeedback('down')}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center ${feedback === 'down' ? 'bg-line border-muted' : 'border-line'}`}
                >
                  <ThumbsDown size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Macro({ label, value }) {
  return (
    <div>
      <p className="font-display font-semibold text-sm">{value}</p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-10 h-10 rounded-full border-2 border-line border-t-ink animate-spin mb-4" />
      <p className="text-sm text-muted">Analyzing your meal...</p>
    </div>
  );
}

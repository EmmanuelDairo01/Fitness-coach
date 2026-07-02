import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function ScreenHeader({ title, onBack, right }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-4">
      <button
        onClick={onBack || (() => navigate(-1))}
        className="w-9 h-9 flex items-center justify-center rounded-full border border-line"
      >
        <ChevronLeft size={18} />
      </button>
      <h1 className="font-display text-base font-semibold">{title}</h1>
      <div className="w-9 h-9 flex items-center justify-center">{right}</div>
    </div>
  );
}

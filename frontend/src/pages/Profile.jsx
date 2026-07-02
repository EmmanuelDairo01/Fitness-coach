import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Scale,
  Target,
  History,
  Utensils,
  Bot,
  HelpCircle,
  LogOut,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const xpForNextLevel = 4000;
  const xpPct = Math.min(100, Math.round(((user?.xp || 0) / xpForNextLevel) * 100));

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <div className="screen-content px-5 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-xl font-semibold">Profile</h1>
          <button onClick={() => navigate('/profile/settings')} className="w-9 h-9 rounded-full border border-line flex items-center justify-center">
            <SettingsIcon size={16} />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-line flex items-center justify-center">
            <UserIcon size={26} className="text-muted" />
          </div>
          <div className="flex-1">
            <p className="font-display font-semibold">{user?.name}</p>
            <p className="text-xs text-muted mb-2">Level {user?.level || 1}</p>
            <div className="h-1.5 bg-line rounded-full overflow-hidden">
              <div className="h-full bg-volt" style={{ width: `${xpPct}%` }} />
            </div>
            <p className="text-[11px] text-muted mt-1">{user?.xp || 0} / {xpForNextLevel} XP</p>
          </div>
        </div>

        <div className="card divide-y divide-line">
          <MenuItem icon={Scale} label="Body Stats" onClick={() => navigate('/profile/body-stats')} />
          <MenuItem icon={Target} label="Goals" onClick={() => navigate('/profile/settings')} />
          <MenuItem icon={History} label="Workout History" onClick={() => navigate('/progress')} />
          <MenuItem icon={Utensils} label="Food Log" onClick={() => navigate('/profile/food-log')} />
          <MenuItem icon={Bot} label="AI Coach History" onClick={() => navigate('/coach')} />
          <MenuItem icon={SettingsIcon} label="Settings" onClick={() => navigate('/profile/settings')} />
          <MenuItem icon={HelpCircle} label="Help & Support" onClick={() => {}} />
          <MenuItem icon={LogOut} label="Log Out" onClick={handleLogout} danger />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between px-4 py-3.5">
      <span className="flex items-center gap-3">
        <Icon size={17} className={danger ? 'text-red-500' : 'text-muted'} />
        <span className={`text-sm font-medium ${danger ? 'text-red-500' : ''}`}>{label}</span>
      </span>
      <ChevronRight size={16} className="text-muted" />
    </button>
  );
}

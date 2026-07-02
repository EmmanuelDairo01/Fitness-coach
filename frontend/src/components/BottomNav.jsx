import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, Camera, LineChart, User } from 'lucide-react';

const tabs = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/workout/log', label: 'Workout', icon: Dumbbell },
  { to: '/scan', label: 'Scan', icon: Camera },
  { to: '/progress', label: 'Progress', icon: LineChart },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-card border-t border-line">
      <div className="flex items-center justify-between px-4 py-2">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2 text-[11px] font-medium ${
                isActive ? 'text-ink' : 'text-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import FoodScanCamera from './pages/FoodScanCamera';
import FoodScanResult from './pages/FoodScanResult';
import WorkoutTracker from './pages/WorkoutTracker';
import SelectExercise from './pages/SelectExercise';
import Progress from './pages/Progress';
import AICoach from './pages/AICoach';
import Profile from './pages/Profile';
import BodyStats from './pages/BodyStats';
import FoodLog from './pages/FoodLog';
import Settings from './pages/Settings';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="app-shell items-center justify-center">
        <p className="text-sm text-muted">Loading...</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/scan" element={<ProtectedRoute><FoodScanCamera /></ProtectedRoute>} />
      <Route path="/scan/result" element={<ProtectedRoute><FoodScanResult /></ProtectedRoute>} />
      <Route path="/workout/log" element={<ProtectedRoute><WorkoutTracker /></ProtectedRoute>} />
      <Route path="/workout/select-exercise" element={<ProtectedRoute><SelectExercise /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
      <Route path="/coach" element={<ProtectedRoute><AICoach /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/body-stats" element={<ProtectedRoute><BodyStats /></ProtectedRoute>} />
      <Route path="/profile/food-log" element={<ProtectedRoute><FoodLog /></ProtectedRoute>} />
      <Route path="/profile/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

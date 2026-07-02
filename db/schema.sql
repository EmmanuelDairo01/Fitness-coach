-- FitAI database schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  daily_calorie_goal INT DEFAULT 2300,
  weekly_workout_goal INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS body_weight_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  weight_kg NUMERIC(5,2) NOT NULL,
  logged_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL,
  image_url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) DEFAULT 'Workout',
  notes TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workout_sets (
  id SERIAL PRIMARY KEY,
  session_id INT REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id INT REFERENCES exercises(id),
  set_number INT NOT NULL,
  weight_kg NUMERIC(6,2) NOT NULL DEFAULT 0,
  reps INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS food_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  serving_description VARCHAR(150),
  calories INT NOT NULL DEFAULT 0,
  protein_g NUMERIC(5,1) DEFAULT 0,
  carbs_g NUMERIC(5,1) DEFAULT 0,
  fats_g NUMERIC(5,1) DEFAULT 0,
  breakdown JSONB,
  confidence VARCHAR(20),
  logged_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'user' | 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON food_logs(user_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_sets_session ON workout_sets(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON workout_sessions(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_weight_user ON body_weight_logs(user_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages(user_id, created_at);

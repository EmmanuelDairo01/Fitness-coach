const pool = require('./db');

async function initDb() {
  // Create all tables
  await pool.query(`
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
      role VARCHAR(20) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON food_logs(user_id, logged_at);
    CREATE INDEX IF NOT EXISTS idx_sets_session ON workout_sets(session_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON workout_sessions(user_id, started_at);
    CREATE INDEX IF NOT EXISTS idx_weight_user ON body_weight_logs(user_id, logged_at);
    CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages(user_id, created_at);
  `);

  // Seed exercises only if the table is empty
  const { rows } = await pool.query('SELECT COUNT(*) FROM exercises');
  if (parseInt(rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO exercises (name, category, image_url) VALUES
        ('Bench Press','Chest','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg'),
        ('Incline Bench Press','Chest','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg'),
        ('Decline Bench Press','Chest','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Bench_Press/0.jpg'),
        ('Dumbbell Chest Press','Chest','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/0.jpg'),
        ('Incline Dumbbell Press','Chest','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/0.jpg'),
        ('Dumbbell Fly','Chest','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Flyes/0.jpg'),
        ('Cable Crossover','Chest','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg'),
        ('Cable Fly','Chest','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg'),
        ('Chest Dip','Chest','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Chest_Version/0.jpg'),
        ('Push Ups','Chest',NULL),
        ('Pec Deck','Chest',NULL),
        ('Machine Chest Press','Chest',NULL),
        ('Pull Up','Back','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Assisted_Pull-Up/0.jpg'),
        ('Chin Up','Back','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chin-Up/0.jpg'),
        ('Lat Pulldown','Back','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Front_Lat_Pulldown/0.jpg'),
        ('Seated Cable Row','Back','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/0.jpg'),
        ('Barbell Row','Back','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/0.jpg'),
        ('Single Arm Dumbbell Row','Back','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/0.jpg'),
        ('T-Bar Row','Back','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_T-Bar_Row/0.jpg'),
        ('Deadlift','Back','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/0.jpg'),
        ('Hyperextension','Back','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hyperextensions_With_No_Hyperextension_Bench/0.jpg'),
        ('Face Pull','Back','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/0.jpg'),
        ('Machine Row','Back',NULL),
        ('Squat','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/0.jpg'),
        ('Hack Squat','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hack_Squat/0.jpg'),
        ('Goblet Squat','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Goblet_Squat/0.jpg'),
        ('Leg Press','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg'),
        ('Leg Curl','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/0.jpg'),
        ('Leg Extension','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg'),
        ('Hip Thrust','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg'),
        ('Lunges','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Lunge/0.jpg'),
        ('Walking Lunges','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Walking_Lunge/0.jpg'),
        ('Calf Raise','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Donkey_Calf_Raises/0.jpg'),
        ('Seated Calf Raise','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Seated_Calf_Raise/0.jpg'),
        ('Romanian Deadlift','Legs',NULL),
        ('Bulgarian Split Squat','Legs',NULL),
        ('Smith Machine Squat','Legs',NULL),
        ('Overhead Press','Shoulder','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shoulder_Press/0.jpg'),
        ('Dumbbell Shoulder Press','Shoulder','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shoulder_Press/0.jpg'),
        ('Arnold Press','Shoulder','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Arnold_Dumbbell_Press/0.jpg'),
        ('Lateral Raise','Shoulder','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Raise_-_With_Bands/0.jpg'),
        ('Front Raise','Shoulder','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Raise_And_Pullover/0.jpg'),
        ('Rear Delt Fly','Shoulder','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rear_Delt_Fly/0.jpg'),
        ('Upright Row','Shoulder','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_One-Arm_Upright_Row/0.jpg'),
        ('Shrugs','Shoulder','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shrug/0.jpg'),
        ('Cable Lateral Raise','Shoulder','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Lateral_Raise/0.jpg'),
        ('Machine Shoulder Press','Shoulder',NULL),
        ('Bicep Curl','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg'),
        ('Hammer Curl','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Hammer_Curl/0.jpg'),
        ('Concentration Curl','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Concentration_Curls/0.jpg'),
        ('Incline Dumbbell Curl','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Curl/0.jpg'),
        ('Preacher Curl','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Preacher_Curl/0.jpg'),
        ('EZ Bar Curl','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/EZ-Bar_Curl/0.jpg'),
        ('Skull Crusher','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/EZ-Bar_Skullcrusher/0.jpg'),
        ('Overhead Tricep Extension','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rope_Overhead_Triceps_Extension/0.jpg'),
        ('Tricep Dip','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Triceps_Version/0.jpg'),
        ('Close Grip Bench Press','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Barbell_Bench_Press/0.jpg'),
        ('Cable Tricep Pushdown','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_One_Arm_Tricep_Extension/0.jpg'),
        ('Tricep Extension','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Tricep_Extension_-Pronated_Grip/0.jpg'),
        ('Plank','Core',NULL),
        ('Side Plank','Core',NULL),
        ('Crunches','Core',NULL),
        ('Bicycle Crunch','Core',NULL),
        ('Russian Twist','Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Russian_Twists/0.jpg'),
        ('Hanging Leg Raise','Core',NULL),
        ('Ab Rollout','Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Roller/0.jpg'),
        ('Cable Crunch','Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crunch/0.jpg'),
        ('Mountain Climber','Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Mountain_Climbers/0.jpg'),
        ('Flutter Kicks','Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flutter_Kicks/0.jpg')
      ON CONFLICT (name) DO UPDATE SET image_url = EXCLUDED.image_url;
    `);
    console.log('Database seeded with exercises');
  }

  console.log('Database ready');
}

module.exports = initDb;

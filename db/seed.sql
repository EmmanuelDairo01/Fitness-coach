-- Default exercise library
-- Images from: github.com/yuhonas/free-exercise-db (correct URL format: /exercises/{Folder}/0.jpg)

INSERT INTO exercises (name, category, image_url) VALUES

  -- CHEST
  ('Bench Press',              'Chest', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg'),
  ('Incline Bench Press',      'Chest', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg'),
  ('Decline Bench Press',      'Chest', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Bench_Press/0.jpg'),
  ('Dumbbell Chest Press',     'Chest', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/0.jpg'),
  ('Incline Dumbbell Press',   'Chest', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/0.jpg'),
  ('Dumbbell Fly',             'Chest', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Flyes/0.jpg'),
  ('Cable Crossover',          'Chest', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg'),
  ('Cable Fly',                'Chest', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg'),
  ('Chest Dip',                'Chest', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Chest_Version/0.jpg'),
  ('Push Ups',                 'Chest', NULL),
  ('Close Grip Push Up',       'Chest', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Push-Up_off_of_a_Dumbbell/0.jpg'),
  ('Pec Deck',                 'Chest', NULL),
  ('Smith Machine Bench Press','Chest', NULL),
  ('Machine Chest Press',      'Chest', NULL),

  -- BACK
  ('Pull Up',                  'Back', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Assisted_Pull-Up/0.jpg'),
  ('Chin Up',                  'Back', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chin-Up/0.jpg'),
  ('Lat Pulldown',             'Back', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Front_Lat_Pulldown/0.jpg'),
  ('Seated Cable Row',         'Back', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/0.jpg'),
  ('Barbell Row',              'Back', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/0.jpg'),
  ('Single Arm Dumbbell Row',  'Back', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/0.jpg'),
  ('T-Bar Row',                'Back', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_T-Bar_Row/0.jpg'),
  ('Deadlift',                 'Back', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/0.jpg'),
  ('Hyperextension',           'Back', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hyperextensions_With_No_Hyperextension_Bench/0.jpg'),
  ('Face Pull',                'Back', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/0.jpg'),
  ('Machine Row',              'Back', NULL),
  ('Pendlay Row',              'Back', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pendlay_Row/0.jpg'),

  -- LEGS
  ('Squat',                    'Legs', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/0.jpg'),
  ('Hack Squat',               'Legs', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hack_Squat/0.jpg'),
  ('Goblet Squat',             'Legs', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Goblet_Squat/0.jpg'),
  ('Smith Machine Squat',      'Legs', NULL),
  ('Romanian Deadlift',        'Legs', NULL),
  ('Sumo Deadlift',            'Legs', NULL),
  ('Bulgarian Split Squat',    'Legs', NULL),
  ('Leg Press',                'Legs', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg'),
  ('Leg Curl',                 'Legs', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/0.jpg'),
  ('Leg Extension',            'Legs', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg'),
  ('Hip Thrust',               'Legs', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg'),
  ('Lunges',                   'Legs', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Lunge/0.jpg'),
  ('Walking Lunges',           'Legs', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Walking_Lunge/0.jpg'),
  ('Calf Raise',               'Legs', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Donkey_Calf_Raises/0.jpg'),
  ('Seated Calf Raise',        'Legs', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Seated_Calf_Raise/0.jpg'),
  ('Box Jump',                 'Legs', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Jump_Multiple_Response/0.jpg'),

  -- SHOULDER
  ('Overhead Press',           'Shoulder', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shoulder_Press/0.jpg'),
  ('Dumbbell Shoulder Press',  'Shoulder', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shoulder_Press/0.jpg'),
  ('Arnold Press',             'Shoulder', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Arnold_Dumbbell_Press/0.jpg'),
  ('Lateral Raise',            'Shoulder', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Raise_-_With_Bands/0.jpg'),
  ('Front Raise',              'Shoulder', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Raise_And_Pullover/0.jpg'),
  ('Rear Delt Fly',            'Shoulder', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rear_Delt_Fly/0.jpg'),
  ('Upright Row',              'Shoulder', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_One-Arm_Upright_Row/0.jpg'),
  ('Shrugs',                   'Shoulder', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shrug/0.jpg'),
  ('Cable Lateral Raise',      'Shoulder', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Lateral_Raise/0.jpg'),
  ('Machine Shoulder Press',   'Shoulder', NULL),

  -- ARMS
  ('Bicep Curl',               'Arms', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg'),
  ('Hammer Curl',              'Arms', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Hammer_Curl/0.jpg'),
  ('Concentration Curl',       'Arms', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Concentration_Curls/0.jpg'),
  ('Incline Dumbbell Curl',    'Arms', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Curl/0.jpg'),
  ('Preacher Curl',            'Arms', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Preacher_Curl/0.jpg'),
  ('EZ Bar Curl',              'Arms', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/EZ-Bar_Curl/0.jpg'),
  ('Cable Curl',               'Arms', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/High_Cable_Curls/0.jpg'),
  ('Skull Crusher',            'Arms', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/EZ-Bar_Skullcrusher/0.jpg'),
  ('Overhead Tricep Extension','Arms', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rope_Overhead_Triceps_Extension/0.jpg'),
  ('Tricep Dip',               'Arms', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Triceps_Version/0.jpg'),
  ('Close Grip Bench Press',   'Arms', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Barbell_Bench_Press/0.jpg'),
  ('Cable Tricep Pushdown',    'Arms', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_One_Arm_Tricep_Extension/0.jpg'),
  ('Tricep Extension',         'Arms', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Tricep_Extension_-Pronated_Grip/0.jpg'),
  ('Diamond Push Up',          'Arms', NULL),
  ('Reverse Curl',             'Arms', NULL),

  -- CORE
  ('Plank',                    'Core', NULL),
  ('Side Plank',               'Core', NULL),
  ('Crunches',                 'Core', NULL),
  ('Bicycle Crunch',           'Core', NULL),
  ('Russian Twist',            'Core', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Russian_Twists/0.jpg'),
  ('Hanging Leg Raise',        'Core', NULL),
  ('Leg Raise',                'Core', NULL),
  ('Ab Rollout',               'Core', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Roller/0.jpg'),
  ('Cable Crunch',             'Core', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crunch/0.jpg'),
  ('Mountain Climber',         'Core', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Mountain_Climbers/0.jpg'),
  ('Flutter Kicks',            'Core', 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flutter_Kicks/0.jpg'),
  ('Hollow Body Hold',         'Core', NULL)

ON CONFLICT (name) DO UPDATE SET image_url = EXCLUDED.image_url;

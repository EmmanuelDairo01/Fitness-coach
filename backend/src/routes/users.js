const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.patch('/me', async (req, res) => {
  const { name, dailyCalorieGoal, weeklyWorkoutGoal } = req.body;
  const result = await pool.query(
    `UPDATE users SET
       name = COALESCE($1, name),
       daily_calorie_goal = COALESCE($2, daily_calorie_goal),
       weekly_workout_goal = COALESCE($3, weekly_workout_goal)
     WHERE id = $4 RETURNING *`,
    [name, dailyCalorieGoal, weeklyWorkoutGoal, req.userId]
  );
  const u = result.rows[0];
  res.json({
    user: {
      id: u.id,
      name: u.name,
      email: u.email,
      level: u.level,
      xp: u.xp,
      dailyCalorieGoal: u.daily_calorie_goal,
      weeklyWorkoutGoal: u.weekly_workout_goal,
    },
  });
});

// Body weight log
router.post('/body-weight', async (req, res) => {
  const { weightKg } = req.body;
  if (!weightKg) return res.status(400).json({ error: 'weightKg is required' });
  const result = await pool.query(
    `INSERT INTO body_weight_logs (user_id, weight_kg) VALUES ($1, $2) RETURNING *`,
    [req.userId, weightKg]
  );
  res.status(201).json({ entry: result.rows[0] });
});

router.get('/body-weight', async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM body_weight_logs WHERE user_id = $1 ORDER BY logged_at ASC`,
    [req.userId]
  );
  res.json({ entries: result.rows });
});

module.exports = router;

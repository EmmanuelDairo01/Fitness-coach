const express = require('express');
const fetch = require('node-fetch');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

async function buildContext(userId) {
  const user = await pool.query('SELECT name, daily_calorie_goal, weekly_workout_goal FROM users WHERE id = $1', [userId]);

  const recentSets = await pool.query(
    `SELECT e.name AS exercise, ws.weight_kg, ws.reps, s.started_at::date AS date
     FROM workout_sets ws
     JOIN exercises e ON e.id = ws.exercise_id
     JOIN workout_sessions s ON s.id = ws.session_id
     WHERE s.user_id = $1 AND s.started_at >= NOW() - INTERVAL '45 days'
     ORDER BY s.started_at DESC LIMIT 150`,
    [userId]
  );

  const weightTrend = await pool.query(
    `SELECT weight_kg, logged_at::date AS date FROM body_weight_logs
     WHERE user_id = $1 ORDER BY logged_at DESC LIMIT 20`,
    [userId]
  );

  const foodTrend = await pool.query(
    `SELECT logged_at::date AS date, SUM(calories) AS calories, SUM(protein_g) AS protein
     FROM food_logs WHERE user_id = $1 AND logged_at >= NOW() - INTERVAL '14 days'
     GROUP BY date ORDER BY date DESC`,
    [userId]
  );

  return {
    user_name: user.rows[0]?.name || 'there',
    daily_calorie_goal: user.rows[0]?.daily_calorie_goal,
    weekly_workout_goal: user.rows[0]?.weekly_workout_goal,
    recent_sets: recentSets.rows,
    weight_trend: weightTrend.rows,
    food_trend: foodTrend.rows,
  };
}

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const context = await buildContext(req.userId);

    const history = await pool.query(
      `SELECT role, content FROM chat_messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [req.userId]
    );

    const aiRes = await fetch(`${AI_SERVICE_URL}/coach-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context, history: history.rows.reverse() }),
    });

    if (!aiRes.ok) {
      const detail = await aiRes.text();
      console.error('AI service error:', detail);
      return res.status(502).json({ error: 'The coach is unavailable right now' });
    }

    const { reply } = await aiRes.json();

    await pool.query(`INSERT INTO chat_messages (user_id, role, content) VALUES ($1,'user',$2)`, [req.userId, message]);
    await pool.query(`INSERT INTO chat_messages (user_id, role, content) VALUES ($1,'assistant',$2)`, [req.userId, reply]);

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not reach the AI coach' });
  }
});

router.get('/history', async (req, res) => {
  const result = await pool.query(
    `SELECT role, content, created_at FROM chat_messages WHERE user_id = $1 ORDER BY created_at ASC LIMIT 100`,
    [req.userId]
  );
  res.json({ messages: result.rows });
});

// Proactive, dashboard-ready improvement tips based on logged data
router.get('/insights', async (req, res) => {
  try {
    const context = await buildContext(req.userId);
    const aiRes = await fetch(`${AI_SERVICE_URL}/coach-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context }),
    });
    if (!aiRes.ok) {
      const detail = await aiRes.text();
      console.error('AI service error:', detail);
      return res.status(502).json({ error: 'Could not generate insights right now' });
    }
    const data = await aiRes.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not generate insights' });
  }
});

module.exports = router;

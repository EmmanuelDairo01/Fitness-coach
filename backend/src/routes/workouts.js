const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Create a new workout session
router.post('/sessions', async (req, res) => {
  const { name } = req.body;
  const result = await pool.query(
    `INSERT INTO workout_sessions (user_id, name) VALUES ($1, $2) RETURNING *`,
    [req.userId, name || 'Workout']
  );
  res.status(201).json({ session: result.rows[0] });
});

// List sessions (most recent first)
router.get('/sessions', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const result = await pool.query(
    `SELECT * FROM workout_sessions WHERE user_id = $1 ORDER BY started_at DESC LIMIT $2`,
    [req.userId, limit]
  );
  res.json({ sessions: result.rows });
});

// Get one session with its sets
router.get('/sessions/:id', async (req, res) => {
  const session = await pool.query(
    `SELECT * FROM workout_sessions WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.userId]
  );
  if (!session.rows.length) return res.status(404).json({ error: 'Session not found' });

  const sets = await pool.query(
    `SELECT ws.*, e.name AS exercise_name, e.category
     FROM workout_sets ws
     JOIN exercises e ON e.id = ws.exercise_id
     WHERE ws.session_id = $1
     ORDER BY ws.exercise_id, ws.set_number`,
    [req.params.id]
  );
  res.json({ session: session.rows[0], sets: sets.rows });
});

// Mark a session complete / rename / add notes
router.patch('/sessions/:id', async (req, res) => {
  const { name, notes, complete } = req.body;
  const result = await pool.query(
    `UPDATE workout_sessions SET
       name = COALESCE($1, name),
       notes = COALESCE($2, notes),
       completed_at = CASE WHEN $3 = true THEN NOW() ELSE completed_at END
     WHERE id = $4 AND user_id = $5 RETURNING *`,
    [name, notes, complete === true, req.params.id, req.userId]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Session not found' });
  res.json({ session: result.rows[0] });
});

// Add a set to a session
router.post('/sessions/:id/sets', async (req, res) => {
  const { exerciseId, setNumber, weightKg, reps } = req.body;
  if (!exerciseId) return res.status(400).json({ error: 'exerciseId is required' });

  const owns = await pool.query(
    `SELECT id FROM workout_sessions WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.userId]
  );
  if (!owns.rows.length) return res.status(404).json({ error: 'Session not found' });

  const result = await pool.query(
    `INSERT INTO workout_sets (session_id, exercise_id, set_number, weight_kg, reps)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [req.params.id, exerciseId, setNumber || 1, weightKg || 0, reps || 0]
  );
  res.status(201).json({ set: result.rows[0] });
});

router.delete('/sets/:setId', async (req, res) => {
  await pool.query(
    `DELETE FROM workout_sets ws USING workout_sessions s
     WHERE ws.id = $1 AND ws.session_id = s.id AND s.user_id = $2`,
    [req.params.setId, req.userId]
  );
  res.json({ ok: true });
});

// Volume-over-time for a given exercise, for the Progress chart
router.get('/progress', async (req, res) => {
  const { exercise, range } = req.query;
  if (!exercise) return res.status(400).json({ error: 'exercise query param is required' });

  const intervalMap = { week: '7 days', month: '30 days', '3months': '90 days', year: '365 days' };
  const interval = intervalMap[range] || '30 days';

  const result = await pool.query(
    `SELECT s.started_at::date AS date,
            SUM(ws.weight_kg * ws.reps) AS volume,
            SUM(ws.reps) AS total_reps,
            MAX(ws.weight_kg) AS top_weight
     FROM workout_sets ws
     JOIN workout_sessions s ON s.id = ws.session_id
     JOIN exercises e ON e.id = ws.exercise_id
     WHERE s.user_id = $1 AND e.name = $2 AND s.started_at >= NOW() - $3::interval
     GROUP BY s.started_at::date
     ORDER BY date ASC`,
    [req.userId, exercise, interval]
  );

  const summary = await pool.query(
    `SELECT COALESCE(SUM(ws.weight_kg * ws.reps), 0) AS total_volume,
            COALESCE(SUM(ws.reps), 0) AS total_reps
     FROM workout_sets ws
     JOIN workout_sessions s ON s.id = ws.session_id
     JOIN exercises e ON e.id = ws.exercise_id
     WHERE s.user_id = $1 AND e.name = $2 AND s.started_at >= NOW() - $3::interval`,
    [req.userId, exercise, interval]
  );

  res.json({ points: result.rows, summary: summary.rows[0] });
});

// Best single-set weight per exercise (Top Lifts)
router.get('/top-lifts', async (req, res) => {
  const result = await pool.query(
    `SELECT e.name AS exercise, MAX(ws.weight_kg) AS top_weight
     FROM workout_sets ws
     JOIN exercises e ON e.id = ws.exercise_id
     JOIN workout_sessions s ON s.id = ws.session_id
     WHERE s.user_id = $1
     GROUP BY e.name
     ORDER BY top_weight DESC
     LIMIT 10`,
    [req.userId]
  );
  res.json({ topLifts: result.rows });
});

// Home dashboard summary
router.get('/summary', async (req, res) => {
  const thisWeek = await pool.query(
    `SELECT COUNT(*) FROM workout_sessions
     WHERE user_id = $1 AND completed_at IS NOT NULL AND started_at >= date_trunc('week', NOW())`,
    [req.userId]
  );
  const lastSession = await pool.query(
    `SELECT * FROM workout_sessions WHERE user_id = $1 ORDER BY started_at DESC LIMIT 1`,
    [req.userId]
  );
  res.json({
    workoutsThisWeek: parseInt(thisWeek.rows[0].count, 10),
    lastSession: lastSession.rows[0] || null,
  });
});

module.exports = router;

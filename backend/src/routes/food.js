const express = require('express');
const fetch = require('node-fetch');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Analyze a photo of food, but don't save it yet - lets the user confirm first
router.post('/analyze', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 is required' });

    const endpoint = `${AI_SERVICE_URL}/analyze-food`;
    console.log('[food/analyze] calling AI service at:', endpoint);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    let aiRes;
    try {
      aiRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: imageBase64 }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!aiRes.ok) {
      const detail = await aiRes.text();
      console.error('[food/analyze] AI service returned', aiRes.status, detail);
      return res.status(502).json({ error: 'Could not analyze the photo right now' });
    }

    const analysis = await aiRes.json();
    console.log('[food/analyze] success, confidence:', analysis.confidence);
    res.json({ analysis });
  } catch (err) {
    console.error('[food/analyze] error:', err.message);
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'AI service took too long — try again' });
    }
    res.status(500).json({ error: 'Could not analyze the photo' });
  }
});

// Save a confirmed food log entry (after the user reviews the AI analysis)
router.post('/', async (req, res) => {
  const { name, servingDescription, calories, proteinG, carbsG, fatsG, breakdown, confidence } = req.body;
  if (!name || calories === undefined) {
    return res.status(400).json({ error: 'name and calories are required' });
  }
  const result = await pool.query(
    `INSERT INTO food_logs (user_id, name, serving_description, calories, protein_g, carbs_g, fats_g, breakdown, confidence)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [req.userId, name, servingDescription, calories, proteinG || 0, carbsG || 0, fatsG || 0, breakdown ? JSON.stringify(breakdown) : null, confidence]
  );
  res.status(201).json({ entry: result.rows[0] });
});

router.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 30, 200);
  const result = await pool.query(
    `SELECT * FROM food_logs WHERE user_id = $1 ORDER BY logged_at DESC LIMIT $2`,
    [req.userId, limit]
  );
  res.json({ entries: result.rows });
});

router.get('/today', async (req, res) => {
  const result = await pool.query(
    `SELECT COALESCE(SUM(calories),0) AS calories,
            COALESCE(SUM(protein_g),0) AS protein,
            COALESCE(SUM(carbs_g),0) AS carbs,
            COALESCE(SUM(fats_g),0) AS fats
     FROM food_logs WHERE user_id = $1 AND logged_at::date = CURRENT_DATE`,
    [req.userId]
  );
  res.json({ today: result.rows[0] });
});

router.delete('/:id', async (req, res) => {
  await pool.query(`DELETE FROM food_logs WHERE id = $1 AND user_id = $2`, [req.params.id, req.userId]);
  res.json({ ok: true });
});

module.exports = router;

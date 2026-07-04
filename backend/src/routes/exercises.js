const express = require('express');
const fetch = require('node-fetch');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const DB_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
let exerciseDbCache = null;
let cacheTime = null;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // refresh cache once per day
const FETCH_TIMEOUT_MS = 10000;
const MAX_CACHE_BYTES = 5 * 1024 * 1024; // 5MB max

async function getExerciseDb() {
  const expired = !cacheTime || Date.now() - cacheTime > CACHE_TTL_MS;
  if (!exerciseDbCache || expired) {
    // Add a timeout so a slow GitHub response never hangs the server
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(DB_URL, { signal: controller.signal });
      if (!res.ok) throw new Error(`GitHub responded with ${res.status}`);
      const text = await res.text();

      // Guard against suspiciously large or malformed payloads (supply chain protection)
      if (Buffer.byteLength(text) > MAX_CACHE_BYTES) throw new Error('Exercise DB payload too large');
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error('Exercise DB format unexpected');

      exerciseDbCache = data;
      cacheTime = Date.now();
    } finally {
      clearTimeout(timer);
    }
  }
  return exerciseDbCache;
}

router.get('/:id/details', async (req, res) => {
  try {
    const row = await pool.query(
      'SELECT id, name, category, image_url FROM exercises WHERE id = $1',
      [req.params.id]
    );
    if (!row.rows.length) return res.status(404).json({ error: 'Not found' });

    const exercise = row.rows[0];
    const folderId = exercise.image_url
      ? exercise.image_url.split('/exercises/')[1]?.split('/')[0]
      : null;

    let match = null;
    try {
      const db = await getExerciseDb();
      match = folderId
        ? db.find((e) => e.id === folderId)
        : db.find((e) => e.name.toLowerCase() === exercise.name.toLowerCase());
    } catch (fetchErr) {
      // If the external fetch fails, still return the exercise — just without extra details
      console.error('Exercise DB fetch failed:', fetchErr.message);
    }

    // Only return safe, string fields from external data — no raw spreading
    const secondImagePath = match?.images?.[1];
    const secondImage = secondImagePath && /^[\w/_.-]+$/.test(secondImagePath)
      ? `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${secondImagePath}`
      : null;

    res.json({
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      image_url: exercise.image_url,
      instructions: Array.isArray(match?.instructions) ? match.instructions.map(String) : [],
      primaryMuscles: Array.isArray(match?.primaryMuscles) ? match.primaryMuscles.map(String) : [],
      secondaryMuscles: Array.isArray(match?.secondaryMuscles) ? match.secondaryMuscles.map(String) : [],
      equipment: typeof match?.equipment === 'string' ? match.equipment : null,
      level: typeof match?.level === 'string' ? match.level : null,
      secondImage,
    });
  } catch (err) {
    console.error('Exercise details error:', err);
    res.status(500).json({ error: 'Could not load exercise details' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    const conditions = [];
    const params = [];

    if (search) {
      // Escape LIKE special characters so % and _ are treated as literals
      const safe = search.toLowerCase().replace(/[%_\\]/g, '\\$&');
      params.push(`%${safe}%`);
      conditions.push(`LOWER(name) LIKE $${params.length} ESCAPE '\\'`);
    }
    if (category && category !== 'All') {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT id, name, category, image_url FROM exercises ${where} ORDER BY name ASC`,
      params
    );
    res.json({ exercises: result.rows });
  } catch (err) {
    console.error('Exercises list error:', err);
    res.status(500).json({ error: 'Could not load exercises' });
  }
});

module.exports = router;

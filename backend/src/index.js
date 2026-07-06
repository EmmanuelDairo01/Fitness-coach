require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initDb = require('./init');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const exerciseRoutes = require('./routes/exercises');
const workoutRoutes = require('./routes/workouts');
const foodRoutes = require('./routes/food');
const coachRoutes = require('./routes/coach');

const app = express();

const allowedOrigin = (process.env.FRONTEND_ORIGIN || '').replace(/\/$/, '') || '*';
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === allowedOrigin || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json({ limit: '12mb' })); // food photos arrive as base64 JSON

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/coach', coachRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 4000;
initDb()
  .then(() => app.listen(PORT, () => console.log(`FitAI backend listening on :${PORT}`)))
  .catch((err) => { console.error('Database init failed:', err); process.exit(1); });

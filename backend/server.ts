import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db';
import { loadStateFromDB, saveStateToDB } from './state';
import { authRouter } from './routes/auth';
import { profileRouter } from './routes/profile';
import { gmailRouter } from './routes/gmail';
import { opportunitiesRouter } from './routes/opportunities';
import { mockTestsRouter } from './routes/mockTests';
import { mockInterviewRouter } from './routes/mockInterview';
import { whatsappRouter } from './routes/whatsapp';
import { recommendationsRouter } from './routes/recommendations';
import { assistantRouter } from './routes/assistant';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8000;

// Allow the separate frontend dev server (Vite) to call this API
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// After every request finishes, persist the in-memory appState to MongoDB.
// This means routes don't need to be individually rewritten to talk to the
// DB — they keep mutating `appState` as before, and it gets saved here.
app.use((req, res, next) => {
  res.on('finish', () => {
    if (req.method !== 'GET') {
      saveStateToDB();
    }
  });
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PrepPilot AI Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/gmail', gmailRouter);
app.use('/api/opportunities', opportunitiesRouter);
app.use('/api/mock-tests', mockTestsRouter);
app.use('/api/mock-interview', mockInterviewRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/assistant', assistantRouter);

// Backward-compatible aliases
app.post('/api/sync-inbox', (req, res, next) => {
  req.url = '/sync';
  gmailRouter(req, res, next);
});
app.post('/api/process-email', (req, res, next) => {
  req.url = '/process-email';
  gmailRouter(req, res, next);
});
app.get('/api/oauth/google/url', (req, res, next) => {
  req.url = '/auth-url';
  gmailRouter(req, res, next);
});

async function start() {
  await connectDB();
  await loadStateFromDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PrepPilot backend API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[server] Failed to start:', err);
  process.exit(1);
});

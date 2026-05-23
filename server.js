import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import Anthropic from '@anthropic-ai/sdk/index.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { clerkMiddleware, getAuth, createClerkClient } from '@clerk/express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// --- MongoDB ---
await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected to MongoDB');

const documentSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  content: { type: String, default: '' },
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);

// --- Middleware ---
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
  credentials: true,
}));
app.use(clerkMiddleware());

// --- Auth guard with email allowlist ---
const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
const emailCache = new Map();

async function requireAuth(req, res, next) {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  if (process.env.NODE_ENV === 'production' && ALLOWED_EMAILS.length > 0) {
    if (!emailCache.has(userId)) {
      try {
        const user = await clerkClient.users.getUser(userId);
        const email = user.emailAddresses[0]?.emailAddress?.toLowerCase() || '';
        emailCache.set(userId, email);
      } catch {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }
    const email = emailCache.get(userId);
    if (!ALLOWED_EMAILS.includes(email)) {
      return res.status(403).json({ error: 'Access restricted' });
    }
  }

  req.userId = userId;
  next();
}

// --- Document routes ---
app.get('/api/documents', requireAuth, async (req, res) => {
  const docs = await Document.find({ userId: req.userId }, 'title description createdAt updatedAt').sort({ updatedAt: -1 });
  res.json(docs);
});

app.post('/api/documents', requireAuth, async (req, res) => {
  const { title, description, content } = req.body;
  const doc = await Document.create({ userId: req.userId, title, description: description || '', content: content || '' });
  res.status(201).json(doc);
});

app.get('/api/documents/:id', requireAuth, async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, userId: req.userId });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
});

app.put('/api/documents/:id', requireAuth, async (req, res) => {
  const { title, content } = req.body;
  const doc = await Document.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { ...(title !== undefined && { title }), ...(content !== undefined && { content }) },
    { new: true }
  );
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
});

app.delete('/api/documents/:id', requireAuth, async (req, res) => {
  await Document.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  res.json({ ok: true });
});

// --- Opening lines via Claude ---
app.post('/api/opening-lines', requireAuth, async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `A writer is about to begin a piece titled "${title}"${description ? ` about: ${description}` : ''}.

Give them exactly 3 possible opening sentences. Each should be distinct in tone or approach — one might be direct, one reflective, one in medias res. They should be beautiful, not generic.

Respond with only a JSON array of 3 strings. No explanation, no labels.`,
      }],
    });

    const raw = message.content[0].text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');
    const lines = JSON.parse(raw);
    res.json({ lines });
  } catch (err) {
    console.error('Opening lines error:', err.message);
    res.status(500).json({ error: 'Could not generate opening lines' });
  }
});

// --- Serve React app in production ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'client/dist/index.html')));
}

const PORT = process.env.PORT || 3002;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`cotev running on port ${PORT}`));
}

export default app;

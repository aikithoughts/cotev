# כתב · Cotev

A markdown editor built for writers who care about the act of writing — not just the output.

*Cotev* (כתב) means "writing" in Hebrew.

---

## The idea

Most editors treat typing as data entry. Cotev treats it as craft. The interface disappears when you write. The page has weight. And depending on the mode you choose, each letter you type arrives with a little theatre — drifting in like a leaf, falling like rain, or blooming like a star.

## Writing modes

**Plain** — Nothing but the page and your words. Beautiful typography, no distraction.

**Autumn** — Letters drift in from the left on the wind, each following its own wandering path, spinning as they settle.

**Rain** — Letters fall from above, accelerating as they drop, each one splashing on landing.

**Starry Night** — A dark page, and each letter blooms into existence like a star winking on.

## Features

- WYSIWYG markdown editing — formatting renders as you type, no preview pane
- Writing mode selector on the threshold screen, persists across sessions
- Auto-save to MongoDB
- Export any document as `.md`
- Two fonts: Lora (serif) and Inter (sans-serif)
- Word count
- Escape to return to the document list

## Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), express-session
- **Frontend**: React, Vite, Tiptap (ProseMirror)
- **Fonts**: Lora, Inter (Google Fonts)

## Running locally

**Prerequisites**: Node.js, a MongoDB Atlas cluster (or local instance)

1. Clone the repo and install dependencies:

```bash
npm install
npm --prefix client install
```

2. Copy `.env.example` to `.env` and fill in your values:

```
MONGODB_URI=your-mongodb-uri
SESSION_SECRET=a-long-random-string
APP_USERNAME=your-username
APP_PASSWORD=your-password
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
```

3. Start both servers with one command:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

## What's coming

- AI-assisted opening lines — when you start a new piece, Claude suggests three possible first sentences based on your title and description
- The rewrite mode — select any passage and receive three alternative versions, shaped by an optional style guide
- More writing modes

import { useState } from 'react';

export default function NewDocument({ onOpen, onBack }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title, description }),
    });
    const doc = await res.json();
    onOpen(doc);
  }

  return (
    <div style={styles.page}>
      <button onClick={onBack} style={styles.back}>← back</button>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.titleInput}
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />
        <textarea
          style={styles.descInput}
          placeholder="What is this about? (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />
        <button type="submit" style={styles.begin} disabled={loading}>
          {loading ? '…' : 'Begin'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    height: '100%',
    maxWidth: 'var(--measure)',
    margin: '0 auto',
    padding: '2.5rem 2rem',
    display: 'flex',
    flexDirection: 'column',
  },
  back: {
    fontSize: '0.8rem',
    color: 'var(--ink-faint)',
    letterSpacing: '0.03em',
    marginBottom: '3rem',
    textAlign: 'left',
    width: 'fit-content',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: '6rem',
  },
  titleInput: {
    fontSize: '2rem',
    fontStyle: 'italic',
    color: 'var(--ink)',
    borderBottom: '1px solid var(--ink-ghost)',
    padding: '0.25rem 0',
    width: '100%',
    background: 'transparent',
  },
  descInput: {
    fontSize: '0.95rem',
    color: 'var(--ink)',
    lineHeight: 1.7,
    resize: 'none',
    borderBottom: '1px solid var(--page-alt)',
    padding: '0.25rem 0',
    width: '100%',
    background: 'transparent',
  },
  begin: {
    alignSelf: 'flex-start',
    fontSize: '0.85rem',
    color: 'var(--ink-faint)',
    letterSpacing: '0.05em',
    marginTop: '0.5rem',
  },
};

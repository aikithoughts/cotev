import { useState, useEffect } from 'react';
import { useClerk } from '@clerk/react';
import { useApiFetch } from '../useApiFetch.js';

const MODES = [
  { key: 'plain',  label: 'Plain' },
  { key: 'autumn', label: 'Autumn' },
  { key: 'rain',   label: 'Rain' },
  { key: 'starry', label: 'Starry Night' },
];

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function Threshold({ font, mode, onModeChange, onFontToggle, onNew, onOpen }) {
  const { signOut } = useClerk();
  const apiFetch = useApiFetch();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    apiFetch('/api/documents')
      .then(r => r.json())
      .then(data => { setDocs(data); setLoading(false); });
    setTimeout(() => setVisible(true), 80);
  }, []);

  return (
    <div style={{ ...styles.page, opacity: visible ? 1 : 0, transition: 'opacity 600ms ease' }}>

      <header style={styles.header}>
        <span style={styles.wordmark}>כתב</span>
        <div style={styles.headerActions}>
          <button onClick={onFontToggle} style={styles.meta} title="Toggle font">
            {font === 'serif' ? 'Aa' : 'Aa'}
          </button>
          <button onClick={() => signOut()} style={styles.meta}>leave</button>
        </div>
      </header>

      <main style={styles.main}>
        <button onClick={onNew} style={styles.newButton}>
          Begin something new
        </button>

        <div style={styles.modeSelector}>
          {MODES.map((m, i) => (
            <span key={m.key} style={styles.modeSelectorRow}>
              <button
                onClick={() => onModeChange(m.key)}
                style={{ ...styles.modeBtn, ...(mode === m.key ? styles.modeBtnActive : {}) }}
              >
                {m.label}
              </button>
              {i < MODES.length - 1 && <span style={styles.modeDot}>·</span>}
            </span>
          ))}
        </div>

        {!loading && docs.length > 0 && (
          <div style={styles.docList}>
            {docs.map(doc => (
              <button key={doc._id} onClick={() => onOpen(doc)} style={styles.docItem}>
                <span style={styles.docTitle}>{doc.title}</span>
                <span style={styles.docDate}>{formatDate(doc.updatedAt)}</span>
              </button>
            ))}
          </div>
        )}

        {!loading && docs.length === 0 && (
          <p style={styles.empty}>Nothing written yet.</p>
        )}
      </main>

    </div>
  );
}

const styles = {
  page: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 'var(--measure)',
    margin: '0 auto',
    padding: '0 2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '2.5rem 0 0',
  },
  wordmark: {
    fontSize: '1.5rem',
    color: 'var(--ink-faint)',
    letterSpacing: '-0.02em',
    userSelect: 'none',
  },
  headerActions: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  meta: {
    fontSize: '0.8rem',
    color: 'var(--ink-ghost)',
    letterSpacing: '0.05em',
    transition: 'color 200ms ease',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: '6rem',
    gap: '3rem',
  },
  newButton: {
    fontSize: '1.5rem',
    color: 'var(--ink)',
    textAlign: 'left',
    lineHeight: 1.4,
    transition: 'color 200ms ease',
    fontStyle: 'italic',
  },
  docList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    borderTop: '1px solid var(--ink-ghost)',
  },
  docItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: '1rem 0',
    borderBottom: '1px solid var(--ink-ghost)',
    textAlign: 'left',
    gap: '1rem',
    transition: 'opacity 200ms ease',
  },
  docTitle: {
    fontSize: '1rem',
    color: 'var(--ink)',
  },
  docDate: {
    fontSize: '0.75rem',
    color: 'var(--ink-faint)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  empty: {
    fontSize: '0.9rem',
    color: 'var(--ink-ghost)',
    fontStyle: 'italic',
  },
  modeSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  modeSelectorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  modeBtn: {
    fontSize: '0.75rem',
    letterSpacing: '0.06em',
    color: 'var(--ink-ghost)',
    transition: 'color 200ms ease',
  },
  modeBtnActive: {
    color: 'var(--ink-faint)',
  },
  modeDot: {
    fontSize: '0.75rem',
    color: 'var(--ink-ghost)',
    userSelect: 'none',
  },
};

import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import { triggerAnimation } from '../animations.js';
import { RainAmbient, Starfield } from '../ambient.jsx';
import '../editor.css';

const AUTOSAVE_DELAY = 2000;

function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default function Editor({ doc, font, mode, onFontToggle, onClose }) {
  const [title, setTitle] = useState(doc.title);
  const [saved, setSaved] = useState(true);
  const [focused, setFocused] = useState(false);
  const [words, setWords] = useState(0);
  const saveTimer = useRef(null);
  const editorWrapRef = useRef(null);
  const docId = doc._id;

  const save = async (content, currentTitle) => {
    await fetch(`/api/documents/${docId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content, title: currentTitle }),
    });
    setSaved(true);
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Typography,
      Markdown,
      Placeholder.configure({ placeholder: 'Begin writing…' }),
    ],
    content: doc.content || '',
    onUpdate({ editor }) {
      const md = editor.storage.markdown.getMarkdown();
      setWords(wordCount(editor.getText()));
      setSaved(false);
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => save(md, title), AUTOSAVE_DELAY);
    },
    onFocus() { setFocused(true); },
    onBlur() { setFocused(false); },
  });

  // Decorative animation — character inserts normally, overlay flies in as pure visual
  useEffect(() => {
    if (!editorWrapRef.current || !editor) return;
    if (mode === 'plain') return;

    const el = editorWrapRef.current;

    const handleKeyDown = (e) => {
      if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;

      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if (!rect.top && !rect.left) return;

      triggerAnimation(e.key, rect, mode);
    };

    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, [editor, mode]);

  // Escape to go back
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (editor && doc.content) {
      editor.commands.setContent(doc.content);
      setWords(wordCount(editor.getText()));
    }
  }, []);

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  function handleTitleChange(e) {
    setTitle(e.target.value);
    setSaved(false);
    clearTimeout(saveTimer.current);
    const content = editor?.storage.markdown.getMarkdown() || '';
    saveTimer.current = setTimeout(() => save(content, e.target.value), AUTOSAVE_DELAY);
  }

  function handleDownload() {
    const content = editor?.storage.markdown.getMarkdown() || '';
    const blob = new Blob([`# ${title}\n\n${content}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={styles.page}>
      {mode === 'rain'   && <RainAmbient />}
      {mode === 'starry' && <Starfield />}

      {/* Chrome fades to near-invisible when typing, never fully gone */}
      <div style={{ ...styles.chrome, opacity: focused ? 0.08 : 1 }}>
        <button onClick={onClose} style={styles.chromeBtn}>← all writing</button>
        <div style={styles.chromeMeta}>
          <span style={styles.savedDot}>{saved ? '' : '·'}</span>
          <span style={styles.wordLabel}>{words} {words === 1 ? 'word' : 'words'}</span>
          <button onClick={onFontToggle} style={styles.chromeBtn}>
            {font === 'serif' ? 'serif' : 'sans'}
          </button>
          <button onClick={handleDownload} style={styles.chromeBtn}>download</button>
        </div>
      </div>

      <div style={styles.scroll}>
        <div style={styles.document}>
          <input
            style={styles.titleInput}
            value={title}
            onChange={handleTitleChange}
            placeholder="Title"
          />
          <div ref={editorWrapRef}>
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  chrome: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 2rem',
    transition: 'opacity 400ms ease',
    zIndex: 10,
  },
  chromeMeta: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  chromeBtn: {
    fontSize: '0.75rem',
    color: 'var(--ink-faint)',
    letterSpacing: '0.04em',
  },
  savedDot: {
    fontSize: '1.2rem',
    color: 'var(--ink-ghost)',
    lineHeight: 1,
  },
  wordLabel: {
    fontSize: '0.75rem',
    color: 'var(--ink-ghost)',
    letterSpacing: '0.03em',
  },
  scroll: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
  document: {
    width: '100%',
    maxWidth: 'var(--measure)',
    padding: '5rem 2rem 10rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  titleInput: {
    fontSize: '2rem',
    fontStyle: 'italic',
    color: 'var(--ink)',
    width: '100%',
    lineHeight: 1.4,
    background: 'transparent',
    border: 'none',
    outline: 'none',
  },
};

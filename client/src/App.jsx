import { useState, useEffect } from 'react';
import { useAuth, SignIn } from '@clerk/react';
import Threshold from './screens/Threshold.jsx';
import NewDocument from './screens/NewDocument.jsx';
import Editor from './screens/Editor.jsx';
import { applyTheme } from './animations.js';

export default function App() {
  const { isLoaded, isSignedIn } = useAuth();
  const [screen, setScreen] = useState('threshold');
  const [activeDoc, setActiveDoc] = useState(null);
  const [font, setFont] = useState('serif');
  const [mode, setMode] = useState(() => localStorage.getItem('cotev-mode') || 'plain');

  useEffect(() => {
    document.body.className = font === 'sans' ? 'font-sans' : '';
  }, [font]);

  useEffect(() => {
    localStorage.setItem('cotev-mode', mode);
    applyTheme(mode);
  }, [mode]);

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <div style={styles.signInWrap}>
        <SignIn routing="hash" />
      </div>
    );
  }

  if (screen === 'new') {
    return (
      <NewDocument
        onOpen={(doc) => { setActiveDoc(doc); setScreen('editor'); }}
        onBack={() => setScreen('threshold')}
      />
    );
  }

  if (screen === 'editor' && activeDoc) {
    return (
      <Editor
        doc={activeDoc}
        font={font}
        mode={mode}
        onFontToggle={() => setFont(f => f === 'serif' ? 'sans' : 'serif')}
        onClose={() => { setActiveDoc(null); setScreen('threshold'); }}
      />
    );
  }

  return (
    <Threshold
      font={font}
      mode={mode}
      onModeChange={setMode}
      onFontToggle={() => setFont(f => f === 'serif' ? 'sans' : 'serif')}
      onNew={() => setScreen('new')}
      onOpen={(doc) => { setActiveDoc(doc); setScreen('editor'); }}
    />
  );
}

const styles = {
  signInWrap: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

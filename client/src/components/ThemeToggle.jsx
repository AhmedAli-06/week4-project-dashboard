import { useEffect, useState } from 'react';
import { IconSun, IconMoon } from '@tabler/icons-react';

const THEME_EVENT = 'theme-change';

function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('theme', t); } catch {  }
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: t }));
}

function currentTheme() {
  try {
    const t = localStorage.getItem('theme');
    if (t === 'light' || t === 'dark') return t;
  } catch {  }
  return document.documentElement.dataset.theme || 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(currentTheme);

  useEffect(() => {
    const onChange = (e) => setTheme(e.detail);
    window.addEventListener(THEME_EVENT, onChange);
    return () => window.removeEventListener(THEME_EVENT, onChange);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  };

  return (
    <button
      className="icon-btn"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
    </button>
  );
}
import { useState, useEffect } from 'preact/hooks';

export function useTheme() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('mvo_theme');
    return saved ? saved === 'dark' : true; 
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('mvo_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('mvo_theme', 'light');
    }
  }, [darkMode]);

  return { darkMode, setDarkMode };
}

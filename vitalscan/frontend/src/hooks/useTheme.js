import { useState, useEffect } from 'react';

export default function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('vitalscan-theme');
    if (saved) return saved === 'dark';
    return true; // default dark
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('vitalscan-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('vitalscan-theme', 'light');
    }
  }, [isDark]);

  const toggle = () => setIsDark((prev) => !prev);

  return { isDark, toggle };
}

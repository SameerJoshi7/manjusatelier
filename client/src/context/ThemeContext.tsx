import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { api } from '@/lib/api';

type Theme = 'light' | 'dark' | 'system';
interface ThemeState {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeState | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>(() => {
    // 1. Initial load from local storage
    const stored = localStorage.getItem('manjus_theme') as Theme | null;
    if (stored) return stored;
    return 'system';
  });

  // 2. If user logs in and has a theme preference, use it
  useEffect(() => {
    if (user?.preferences?.theme) {
      setTheme(user.preferences.theme);
    }
  }, [user?.preferences?.theme]);

  // 3. Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    let actualTheme = theme;
    
    if (theme === 'system') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    root.classList.toggle('dark', actualTheme === 'dark');
    localStorage.setItem('manjus_theme', theme);
  }, [theme]);

  const toggle = () => {
    setTheme((t) => {
      let next: Theme = 'light';
      if (t === 'light') next = 'dark';
      else if (t === 'dark') next = 'system';
      else next = 'light'; // system -> light
      
      // Fire and forget to backend if logged in
      if (user) {
        api.put('/auth/preferences', { theme: next }).catch(console.error);
      }
      return next;
    });
  };

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

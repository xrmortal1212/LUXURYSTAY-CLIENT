import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const STORAGE_KEY = 'luxurystay-dashboard-theme';

const ThemeContext = createContext({ theme: 'light', setTheme: () => {}, toggleTheme: () => {} });

const readStoredTheme = () => {
  if (typeof window === 'undefined') return 'light';
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

export const DashboardThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(readStoredTheme);

  const setTheme = useCallback(nextTheme => {
    setThemeState(nextTheme === 'dark' ? 'dark' : 'light');
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(current => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage unavailable — ignore */
    }
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <div className="dashboard-theme-scope" data-dash-theme={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useDashboardTheme = () => useContext(ThemeContext);

export const DashboardThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useDashboardTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`dashboard-icon-button dashboard-theme-toggle${className ? ` ${className}` : ''}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
};

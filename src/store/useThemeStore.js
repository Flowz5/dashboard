import { create } from 'zustand';

// On utilise localStorage pour mémoriser le choix (clair ou sombre) de l'utilisateur
const useThemeStore = create((set) => ({
  isDarkMode: localStorage.getItem('theme') === 'dark',
  toggleTheme: () => set((state) => {
    const newMode = !state.isDarkMode;
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    if (newMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    return { isDarkMode: newMode };
  }),
  initTheme: () => {
    const isDark = localStorage.getItem('theme') === 'dark';
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}));

export default useThemeStore;

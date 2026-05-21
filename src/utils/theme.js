const THEME_STORAGE_KEY = "pokemonShowdownTheme";
const DARK_THEME = "dark";
const LIGHT_THEME = "light";

export function getInitialTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === DARK_THEME || savedTheme === LIGHT_THEME) {
    return savedTheme;
  }

  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return DARK_THEME;
  }

  return LIGHT_THEME;
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function getNextTheme(theme) {
  return theme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
}

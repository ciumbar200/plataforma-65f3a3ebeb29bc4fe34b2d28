import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FALLBACK_LANGUAGE, Language, messages, TranslationDictionary } from './messages';

const LANGUAGE_STORAGE_KEY = 'moon.language';

const SUPPORTED_LANGUAGES: Language[] = ['es', 'en', 'ca'];

const normalizeLanguage = (value: string | null | undefined): Language | null => {
  if (!value) return null;
  const lowerValue = value.toLowerCase();
  if (lowerValue.startsWith('es')) return 'es';
  if (lowerValue.startsWith('en')) return 'en';
  if (lowerValue.startsWith('ca') || lowerValue.startsWith('val')) return 'ca';
  return null;
};

export type PathLanguageInfo = {
  language: Language | null;
  pathWithoutLanguage: string;
};

export const extractLanguageFromPathname = (pathname: string): PathLanguageInfo => {
  const normalizedPath = typeof pathname === 'string' && pathname.length > 0 ? pathname : '/';
  const segments = normalizedPath.split('/').filter(Boolean);

  if (segments.length === 0) {
    return { language: null, pathWithoutLanguage: '/' };
  }

  const [firstSegment, ...rest] = segments;
  const language = normalizeLanguage(firstSegment);

  if (!language) {
    return { language: null, pathWithoutLanguage: normalizedPath || '/' };
  }

  const remainingPath = rest.length > 0 ? `/${rest.join('/')}` : '/';

  return {
    language,
    pathWithoutLanguage: remainingPath,
  };
};

export const getPathWithoutLanguage = (pathname: string): string => (
  extractLanguageFromPathname(pathname).pathWithoutLanguage
);

const normalizePathInput = (path?: string): string => {
  if (!path || path === '/') {
    return '/';
  }
  return path.startsWith('/') ? path : `/${path}`;
};

const getFromStorage = (): Language | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return normalizeLanguage(stored);
  } catch {
    return null;
  }
};

const setInStorage = (language: Language) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage errors (e.g. quota exceeded, private mode)
  }
};

const detectInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return FALLBACK_LANGUAGE;

  const queryLanguage = normalizeLanguage(new URLSearchParams(window.location.search).get('lang'));
  const { language: pathLanguage } = extractLanguageFromPathname(window.location.pathname);
  const storageLanguage = getFromStorage();

  const navigatorLanguages: Language[] = [];
  if (typeof navigator !== 'undefined') {
    const preferred = Array.isArray(navigator.languages) ? navigator.languages : [navigator.language];
    preferred.forEach((lang) => {
      const normalized = normalizeLanguage(lang);
      if (normalized) {
        navigatorLanguages.push(normalized);
      }
    });
  }

  const candidates = [
    queryLanguage,
    pathLanguage,
    storageLanguage,
    FALLBACK_LANGUAGE,
    ...navigatorLanguages,
  ];

  for (const candidate of candidates) {
    if (candidate && SUPPORTED_LANGUAGES.includes(candidate)) {
      return candidate;
    }
  }

  return FALLBACK_LANGUAGE;
};

const getNestedValue = (dictionary: TranslationDictionary, path: string): unknown => {
  return path.split('.').reduce<unknown>((acc, segment) => {
    if (acc === undefined || acc === null) return undefined;
    if (typeof acc !== 'object') return undefined;
    if (!Object.prototype.hasOwnProperty.call(acc, segment)) return undefined;
    return (acc as Record<string, unknown>)[segment];
  }, dictionary);
};

const formatMessage = (template: unknown, replacements?: Record<string, string | number>): string => {
  if (typeof template !== 'string') return '';
  if (!replacements) return template;

  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = replacements[key];
    return value === undefined || value === null ? match : String(value);
  });
};

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  get: <T = unknown>(key: string) => T;
  scope: <T = TranslationDictionary>(key: string) => T;
  localizePath: (path: string) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => detectInitialLanguage());
  const [initialPathLanguage] = useState<Language | null>(() => {
    if (typeof window === 'undefined') return null;
    return extractLanguageFromPathname(window.location.pathname).language;
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    setInStorage(language);
  }, [language]);

  const setLanguage = useCallback((newLanguage: Language) => {
    if (!SUPPORTED_LANGUAGES.includes(newLanguage)) return;
    setLanguageState(newLanguage);
  }, []);

  const translate = useCallback((key: string, replacements?: Record<string, string | number>) => {
    const langDictionary = messages[language] ?? {};
    const fallbackDictionary = messages[FALLBACK_LANGUAGE] ?? {};

    const value =
      getNestedValue(langDictionary, key) ??
      (language !== FALLBACK_LANGUAGE ? getNestedValue(fallbackDictionary, key) : undefined);

    if (value === undefined) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[i18n] Missing translation for key "${key}" in language "${language}"`);
      }
      return key;
    }

    return formatMessage(value, replacements);
  }, [language]);

  const getValue = useCallback(<T,>(key: string): T => {
    const langDictionary = messages[language] ?? {};
    const fallbackDictionary = messages[FALLBACK_LANGUAGE] ?? {};

    const value =
      getNestedValue(langDictionary, key) ??
      (language !== FALLBACK_LANGUAGE ? getNestedValue(fallbackDictionary, key) : undefined);

    if (value === undefined) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[i18n] Missing dictionary entry for key "${key}" in language "${language}"`);
      }
    }

    return value as T;
  }, [language]);

  const scope = useCallback(<T,>(key: string): T => {
    const scoped = getValue<T>(key);
    if (!scoped || typeof scoped !== 'object') {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[i18n] Requested scope "${key}" did not resolve to an object.`);
      }
      return {} as T;
    }
    return scoped;
  }, [getValue]);

  const localizePath = useCallback((path: string) => {
    const normalizedPath = normalizePathInput(path);
    const shouldPrefix = Boolean(initialPathLanguage) || language !== FALLBACK_LANGUAGE;

    if (!shouldPrefix) {
      return normalizedPath;
    }

    const pathTail = normalizedPath === '/' ? '' : normalizedPath;
    return `/${language}${pathTail}`;
  }, [initialPathLanguage, language]);

  const contextValue = useMemo<I18nContextValue>(() => ({
    language,
    setLanguage,
    t: translate,
    get: getValue,
    scope,
    localizePath,
  }), [language, setLanguage, translate, getValue, scope, localizePath]);

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

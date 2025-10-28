import { ca } from './locales/ca';
import { en } from './locales/en';
import { es } from './locales/es';

export type Language = 'es' | 'en' | 'ca';

export const FALLBACK_LANGUAGE: Language = 'es';

export type TranslationDictionary = Record<string, unknown>;

export const messages: Record<Language, TranslationDictionary> = {
  es,
  en,
  ca,
};

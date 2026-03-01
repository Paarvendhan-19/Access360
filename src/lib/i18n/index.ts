import en from './dictionaries/en.json';
import ta from './dictionaries/ta.json';
import hi from './dictionaries/hi.json';

export const dictionaries = {
    en,
    ta,
    hi,
} as const;

export type Language = keyof typeof dictionaries;
export type Dictionary = typeof en;

export const getDictionary = (lang: Language): Dictionary => {
    return dictionaries[lang] || dictionaries.en;
};

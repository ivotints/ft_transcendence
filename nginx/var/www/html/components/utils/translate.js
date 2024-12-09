// utils/translate.js
import { getTranslation } from './translations.js';
import { getLanguage } from './state.js';

export function translate(word) {
    const language = getLanguage();
    return getTranslation(language, word);
}

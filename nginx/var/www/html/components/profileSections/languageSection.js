// profileSections/languageSection.js
import { translate } from '../utils/translate.js';
import { setLanguage, getLanguage } from '../utils/state.js';

export function renderLanguageChange(container, showSection) {
    const section = document.createElement('div');
    section.className = 'language-section';

    const title = document.createElement('h2');
    title.textContent = translate('Language');
    section.appendChild(title);

    const languageSelect = document.createElement('select');
    languageSelect.className = 'language-select';

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'ru', name: 'Русский' },
        { code: 'cz', name: 'Čeština' }
    ];

    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.code;
        option.textContent = lang.name;
        option.selected = getLanguage() === lang.code;
        languageSelect.appendChild(option);
    });

    languageSelect.addEventListener('change', (e) => {
        setLanguage(e.target.value);
        // Reload the page to apply new language
		showSection('Language');
    });

    section.appendChild(languageSelect);
    container.appendChild(section);
}

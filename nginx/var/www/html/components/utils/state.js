// state.js
export const state = {
    isLoggedIn: JSON.parse(localStorage.getItem('isLoggedIn')) || false,
    language: localStorage.getItem('language') || 'en'
};

export function setLoggedIn(value) {
    state.isLoggedIn = value;
    localStorage.setItem('isLoggedIn', JSON.stringify(value));
}

export function checkLoginStatus() {
    return state.isLoggedIn;
}

export function setLanguage(lang) {
    state.language = lang;
    localStorage.setItem('language', lang);
}

export function getLanguage() {
    return state.language;
}

// state.js
export const state = {
    isLoggedIn: JSON.parse(localStorage.getItem('isLoggedIn')) || false
};

export function setLoggedIn(value) {
    state.isLoggedIn = value;
    localStorage.setItem('isLoggedIn', JSON.stringify(value));
}

export function checkLoginStatus() {
    return state.isLoggedIn;
}

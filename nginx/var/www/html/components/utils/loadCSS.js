// utils/loadCSS.js
export function loadCSS(href) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`link[href="${href}"]`)) {
            resolve();
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => resolve();
        link.onerror = () => reject();
        document.head.appendChild(link);
    });
}

export async function loadAllStyles() {
    const styles = [
        '/components/styles/styles.css',
        '/components/styles/header.css',
        '/components/styles/homePage.css',
        '/components/styles/tournamentPage.css',
        '/components/styles/playerRegistration.css',
        '/components/styles/pongGame.css',
        '/components/styles/profilePage.css',
        '/components/styles/gamePage.css',
        '/components/styles/cowboyPage.css',
        '/components/styles/auth.css',
        '/components/styles/PongVsPlayerPage.css',
        '/components/styles/language.css',
        '/components/styles/2FA.css',
    ];

    try {
        await Promise.all(styles.map(style => loadCSS(style)));
    } catch (error) {
        console.error('Failed to load styles:', error);
    }
}

// components/utils/loadCSS.js
export function loadCSS(href) {
    return new Promise((resolve, reject) => {
        //console.log(`Loading CSS file: ${href}`);
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => {
            //console.log(`Successfully loaded CSS file: ${href}`);
            resolve();
        };
        link.onerror = () => {
            console.error(`Failed to load CSS file: ${href}`);
            reject(new Error(`Failed to load CSS file: ${href}`));
        };
        document.head.appendChild(link);
    });
}

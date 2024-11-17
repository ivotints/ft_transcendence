export function matchDisplay(match) {
    const matchDisplayContainer = document.createElement('div');
    matchDisplayContainer.className = 'match-display';
  
    const title = document.createElement('h2');
    title.textContent = 'Current Match';
    matchDisplayContainer.appendChild(title);
  
    const matchText = document.createElement('p');
    matchText.textContent = match !== 'No more matches scheduled.' ? match : 'No matches yet.';
    matchText.className = match !== 'No more matches scheduled.' ? '' : 'no-match';
    matchDisplayContainer.appendChild(matchText);
  
    return matchDisplayContainer;
  }
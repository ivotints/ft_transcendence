export function nextMatch(onPlayGame) {
    const nextMatchContainer = document.createElement('div');
    nextMatchContainer.className = 'next-match';
  
    const playButton = document.createElement('button');
    playButton.className = 'submit-button';
    playButton.textContent = 'Play Game';
    playButton.addEventListener('click', onPlayGame);
    nextMatchContainer.appendChild(playButton);
  
    return nextMatchContainer;
  }
export function scoreTracker(scores) {
    const scoreTrackerContainer = document.createElement('div');
    scoreTrackerContainer.className = 'score-tracker';
  
    const title = document.createElement('h2');
    title.textContent = 'Scores';
    scoreTrackerContainer.appendChild(title);
  
    const scoreList = document.createElement('ul');
    Object.keys(scores).forEach((player, index) => {
      const listItem = document.createElement('li');
      const playerName = document.createElement('span');
      playerName.textContent = player;
      const playerPoints = document.createElement('span');
      playerPoints.className = 'points';
      playerPoints.textContent = `${scores[player]} points`;
      listItem.appendChild(playerName);
      listItem.appendChild(playerPoints);
      scoreList.appendChild(listItem);
    });
    scoreTrackerContainer.appendChild(scoreList);
  
    return scoreTrackerContainer;
  }
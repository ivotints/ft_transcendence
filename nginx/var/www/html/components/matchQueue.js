export function matchQueue(queue) {
    const matchQueueContainer = document.createElement('div');
    matchQueueContainer.className = 'match-queue';
  
    const title = document.createElement('h2');
    title.textContent = 'Match Queue';
    matchQueueContainer.appendChild(title);
  
    const queueList = document.createElement('ul');
    queue.forEach((match, index) => {
      const listItem = document.createElement('li');
      listItem.textContent = match;
      queueList.appendChild(listItem);
    });
    matchQueueContainer.appendChild(queueList);
  
    return matchQueueContainer;
  }
export function playerRegistration(addPlayer, players) {
    const registrationContainer = document.createElement('div');
    registrationContainer.className = 'player-registration';

    const title = document.createElement('h2');
    title.textContent = 'Player Registration';
    registrationContainer.appendChild(title);

    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group';


    const aliasInput = document.createElement('input');
    aliasInput.maxLength = 32;
    aliasInput.type = 'text';
    aliasInput.placeholder = 'Enter alias';
    aliasInput.className = 'alias-input';
    aliasInput.disabled = players.length >= 4;
    inputGroup.appendChild(aliasInput);

    const addButton = document.createElement('button');
    addButton.textContent = 'Add Player';
    addButton.className = `add-button ${players.length >= 4 ? 'disabled' : ''}`;
    addButton.disabled = players.length >= 4;
    inputGroup.appendChild(addButton);
    registrationContainer.appendChild(inputGroup);

    const errorMessage = document.createElement('p');
    errorMessage.className = 'error-message';
    registrationContainer.appendChild(errorMessage);

    const playerList = document.createElement('ul');
    playerList.className = 'player-list';
    players.forEach((player, index) => {
      const playerItem = document.createElement('li');
      playerItem.className = 'player-item';
      playerItem.textContent = player;
      playerList.appendChild(playerItem);
    });
    registrationContainer.appendChild(playerList);

    const handleAddPlayer = () => {
      const trimmedAlias = aliasInput.value.trim();
      if (!trimmedAlias || players.includes(trimmedAlias) || trimmedAlias.includes(' ')) {
        errorMessage.textContent = 'Alias cannot be empty, contain spaces, or already be registered.';
      } else {
        addPlayer(trimmedAlias);
        aliasInput.value = '';
        errorMessage.textContent = '';
      }
    };
    addButton.addEventListener('click', handleAddPlayer);

    return registrationContainer;
  }


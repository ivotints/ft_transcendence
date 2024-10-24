let Language = 'en';  // Default language

export function translate(word) {
  if (Language === 'ru') {
    switch (word) {
      case 'Home':
        return 'Дом';
      case 'Profile':
        return 'Профиль';
      case 'Game':
        return 'Игра';
      case 'Tournament':
        return 'Турнир';
      case 'Language':
        return 'Язык';
      case 'User Info':
        return 'Информация пользователя';
      case 'Change Email':
        return 'Изменить электронную почту';
      case 'Change Password':
        return 'Изменить пароль';
      case 'Add Friend':
        return 'Добавить друга';
      case 'Friend List':
        return 'Список друзей';
      case 'Pending Friend Requests':
        return 'Ожидающие заявки в друзья';
      case 'Match History':
        return 'История матчей';
      default:
        return word;
    }
  } else if (Language === 'cz') {
    switch (word) {
      case 'Home':
        return 'Dům';
      case 'Profile':
        return 'Profil';
      case 'Game':
        return 'Hra';
      case 'Tournament':
        return 'Turnaj';
      case 'Language':
        return 'Jazyk';
      case 'User Info':
        return 'Uživatelské informace';
      case 'Change Email':
        return 'Změnit e-mail';
      case 'Change Password':
        return 'Změnit heslo';
      case 'Add Friend':
        return 'Přidat přítele';
      case 'Friend List':
        return 'Seznam přátel';
      case 'Pending Friend Requests':
        return 'Čekající žádosti o přátelství';
      case 'Match History':
        return 'Historie zápasů';
      default:
        return word;
    }
  }
  return word;
}

export function setLanguage(lang) {
  Language = lang;  // Update the current language
}

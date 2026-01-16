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
        
        // Стандартные подарки
        database.gifts = {
            heart: { id: 'heart', name: 'Сердце', emoji: '💖', price: 10 },
            flower: { id: 'flower', name: 'Цветы', emoji: '💐', price: 15 },
            bear: { id: 'bear', name: 'Мишка', emoji: '🧸', price: 5 },
            rocket: { id: 'rocket', name: 'Ракета', emoji: '🚀', price: 50 }
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
    const birthdate = document.getElementById('register-birthdate').value;
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
        birthdate: birthdate,
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
    
    if (currentUser.id === 'zant') {
        document.getElementById('zant-panel').style.display = 'block';
    }
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
            } else if ((chat.type === 'group' || chat.type === 'channel') && 
                       (chat.members?.includes(currentUser.id) || chat.subscribers?.includes(currentUser.id))) {
                addChatToList(chat);
            }
        });
    } else if (tab === 'контакты') {
        Object.values(db.users).forEach(user => {
            if (user.id !== currentUser.id) {
                addContactToList(user);
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
    let avatar = '💬';
    let status = '';
    
    if (chat.type === 'contact') {
        const otherUser = chat.user1 === currentUser.id ? 
            db.getUser(chat.user2) : db.getUser(chat.user1);
        if (otherUser) {
            name = `${otherUser.firstname} ${otherUser.lastname}`;
            if (otherUser.avatar) {
                avatar = `<div class="item-avatar" style="background-image: url('${otherUser.avatar}')"></div>`;
            } else {
                avatar = `<div class="item-avatar">${otherUser.firstname?.charAt(0) || '?'}</div>`;
            }
            status = otherUser.verified ? '<span class="verified-badge">✓</span>' : '';
        }
    }
    
    div.innerHTML = `
        ${avatar}
        <div class="item-info">
            <div class="item-name">
                ${name} ${status}
            </div>
            <div class="item-meta">
                <span>${chat.lastMessage || 'Нет сообщений'}</span>
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
    
    const avatar = user.avatar ? 
        `<div class="item-avatar" style="background-image: url('${user.avatar}')"></div>` :
        `<div class="item-avatar">${user.firstname.charAt(0)}</div>`;
    
    div.innerHTML = `
        ${avatar}
        <div class="item-info">
            <div class="item-name">
                ${user.firstname} ${user.lastname}
                ${user.verified ? '<span class="verified-badge">✓</span>' : ''}
            </div>
            <div class="item-meta">
                <span>@${user.username}</span>
            </div>
        </div>
    `;
    
    list.appendChild(div);
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
        }
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
                <h3>Выберите чат</h3>
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
                <h3>Начните диалог</h3>
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
    
    if (!text || !currentChatId) return;
    
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
        timestamp: new Date().toISOString()
    };
    
    db.saveMessage(currentChatId, message);
    addMessageToUI(message, true);
    input.value = '';
}

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
                ${sender?.verified ? '<span class="verified-badge">✓</span>' : ''}
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
        sendPhoto(event.target.result);
    };
    reader.readAsDataURL(file);
});

function sendPhoto(photoUrl) {
    if (!currentChatId) return;
    
    const message = {
        id: Date.now(),
        sender: currentUser.id,
        image: photoUrl,
        timestamp: new Date().toISOString()
    };
    
    db.saveMessage(currentChatId, message);
    addMessageToUI(message, true);
}

function openImage(url) {
    window.open(url, '_blank');
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
    addMessageToUI(message, true);
    toggleStickerPicker();
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
            <div>${gift.name}</div>
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
        showNotification('Выберите подарок');
        return;
    }
    
    if (currentUser.stars < selectedGift.price) {
        showNotification('Недостаточно звёзд');
        return;
    }
    
    currentUser.stars -= selectedGift.price;
    db.saveUser(currentUser);
    updateUserUI();
    
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

function openWindow(id) {
    closeAllWindows();
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

// ============ ИНИЦИАЛИЗАЦИЯ ============
document.addEventListener('DOMContentLoaded', function() {
    // Отправка сообщения по Enter
    document.getElementById('message-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
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
                 user.firstname.toLowerCase().includes(term))) {
                addContactToList(user);
            }
        });
    });
});

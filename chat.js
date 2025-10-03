// Chat page functionality
let currentActiveChat = null;
let chatList = [];

// Initialize chat page
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) {
        return;
    }
    
    updateUserProfile();
    loadChatList();
    setupEventListeners();
    
    // Check for notifications on page load
    checkForNotifications();
});

// Update user profile display
function updateUserProfile() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        const userTypeBtn = document.getElementById('userTypeBtn');
        if (userTypeBtn) {
            const icons = {
                participant: 'fas fa-search',
                host: 'fas fa-calendar-plus',
                admin: 'fas fa-crown'
            };
            const labels = {
                participant: 'Participant',
                host: 'Host',
                admin: 'Admin'
            };

            userTypeBtn.innerHTML = `<i class="${icons[currentUser.type]}"></i> ${labels[currentUser.type]}`;
        }
        
        // Show/hide host party navigation
        const hostPartyNav = document.getElementById('hostPartyNav');
        if (hostPartyNav && (currentUser.type === 'host' || currentUser.type === 'admin')) {
            hostPartyNav.style.display = 'block';
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Modal close functionality
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = () => modal.style.display = 'none';
        }
        modal.onclick = (e) => {
            if (e.target === modal) modal.style.display = 'none';
        };
    });
}

// Load chat list
function loadChatList() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    chatList = ChatDB.getUserRecentChats(currentUser.id);
    renderChatList();
}

// Render chat list
function renderChatList() {
    const chatListElement = document.getElementById('chatList');
    const noChatsElement = document.getElementById('noChats');
    
    if (chatList.length === 0) {
        chatListElement.innerHTML = '';
        noChatsElement.style.display = 'block';
        return;
    }
    
    noChatsElement.style.display = 'none';
    
    chatListElement.innerHTML = chatList.map(chat => {
        const party = sampleParties.find(p => p.id == chat.partyId);
        const unreadCount = ChatDB.getUnreadCount(chat.partyId, getCurrentUser().id);
        const lastMessage = ChatDB.getPartyMessages(chat.partyId).slice(-1)[0];
        
        return `
            <div class="chat-item ${currentActiveChat === chat.partyId ? 'active' : ''}" 
                 onclick="openChat('${chat.partyId}')">
                <div class="chat-item-content">
                    <div class="chat-item-header">
                        <h4>${party ? party.name : 'Unknown Party'}</h4>
                        <span class="chat-time">${formatLastMessageTime(lastMessage ? lastMessage.timestamp : chat.lastActivity)}</span>
                    </div>
                    <div class="chat-item-message">
                        ${lastMessage ? 
                            `<span class="sender-name">${lastMessage.senderName || lastMessage.userName || 'Unknown'}:</span> ${escapeHTML(lastMessage.text || lastMessage.message || '')}` : 
                            'No messages yet'
                        }
                    </div>
                </div>
                ${unreadCount > 0 ? `<div class="chat-unread-badge">${unreadCount}</div>` : ''}
            </div>
        `;
    }).join('');
}

// Open a chat
function openChat(partyId) {
    currentActiveChat = partyId;
    const party = sampleParties.find(p => p.id == partyId);
    
    if (!party) return;
    
    // Update active chat header
    document.getElementById('activePartyName').textContent = party.name;
    document.getElementById('activePartyDetails').innerHTML = `
        <i class="fas fa-map-marker-alt"></i> ${party.location} • 
        <i class="fas fa-calendar"></i> ${formatDate(party.date)}
    `;
    
    // Show active chat, hide welcome
    document.getElementById('chatWelcome').style.display = 'none';
    document.getElementById('activeChat').style.display = 'flex';
    
    // Load messages
    loadMessages(partyId);
    
    // Mark messages as read
    ChatDB.markMessagesAsRead(partyId, getCurrentUser().id);
    ChatDB.markAllNotificationsAsRead(getCurrentUser().id, partyId);
    
    // Update chat list to show active state
    renderChatList();
    
    // Focus message input
    document.getElementById('messageInput').focus();
}

// Load messages for a party
function loadMessages(partyId) {
    const messages = ChatDB.getPartyMessages(partyId);
    const messagesContainer = document.getElementById('messagesContainer');
    
    messagesContainer.innerHTML = messages.map(message => {
        const isCurrentUser = message.userId === getCurrentUser().id;
        const messageTime = new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        return `
            <div class="message ${isCurrentUser ? 'sent' : 'received'}">
                <div class="message-content">
                    ${!isCurrentUser ? `<div class="message-sender">${escapeHTML(message.senderName || message.userName || 'Unknown')}</div>` : ''}
                    <div class="message-text">${escapeHTML(message.text || message.message || '')}</div>
                    <div class="message-time">${messageTime}</div>
                </div>
            </div>
        `;
    }).join('');
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send a message
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();
    
    if (!messageText || !currentActiveChat) return;
    
    const currentUser = getCurrentUser();
    const party = sampleParties.find(p => p.id == currentActiveChat);
    
    const message = {
        id: Date.now(),
        partyId: currentActiveChat,
        userId: currentUser.id,
        senderName: currentUser.name,
        text: messageText,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    // Add message to database
    ChatDB.addMessage(currentActiveChat, message);
    
    // Add to chat if not exists
    const chat = ChatDB.getOrCreatePartyChat(currentActiveChat);
    ChatDB.addParticipantToChat(currentActiveChat, currentUser.id);
    
    // Clear input
    messageInput.value = '';
    
    // Reload messages
    loadMessages(currentActiveChat);
    
    // Update chat list
    loadChatList();
    
    // Show notification to other participants
    showMessageNotification(party, currentUser, messageText);
}

// Handle message input keypress
function handleMessageKeypress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Close active chat
function closeActiveChat() {
    currentActiveChat = null;
    document.getElementById('activeChat').style.display = 'none';
    document.getElementById('chatWelcome').style.display = 'flex';
    renderChatList();
}

// Search chats
function searchChats() {
    const searchTerm = document.getElementById('chatSearch').value.toLowerCase();
    const filteredChats = chatList.filter(chat => {
        const party = sampleParties.find(p => p.id == chat.partyId);
        return party && party.name.toLowerCase().includes(searchTerm);
    });
    
    // Temporarily replace chat list for search results
    const chatListElement = document.getElementById('chatList');
    const noChatsElement = document.getElementById('noChats');
    
    if (filteredChats.length === 0 && searchTerm) {
        chatListElement.innerHTML = '';
        noChatsElement.style.display = 'block';
        noChatsElement.innerHTML = `
            <i class="fas fa-search"></i>
            <p>No conversations found</p>
            <small>Try a different search term</small>
        `;
        return;
    }
    
    if (searchTerm) {
        chatListElement.innerHTML = filteredChats.map(chat => {
            const party = sampleParties.find(p => p.id == chat.partyId);
            const unreadCount = ChatDB.getUnreadCount(chat.partyId, getCurrentUser().id);
            const lastMessage = ChatDB.getPartyMessages(chat.partyId).slice(-1)[0];
            
            return `
                <div class="chat-item ${currentActiveChat === chat.partyId ? 'active' : ''}" 
                     onclick="openChat('${chat.partyId}')">
                    <div class="chat-item-content">
                        <div class="chat-item-header">
                            <h4>${party ? party.name : 'Unknown Party'}</h4>
                            <span class="chat-time">${formatLastMessageTime(lastMessage ? lastMessage.timestamp : chat.lastActivity)}</span>
                        </div>
                        <div class="chat-item-message">
                            ${lastMessage ? 
                                `<span class="sender-name">${lastMessage.senderName || lastMessage.userName || 'Unknown'}:</span> ${escapeHTML(lastMessage.text || lastMessage.message || '')}` : 
                                'No messages yet'
                            }
                        </div>
                    </div>
                    ${unreadCount > 0 ? `<div class="chat-unread-badge">${unreadCount}</div>` : ''}
                </div>
            `;
        }).join('');
    } else {
        renderChatList();
    }
}

// Refresh chats
function refreshChats() {
    loadChatList();
    showNotification('Chat list refreshed', 'success');
}

// Show party info
function showPartyInfo() {
    if (!currentActiveChat) return;
    
    const party = sampleParties.find(p => p.id == currentActiveChat);
    if (!party) return;
    
    const modal = document.getElementById('partyInfoModal');
    const content = document.getElementById('partyInfoContent');
    
    content.innerHTML = `
        <h3>${party.name}</h3>
        <div class="party-info-details">
            <div class="info-item">
                <i class="fas fa-calendar"></i>
                <strong>Date:</strong> ${formatDate(party.date)}
            </div>
            <div class="info-item">
                <i class="fas fa-map-marker-alt"></i>
                <strong>Location:</strong> ${party.location}
            </div>
            <div class="info-item">
                <i class="fas fa-dollar-sign"></i>
                <strong>Price:</strong> ${party.price}
            </div>
            <div class="info-item">
                <i class="fas fa-users"></i>
                <strong>Capacity:</strong> ${party.capacity} people
            </div>
            <div class="info-item">
                <i class="fas fa-user"></i>
                <strong>Host:</strong> ${party.host}
            </div>
            <div class="info-item">
                <i class="fas fa-tag"></i>
                <strong>Category:</strong> ${party.category}
            </div>
        </div>
        <div class="party-description">
            <strong>Description:</strong>
            <p>${party.description}</p>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Check for notifications
function checkForNotifications() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const unreadCount = ChatDB.getUnreadNotificationCount(currentUser.id);
    if (unreadCount > 0) {
        showNotification(`You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`, 'info');
    }
}

// Show message notification
function showMessageNotification(party, sender, message) {
    // Get all participants except sender
    const chat = ChatDB.getPartyChat(party.id);
    if (chat) {
        chat.participants.forEach(participantId => {
            if (participantId !== sender.id) {
                const participant = testUsers.find(u => u.id === participantId);
                if (participant) {
                    showChatNotification(party.name, sender.name, message);
                }
            }
        });
    }
}

// Format last message time
function formatLastMessageTime(timestamp) {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now - messageTime) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
        return 'Just now';
    } else if (diffInHours < 24) {
        return messageTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } else if (diffInHours < 48) {
        return 'Yesterday';
    } else {
        return messageTime.toLocaleDateString();
    }
}

// Escape HTML to prevent XSS
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

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
            closeBtn.onclick = () => {
                modal.style.display = 'none';
                if (modal.id === 'activeChatModal') {
                    closeActiveChat();
                }
            };
        }
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                if (modal.id === 'activeChatModal') {
                    closeActiveChat();
                }
            }
        };
    });
}

// Load chat list
function loadChatList() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Clean up orphaned notifications before loading
    ChatDB.cleanupOrphanedNotifications();
    
    chatList = ChatDB.getUserRecentChats(currentUser.id);
    renderChatList();
    
    // Update notification badges after cleanup
    updateNavigationNotificationBadges();
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
        // Ensure partyId is treated as number for consistent matching
        const partyId = Number(chat.partyId);
        const party = PartyDB.getPartyById(partyId);
        const unreadCount = ChatDB.getUnreadCount(partyId, getCurrentUser().id);
        const lastMessage = ChatDB.getPartyMessages(partyId).slice(-1)[0];
        
        return `
            <div class="chat-item ${currentActiveChat === partyId ? 'active' : ''}">
                <div class="chat-item-content" onclick="openChat(${partyId})">
                    <div class="chat-item-header">
                        <h4>${party ? (party.title || party.name || 'Unknown Party') : 'Unknown Party'}</h4>
                        <span class="chat-time">${formatLastMessageTime(lastMessage ? lastMessage.timestamp : chat.lastActivity)}</span>
                    </div>
                    <div class="chat-item-message">
                        ${lastMessage ? 
                            `<span class="sender-name">${lastMessage.senderName || lastMessage.userName || 'Unknown'}:</span> ${escapeHTML(lastMessage.text || lastMessage.message || '')}` : 
                            'No messages yet'
                        }
                    </div>
                </div>
                <button class="chat-delete-btn" onclick="event.stopPropagation(); deleteChat(${partyId})" title="Delete conversation">
                    <i class="fas fa-trash"></i>
                </button>
                ${unreadCount > 0 ? `<div class="chat-unread-badge">${unreadCount}</div>` : ''}
            </div>
        `;
    }).join('');
}

// Open a chat
function openChat(partyId) {
    // Convert partyId to number for consistent matching
    partyId = Number(partyId);
    currentActiveChat = partyId;
    const party = PartyDB.getPartyById(partyId);
    
    if (!party) {
        console.error('Party not found for ID:', partyId);
        return;
    }
    
    // Update active chat header
    const partyName = party.title || party.name || 'Unknown Party';
    const activePartyName = document.getElementById('activePartyName');
    const activePartyDetails = document.getElementById('activePartyDetails');
    
    if (activePartyName) {
        activePartyName.textContent = partyName;
    }
    if (activePartyDetails) {
        activePartyDetails.innerHTML = `
            <i class="fas fa-map-marker-alt"></i> ${party.location} • 
            <i class="fas fa-calendar"></i> ${formatDate(party.date)}
        `;
    }
    
    // Show active chat modal
    const chatModal = document.getElementById('activeChatModal');
    if (!chatModal) {
        console.error('Chat modal not found');
        return;
    }
    chatModal.style.display = 'block';
    
    const activeChat = document.getElementById('activeChat');
    if (!activeChat) {
        console.error('Active chat container not found');
        return;
    }
    activeChat.style.display = 'flex';
    
    // Load messages after a short delay to ensure modal is visible
    setTimeout(() => {
        loadMessages(partyId);
    }, 100);
    
    // Mark messages as read
    ChatDB.markMessagesAsRead(partyId, getCurrentUser().id);
    ChatDB.markAllNotificationsAsRead(getCurrentUser().id, partyId);
    
    // Update chat list to show active state
    renderChatList();
    
    // Focus message input
    setTimeout(() => {
        const input = document.getElementById('messageInput');
        if (input) input.focus();
    }, 200);
}

// Load messages for a party
function loadMessages(partyId) {
    const messages = ChatDB.getPartyMessages(partyId);
    const messagesContainer = document.getElementById('messagesContainer');
    
    if (!messagesContainer) {
        console.error('Messages container not found');
        return;
    }
    
    if (messages.length === 0) {
        messagesContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <i class="fas fa-comments" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                <p>No messages yet. Start the conversation!</p>
            </div>
        `;
        return;
    }
    
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
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
}

// Send a message
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();
    
    if (!messageText || !currentActiveChat) return;
    
    const currentUser = getCurrentUser();
    const party = PartyDB.getPartyById(currentActiveChat);
    
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
    
    // Ensure hosts/admins are added to participants so they get notifications
    testUsers.forEach(user => {
        if (user.type === 'host' || user.type === 'admin') {
            ChatDB.addParticipantToChat(currentActiveChat, user.id);
        }
    });
    
    // Send notifications to all participants (including hosts/admins)
    const updatedChat = ChatDB.getPartyChat(currentActiveChat);
    if (updatedChat) {
        const recipients = new Set(updatedChat.participants);
        // Add all hosts and admins
        testUsers.forEach(user => {
            if ((user.type === 'host' || user.type === 'admin') && user.id !== currentUser.id) {
                recipients.add(user.id);
            }
        });
        
        recipients.forEach(participantId => {
            if (participantId !== currentUser.id) {
                ChatDB.addNotification(participantId, currentActiveChat, message);
            }
        });
    }
    
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
    const chatModal = document.getElementById('activeChatModal');
    if (chatModal) {
        chatModal.style.display = 'none';
    }
    document.getElementById('activeChat').style.display = 'none';
    renderChatList();
}

// Search chats
function searchChats() {
    const searchTerm = document.getElementById('chatSearch').value.toLowerCase();
        const filteredChats = chatList.filter(chat => {
            const party = PartyDB.getPartyById(chat.partyId);
            const partyName = party ? (party.title || party.name || '') : '';
            return partyName.toLowerCase().includes(searchTerm);
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
            const party = PartyDB.getPartyById(chat.partyId);
            const unreadCount = ChatDB.getUnreadCount(chat.partyId, getCurrentUser().id);
            const lastMessage = ChatDB.getPartyMessages(chat.partyId).slice(-1)[0];
            
            return `
                <div class="chat-item ${currentActiveChat === chat.partyId ? 'active' : ''}">
                    <div class="chat-item-content" onclick="openChat(${chat.partyId})">
                        <div class="chat-item-header">
                            <h4>${party ? (party.title || party.name || 'Unknown Party') : 'Unknown Party'}</h4>
                            <span class="chat-time">${formatLastMessageTime(lastMessage ? lastMessage.timestamp : chat.lastActivity)}</span>
                        </div>
                        <div class="chat-item-message">
                            ${lastMessage ? 
                                `<span class="sender-name">${lastMessage.senderName || lastMessage.userName || 'Unknown'}:</span> ${escapeHTML(lastMessage.text || lastMessage.message || '')}` : 
                                'No messages yet'
                            }
                        </div>
                    </div>
                    <button class="chat-delete-btn" onclick="event.stopPropagation(); deleteChat(${chat.partyId})" title="Delete conversation">
                        <i class="fas fa-trash"></i>
                    </button>
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
    
    const party = PartyDB.getPartyById(currentActiveChat);
    if (!party) return;
    
    const modal = document.getElementById('partyInfoModal');
    const content = document.getElementById('partyInfoContent');
    
    content.innerHTML = `
        <h3>${party.title || party.name || 'Unknown Party'}</h3>
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
        // Get all users who should receive notifications (participants + hosts/admins)
        const recipients = new Set(chat.participants);
        
        // Add all hosts and admins to recipients (they should always get notifications for their parties)
        testUsers.forEach(user => {
            if ((user.type === 'host' || user.type === 'admin') && user.id !== sender.id) {
                recipients.add(user.id);
                // Also add them to chat participants if not already there
                ChatDB.addParticipantToChat(party.id, user.id);
            }
        });
        
        // Send notifications to all recipients
        recipients.forEach(participantId => {
            if (participantId !== sender.id) {
                const participant = testUsers.find(u => u.id === participantId);
                if (participant) {
                    showChatNotification(party.title || party.name || 'Party', sender.name, message);
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

// Delete chat conversation
function deleteChat(partyId) {
    const party = PartyDB.getPartyById(partyId);
    const partyName = party ? (party.title || party.name || 'this conversation') : 'this conversation';
    const currentUser = getCurrentUser();
    
    if (confirm(`Are you sure you want to delete "${partyName}"? This will permanently delete all messages in this conversation.`)) {
        // Delete the chat (this also deletes messages and notifications for all users)
        ChatDB.deleteChat(partyId);
        
        // Clean up any orphaned notifications
        ChatDB.cleanupOrphanedNotifications();
        
        // If this was the active chat, close it
        if (currentActiveChat === partyId) {
            closeActiveChat();
        }
        
        // Reload chat list
        loadChatList();
        
        // Update all notification badges - this will recalculate unread count (should be 0 after deletion)
        updateNavigationNotificationBadges();
        
        showNotification('Conversation deleted', 'success');
    }
}

// Delete current active chat
function deleteCurrentChat() {
    if (!currentActiveChat) return;
    deleteChat(currentActiveChat);
}

// Delete all chat history
function deleteAllChats() {
    if (confirm('Are you sure you want to delete ALL chat history? This action cannot be undone.')) {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        // Get all user chats
        const chats = ChatDB.getUserRecentChats(currentUser.id);
        
        // Delete each chat (this also deletes messages and notifications)
        chats.forEach(chat => {
            ChatDB.deleteChat(chat.partyId);
        });
        
        // Clean up any orphaned notifications
        ChatDB.cleanupOrphanedNotifications();
        
        // Also clear all notifications for current user to be absolutely sure
        const notifications = JSON.parse(localStorage.getItem('partyverse_chat_notifications') || '{}');
        if (notifications[currentUser.id]) {
            notifications[currentUser.id] = [];
            localStorage.setItem('partyverse_chat_notifications', JSON.stringify(notifications));
        }
        
        // Close active chat if open
        if (currentActiveChat) {
            closeActiveChat();
        }
        
        // Reload chat list
        loadChatList();
        
        // Update all notification badges
        updateNavigationNotificationBadges();
        
        // Also update bell badge if it exists (for participant page)
        if (typeof updateBellNotificationBadge === 'function') {
            updateBellNotificationBadge();
        }
        
        showNotification('All conversations deleted', 'success');
    }
}

// Escape HTML to prevent XSS
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

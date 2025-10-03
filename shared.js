// Shared JavaScript for PartyVerse App
// Test users data
const testUsers = [
    {
        id: 1,
        name: "Test Admin",
        email: "admin@partyverse.com",
        password: "admin123",
        type: "admin",
        profilePicture: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23ffd700'/%3E%3Ccircle cx='50' cy='40' r='20' fill='%23fff'/%3E%3Cpath d='M20 80 Q50 60 80 80' fill='%23fff'/%3E%3C/svg%3E"
    },
    {
        id: 2,
        name: "John Host",
        email: "host@partyverse.com",
        password: "host123",
        type: "host",
        profilePicture: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%238b5cf6'/%3E%3Ccircle cx='50' cy='40' r='20' fill='%23fff'/%3E%3Cpath d='M20 80 Q50 60 80 80' fill='%23fff'/%3E%3C/svg%3E"
    },
    {
        id: 3,
        name: "Sarah Participant",
        email: "participant@partyverse.com",
        password: "participant123",
        type: "participant",
        profilePicture: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%233b82f6'/%3E%3Ccircle cx='50' cy='40' r='20' fill='%23fff'/%3E%3Cpath d='M20 80 Q50 60 80 80' fill='%23fff'/%3E%3C/svg%3E"
    }
];

// Sample parties data
const sampleParties = [
    {
        id: 1,
        title: "Funky Friday",
        description: "Dance the night away with amazing music and great vibes!",
        date: "2024-07-15",
        time: "20:00",
        location: "Stoke-on-Trent, UK",
        type: "social",
        price: 20,
        capacity: 50,
        host: "DJ Mike",
        attendees: 23
    },
    {
        id: 2,
        title: "Wild Night",
        description: "Epic party vibes with live DJ and dancing!",
        date: "2024-07-20",
        time: "21:00",
        location: "Hanley, UK",
        type: "social",
        price: 25,
        capacity: 80,
        host: "Party Crew",
        attendees: 45
    },
    {
        id: 3,
        title: "Parteyy!",
        description: "Join the celebration with friends and music!",
        date: "2024-07-25",
        time: "19:30",
        location: "Newcastle-under-Lyme, UK",
        type: "social",
        price: 15,
        capacity: 40,
        host: "Sarah & Friends",
        attendees: 28
    },
    {
        id: 4,
        title: "Birthday Bash",
        description: "Celebrating Sarah's 25th birthday with live music and dancing!",
        date: "2024-07-20",
        time: "19:30",
        location: "456 Party Lane, Orlando",
        type: "birthday",
        price: 15,
        capacity: 30,
        host: "Sarah Johnson",
        attendees: 18
    },
    {
        id: 5,
        title: "Corporate Networking Event",
        description: "Professional networking event for tech industry professionals.",
        date: "2024-07-25",
        time: "17:00",
        location: "789 Business Ave, Tampa",
        type: "corporate",
        price: 0,
        capacity: 100,
        host: "TechCorp Events",
        attendees: 67
    },
    {
        id: 6,
        title: "Wedding Reception",
        description: "Join us to celebrate the union of Mike and Lisa!",
        date: "2024-08-01",
        time: "16:00",
        location: "321 Garden Way, Jacksonville",
        type: "wedding",
        price: 50,
        capacity: 150,
        host: "Mike & Lisa",
        attendees: 89
    }
];


// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Check if user is logged in
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'splash.html';
        return false;
    }
    return true;
}

// Get current user
function getCurrentUser() {
    const userStr = sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Logout function
function logout() {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('isLoggedIn');
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'splash.html';
    }, 1000);
}

// Format date helper
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Chat Database Management
const ChatDB = {
    // Initialize chat database
    init() {
        if (!localStorage.getItem('partyverse_chats')) {
            localStorage.setItem('partyverse_chats', JSON.stringify({}));
        }
        if (!localStorage.getItem('partyverse_chat_messages')) {
            localStorage.setItem('partyverse_chat_messages', JSON.stringify([]));
        }
        if (!localStorage.getItem('partyverse_chat_notifications')) {
            localStorage.setItem('partyverse_chat_notifications', JSON.stringify({}));
        }
    },

    // Get all chats
    getAllChats() {
        return JSON.parse(localStorage.getItem('partyverse_chats') || '{}');
    },

    // Get chat for a specific party
    getPartyChat(partyId) {
        const chats = this.getAllChats();
        return chats[partyId] || null;
    },

    // Create or get chat for a party
    getOrCreatePartyChat(partyId) {
        const chats = this.getAllChats();
        if (!chats[partyId]) {
            chats[partyId] = {
                partyId: partyId,
                participants: [],
                created: new Date().toISOString(),
                lastActivity: new Date().toISOString()
            };
            localStorage.setItem('partyverse_chats', JSON.stringify(chats));
        }
        return chats[partyId];
    },

    // Add participant to chat
    addParticipantToChat(partyId, userId) {
        const chats = this.getAllChats();
        if (chats[partyId]) {
            if (!chats[partyId].participants.includes(userId)) {
                chats[partyId].participants.push(userId);
                chats[partyId].lastActivity = new Date().toISOString();
                localStorage.setItem('partyverse_chats', JSON.stringify(chats));
            }
        }
    },

    // Get all messages for a party
    getPartyMessages(partyId) {
        const messages = JSON.parse(localStorage.getItem('partyverse_chat_messages') || '[]');
        return messages.filter(msg => msg.partyId === partyId);
    },

    // Add message to chat
    addMessage(partyId, messageObj) {
        const messages = JSON.parse(localStorage.getItem('partyverse_chat_messages') || '[]');
        
        // Ensure message object has correct structure
        const newMessage = {
            id: messageObj.id || Date.now(),
            partyId: partyId,
            userId: messageObj.userId,
            senderName: messageObj.senderName,
            text: messageObj.text,
            timestamp: messageObj.timestamp || new Date().toISOString(),
            read: messageObj.read || false
        };
        
        messages.push(newMessage);
        localStorage.setItem('partyverse_chat_messages', JSON.stringify(messages));

        // Update chat last activity
        const chats = this.getAllChats();
        if (chats[partyId]) {
            chats[partyId].lastActivity = new Date().toISOString();
            chats[partyId].lastMessageTime = new Date().toISOString();
            localStorage.setItem('partyverse_chats', JSON.stringify(chats));
        }

        return newMessage;
    },

    // Mark messages as read
    markMessagesAsRead(partyId, userId) {
        const messages = JSON.parse(localStorage.getItem('partyverse_chat_messages') || '[]');
        const updatedMessages = messages.map(msg => {
            if (msg.partyId === partyId && msg.userId !== userId) {
                msg.read = true;
            }
            return msg;
        });
        localStorage.setItem('partyverse_chat_messages', JSON.stringify(updatedMessages));
    },

    // Get unread message count for a party
    getUnreadCount(partyId, userId) {
        const messages = this.getPartyMessages(partyId);
        return messages.filter(msg => msg.userId !== userId && !msg.read).length;
    },

    // Get recent chats for a user
    getUserRecentChats(userId) {
        const chats = this.getAllChats();
        const userChats = Object.values(chats).filter(chat => 
            chat.participants.includes(userId)
        );
        
        // Sort by last activity
        return userChats.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
    },

    // Notification system
    addNotification(userId, partyId, message) {
        const notifications = JSON.parse(localStorage.getItem('partyverse_chat_notifications') || '{}');
        if (!notifications[userId]) {
            notifications[userId] = [];
        }
        
        const notification = {
            id: Date.now(),
            partyId: partyId,
            message: message.text,
            sender: message.senderName,
            timestamp: message.timestamp,
            read: false
        };
        
        notifications[userId].unshift(notification);
        
        // Keep only last 50 notifications per user
        if (notifications[userId].length > 50) {
            notifications[userId] = notifications[userId].slice(0, 50);
        }
        
        localStorage.setItem('partyverse_chat_notifications', JSON.stringify(notifications));
        return notification;
    },

    getNotifications(userId) {
        return JSON.parse(localStorage.getItem('partyverse_chat_notifications') || '{}')[userId] || [];
    },

    markNotificationAsRead(userId, notificationId) {
        const notifications = JSON.parse(localStorage.getItem('partyverse_chat_notifications') || '{}');
        if (notifications[userId]) {
            const notification = notifications[userId].find(n => n.id === notificationId);
            if (notification) {
                notification.read = true;
                localStorage.setItem('partyverse_chat_notifications', JSON.stringify(notifications));
            }
        }
    },

    markAllNotificationsAsRead(userId, partyId) {
        const notifications = JSON.parse(localStorage.getItem('partyverse_chat_notifications') || '{}');
        if (notifications[userId]) {
            notifications[userId].forEach(notification => {
                if (notification.partyId === partyId) {
                    notification.read = true;
                }
            });
            localStorage.setItem('partyverse_chat_notifications', JSON.stringify(notifications));
        }
    },

    getUnreadNotificationCount(userId) {
        const notifications = this.getNotifications(userId);
        return notifications.filter(n => !n.read).length;
    }
};

// Initialize chat database when script loads
ChatDB.init();

// Clear existing chat data and initialize with sample messages
function initializeChatData() {
    // Clear existing chat data
    localStorage.removeItem('partyverse_chats');
    localStorage.removeItem('partyverse_chat_messages');
    localStorage.removeItem('partyverse_chat_notifications');
    
    // Reinitialize
    ChatDB.init();
    
    // Add sample messages to demonstrate chat functionality
    const sampleMessages = [
        {
            id: Date.now() - 300000,
            partyId: 1,
            userId: 2,
            senderName: "John Host",
            text: "Welcome everyone to Funky Friday! 🎉",
            timestamp: new Date(Date.now() - 300000).toISOString(),
            read: false
        },
        {
            id: Date.now() - 240000,
            partyId: 1,
            userId: 3,
            senderName: "Sarah Participant",
            text: "Thanks for hosting! Can't wait for the party!",
            timestamp: new Date(Date.now() - 240000).toISOString(),
            read: false
        },
        {
            id: Date.now() - 180000,
            partyId: 1,
            userId: 2,
            senderName: "John Host",
            text: "The music setup is ready and we have great drinks!",
            timestamp: new Date(Date.now() - 180000).toISOString(),
            read: false
        },
        {
            id: Date.now() - 120000,
            partyId: 2,
            userId: 2,
            senderName: "John Host",
            text: "Beach party is going to be amazing! 🌊",
            timestamp: new Date(Date.now() - 120000).toISOString(),
            read: false
        }
    ];
    
    // Add sample messages
    sampleMessages.forEach(msg => {
        ChatDB.addMessage(msg.partyId, msg);
        ChatDB.getOrCreatePartyChat(msg.partyId);
        ChatDB.addParticipantToChat(msg.partyId, msg.userId);
    });
    
    console.log('Chat data initialized with sample messages');
}

// Initialize chat data on first load
if (!localStorage.getItem('partyverse_chat_initialized')) {
    initializeChatData();
    localStorage.setItem('partyverse_chat_initialized', 'true');
}

// Notification system for chat messages
function showChatNotification(partyName, senderName, message) {
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
        const notification = new Notification(`New message in ${partyName}`, {
            body: `${senderName}: ${message}`,
            icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%233b82f6"/%3E%3Ccircle cx="50" cy="40" r="20" fill="%23fff"/%3E%3Cpath d="M20 80 Q50 60 80 80" fill="%23fff"/%3E%3C/svg%3E',
            tag: `chat-${partyName}`,
            requireInteraction: false
        });
        
        notification.onclick = function() {
            window.focus();
            notification.close();
        };
        
        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);
    }
    
    // Also show in-app notification
    showNotification(`New message from ${senderName} in ${partyName}`, 'info');
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Initialize notification permission on page load
document.addEventListener('DOMContentLoaded', requestNotificationPermission);

// Update navigation notification badges
function updateNavigationNotificationBadges() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const unreadCount = ChatDB.getUnreadNotificationCount(currentUser.id);
    const badge = document.getElementById('navNotificationBadge');
    
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Update notification badges when page loads
document.addEventListener('DOMContentLoaded', updateNavigationNotificationBadges);

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

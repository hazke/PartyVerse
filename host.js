// Host page JavaScript
let hostedParties = [];

// Load hosted parties from localStorage
function loadHostedParties() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Get all user-created parties from localStorage
    const userParties = JSON.parse(localStorage.getItem('partyverse_user_parties') || '[]');
    
    // Filter to only show parties created by current user (match by host name or user ID)
    hostedParties = userParties.filter(party => {
        // Match by host name or if we stored userId, match by that
        return party.host === currentUser.name || party.hostId === currentUser.id;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!checkAuth()) {
        return;
    }

    // Update user profile
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
    }

    // Load hosted parties from localStorage
    loadHostedParties();

    // Setup event listeners
    setupHostEvents();
    renderHostedParties();
});

// Refresh hosted parties when page becomes visible (user returns to tab)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && checkAuth()) {
        loadHostedParties();
        renderHostedParties();
    }
});

function setupHostEvents() {
    // Party form
    const partyForm = document.getElementById('partyForm');
    if (partyForm) {
        partyForm.addEventListener('submit', createParty);
    }
}

function createParty(event) {
    event.preventDefault();
    
    const currentUser = getCurrentUser();
    const party = {
        id: Date.now(),
        title: document.getElementById('partyTitle').value,
        description: document.getElementById('partyDescription').value,
        date: document.getElementById('partyDate').value,
        time: document.getElementById('partyTime').value,
        location: document.getElementById('partyLocation').value,
        type: document.getElementById('partyType').value,
        price: parseFloat(document.getElementById('partyPrice').value) || 0,
        capacity: parseInt(document.getElementById('partyCapacity').value),
        host: currentUser ? currentUser.name : 'You',
        hostId: currentUser ? currentUser.id : null, // Store user ID for filtering
        attendees: 0
    };

    hostedParties.push(party);
    
    // Save to localStorage so it appears in recommendations and persists
    PartyDB.addParty(party);
    
    document.getElementById('partyForm').reset();
    renderHostedParties();
    
    showNotification('Party created successfully!', 'success');
}

function renderHostedParties() {
    const hostedPartiesList = document.getElementById('hostedPartiesList');
    if (!hostedPartiesList) return;
    
    // Reload from localStorage to ensure we have the latest data
    loadHostedParties();
    
    if (hostedParties.length === 0) {
        hostedPartiesList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <i class="fas fa-calendar-plus" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                <p>No parties created yet.</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Create your first party using the form above!</p>
            </div>
        `;
        // Update unread badges even if no parties
        setTimeout(updateHostUnreadBadges, 100);
        return;
    }
    
    hostedPartiesList.innerHTML = hostedParties.map(party => `
        <div class="party-item">
            <h4>${party.title}</h4>
            <p>${party.description}</p>
            <p><strong>Date:</strong> ${formatDate(party.date)} at ${party.time}</p>
            <p><strong>Location:</strong> ${party.location}</p>
            <p><strong>Attendees:</strong> ${party.attendees}/${party.capacity}</p>
            <div class="party-actions">
                <button class="btn btn-small btn-chat" onclick="openHostPartyChat(${party.id})">
                    <i class="fas fa-comments"></i> Chat
                    <span class="chat-badge" id="hostChatBadge-${party.id}" style="display: none;">0</span>
                </button>
                <button class="btn btn-small btn-danger" onclick="deleteParty(${party.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
    
    // Update unread badges after rendering
    setTimeout(updateHostUnreadBadges, 100);
}

function deleteParty(partyId) {
    if (confirm('Are you sure you want to delete this party?')) {
        hostedParties = hostedParties.filter(p => p.id !== partyId);
        // Also remove from localStorage
        PartyDB.deleteParty(partyId);
        // Reload from localStorage to ensure sync
        loadHostedParties();
        renderHostedParties();
        showNotification('Party deleted successfully!', 'success');
    }
}

// Chat functionality for hosts
function openHostPartyChat(partyId) {
    const party = hostedParties.find(p => p.id === partyId);
    if (!party) return;
    
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Create or get chat for this party
    ChatDB.getOrCreatePartyChat(partyId);
    ChatDB.addParticipantToChat(partyId, currentUser.id);
    
    // Show chat modal
    const chatModal = document.getElementById('chatModal');
    const chatContent = document.getElementById('chatModalContent');
    
    if (chatContent) {
        chatContent.innerHTML = `
            <div class="chat-header">
                <h2>Chat - ${party.title}</h2>
                <span class="close" onclick="closeChat()">&times;</span>
            </div>
            
            <div class="chat-messages" id="chatMessages-${partyId}">
                <!-- Messages will be loaded here -->
            </div>
            
            <div class="chat-input-container">
                <div class="chat-input-wrapper">
                    <input type="text" id="chatInput-${partyId}" placeholder="Type your message..." maxlength="500">
                    <button class="chat-send-btn" onclick="sendChatMessage(${partyId})">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                <div class="chat-info">
                    <small>Chatting as ${currentUser.name} (${currentUser.type})</small>
                </div>
            </div>
        `;
    }
    
    if (chatModal) {
        chatModal.style.display = 'block';
        loadChatMessages(partyId);
        updateHostUnreadBadges();
        
        // Mark messages as read
        ChatDB.markMessagesAsRead(partyId, currentUser.id);
        
        // Focus on input
        setTimeout(() => {
            const input = document.getElementById(`chatInput-${partyId}`);
            if (input) input.focus();
        }, 100);
        
        // Setup enter key listener
        const input = document.getElementById(`chatInput-${partyId}`);
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendChatMessage(partyId);
                }
            });
        }
    }
}

function sendChatMessage(partyId) {
    const input = document.getElementById(`chatInput-${partyId}`);
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Create message object
    const messageObj = {
        id: Date.now(),
        partyId: partyId,
        userId: currentUser.id,
        senderName: currentUser.name,
        text: message,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    // Add message to database
    ChatDB.addMessage(partyId, messageObj);
    
    // Send notifications to other participants
    const party = PartyDB.getPartyById(partyId);
    const chat = ChatDB.getPartyChat(partyId);
    if (party && chat) {
        // Get all users who should receive notifications (participants + hosts/admins)
        const recipients = new Set(chat.participants);
        
        // Add all hosts and admins to recipients (they should always get notifications for their parties)
        testUsers.forEach(user => {
            if ((user.type === 'host' || user.type === 'admin') && user.id !== currentUser.id) {
                recipients.add(user.id);
                // Also add them to chat participants if not already there
                ChatDB.addParticipantToChat(partyId, user.id);
            }
        });
        
        // Send notifications to all recipients
        recipients.forEach(participantId => {
            if (participantId !== currentUser.id) {
                ChatDB.addNotification(participantId, partyId, messageObj);
                showChatNotification(party.name, currentUser.name, message);
            }
        });
    }
    
    // Clear input
    input.value = '';
    
    // Reload messages
    loadChatMessages(partyId);
    
    // Update unread badges
    updateHostUnreadBadges();
    
    // Update navigation notification badges
    updateNavigationNotificationBadges();
    
    // Show notification
    showNotification('Message sent!', 'success');
}

function loadChatMessages(partyId) {
    const messages = ChatDB.getPartyMessages(partyId);
    const messagesContainer = document.getElementById(`chatMessages-${partyId}`);
    
    if (!messagesContainer) return;
    
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

function updateHostUnreadBadges() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    hostedParties.forEach(party => {
        const unreadCount = ChatDB.getUnreadCount(party.id, currentUser.id);
        const badge = document.getElementById(`hostChatBadge-${party.id}`);
        
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badge.style.display = 'inline';
            } else {
                badge.style.display = 'none';
            }
        }
    });
}

// Escape HTML to prevent XSS
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
// Participant page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!checkAuth()) {
        return;
    }

    // Update user profile
    const currentUser = getCurrentUser();
    if (currentUser) {
        const profileImg = document.getElementById('headerProfileImg');
        if (profileImg) {
            profileImg.src = currentUser.profilePicture;
        }

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

    // Setup event listeners
    setupParticipantEvents();
    
    // Render recommendations
    renderRecommendations();
});

function setupParticipantEvents() {
    // Search and filters
    const partySearch = document.getElementById('partySearch');
    if (partySearch) {
        partySearch.addEventListener('input', filterParties);
    }

    document.querySelectorAll('#dateFilter, #typeFilter, #priceFilter').forEach(filter => {
        filter.addEventListener('change', filterParties);
    });

    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            modal.style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

function toggleFilters() {
    const filtersPanel = document.getElementById('filtersPanel');
    if (filtersPanel) {
        filtersPanel.classList.toggle('show');
    }
}

function filterParties() {
    // This would filter parties if we had a party list on this page
    console.log('Filtering parties...');
}

function showPartyDetails(partyId) {
    const party = PartyDB.getPartyById(partyId);
    if (!party) return;

    const modalContent = document.getElementById('partyModalContent');
    if (modalContent) {
        modalContent.innerHTML = `
            <h2>${party.title}</h2>
            <p><strong>Description:</strong> ${party.description}</p>
            <p><strong>Date:</strong> ${formatDate(party.date)}</p>
            <p><strong>Time:</strong> ${party.time}</p>
            <p><strong>Location:</strong> ${party.location}</p>
            <p><strong>Type:</strong> ${party.type.charAt(0).toUpperCase() + party.type.slice(1)}</p>
            <p><strong>Price:</strong> ${party.price === 0 ? 'Free' : '$' + party.price + ' per person'}</p>
            <p><strong>Capacity:</strong> ${party.capacity} people</p>
            <p><strong>Attendees:</strong> ${party.attendees} people</p>
            <p><strong>Host:</strong> ${party.host}</p>
            <div style="margin-top: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="joinParty(${party.id})">
                    <i class="fas fa-plus"></i> Join Party
                </button>
                <button class="btn btn-secondary" onclick="shareParty(${party.id})">
                    <i class="fas fa-share-alt"></i> Share
                </button>
                <button class="btn btn-chat" onclick="openPartyChat(${party.id})">
                    <i class="fas fa-comments"></i> Chat
                    <span class="chat-badge" id="chatBadge-${party.id}" style="display: none;">0</span>
                </button>
            </div>
        `;
    }

    const modal = document.getElementById('partyModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function joinParty(partyId) {
    const party = PartyDB.getPartyById(partyId);
    if (party && party.attendees < party.capacity) {
        party.attendees++;
        showNotification('Successfully joined the party!', 'success');
        document.getElementById('partyModal').style.display = 'none';
    } else if (party && party.attendees >= party.capacity) {
        showNotification('Sorry, this party is full!', 'error');
    }
}

function shareParty(partyId) {
    const party = PartyDB.getPartyById(partyId);
    if (!party) return;
    
    // Create share modal content
    const shareModal = document.getElementById('shareModal');
    const shareContent = document.getElementById('shareModalContent');
    
    if (shareContent) {
        shareContent.innerHTML = `
            <h2>Share "${party.title}"</h2>
            <p>Share this amazing party with your friends!</p>
            
            <div class="share-options">
                <button class="share-btn facebook-btn" onclick="shareToFacebook(${party.id})">
                    <i class="fab fa-facebook-f"></i>
                    Facebook
                </button>
                <button class="share-btn twitter-btn" onclick="shareToTwitter(${party.id})">
                    <i class="fab fa-twitter"></i>
                    Twitter
                </button>
                <button class="share-btn whatsapp-btn" onclick="shareToWhatsApp(${party.id})">
                    <i class="fab fa-whatsapp"></i>
                    WhatsApp
                </button>
                <button class="share-btn email-btn" onclick="shareToEmail(${party.id})">
                    <i class="fas fa-envelope"></i>
                    Email
                </button>
                <button class="share-btn copy-btn" onclick="copyPartyLink(${party.id})">
                    <i class="fas fa-copy"></i>
                    Copy Link
                </button>
            </div>
            
            <div class="share-preview">
                <h4>Preview:</h4>
                <div class="share-preview-content">
                    <strong>${party.title}</strong><br>
                    📅 ${formatDate(party.date)} at ${party.time}<br>
                    📍 ${party.location}<br>
                    💰 ${party.price === 0 ? 'Free' : '$' + party.price + ' per person'}<br>
                    👥 ${party.attendees}/${party.capacity} people<br>
                    <em>${party.description}</em>
                </div>
            </div>
        `;
    }
    
    if (shareModal) {
        shareModal.style.display = 'block';
    }
}

// Social media sharing functions
function shareToFacebook(partyId) {
    const party = PartyDB.getPartyById(partyId);
    if (!party) return;
    
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this amazing party: ${party.title} on ${formatDate(party.date)} at ${party.location}!`);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    showNotification('Opening Facebook to share...', 'info');
}

function shareToTwitter(partyId) {
    const party = PartyDB.getPartyById(partyId);
    if (!party) return;
    
    const text = encodeURIComponent(`Check out this amazing party: ${party.title} on ${formatDate(party.date)} at ${party.location}! Join me at this awesome event! 🎉`);
    const url = encodeURIComponent(window.location.href);
    const hashtags = encodeURIComponent('PartyVerse,Party,Events');
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}`;
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    showNotification('Opening Twitter to share...', 'info');
}

function shareToWhatsApp(partyId) {
    const party = PartyDB.getPartyById(partyId);
    if (!party) return;
    
    const text = encodeURIComponent(`🎉 Check out this amazing party: ${party.title}\n\n📅 ${formatDate(party.date)} at ${party.time}\n📍 ${party.location}\n💰 ${party.price === 0 ? 'Free' : '$' + party.price + ' per person'}\n👥 ${party.attendees}/${party.capacity} people\n\n${party.description}\n\nFind more parties at PartyVerse!`);
    const shareUrl = `https://wa.me/?text=${text}`;
    
    window.open(shareUrl, '_blank');
    showNotification('Opening WhatsApp to share...', 'info');
}

function shareToEmail(partyId) {
    const party = PartyDB.getPartyById(partyId);
    if (!party) return;
    
    const subject = encodeURIComponent(`Amazing Party: ${party.title}`);
    const body = encodeURIComponent(`Hey! I found an amazing party that you might be interested in:

🎉 ${party.title}
📅 ${formatDate(party.date)} at ${party.time}
📍 ${party.location}
💰 ${party.price === 0 ? 'Free' : '$' + party.price + ' per person'}
👥 ${party.attendees}/${party.capacity} people

${party.description}

Check it out and let me know if you want to go together!

Find more parties at PartyVerse.`);
    
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
    showNotification('Opening email client...', 'info');
}

function copyPartyLink(partyId) {
    const party = PartyDB.getPartyById(partyId);
    if (!party) return;
    
    const shareText = `🎉 ${party.title}\n📅 ${formatDate(party.date)} at ${party.time}\n📍 ${party.location}\n💰 ${party.price === 0 ? 'Free' : '$' + party.price + ' per person'}\n👥 ${party.attendees}/${party.capacity} people\n\n${party.description}\n\nFind more parties at PartyVerse!`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('Party details copied to clipboard!', 'success');
        }).catch(() => {
            fallbackCopyTextToClipboard(shareText);
        });
    } else {
        fallbackCopyTextToClipboard(shareText);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Party details copied to clipboard!', 'success');
    } catch (err) {
        showNotification('Unable to copy to clipboard', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Chat functionality
function openPartyChat(partyId) {
    const party = PartyDB.getPartyById(partyId);
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
        
        // Mark messages as read
        ChatDB.markMessagesAsRead(partyId, currentUser.id);
        ChatDB.markAllNotificationsAsRead(currentUser.id, partyId);
        
        // Update badges
        updateUnreadBadges();
        updateBellNotificationBadge();
        
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

function loadChatMessages(partyId) {
    const messages = ChatDB.getPartyMessages(partyId);
    const messagesContainer = document.getElementById(`chatMessages-${partyId}`);
    
    if (!messagesContainer) return;
    
    if (messages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="chat-welcome">
                <i class="fas fa-comments"></i>
                <h4>Start the conversation!</h4>
                <p>Be the first to chat about this party.</p>
            </div>
        `;
        return;
    }
    
    const currentUser = getCurrentUser();
    messagesContainer.innerHTML = messages.map(msg => {
        const isOwnMessage = msg.userId === currentUser.id;
        const messageTime = new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        return `
            <div class="chat-message ${isOwnMessage ? 'own-message' : 'other-message'}">
                <div class="message-content">
                    <div class="message-header">
                        <span class="sender-name">${msg.senderName || msg.userName || 'Unknown'}</span>
                        <span class="message-time">${messageTime}</span>
                    </div>
                    <div class="message-text">${escapeHTML(msg.text || msg.message || '')}</div>
                    <div class="message-meta">
                        <span class="user-type-badge ${msg.userType || 'participant'}">${(msg.userType || 'participant').toUpperCase()}</span>
                        ${!msg.read && !isOwnMessage ? '<span class="unread-indicator">●</span>' : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
    updateUnreadBadges();
    
    // Update navigation notification badges
    updateNavigationNotificationBadges();
    
    // Update bell notification badge
    updateBellNotificationBadge();
    
    // Show notification
    showNotification('Message sent!', 'success');
}

function closeChat() {
    const chatModal = document.getElementById('chatModal');
    if (chatModal) {
        chatModal.style.display = 'none';
    }
}

function updateUnreadBadges() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    PartyDB.getAllParties().forEach(party => {
        const unreadCount = ChatDB.getUnreadCount(party.id, currentUser.id);
        const badge = document.getElementById(`chatBadge-${party.id}`);
        
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badge.style.display = 'inline';
            } else {
                badge.style.display = 'none';
            }
        }
    });
    
    // Also update the bell notification badge
    updateBellNotificationBadge();
}

function updateBellNotificationBadge() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const unreadCount = ChatDB.getUnreadNotificationCount(currentUser.id);
    const badge = document.getElementById('bellNotificationBadge');
    
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Render recommendations section
function renderRecommendations() {
    const recommendationsGrid = document.getElementById('recommendationsGrid');
    if (!recommendationsGrid) return;
    
    // Get all parties (sample + user-created)
    const allParties = PartyDB.getAllParties();
    
    // Sort by date (most recent first) and take first 6
    const sortedParties = allParties
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6);
    
    if (sortedParties.length === 0) {
        recommendationsGrid.innerHTML = '<p style="color: #666; padding: 1rem;">No parties available yet.</p>';
        return;
    }
    
    // Generate gradient colors for party cards
    const gradients = [
        'linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcf7f, #4d9de0)',
        'linear-gradient(45deg, #8b5cf6, #ff6b6b, #ffd93d)',
        'linear-gradient(45deg, #1a1a2e, #8b5cf6, #ff6b6b)',
        'linear-gradient(45deg, #4d9de0, #6bcf7f, #ffd93d)',
        'linear-gradient(45deg, #ff6b6b, #8b5cf6, #4d9de0)',
        'linear-gradient(45deg, #ffd93d, #ff6b6b, #8b5cf6)'
    ];
    
    recommendationsGrid.innerHTML = sortedParties.map((party, index) => {
        const gradient = gradients[index % gradients.length];
        const shortDescription = party.description.length > 30 
            ? party.description.substring(0, 30) + '...' 
            : party.description;
        
        return `
            <div class="recommendation-card" onclick="showPartyDetails(${party.id})">
                <div class="card-image">
                    <div class="party-image" style="background: ${gradient}; background-size: 400% 400%; animation: gradientShift 3s ease infinite;"></div>
                </div>
                <div class="card-content">
                    <h4>${escapeHTML(party.title)}</h4>
                    <p>${escapeHTML(shortDescription)}</p>
                </div>
            </div>
        `;
    }).join('');
}

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize chat badges on page load
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        setTimeout(() => {
            updateUnreadBadges();
            updateBellNotificationBadge();
        }, 500);
    }
});

// Update badge when page becomes visible (user returns to tab)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && checkAuth()) {
        updateBellNotificationBadge();
        updateUnreadBadges();
        renderRecommendations(); // Refresh recommendations in case new parties were created
    }
});

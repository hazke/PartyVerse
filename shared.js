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
        name: "Sarah Owner",
        email: "owner@partyverse.com",
        password: "owner123",
        type: "owner",
        profilePicture: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23ff6b6b'/%3E%3Ccircle cx='50' cy='40' r='20' fill='%23fff'/%3E%3Cpath d='M20 80 Q50 60 80 80' fill='%23fff'/%3E%3C/svg%3E"
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

// Sample venues data
const sampleVenues = [
    {
        id: 1,
        name: "Sunset Beach House",
        description: "Beautiful beachfront property perfect for parties",
        address: "123 Beach Street, Miami",
        capacity: 50,
        pricePerHour: 200,
        amenities: ["parking", "kitchen", "outdoor-space"],
        owner: "Beach Properties LLC"
    },
    {
        id: 2,
        name: "Downtown Event Center",
        description: "Modern event space in the heart of downtown",
        address: "456 Business Blvd, Orlando",
        capacity: 100,
        pricePerHour: 300,
        amenities: ["parking", "kitchen", "sound-system", "dance-floor"],
        owner: "Event Spaces Inc"
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

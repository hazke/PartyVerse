// Host page JavaScript
let hostedParties = [];

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
                owner: 'fas fa-home',
                admin: 'fas fa-crown'
            };
            const labels = {
                participant: 'Participant',
                host: 'Host',
                owner: 'House Owner',
                admin: 'Admin'
            };

            userTypeBtn.innerHTML = `<i class="${icons[currentUser.type]}"></i> ${labels[currentUser.type]}`;
        }
    }

    // Setup event listeners
    setupHostEvents();
    renderHostedParties();
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
        attendees: 0
    };

    hostedParties.push(party);
    
    document.getElementById('partyForm').reset();
    renderHostedParties();
    
    showNotification('Party created successfully!', 'success');
}

function renderHostedParties() {
    const hostedPartiesList = document.getElementById('hostedPartiesList');
    if (!hostedPartiesList) return;
    
    hostedPartiesList.innerHTML = hostedParties.map(party => `
        <div class="party-item">
            <h4>${party.title}</h4>
            <p>${party.description}</p>
            <p><strong>Date:</strong> ${formatDate(party.date)} at ${party.time}</p>
            <p><strong>Location:</strong> ${party.location}</p>
            <p><strong>Attendees:</strong> ${party.attendees}/${party.capacity}</p>
            <div class="party-actions">
                <button class="btn btn-small btn-danger" onclick="deleteParty(${party.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function deleteParty(partyId) {
    if (confirm('Are you sure you want to delete this party?')) {
        hostedParties = hostedParties.filter(p => p.id !== partyId);
        renderHostedParties();
        showNotification('Party deleted successfully!', 'success');
    }
}

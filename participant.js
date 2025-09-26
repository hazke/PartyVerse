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
    setupParticipantEvents();
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
    const party = sampleParties.find(p => p.id === partyId);
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
            <div style="margin-top: 2rem;">
                <button class="btn btn-primary" onclick="joinParty(${party.id})">
                    <i class="fas fa-plus"></i> Join Party
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
    const party = sampleParties.find(p => p.id === partyId);
    if (party && party.attendees < party.capacity) {
        party.attendees++;
        showNotification('Successfully joined the party!', 'success');
        document.getElementById('partyModal').style.display = 'none';
    } else if (party && party.attendees >= party.capacity) {
        showNotification('Sorry, this party is full!', 'error');
    }
}

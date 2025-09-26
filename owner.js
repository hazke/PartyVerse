// Owner page JavaScript
let listedVenues = [];

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
    setupOwnerEvents();
    renderListedVenues();
});

function setupOwnerEvents() {
    // Venue form
    const venueForm = document.getElementById('venueForm');
    if (venueForm) {
        venueForm.addEventListener('submit', createVenue);
    }
}

function createVenue(event) {
    event.preventDefault();
    
    const currentUser = getCurrentUser();
    const amenities = [];
    document.querySelectorAll('.amenities-checkboxes input:checked').forEach(checkbox => {
        amenities.push(checkbox.value);
    });

    const venue = {
        id: Date.now(),
        name: document.getElementById('venueName').value,
        description: document.getElementById('venueDescription').value,
        address: document.getElementById('venueAddress').value,
        capacity: parseInt(document.getElementById('venueCapacity').value),
        pricePerHour: parseFloat(document.getElementById('venuePrice').value),
        amenities: amenities,
        owner: currentUser ? currentUser.name : 'You'
    };

    listedVenues.push(venue);
    
    document.getElementById('venueForm').reset();
    renderListedVenues();
    
    showNotification('Venue listed successfully!', 'success');
}

function renderListedVenues() {
    const listedVenuesList = document.getElementById('listedVenuesList');
    if (!listedVenuesList) return;
    
    listedVenuesList.innerHTML = listedVenues.map(venue => `
        <div class="venue-item">
            <h4>${venue.name}</h4>
            <p>${venue.description}</p>
            <p><strong>Address:</strong> ${venue.address}</p>
            <p><strong>Capacity:</strong> ${venue.capacity} people</p>
            <p><strong>Price:</strong> $${venue.pricePerHour}/hour</p>
            <p><strong>Amenities:</strong> ${venue.amenities.join(', ')}</p>
            <div class="venue-actions">
                <button class="btn btn-small btn-danger" onclick="deleteVenue(${venue.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function deleteVenue(venueId) {
    if (confirm('Are you sure you want to delete this venue?')) {
        listedVenues = listedVenues.filter(v => v.id !== venueId);
        renderListedVenues();
        showNotification('Venue deleted successfully!', 'success');
    }
}

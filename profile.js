// Profile page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!checkAuth()) {
        return;
    }

    // Update user profile
    updateProfileInfo();
    setupProfileEvents();
});

function updateProfileInfo() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        const profileImage = document.getElementById('profileImage');
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const userType = document.getElementById('userType');
        const userTypeBtn = document.getElementById('userTypeBtn');
        
        if (profileImage) profileImage.src = currentUser.profilePicture;
        if (userName) userName.textContent = currentUser.name;
        if (userEmail) userEmail.textContent = currentUser.email;
        
        const typeLabels = {
            participant: 'Participant',
            host: 'Host',
            owner: 'House Owner',
            admin: 'Admin'
        };
        if (userType) userType.textContent = typeLabels[currentUser.type] || 'User';
        
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
}

function setupProfileEvents() {
    // User type selection
    document.querySelectorAll('.user-type-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const type = e.currentTarget.getAttribute('data-type');
            setUserType(type);
            hideModal('userTypeModal');
        });
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

function showUserTypeModal() {
    const modal = document.getElementById('userTypeModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function setUserType(type) {
    const currentUser = getCurrentUser();
    if (currentUser) {
        currentUser.type = type;
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateProfileInfo();
        showNotification('User type updated successfully!', 'success');
    }
}

function showEditProfile() {
    showNotification('Edit profile feature coming soon!', 'info');
}

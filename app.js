// ===========================
// MAIN APP CONTROLLER
// ===========================

let currentPage = 'dashboard';

/**
 * Initialize the application
 */
function initApp() {
    // Initialize sample data if needed
    initializeSampleData();

    // Setup navigation
    setupNavigation();

    // Initialize current page
    initDashboard();

    // Initialize icons
    lucide.createIcons();

    console.log('🐾 Pet Store Management App initialized!');
}

/**
 * Setup navigation event listeners
 */
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            switchPage(page);
        });
    });
}

/**
 * Switch between pages
 * @param {string} pageName - Name of the page to switch to
 */
function switchPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show selected page
    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === pageName) {
            item.classList.add('active');
        }
    });

    // Update current page
    currentPage = pageName;

    // Initialize page-specific functionality
    switch (pageName) {
        case 'dashboard':
            initDashboard();
            break;
        case 'products':
            initProducts();
            break;
        case 'reports':
            initReports();
            break;
        case 'orders':
            initOrders();
            break;
        case 'settings':
            initSettings();
            break;
    }

    // Reinitialize icons
    lucide.createIcons();
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// ===========================
// SETTINGS PAGE
// ===========================

/**
 * Initialize settings page
 */
function initSettings() {
    renderSettingsPage();
    setupSettingsEventListeners();
}

/**
 * Render settings page
 */
function renderSettingsPage() {
    // Update statistics
    document.getElementById('totalProductsCount').textContent = getProducts().length;
    document.getElementById('totalOrdersCount').textContent = getOrders().length;

    // Reinitialize icons
    lucide.createIcons();
}

/**
 * Export all data
 */
function exportAllData() {
    const data = {
        products: getProducts(),
        orders: getOrders(),
        transactions: getTransactions(),
        exportDate: new Date().toISOString(),
        version: '1.0.0'
    };

    const filename = `pet-store-backup-${new Date().getTime()}.json`;
    exportAsJSON(data, filename);
    showToast('Dữ liệu đã được xuất thành công', 'success');
}

/**
 * Import data from file
 */
function importData() {
    const fileInput = document.getElementById('importFileInput');
    fileInput.click();
}

/**
 * Handle file import
 */
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    importFromJSON(file)
        .then(data => {
            // Validate data structure
            if (!data.products || !data.orders || !data.transactions) {
                throw new Error('File không đúng định dạng');
            }

            // Confirm import
            if (confirm(`Bạn có chắc muốn khôi phục dữ liệu?\n\nDữ liệu hiện tại sẽ bị ghi đè:\n- ${data.products.length} sản phẩm\n- ${data.orders.length} đơn hàng\n\nThao tác này không thể hoàn tác!`)) {
                // Import data
                saveProducts(data.products);
                saveOrders(data.orders);
                saveTransactions(data.transactions);

                showToast('Dữ liệu đã được khôi phục thành công', 'success');

                // Refresh page
                setTimeout(() => {
                    location.reload();
                }, 1500);
            }
        })
        .catch(error => {
            showToast('Lỗi khi nhập dữ liệu: ' + error.message, 'error');
        });

    // Reset file input
    event.target.value = '';
}

/**
 * Clear all data
 */
function clearAllData() {
    const productsCount = getProducts().length;
    const ordersCount = getOrders().length;

    if (productsCount === 0 && ordersCount === 0) {
        showToast('Không có dữ liệu để xóa', 'info');
        return;
    }

    const confirmation = prompt(
        `⚠️ CẢNH BÁO: Bạn sắp xóa toàn bộ dữ liệu!\n\n` +
        `- ${productsCount} sản phẩm\n` +
        `- ${ordersCount} đơn hàng\n\n` +
        `Thao tác này KHÔNG THỂ HOÀN TÁC!\n\n` +
        `Nhập "XOA TAT CA" để xác nhận:`
    );

    if (confirmation === 'XOA TAT CA') {
        // Clear all data
        localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
        localStorage.removeItem(STORAGE_KEYS.ORDERS);
        localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);

        showToast('Đã xóa toàn bộ dữ liệu', 'success');

        // Reload page
        setTimeout(() => {
            location.reload();
        }, 1500);
    } else if (confirmation !== null) {
        showToast('Văn bản xác nhận không đúng', 'error');
    }
}

/**
 * Setup settings event listeners
 */
function setupSettingsEventListeners() {
    // Export data
    document.getElementById('exportDataBtn').addEventListener('click', exportAllData);

    // Import data
    document.getElementById('importDataBtn').addEventListener('click', importData);

    // File input change
    document.getElementById('importFileInput').addEventListener('change', handleFileImport);

    // Clear data
    document.getElementById('clearDataBtn').addEventListener('click', clearAllData);
}

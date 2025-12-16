// ===========================
// UTILITY FUNCTIONS
// ===========================

/**
 * Format number as Vietnamese currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1).replace('.0', '') + ' tr';
    } else if (amount >= 1000) {
        const formatted = amount.toLocaleString('vi-VN');
        return formatted + ' đ';
    }
    return amount.toLocaleString('vi-VN') + ' đ';
}

/**
 * Format currency for revenue display (short form)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatRevenue(amount) {
    if (amount >= 1000000) {
        const millions = (amount / 1000000).toFixed(3);
        return millions.replace(/\.?0+$/, '') + ' tr';
    }
    return formatCurrency(amount);
}

/**
 * Format date and time in Vietnamese
 * @param {Date} date - Date to format
 * @param {boolean} includeTime - Include time in the output
 * @returns {string} Formatted date string
 */
function formatDate(date, includeTime = false) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    if (includeTime) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
    
    return `${day}/${month}/${year}`;
}

/**
 * Format relative time (e.g., "2 giờ trước", "5 phút trước")
 * @param {Date} date - Date to format
 * @returns {string} Relative time string
 */
function formatRelativeTime(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return formatDate(date);
}

/**
 * Calculate percentage change between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {object} Object with percentage and isPositive flag
 */
function calculatePercentageChange(current, previous) {
    if (previous === 0) {
        return { percentage: current > 0 ? 100 : 0, isPositive: current > 0 };
    }
    
    const change = ((current - previous) / previous) * 100;
    return {
        percentage: Math.abs(change).toFixed(1),
        isPositive: change >= 0
    };
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast ('success', 'error', 'info')
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    
    // Trigger reflow to restart animation
    void toast.offsetWidth;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Get date range for a period
 * @param {string} period - Period type ('today', 'week', 'month')
 * @returns {object} Object with start and end dates
 */
function getDateRange(period) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
        case 'today':
            return {
                start: today,
                end: new Date(today.getTime() + 86400000 - 1)
            };
        
        case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);
            return { start: weekStart, end: weekEnd };
        
        case 'month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            return { start: monthStart, end: monthEnd };
        
        default:
            return { start: today, end: today };
    }
}

/**
 * Filter data by date range
 * @param {Array} data - Data array to filter
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @param {string} dateField - Name of the date field
 * @returns {Array} Filtered data
 */
function filterByDateRange(data, start, end, dateField = 'createdAt') {
    return data.filter(item => {
        const itemDate = new Date(item[dateField]);
        return itemDate >= start && itemDate <= end;
    });
}

/**
 * Get stock status for a product
 * @param {number} stock - Stock quantity
 * @returns {object} Stock status with label and type
 */
function getStockStatus(stock) {
    if (stock === 0) {
        return { label: 'Hết hàng', type: 'out-of-stock', icon: 'x-circle' };
    } else if (stock <= 5) {
        return { label: `Tồn kho: ${stock} (Sắp hết)`, type: 'low-stock', icon: 'alert-triangle' };
    } else {
        return { label: `Tồn kho: ${stock}`, type: 'in-stock', icon: 'check-circle' };
    }
}

/**
 * Sort array by field
 * @param {Array} array - Array to sort
 * @param {string} field - Field to sort by
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
function sortBy(array, field, order = 'asc') {
    return [...array].sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        
        if (order === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
}

/**
 * Export data as JSON file
 * @param {object} data - Data to export
 * @param {string} filename - Filename for the export
 */
function exportAsJSON(data, filename = 'export.json') {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Import data from JSON file
 * @param {File} file - File to import
 * @returns {Promise} Promise resolving to parsed data
 */
function importFromJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                resolve(data);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

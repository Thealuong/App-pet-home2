// ===========================
// DASHBOARD PAGE
// ===========================

let currentPeriod = 'today';

/**
 * Initialize dashboard
 */
function initDashboard() {
    renderDashboard();
    setupDashboardEventListeners();
}

/**
 * Render dashboard content
 */
function renderDashboard() {
    const range = getDateRange(currentPeriod);

    // Calculate statistics
    const revenue = calculateRevenue(range.start, range.end);
    const orders = countOrders(range.start, range.end);
    const profit = calculateProfit(range.start, range.end);

    // Get previous period for comparison
    const prevRange = getPreviousPeriodRange(currentPeriod);
    const prevRevenue = calculateRevenue(prevRange.start, prevRange.end);
    const prevOrders = countOrders(prevRange.start, prevRange.end);
    const prevProfit = calculateProfit(prevRange.start, prevRange.end);

    // Calculate changes
    const revenueChange = calculatePercentageChange(revenue, prevRevenue);
    const ordersChange = calculatePercentageChange(orders, prevOrders);
    const profitChange = calculatePercentageChange(profit, prevProfit);

    // Update revenue card
    document.getElementById('revenueAmount').textContent = formatRevenue(revenue);

    const revenueChangeEl = document.getElementById('revenueChange');
    revenueChangeEl.innerHTML = `
        <span class="change-icon">${revenueChange.isPositive ? '↗' : '↘'}</span>
        <span class="change-text">${revenueChange.isPositive ? '+' : '-'}${revenueChange.percentage}%</span>
        <span class="change-label">so với ${getPeriodLabel(currentPeriod)}</span>
    `;

    // Update orders card
    document.getElementById('ordersCount').textContent = orders;
    const ordersStatChange = document.querySelector('#ordersCount').parentElement.querySelector('.stat-change');
    ordersStatChange.innerHTML = `<span>${ordersChange.isPositive ? '↑' : '↓'} ${ordersChange.percentage}%</span>`;
    ordersStatChange.className = `stat-change ${ordersChange.isPositive ? 'positive' : 'negative'}`;

    // Update profit card
    document.getElementById('profitAmount').textContent = formatRevenue(profit);
    const profitStatChange = document.querySelector('#profitAmount').parentElement.querySelector('.stat-change');
    profitStatChange.innerHTML = `<span>${profitChange.isPositive ? '↑' : '↓'} ${profitChange.percentage}%</span>`;
    profitStatChange.className = `stat-change ${profitChange.isPositive ? 'positive' : 'negative'}`;

    // Render stock alerts
    renderStockAlerts();

    // Render recent activities
    renderRecentActivities();

    // Initialize chart
    initTrendChart();
}

/**
 * Get previous period range for comparison
 */
function getPreviousPeriodRange(period) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (period) {
        case 'today':
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return {
                start: yesterday,
                end: new Date(yesterday.getTime() + 86400000 - 1)
            };

        case 'week':
            const lastWeekStart = new Date(today);
            lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
            const lastWeekEnd = new Date(lastWeekStart);
            lastWeekEnd.setDate(lastWeekStart.getDate() + 7);
            return { start: lastWeekStart, end: lastWeekEnd };

        case 'month':
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
            return { start: lastMonthStart, end: lastMonthEnd };

        default:
            return { start: today, end: today };
    }
}

/**
 * Get period label for display
 */
function getPeriodLabel(period) {
    switch (period) {
        case 'today': return 'hôm qua';
        case 'week': return 'tuần trước';
        case 'month': return 'tháng trước';
        default: return 'trước';
    }
}

/**
 * Render stock alerts
 */
function renderStockAlerts() {
    const lowStockProducts = getLowStockProducts(5);
    const alertsContainer = document.getElementById('stockAlerts');

    if (lowStockProducts.length === 0) {
        alertsContainer.innerHTML = `
            <div class="alert-item info">
                <div class="alert-icon">
                    <i data-lucide="check-circle"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">Tất cả sản phẩm đều có đủ hàng</div>
                    <div class="alert-subtitle">Không có cảnh báo kho</div>
                </div>
            </div>
        `;
    } else {
        alertsContainer.innerHTML = lowStockProducts.slice(0, 3).map(product => {
            const isOutOfStock = product.stock === 0;
            return `
                <div class="alert-item ${isOutOfStock ? '' : 'warning'}">
                    <div class="alert-icon ${isOutOfStock ? 'danger' : 'warning'}">
                        <i data-lucide="${isOutOfStock ? 'alert-circle' : 'alert-triangle'}"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-title">${product.name}</div>
                        <div class="alert-subtitle">Mã: ${product.sku} | Size: ${product.size || 'N/A'}</div>
                    </div>
                    <div class="alert-badge ${isOutOfStock ? 'danger' : 'warning'}">
                        ${isOutOfStock ? 'Hết hàng' : `Còn ${product.stock}`}
                    </div>
                </div>
            `;
        }).join('');
    }

    lucide.createIcons();
}

/**
 * Render recent activities
 */
function renderRecentActivities() {
    const transactions = getTransactions().slice(-5).reverse();
    const activitiesContainer = document.getElementById('recentActivities');

    if (transactions.length === 0) {
        activitiesContainer.innerHTML = `
            <div class="activity-item">
                <div class="activity-content">
                    <div class="activity-subtitle">Chưa có hoạt động nào</div>
                </div>
            </div>
        `;
    } else {
        activitiesContainer.innerHTML = transactions.map(transaction => {
            const isPositive = transaction.type === 'sale';
            return `
                <div class="activity-item">
                    <div class="activity-icon ${isPositive ? 'orders' : 'stock'}">
                        <i data-lucide="${isPositive ? 'shopping-bag' : 'package'}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">${transaction.description}</div>
                        <div class="activity-subtitle">${transaction.type === 'sale' ? 'Bán hàng' : 'Nhập hàng'}</div>
                        <div class="activity-time">${formatRelativeTime(transaction.createdAt)}</div>
                    </div>
                    <div class="activity-amount ${isPositive ? 'positive' : 'negative'}">
                        ${isPositive ? '+' : ''}${formatCurrency(transaction.amount)}
                    </div>
                </div>
            `;
        }).join('');
    }

    lucide.createIcons();
}

/**
 * Setup dashboard event listeners
 */
function setupDashboardEventListeners() {
    // Time filter tabs
    document.querySelectorAll('#page-dashboard .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('#page-dashboard .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update period
            currentPeriod = btn.dataset.period;

            // Re-render dashboard
            renderDashboard();
        });
    });

    // View all alerts
    document.getElementById('viewAllAlerts')?.addEventListener('click', (e) => {
        e.preventDefault();
        // Switch to products page with low stock filter
        switchPage('products');
        // TODO: Set filter to low stock
    });
}

// ===========================
// REPORTS PAGE
// ===========================

let reportPeriod = 'today';
let reportChartType = 'revenue';

/**
 * Initialize reports page
 */
function initReports() {
    renderReports();
    setupReportsEventListeners();
}

/**
 * Render reports page
 */
function renderReports() {
    const range = getDateRange(reportPeriod);

    // Calculate statistics
    const revenue = calculateRevenue(range.start, range.end);
    const orders = countOrders(range.start, range.end);
    const profit = calculateProfit(range.start, range.end);

    // Get previous period for comparison
    const prevRange = getPreviousPeriodRange(reportPeriod);
    const prevRevenue = calculateRevenue(prevRange.start, prevRange.end);
    const prevOrders = countOrders(prevRange.start, prevRange.end);
    const prevProfit = calculateProfit(prevRange.start, prevRange.end);

    // Calculate changes
    const revenueChange = calculatePercentageChange(revenue, prevRevenue);
    const ordersChange = calculatePercentageChange(orders, prevOrders);
    const profitChange = calculatePercentageChange(profit, prevProfit);

    // Update revenue summary
    document.getElementById('reportRevenueAmount').textContent = formatRevenue(revenue);
    document.getElementById('reportRevenueComparison').textContent = formatRevenue(prevRevenue);

    // Update stats cards
    document.getElementById('reportOrdersCount').textContent = orders;
    document.getElementById('reportOrdersChange').textContent = ordersChange.percentage + '%';

    document.getElementById('reportProfitAmount').textContent = formatRevenue(profit);
    const profitChangeEl = document.getElementById('reportProfitChange');
    profitChangeEl.textContent = (profitChange.isPositive ? '↑ ' : '↓ ') + profitChange.percentage + '%';
    profitChangeEl.parentElement.className = `report-stat-change ${profitChange.isPositive ? 'positive' : 'negative'}`;

    // Render top products
    renderTopProducts();

    // Render stock alerts
    renderReportStockAlerts();

    // Initialize chart
    initReportChart(reportChartType);
}

/**
 * Render top selling products
 */
function renderTopProducts() {
    const topProducts = getTopSellingProducts(3);
    const container = document.getElementById('topProductsList');

    if (topProducts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Chưa có dữ liệu bán hàng</p>
            </div>
        `;
    } else {
        container.innerHTML = topProducts.map((product, index) => `
            <div class="top-product-item">
                <div class="top-product-image placeholder">
                    <i data-lucide="package"></i>
                </div>
                <div class="top-product-info">
                    <div class="top-product-name">${product.name}</div>
                    <div class="top-product-sold">Đã bán: ${product.soldQuantity}</div>
                </div>
                <div class="top-product-price">
                    <div class="top-product-amount">${formatCurrency(product.revenue)}</div>
                    <div class="top-product-badge ${index === 0 ? '' : 'rank-' + (index + 1)}">
                        Top ${index + 1}
                    </div>
                </div>
            </div>
        `).join('');
    }

    lucide.createIcons();
}

/**
 * Render stock alerts for reports
 */
function renderReportStockAlerts() {
    const lowStockProducts = getLowStockProducts(5);
    const container = document.getElementById('reportStockAlerts');

    if (lowStockProducts.length === 0) {
        container.innerHTML = `
            <div class="alert-item info">
                <div class="alert-icon">
                    <i data-lucide="check-circle"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">Tất cả sản phẩm đều có đủ hàng</div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = lowStockProducts.slice(0, 2).map(product => {
            const isOutOfStock = product.stock === 0;
            return `
                <div class="alert-item ${isOutOfStock ? '' : 'warning'}">
                    <div class="alert-icon ${isOutOfStock ? 'danger' : 'warning'}">
                        <i data-lucide="${isOutOfStock ? 'alert-circle' : 'alert-triangle'}"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-title">${product.name}</div>
                        <div class="alert-subtitle">${isOutOfStock ? 'Hết hàng' : `Còn ${product.stock} sản phẩm`}</div>
                    </div>
                    <div class="alert-badge ${isOutOfStock ? 'danger' : 'warning'}">
                        ${isOutOfStock ? 'Nhập hàng' : 'Sắp hết'}
                    </div>
                </div>
            `;
        }).join('');
    }

    lucide.createIcons();
}

/**
 * Setup reports event listeners
 */
function setupReportsEventListeners() {
    // Time period tabs
    document.querySelectorAll('#page-reports .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('#page-reports .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update period
            reportPeriod = btn.dataset.period;

            // Re-render reports
            renderReports();
        });
    });

    // Chart type tabs
    document.querySelectorAll('.chart-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.chart-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update chart type
            reportChartType = btn.dataset.chart;

            // Re-render chart
            initReportChart(reportChartType);
        });
    });

    // Export button
    document.querySelector('.export-btn')?.addEventListener('click', () => {
        const range = getDateRange(reportPeriod);
        const data = {
            period: reportPeriod,
            dateRange: {
                start: range.start.toISOString(),
                end: range.end.toISOString()
            },
            revenue: calculateRevenue(range.start, range.end),
            orders: countOrders(range.start, range.end),
            profit: calculateProfit(range.start, range.end),
            topProducts: getTopSellingProducts(10),
            lowStockProducts: getLowStockProducts(5),
            exportDate: new Date().toISOString()
        };

        const filename = `bao-cao-${reportPeriod}-${new Date().getTime()}.json`;
        exportAsJSON(data, filename);
        showToast('Báo cáo đã được xuất', 'success');
    });

    // Back button
    document.getElementById('backBtn')?.addEventListener('click', () => {
        switchPage('dashboard');
    });
}

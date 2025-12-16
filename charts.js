// ===========================
// CHART CONFIGURATIONS
// ===========================

let trendChartInstance = null;
let reportChartInstance = null;

/**
 * Initialize trend chart on dashboard
 */
function initTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (trendChartInstance) {
        trendChartInstance.destroy();
    }

    // Get real hourly data from today's transactions
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 86400000 - 1);

    const transactions = getTransactions().filter(t => {
        const tDate = new Date(t.createdAt);
        return t.type === 'sale' && tDate >= startOfDay && tDate <= endOfDay;
    });

    // Group by hour (6h intervals)
    const hourlyData = {};
    const hours = ['6h', '9h', '12h', '15h', '18h', '21h'];
    hours.forEach(h => hourlyData[h] = 0);

    transactions.forEach(t => {
        const hour = new Date(t.createdAt).getHours();
        if (hour >= 6 && hour < 9) hourlyData['6h'] += t.amount;
        else if (hour >= 9 && hour < 12) hourlyData['9h'] += t.amount;
        else if (hour >= 12 && hour < 15) hourlyData['12h'] += t.amount;
        else if (hour >= 15 && hour < 18) hourlyData['15h'] += t.amount;
        else if (hour >= 18 && hour < 21) hourlyData['18h'] += t.amount;
        else if (hour >= 21 || hour < 6) hourlyData['21h'] += t.amount;
    });

    const data = hours.map(h => hourlyData[h]);

    trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Doanh thu',
                data: data,
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#2196F3',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1A1A1A',
                    padding: 12,
                    borderRadius: 8,
                    titleFont: {
                        size: 13
                    },
                    bodyFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    callbacks: {
                        label: function (context) {
                            return formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        color: '#9E9E9E'
                    }
                },
                y: {
                    display: false,
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

/**
 * Initialize report chart
 * @param {string} type - Chart type ('revenue' or 'inventory')
 */
function initReportChart(type = 'revenue') {
    const ctx = document.getElementById('reportChart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (reportChartInstance) {
        reportChartInstance.destroy();
    }

    if (type === 'revenue') {
        // Revenue chart - real hourly data
        const range = getDateRange('today'); // Use current period from dashboard
        const transactions = getTransactions().filter(t => {
            const tDate = new Date(t.createdAt);
            return t.type === 'sale' && tDate >= range.start && tDate <= range.end;
        });

        // Group by 4-hour intervals
        const hourlyData = { '08:00': 0, '12:00': 0, '16:00': 0, '20:00': 0 };
        const hours = ['08:00', '12:00', '16:00', '20:00'];

        transactions.forEach(t => {
            const hour = new Date(t.createdAt).getHours();
            if (hour >= 8 && hour < 12) hourlyData['08:00'] += t.amount;
            else if (hour >= 12 && hour < 16) hourlyData['12:00'] += t.amount;
            else if (hour >= 16 && hour < 20) hourlyData['16:00'] += t.amount;
            else hourlyData['20:00'] += t.amount;
        });

        const data = hours.map(h => hourlyData[h]);

        reportChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hours,
                datasets: [{
                    label: 'Doanh thu',
                    data: data,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointBackgroundColor: '#2196F3',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1A1A1A',
                        padding: 12,
                        borderRadius: 8,
                        titleFont: {
                            size: 13
                        },
                        bodyFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        callbacks: {
                            label: function (context) {
                                return formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            },
                            color: '#9E9E9E'
                        }
                    },
                    y: {
                        display: false
                    }
                }
            }
        });
    } else {
        // Inventory chart - real category stock levels
        const products = getProducts();
        const categoryMap = {
            'food': 'Đồ ăn',
            'accessories': 'Phụ kiện',
            'toys': 'Đồ chơi',
            'clothes': 'Quần áo'
        };

        const categoryData = {
            'Đồ ăn': 0,
            'Phụ kiện': 0,
            'Đồ chơi': 0,
            'Quần áo': 0
        };

        products.forEach(p => {
            const catName = categoryMap[p.category];
            if (catName) {
                categoryData[catName] += p.stock;
            }
        });

        const categories = Object.keys(categoryData);
        const data = Object.values(categoryData);

        reportChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    label: 'Số lượng sản phẩm',
                    data: data,
                    backgroundColor: [
                        'rgba(33, 150, 243, 0.8)',
                        'rgba(76, 175, 80, 0.8)',
                        'rgba(255, 152, 0, 0.8)',
                        'rgba(156, 39, 176, 0.8)'
                    ],
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1A1A1A',
                        padding: 12,
                        borderRadius: 8
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            },
                            color: '#9E9E9E'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#F0F0F0',
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            },
                            color: '#9E9E9E'
                        }
                    }
                }
            }
        });
    }
}

/**
 * Update chart data based on actual data
 * @param {string} period - Time period ('today', 'week', 'month')
 */
function updateChartData(period) {
    // This function would fetch real data and update the chart
    // For now, it reinitializes with sample data
    initTrendChart();
}

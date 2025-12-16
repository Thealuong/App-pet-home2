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

    // Generate sample hourly data for today
    const hours = ['6h', '9h', '12h', '15h', '18h', '21h'];
    const data = [800000, 1500000, 2200000, 1800000, 2800000, 3200000];

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
        // Revenue chart - hourly data
        const hours = ['08:00', '12:00', '16:00', '20:00'];
        const data = [2500000, 5800000, 8200000, 12500000];

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
        // Inventory chart - category stock levels
        const categories = ['Đồ ăn', 'Phụ kiện', 'Đồ chơi', 'Quần áo'];
        const data = [45, 32, 18, 25];

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

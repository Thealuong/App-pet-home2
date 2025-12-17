// ===========================
// DATA MODELS & LOCALSTORAGE
// ===========================

// Storage keys
const STORAGE_KEYS = {
    PRODUCTS: 'petshop_products',
    ORDERS: 'petshop_orders',
    TRANSACTIONS: 'petshop_transactions',
    SETTINGS: 'petshop_settings'
};

// ===========================
// PRODUCT MANAGEMENT
// ===========================

/**
 * Get all products from localStorage
 * @returns {Array} Array of products
 */
function getProducts() {
    const products = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return products ? JSON.parse(products) : [];
}

/**
 * Save products to localStorage
 * @param {Array} products - Products array
 */
function saveProducts(products) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

/**
 * Add a new product
 * @param {object} product - Product data
 * @returns {object} Created product
 */
function addProduct(product) {
    const products = getProducts();
    const newProduct = {
        id: generateId(),
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: parseFloat(product.price),
        cost: parseFloat(product.cost) || 0,
        stock: parseInt(product.stock),
        size: product.size || '',
        image: product.image || '',
        barcode: product.barcode || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    products.push(newProduct);
    saveProducts(products);
    return newProduct;
}

/**
 * Update a product
 * @param {string} id - Product ID
 * @param {object} updates - Updates to apply
 * @returns {object} Updated product
 */
function updateProduct(id, updates) {
    const products = getProducts();
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
        throw new Error('Product not found');
    }

    products[index] = {
        ...products[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    saveProducts(products);
    return products[index];
}

/**
 * Delete a product
 * @param {string} id - Product ID
 */
function deleteProduct(id) {
    const products = getProducts();
    const filtered = products.filter(p => p.id !== id);
    saveProducts(filtered);
}

/**
 * Get product by ID
 * @param {string} id - Product ID
 * @returns {object} Product
 */
function getProductById(id) {
    const products = getProducts();
    return products.find(p => p.id === id);
}

/**
 * Search products
 * @param {string} query - Search query
 * @returns {Array} Matching products
 */
function searchProducts(query) {
    const products = getProducts();
    const lowerQuery = query.toLowerCase();

    return products.filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.sku.toLowerCase().includes(lowerQuery) ||
        (p.barcode && p.barcode.toLowerCase().includes(lowerQuery))
    );
}

/**
 * Get product by barcode
 * @param {string} barcode - Barcode string
 * @returns {object|null} Product or null
 */
function getProductByBarcode(barcode) {
    const products = getProducts();
    return products.find(p => p.barcode && p.barcode === barcode) || null;
}

/**
 * Filter products by category
 * @param {string} category - Category
 * @returns {Array} Filtered products
 */
function filterProductsByCategory(category) {
    const products = getProducts();

    if (category === 'all') {
        return products;
    } else if (category === 'out-of-stock') {
        return products.filter(p => p.stock === 0);
    } else if (category === 'low-stock') {
        return products.filter(p => p.stock > 0 && p.stock <= 5);
    } else {
        return products.filter(p => p.category === category);
    }
}

// ===========================
// ORDER MANAGEMENT
// ===========================

/**
 * Get all orders from localStorage
 * @returns {Array} Array of orders
 */
function getOrders() {
    const orders = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return orders ? JSON.parse(orders) : [];
}

/**
 * Save orders to localStorage
 * @param {Array} orders - Orders array
 */
function saveOrders(orders) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

/**
 * Create a new order
 * @param {object} order - Order data
 * @returns {object} Created order
 */
function createOrder(order) {
    const orders = getOrders();
    const newOrder = {
        id: generateId(),
        items: order.items,
        total: order.total,
        paymentMethod: order.paymentMethod,
        status: 'completed',
        createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
    saveOrders(orders);

    // Update product stock
    order.items.forEach(item => {
        const product = getProductById(item.productId);
        if (product) {
            updateProduct(product.id, {
                stock: product.stock - item.quantity
            });
        }
    });

    // Create transaction
    createTransaction({
        type: 'sale',
        amount: order.total,
        description: `Đơn hàng #${newOrder.id.substr(0, 6)}`,
        orderId: newOrder.id
    });

    return newOrder;
}

// ===========================
// TRANSACTION MANAGEMENT
// ===========================

/**
 * Get all transactions from localStorage
 * @returns {Array} Array of transactions
 */
function getTransactions() {
    const transactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return transactions ? JSON.parse(transactions) : [];
}

/**
 * Save transactions to localStorage
 * @param {Array} transactions - Transactions array
 */
function saveTransactions(transactions) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

/**
 * Create a new transaction
 * @param {object} transaction - Transaction data
 * @returns {object} Created transaction
 */
function createTransaction(transaction) {
    const transactions = getTransactions();
    const newTransaction = {
        id: generateId(),
        type: transaction.type, // 'sale', 'purchase', 'refund'
        amount: transaction.amount,
        description: transaction.description,
        orderId: transaction.orderId || null,
        createdAt: new Date().toISOString()
    };

    transactions.push(newTransaction);
    saveTransactions(transactions);
    return newTransaction;
}

// ===========================
// STATISTICS
// ===========================

/**
 * Calculate revenue for a period
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {number} Total revenue
 */
function calculateRevenue(start, end) {
    const transactions = getTransactions();
    const filtered = filterByDateRange(transactions, start, end, 'createdAt');

    return filtered
        .filter(t => t.type === 'sale')
        .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate profit for a period
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {number} Total profit
 */
function calculateProfit(start, end) {
    const orders = getOrders();
    const filtered = filterByDateRange(orders, start, end, 'createdAt');

    return filtered.reduce((sum, order) => {
        const orderProfit = order.items.reduce((itemSum, item) => {
            const product = getProductById(item.productId);
            if (product) {
                const profit = (item.price - product.cost) * item.quantity;
                return itemSum + profit;
            }
            return itemSum;
        }, 0);
        return sum + orderProfit;
    }, 0);
}

/**
 * Count orders for a period
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {number} Order count
 */
function countOrders(start, end) {
    const orders = getOrders();
    const filtered = filterByDateRange(orders, start, end, 'createdAt');
    return filtered.length;
}

/**
 * Get top selling products
 * @param {number} limit - Number of products to return
 * @returns {Array} Top products with sales data
 */
function getTopSellingProducts(limit = 5) {
    const orders = getOrders();
    const productSales = {};

    orders.forEach(order => {
        order.items.forEach(item => {
            if (!productSales[item.productId]) {
                productSales[item.productId] = {
                    productId: item.productId,
                    quantity: 0,
                    revenue: 0
                };
            }
            productSales[item.productId].quantity += item.quantity;
            productSales[item.productId].revenue += item.price * item.quantity;
        });
    });

    const sortedProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, limit);

    return sortedProducts.map(sale => {
        const product = getProductById(sale.productId);
        return {
            ...product,
            soldQuantity: sale.quantity,
            revenue: sale.revenue
        };
    }).filter(p => p.id); // Filter out products that no longer exist
}

/**
 * Get low stock products
 * @param {number} threshold - Stock threshold
 * @returns {Array} Low stock products
 */
function getLowStockProducts(threshold = 5) {
    const products = getProducts();
    return products.filter(p => p.stock <= threshold);
}

// ===========================
// SAMPLE DATA GENERATION
// ===========================

/**
 * Initialize app with sample data
 */
function initializeSampleData() {
    // Disabled: Start with empty database
    return;

    // Check if data already exists
    if (getProducts().length > 0) {
        return;
    }

    // Sample products with barcodes (EAN-13 format)
    const sampleProducts = [
        {
            name: 'Áo Thun Nam Basic',
            sku: 'AT-001',
            category: 'clothes',
            price: 150000,
            cost: 80000,
            stock: 24,
            size: 'L',
            image: '',
            barcode: '8934567890123'
        },
        {
            name: 'Quần Jeans Slimfit',
            sku: 'QJ-023',
            category: 'clothes',
            price: 350000,
            cost: 200000,
            stock: 3,
            size: '32',
            image: '',
            barcode: '8934567890130'
        },
        {
            name: 'Giày Sneaker White',
            sku: 'G-W01',
            category: 'accessories',
            price: 550000,
            cost: 300000,
            stock: 0,
            size: '41',
            image: '',
            barcode: '8934567890147'
        },
        {
            name: 'Áo Khoác Bomber',
            sku: 'AK-099',
            category: 'clothes',
            price: 450000,
            cost: 250000,
            stock: 12,
            size: 'XL',
            image: '',
            barcode: '8934567890154'
        },
        {
            name: 'Thức ăn cho chó Royal Canin',
            sku: 'RC-DOG-01',
            category: 'food',
            price: 520000,
            cost: 350000,
            stock: 15,
            size: '1kg',
            image: '',
            barcode: '8934567890161'
        },
        {
            name: 'Vòng cổ cho mèo',
            sku: 'ACC-CAT-001',
            category: 'accessories',
            price: 85000,
            cost: 40000,
            stock: 30,
            size: 'S',
            image: '',
            barcode: '8934567890178'
        }
    ];

    sampleProducts.forEach(product => addProduct(product));

    // Sample orders (for statistics)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Today's orders
    createOrder({
        items: [
            { productId: getProducts()[0].id, quantity: 2, price: 150000 }
        ],
        total: 300000,
        paymentMethod: 'cash'
    });

    createOrder({
        items: [
            { productId: getProducts()[4].id, quantity: 1, price: 520000 }
        ],
        total: 520000,
        paymentMethod: 'bank'
    });

    showToast('Dữ liệu mẫu đã được tạo thành công', 'success');
}

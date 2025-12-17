// ===========================
// ORDERS PAGE (POS)
// ===========================

let cart = [];
let orderSearchQuery = '';

/**
 * Initialize orders page
 */
function initOrders() {
    renderOrdersPage();
    setupOrdersEventListeners();
}

/**
 * Render orders page
 */
function renderOrdersPage() {
    renderCartItems();
    renderOrderProducts();
    updateCartSummary();
}

/**
 * Render cart items
 */
function renderCartItems() {
    const cartContainer = document.getElementById('cartItems');

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <i data-lucide="shopping-cart" style="width: 48px; height: 48px; opacity: 0.3;"></i>
                <p>Giỏ hàng trống</p>
            </div>
        `;
    } else {
        cartContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatCurrency(item.price)}/sản phẩm</div>
                </div>
                <div class="cart-item-controls">
                    <button class="cart-qty-btn" onclick="decreaseQuantity('${item.id}')">-</button>
                    <div class="cart-qty">${item.quantity}</div>
                    <button class="cart-qty-btn" onclick="increaseQuantity('${item.id}')">+</button>
                </div>
                <div class="cart-item-total">${formatCurrency(item.price * item.quantity)}</div>
            </div>
        `).join('');
    }

    lucide.createIcons();
}

/**
 * Render available products for ordering
 */
function renderOrderProducts() {
    let products = getProducts();

    // Apply search filter
    if (orderSearchQuery) {
        products = products.filter(p =>
            p.name.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(orderSearchQuery.toLowerCase())
        );
    }

    const container = document.getElementById('orderProductsList');

    if (products.length === 0) {
        container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #9E9E9E;">Không tìm thấy sản phẩm</div>`;
    } else {
        container.innerHTML = products.map(product => {
            const isOutOfStock = product.stock === 0;
            return `
                <div class="order-product-card ${isOutOfStock ? 'out-of-stock' : ''}" 
                     onclick="${isOutOfStock ? '' : `addToCart('${product.id}')`}">
                    <div class="order-product-name">${product.name}</div>
                    <div class="order-product-stock">
                        ${isOutOfStock ? 'Hết hàng' : `Còn ${product.stock}`}
                    </div>
                    <div class="order-product-price">${formatCurrency(product.price)}</div>
                </div>
            `;
        }).join('');
    }
}

/**
 * Add product to cart
 */
function addToCart(productId) {
    const product = getProductById(productId);
    if (!product || product.stock === 0) return;

    const cartItem = cart.find(item => item.id === productId);

    if (cartItem) {
        // Check stock before increasing
        if (cartItem.quantity < product.stock) {
            cartItem.quantity++;
        } else {
            showToast('Không đủ hàng trong kho', 'error');
            return;
        }
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    renderCartItems();
    updateCartSummary();
}

/**
 * Increase quantity
 */
function increaseQuantity(productId) {
    const product = getProductById(productId);
    const cartItem = cart.find(item => item.id === productId);

    if (cartItem && cartItem.quantity < product.stock) {
        cartItem.quantity++;
        renderCartItems();
        updateCartSummary();
    } else {
        showToast('Không đủ hàng trong kho', 'error');
    }
}

/**
 * Decrease quantity
 */
function decreaseQuantity(productId) {
    const cartItem = cart.find(item => item.id === productId);

    if (cartItem) {
        cartItem.quantity--;
        if (cartItem.quantity === 0) {
            cart = cart.filter(item => item.id !== productId);
        }
        renderCartItems();
        updateCartSummary();
    }
}

/**
 * Update cart summary display
 */
function updateCartSummary() {
    const summary = document.getElementById('cartSummary');
    const totalEl = document.getElementById('cartTotal');

    if (cart.length === 0) {
        summary.style.display = 'none';
    } else {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalEl.textContent = formatCurrency(total);
        summary.style.display = 'block';
    }
}

/**
 * Clear cart
 */
function clearCart() {
    if (cart.length === 0) return;

    if (confirm('Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
        cart = [];
        renderCartItems();
        updateCartSummary();
        showToast('Đã xóa giỏ hàng', 'success');
    }
}

/**
 * Checkout
 */
function checkout() {
    if (cart.length === 0) {
        showToast('Giỏ hàng trống', 'error');
        return;
    }

    const paymentMethod = prompt('Phương thức thanh toán:\n1 - Tiền mặt\n2 - Chuyển khoản', '1');

    if (paymentMethod === null) return;

    const method = paymentMethod === '2' ? 'bank' : 'cash';
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order
    const order = {
        items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
        })),
        total: total,
        paymentMethod: method
    };

    try {
        createOrder(order);
        showToast('Đơn hàng đã được tạo thành công!', 'success');

        // Clear cart
        cart = [];
        renderCartItems();
        updateCartSummary();

        // Refresh dashboard if needed
        if (typeof initDashboard === 'function') {
            initDashboard();
        }
    } catch (error) {
        showToast('Có lỗi xảy ra: ' + error.message, 'error');
    }
}

/**
 * Show order history
 */
function showOrderHistory() {
    document.getElementById('posView').style.display = 'none';
    document.getElementById('historyView').style.display = 'block';
    renderOrderHistory();
}

/**
 * Hide order history
 */
function hideOrderHistory() {
    document.getElementById('posView').style.display = 'block';
    document.getElementById('historyView').style.display = 'none';
}

/**
 * Render order history
 */
function renderOrderHistory() {
    const orders = getOrders().slice().reverse();
    const container = document.getElementById('orderHistoryList');

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Chưa có đơn hàng nào</p>
            </div>
        `;
    } else {
        container.innerHTML = orders.map(order => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            return `
                <div class="activity-item">
                    <div class="activity-icon orders">
                        <i data-lucide="shopping-bag"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">Đơn hàng #${order.id.substr(0, 6)}</div>
                        <div class="activity-subtitle">
                            ${itemCount} sản phẩm • ${order.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                        </div>
                        <div class="activity-time">${formatRelativeTime(order.createdAt)}</div>
                    </div>
                    <div class="activity-amount positive">
                        ${formatCurrency(order.total)}
                    </div>
                </div>
            `;
        }).join('');
    }

    lucide.createIcons();
}

/**
 * Setup orders event listeners
 */
function setupOrdersEventListeners() {
    // Search products
    const searchInput = document.getElementById('orderProductSearch');
    searchInput.addEventListener('input', debounce((e) => {
        orderSearchQuery = e.target.value;
        renderOrderProducts();
    }, 300));

    // Clear cart
    document.getElementById('clearCartBtn').addEventListener('click', clearCart);

    // Checkout
    document.getElementById('checkoutBtn').addEventListener('click', checkout);

    // View history
    document.getElementById('viewHistoryBtn').addEventListener('click', showOrderHistory);

    // Back to POS
    document.getElementById('backToPosBtn')?.addEventListener('click', hideOrderHistory);

    // Barcode scanner
    setupBarcodeScanner();
}

// ===========================
// BARCODE SCANNER
// ===========================

let html5QrcodeScanner = null;
let scannerActive = false;

/**
 * Setup barcode scanner event listeners
 */
function setupBarcodeScanner() {
    const scanBtn = document.getElementById('scanBarcodeBtn');
    const closeScannerBtn = document.getElementById('closeScannerBtn');
    const stopScannerBtn = document.getElementById('stopScannerBtn');
    const scannerModal = document.getElementById('scannerModal');

    // Open scanner
    scanBtn?.addEventListener('click', async () => {
        const hasPermission = await checkCameraPermission();
        if (!hasPermission) {
            showToast('Không thể truy cập camera. Vui lòng cấp quyền camera.', 'error');
            return;
        }
        startBarcodeScanner();
    });

    // Close scanner
    const closeScanner = () => {
        stopBarcodeScanner();
    };

    closeScannerBtn?.addEventListener('click', closeScanner);
    stopScannerBtn?.addEventListener('click', closeScanner);

    // Close on backdrop click
    scannerModal?.addEventListener('click', (e) => {
        if (e.target === scannerModal) {
            closeScanner();
        }
    });
}

/**
 * Start barcode scanner
 */
function startBarcodeScanner() {
    const modal = document.getElementById('scannerModal');
    const resultDiv = document.getElementById('scannerResult');

    modal.classList.add('active');
    resultDiv.style.display = 'none';

    // Initialize scanner if not already done
    if (!html5QrcodeScanner) {
        html5QrcodeScanner = new Html5Qrcode("scannerContainer");
    }

    // Scanner configuration
    const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.777778
    };

    // Start scanning
    html5QrcodeScanner.start(
        { facingMode: "environment" }, // Use back camera on mobile
        config,
        onScanSuccess,
        onScanError
    ).then(() => {
        scannerActive = true;
    }).catch(err => {
        console.error('Scanner start error:', err);
        showToast('Không thể khởi động camera', 'error');
        stopBarcodeScanner();
    });
}

/**
 * Stop barcode scanner
 */
function stopBarcodeScanner() {
    if (html5QrcodeScanner && scannerActive) {
        html5QrcodeScanner.stop().then(() => {
            scannerActive = false;
            document.getElementById('scannerModal').classList.remove('active');
            document.getElementById('scannerResult').style.display = 'none';
        }).catch(err => {
            console.error('Scanner stop error:', err);
            scannerActive = false;
            document.getElementById('scannerModal').classList.remove('active');
        });
    } else {
        document.getElementById('scannerModal').classList.remove('active');
    }
}

/**
 * Handle successful barcode scan
 */
function onScanSuccess(decodedText, decodedResult) {
    console.log('Scanned:', decodedText);

    // Find product by barcode
    const product = getProductByBarcode(decodedText);

    const resultDiv = document.getElementById('scannerResult');
    const resultText = document.getElementById('scannerResultText');

    if (product) {
        // Product found
        resultText.textContent = `Đã quét: ${product.name}`;
        resultDiv.style.display = 'block';

        // Vibrate on success
        vibrate(100);

        // Add to cart
        addToCart(product.id);

        // Show success toast
        showToast(`Đã thêm ${product.name} vào giỏ hàng`, 'success');

        // Close scanner after 1 second
        setTimeout(() => {
            stopBarcodeScanner();
        }, 1000);
    } else {
        // Product not found
        resultDiv.style.display = 'block';
        resultDiv.style.background = '#FFEBEE';
        resultText.textContent = `Không tìm thấy sản phẩm với mã: ${decodedText}`;
        resultText.style.color = 'var(--color-danger)';

        // Vibrate twice for error
        vibrate([100, 100, 100]);

        showToast('Không tìm thấy sản phẩm', 'error');

        // Reset result display after 2 seconds
        setTimeout(() => {
            resultDiv.style.display = 'none';
            resultDiv.style.background = '#E8F5E9';
            resultText.style.color = 'var(--color-success)';
        }, 2000);
    }
}

/**
 * Handle scan errors (just log, don't show to user as errors happen frequently during scanning)
 */
function onScanError(errorMessage) {
    // Silent - scanning errors are normal during the scanning process
    // Only log to console for debugging
    // console.log('Scan error:', errorMessage);
}

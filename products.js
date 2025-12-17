// ===========================
// PRODUCTS PAGE
// ===========================

let currentCategory = 'all';
let currentSearchQuery = '';
let editingProductId = null;

/**
 * Initialize products page
 */
function initProducts() {
    renderProducts();
    setupProductsEventListeners();
}

/**
 * Render products list
 */
function renderProducts() {
    let products = getProducts();

    // Apply category filter
    products = filterProductsByCategory(currentCategory);

    // Apply search filter
    if (currentSearchQuery) {
        products = products.filter(p =>
            p.name.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(currentSearchQuery.toLowerCase())
        );
    }

    // Update product count
    document.getElementById('productCount').textContent = `${products.length} sản phẩm`;

    // Render product cards
    const productsList = document.getElementById('productsList');

    if (products.length === 0) {
        productsList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="package-x" class="empty-icon"></i>
                <p>Không tìm thấy sản phẩm nào</p>
            </div>
        `;
    } else {
        productsList.innerHTML = products.map(product => {
            const stockStatus = getStockStatus(product.stock);
            const imageHtml = product.image
                ? `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">`
                : `<i data-lucide="image"></i>`;

            return `
                <div class="product-card" data-product-id="${product.id}">
                    <div class="product-image ${!product.image ? 'placeholder' : ''}">
                        ${imageHtml}
                    </div>
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-meta">SKU: ${product.sku} | Size: ${product.size || 'N/A'}</div>
                        <div class="product-stock ${stockStatus.type}">
                            <i data-lucide="${stockStatus.icon}" class="product-stock-icon"></i>
                            <span>${stockStatus.label}</span>
                        </div>
                    </div>
                    <div class="product-price-section">
                        <div class="product-price">${formatCurrency(product.price)}</div>
                    </div>
                    <div class="product-actions">
                        <button class="product-action-btn" onclick="editProduct('${product.id}')">
                            <i data-lucide="edit-2"></i>
                        </button>
                        <button class="product-action-btn delete" onclick="handleDeleteProduct('${product.id}')">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    lucide.createIcons();
}

/**
 * Setup products page event listeners
 */
function setupProductsEventListeners() {
    // Search input
    const searchInput = document.getElementById('productSearch');
    searchInput.addEventListener('input', debounce((e) => {
        currentSearchQuery = e.target.value;
        renderProducts();
    }, 300));

    // Category tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update category
            currentCategory = tab.dataset.category;

            // Re-render products
            renderProducts();
        });
    });

    // Add product button
    document.getElementById('addProductBtn').addEventListener('click', () => {
        openProductModal();
    });

    // Product form submit
    document.getElementById('productForm').addEventListener('submit', (e) => {
        e.preventDefault();
        handleProductSubmit(e);
    });

    // Close modal buttons
    document.getElementById('closeModal').addEventListener('click', closeProductModal);
    document.getElementById('cancelBtn').addEventListener('click', closeProductModal);

    // Close modal on backdrop click
    document.getElementById('productModal').addEventListener('click', (e) => {
        if (e.target.id === 'productModal') {
            closeProductModal();
        }
    });

    // Image selection handler
    document.getElementById('selectImageBtn').addEventListener('click', () => {
        document.getElementById('productImageInput').click();
    });

    // Image input change handler
    document.getElementById('productImageInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showToast('Vui lòng chọn file hình ảnh', 'error');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showToast('Kích thước file không được vượt quá 5MB', 'error');
                return;
            }

            // Read and display image
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageData = event.target.result;

                // Update preview
                const previewImg = document.getElementById('previewImg');
                const imagePreview = document.getElementById('imagePreview');
                const imagePreviewText = document.getElementById('imagePreviewText');

                previewImg.src = imageData;
                imagePreview.style.display = 'block';
                imagePreviewText.value = file.name;

                // Store image data in hidden input
                const form = document.getElementById('productForm');
                const imageInput = form.querySelector('input[name="image"]');
                imageInput.value = imageData; // Store base64 data
            };
            reader.readAsDataURL(file);
        }
    });
}

/**
 * Open product modal
 */
function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const title = document.getElementById('modalTitle');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const imagePreviewText = document.getElementById('imagePreviewText');

    // Reset image preview
    imagePreview.style.display = 'none';
    previewImg.src = '';
    imagePreviewText.value = '';
    document.getElementById('productImageInput').value = '';

    if (productId) {
        // Edit mode
        editingProductId = productId;
        const product = getProductById(productId);

        title.textContent = 'Chỉnh sửa sản phẩm';
        form.name.value = product.name;
        form.sku.value = product.sku || '';
        form.category.value = product.category;
        form.price.value = product.price;
        form.cost.value = product.cost;
        form.stock.value = product.stock;
        form.size.value = product.size;
        form.image.value = product.image || '';

        // Show image preview if exists
        if (product.image) {
            previewImg.src = product.image;
            imagePreview.style.display = 'block';
            imagePreviewText.value = 'Hình ảnh hiện tại';
        }
    } else {
        // Add mode
        editingProductId = null;
        title.textContent = 'Thêm sản phẩm';
        form.reset();
    }

    modal.classList.add('active');
}

/**
 * Close product modal
 */
function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
    editingProductId = null;
}

/**
 * Handle product form submit
 */
function handleProductSubmit(e) {
    const form = e.target;
    const formData = new FormData(form);

    const productData = {
        name: formData.get('name'),
        sku: formData.get('sku'),
        category: formData.get('category'),
        price: formData.get('price'),
        cost: formData.get('cost'),
        stock: formData.get('stock'),
        size: formData.get('size'),
        image: formData.get('image')
    };

    // Auto-generate SKU if not provided
    if (!productData.sku || productData.sku.trim() === '') {
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);
        productData.sku = `AUTO-${timestamp}-${randomNum}`;
    }

    try {
        if (editingProductId) {
            // Update existing product
            updateProduct(editingProductId, productData);
            showToast('Sản phẩm đã được cập nhật', 'success');
        } else {
            // Add new product
            addProduct(productData);
            showToast('Sản phẩm đã được thêm', 'success');
        }

        closeProductModal();
        renderProducts();
    } catch (error) {
        showToast('Có lỗi xảy ra: ' + error.message, 'error');
    }
}

/**
 * Edit product
 */
function editProduct(productId) {
    openProductModal(productId);
}

/**
 * Delete product
 */
function handleDeleteProduct(productId) {
    const product = getProductById(productId);

    if (confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?`)) {
        deleteProduct(productId);
        showToast('Sản phẩm đã được xóa', 'success');
        renderProducts();
    }
}

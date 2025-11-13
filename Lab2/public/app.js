const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCart();
});

async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error('Błąd przy pobieraniu produktów');

        const products = await response.json();
        
        displayProductsTable(products);
        populateProductSelect(products);
    } catch (error) {
        console.error('Błąd:', error);
        showMessage('product-msg', 'Błąd przy pobieraniu produktów', 'error');
    }
}

function displayProductsTable(products) {
    const tbody = document.querySelector('#products-list tbody');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-message">Brak produktów</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.name}</td>
            <td>${product.price.toFixed(2)} zł</td>
            <td>
                <input type="number" min="1" value="1" id="qty-${product.id}" class="product-qty">
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-add" onclick="addToCartDirect(${product.id})">Dodaj do koszyka</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function populateProductSelect(products) {
    const select = document.getElementById('product-select-dropdown');
    const currentValue = select.value;

    select.innerHTML = '<option value="">-- Wybierz produkt --</option>';

    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} (${product.price.toFixed(2)} zł)`;
        select.appendChild(option);
    });

    select.value = currentValue;
}

document.getElementById('form-add-product').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);

    if (!name || isNaN(price) || price < 0) {
        showMessage('product-msg', 'Podaj poprawną nazwę i cenę', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Błąd przy tworzeniu produktu');
        }

        showMessage('product-msg', 'Produkt dodany pomyślnie!', 'success');
        document.getElementById('form-add-product').reset();
        loadProducts();
    } catch (error) {
        console.error('Błąd:', error);
        showMessage('product-msg', error.message, 'error');
    }
});

async function addToCartDirect(productId) {
    const qtyInput = document.getElementById(`qty-${productId}`);
    const qty = parseInt(qtyInput.value);

    if (isNaN(qty) || qty < 1) {
        alert('Podaj poprawną ilość');
        return;
    }

    await addToCart(productId, qty);
}

async function addToCartFromSelect() {
    const productId = document.getElementById('product-select-dropdown').value;
    const qty = parseInt(document.getElementById('product-quantity').value);

    if (!productId) {
        alert('Wybierz produkt');
        return;
    }

    if (isNaN(qty) || qty < 1) {
        alert('Podaj poprawną ilość');
        return;
    }

    await addToCart(parseInt(productId), qty);
}

async function addToCart(productId, qty) {
    try {
        const response = await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, qty })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Błąd przy dodawaniu do koszyka');
        }

        loadCart();
        document.getElementById('product-select-dropdown').value = '';
        document.getElementById('product-quantity').value = '1';
    } catch (error) {
        console.error('Błąd:', error);
        alert(error.message);
    }
}

async function loadCart() {
    try {
        const response = await fetch(`${API_BASE_URL}/cart`);
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error('Błąd przy pobieraniu koszyka');
        }

        const cartItems = await response.json();
        console.log('Cart items:', cartItems);
        displayCart(cartItems);
    } catch (error) {
        console.error('Błąd:', error);
        console.error('Error details:', error.message, error.stack);
        alert('Błąd przy pobieraniu koszyka: ' + error.message);
    }
}

function displayCart(cartItems) {
    const tbody = document.querySelector('#cart-list tbody');

    if (cartItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-message">Koszyk jest pusty</td></tr>';
        return;
    }

    tbody.innerHTML = cartItems.map(item => `
        <tr>
            <td>${item.product_id}</td>
            <td>
                <input type="number" min="1" value="${item.qty}" id="cart-qty-${item.product_id}" class="cart-qty">
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-update" onclick="updateCartItem(${item.product_id})">Aktualizuj</button>
                    <button class="btn-remove" onclick="removeFromCart(${item.product_id})">Usuń</button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function updateCartItem(productId) {
    const qtyInput = document.getElementById(`cart-qty-${productId}`);
    const qty = parseInt(qtyInput.value);

    if (isNaN(qty) || qty < 1) {
        alert('Podaj poprawną ilość');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart/item`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, qty })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Błąd przy aktualizacji');
        }

        loadCart();
    } catch (error) {
        console.error('Błąd:', error);
        alert(error.message);
    }
}

async function removeFromCart(productId) {
    if (!confirm('Na pewno chcesz usunąć ten produkt?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/cart/item/${productId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Błąd przy usuwaniu');
        }

        loadCart();
    } catch (error) {
        console.error('Błąd:', error);
        alert(error.message);
    }
}

async function checkout() {
    if (!confirm('Na pewno chcesz sfinalizować zamówienie?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Błąd przy finalizacji');
        }

        const result = await response.json();
        alert(`Zamówienie złożone!\nNumer zamówienia: ${result.order_id}\nSuma: ${result.total.toFixed(2)} zł`);
        loadCart();
    } catch (error) {
        console.error('Błąd:', error);
        alert(error.message);
    }
}

function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message ${type}`;
    
    setTimeout(() => {
        element.className = 'message';
        element.textContent = '';
    }, 3000);
}

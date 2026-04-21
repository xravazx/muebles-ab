import { getProducts, saveProducts, getCurrentUser, setCurrentUser, getIsAdmin, setIsAdmin } from './data.js';

let products = [];
let currentCategory = 'Todos';
let searchQuery = '';
let currentProductBeingRated = null;

// DOM Elements
const productGrid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');
const logoBtn = document.getElementById('logo-btn');
const authBtn = document.getElementById('auth-btn');
const adminNavBtn = document.getElementById('admin-nav-btn');

// Views
const publicView = document.getElementById('public-view');
const adminView = document.getElementById('admin-view');

// Modals
const productModal = document.getElementById('product-modal');
const authModal = document.getElementById('auth-modal');
const adminAuthModal = document.getElementById('admin-auth-modal');
const addProductModal = document.getElementById('add-product-modal');
const closeBtns = document.querySelectorAll('.close-modal');

document.addEventListener('DOMContentLoaded', () => {
  products = getProducts();
  updateAuthUI();
  renderProducts();

  // Search
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderProducts();
  });

  // Filters
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      renderProducts();
    });
  });

  // Nav Actions
  logoBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showView(publicView);
  });

  authBtn.addEventListener('click', () => {
    const user = getCurrentUser();
    if (user) {
      // Logout
      setCurrentUser(null);
      setIsAdmin(false);
      updateAuthUI();
      showToast('Sesión cerrada correctamente', 'success');
      showView(publicView);
    } else {
      openModal(authModal);
    }
  });

  adminNavBtn.addEventListener('click', () => {
    renderAdminTable();
    showView(adminView);
  });

  // Auth Forms
  document.getElementById('auth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username-input').value;
    setCurrentUser(username);
    updateAuthUI();
    closeModal(authModal);
    showToast(`Bienvenido, ${username}!`, 'success');
  });

  document.getElementById('go-to-admin-login').addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(authModal);
    openModal(adminAuthModal);
  });

  document.getElementById('admin-auth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = document.getElementById('admin-pass-input').value;
    if (pass === 'admin123') { // Hardcoded for demo
      setCurrentUser('Admin');
      setIsAdmin(true);
      updateAuthUI();
      closeModal(adminAuthModal);
      showToast('Acceso Administrativo Concedido', 'success');
      renderAdminTable();
      showView(adminView);
    } else {
      showToast('Contraseña incorrecta', 'error');
    }
  });

  // Modal Closers
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(btn.closest('.modal'));
    });
  });

  // Product Detail UI (Stars Logic)
  const stars = document.querySelectorAll('.interactive-stars span');
  let selectedRating = 0;

  stars.forEach(star => {
    star.addEventListener('mouseover', function() {
      const val = parseInt(this.dataset.val);
      stars.forEach(s => s.classList.toggle('hovered', parseInt(s.dataset.val) <= val));
    });
    star.addEventListener('mouseout', function() {
      stars.forEach(s => s.classList.remove('hovered'));
    });
    star.addEventListener('click', function() {
      if (!getCurrentUser()) {
        closeModal(productModal);
        openModal(authModal);
        showToast('Debes iniciar sesión para calificar', 'error');
        return;
      }
      selectedRating = parseInt(this.dataset.val);
      stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.val) <= selectedRating));
      document.getElementById('submit-rating-btn').disabled = false;
    });
  });

  document.getElementById('submit-rating-btn').addEventListener('click', () => {
    if (currentProductBeingRated && selectedRating > 0) {
      // Simulate saving rating
      const idx = products.findIndex(p => p.id === currentProductBeingRated.id);
      if (idx !== -1) {
        let p = products[idx];
        let total = (p.stars * p.reviews) + selectedRating;
        p.reviews += 1;
        p.stars = parseFloat((total / p.reviews).toFixed(1));
        saveProducts(products);
        
        // Update UI
        document.getElementById('modal-stars-display').innerHTML = renderStarsHTML(p.stars, p.reviews);
        showToast('¡Gracias por tu calificación!', 'success');
        
        // Reset interactive
        stars.forEach(s => s.classList.remove('active', 'hovered'));
        selectedRating = 0;
        document.getElementById('submit-rating-btn').disabled = true;
        renderProducts(); // Update grid behind
        if(getIsAdmin()) renderAdminTable();
      }
    }
  });

  // Admin Actions
  document.getElementById('add-product-btn').addEventListener('click', () => openModal(addProductModal));

  document.getElementById('add-product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const newProduct = {
      id: Date.now(),
      name: document.getElementById('new-prod-name').value,
      category: document.getElementById('new-prod-category').value,
      desc: document.getElementById('new-prod-desc').value,
      img: document.getElementById('new-prod-img').value,
      stars: 0,
      reviews: 0
    };
    products.push(newProduct);
    saveProducts(products);
    renderAdminTable();
    renderProducts();
    closeModal(addProductModal);
    e.target.reset();
    showToast('Producto añadido exitosamente', 'success');
  });

});

// --- RENDER FUNCTIONS ---

function renderProducts() {
  productGrid.innerHTML = '';
  
  let filtered = products.filter(p => {
    const matchCategory = currentCategory === 'Todos' || p.category === currentCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery) || p.category.toLowerCase().includes(searchQuery);
    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No se encontraron productos.</p>';
    return;
  }

  filtered.forEach((product, index) => {
    const delay = index * 0.05; // Staggered animation
    const card = document.createElement('article');
    card.className = 'product-card fade-in';
    card.style.animationDelay = `${delay}s`;
    
    card.innerHTML = `
      <div class="img-container">
        <img src="${product.img}" alt="${product.name}" loading="lazy">
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3>${product.name}</h3>
        <div class="stars">${renderStarsHTML(product.stars, product.reviews)}</div>
      </div>
    `;

    card.addEventListener('click', () => openProductDetail(product));
    productGrid.appendChild(card);
  });
}

function openProductDetail(product) {
  currentProductBeingRated = product;
  document.getElementById('modal-img').src = product.img;
  document.getElementById('modal-title').textContent = product.name;
  document.getElementById('modal-category').textContent = product.category;
  document.getElementById('modal-desc').textContent = product.desc;
  document.getElementById('modal-stars-display').innerHTML = renderStarsHTML(product.stars, product.reviews);
  
  // Reset interaction
  document.querySelectorAll('.interactive-stars span').forEach(s => s.classList.remove('active'));
  document.getElementById('submit-rating-btn').disabled = true;
  
  openModal(productModal);
}

function renderAdminTable() {
  const tbody = document.getElementById('admin-table-body');
  tbody.innerHTML = '';
  
  products.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${p.img}" alt="img"></td>
      <td><strong>${p.name}</strong></td>
      <td>${p.category}</td>
      <td>${p.stars} ★ (${p.reviews})</td>
      <td><button class="btn btn-delete" data-id="${p.id}">Eliminar</button></td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.dataset.id);
      products = products.filter(p => p.id !== id);
      saveProducts(products);
      renderAdminTable();
      renderProducts();
      showToast('Producto eliminado', 'success');
    });
  });
}

// --- UTILS ---

function renderStarsHTML(stars, reviews) {
  let starsHtml = '';
  const rounded = Math.round(stars);
  for(let i=1; i<=5; i++) {
    starsHtml += i <= rounded ? '★' : '☆';
  }
  return `${starsHtml} <span>(${reviews} reseñas)</span>`;
}

function updateAuthUI() {
  const user = getCurrentUser();
  const isAdmin = getIsAdmin();
  
  if (user) {
    authBtn.textContent = 'Cerrar Sesión (' + user + ')';
    adminNavBtn.style.display = isAdmin ? 'inline-block' : 'none';
  } else {
    authBtn.textContent = 'Iniciar Sesión';
    adminNavBtn.style.display = 'none';
  }
}

function showView(viewElement) {
  document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
  viewElement.style.display = 'block';
  // If returning to public view, hide search if wanted or just clear
  if(viewElement === publicView) {
    document.querySelector('.filters').style.display = 'flex';
    document.querySelector('.hero').style.display = 'block';
  }
}

function openModal(modal) {
  modal.classList.add('active');
}

function closeModal(modal) {
  modal.classList.remove('active');
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

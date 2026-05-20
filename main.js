import { getProducts, saveProducts, getIsAdmin, setIsAdmin, getAdminPassword, setAdminPassword, getSocialLinks, saveSocialLinks } from './data.js';

let products = [];
let currentCategory = 'Todos';
let searchQuery = '';
// DOM Elements
const productGrid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');
const logoBtn = document.getElementById('logo-btn');
const adminNavBtn = document.getElementById('admin-nav-btn');

// Views
const publicView = document.getElementById('public-view');
const adminView = document.getElementById('admin-view');

// Modals
const productModal = document.getElementById('product-modal');
const adminAuthModal = document.getElementById('admin-auth-modal');
const addProductModal = document.getElementById('add-product-modal');
const closeBtns = document.querySelectorAll('.close-modal');

document.addEventListener('DOMContentLoaded', () => {
  products = getProducts();
  if(getIsAdmin()) adminNavBtn.style.display = 'inline-block';
  renderProducts();
  renderSocialLinks();

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

  logoBtn.addEventListener('dblclick', (e) => {
    e.preventDefault();
    const currentPass = getAdminPassword();
    if (!currentPass) {
      document.getElementById('admin-auth-title').textContent = "Configurar Admin";
      document.getElementById('admin-auth-desc').textContent = "Crea una contraseña fuerte (min 8 chars, 1 Mayus, 1 minus, 1 num, 1 especial).";
      document.getElementById('admin-pass-hint').style.display = "block";
      document.getElementById('admin-auth-submit-btn').textContent = "Crear Contraseña";
    } else {
      document.getElementById('admin-auth-title').textContent = "Acceso Administrativo";
      document.getElementById('admin-auth-desc').textContent = "Ingresa tu contraseña de administrador.";
      document.getElementById('admin-pass-hint').style.display = "none";
      document.getElementById('admin-auth-submit-btn').textContent = "Acceder";
    }
    document.getElementById('admin-pass-input').value = "";
    openModal(adminAuthModal);
  });

  // Auth form removed

  adminNavBtn.addEventListener('click', () => {
    renderAdminTable();
    showView(adminView);
  });

  // Quitado el botón visible anterior, ahora por logo.

  document.getElementById('admin-auth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = document.getElementById('admin-pass-input').value;
    const currentPass = getAdminPassword();
    
    if (!currentPass) {
      // Setup
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
      if (!regex.test(pass)) {
        showToast('La contraseña no cumple con los requisitos mínimos', 'error');
        return;
      }
      setAdminPassword(pass);
      showToast('Contraseña de administrador creada', 'success');
      loginAdmin();
    } else {
      // Login
      if (pass === currentPass) {
        loginAdmin();
      } else {
        showToast('Contraseña incorrecta', 'error');
      }
    }
  });

  function loginAdmin() {
    setIsAdmin(true);
    adminNavBtn.style.display = 'inline-block';
    closeModal(adminAuthModal);
    showToast('Acceso Administrativo Concedido', 'success');
    renderAdminTable();
    showView(adminView);
  }

  // Modal Closers
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(btn.closest('.modal'));
    });
  });

  // Admin Actions
  document.getElementById('add-product-btn').addEventListener('click', () => {
    document.getElementById('add-product-form').reset();
    openModal(addProductModal);
  });

  document.getElementById('toggle-settings-btn').addEventListener('click', () => {
    const settingsSec = document.getElementById('admin-settings-section');
    if(settingsSec.style.display === 'none') {
      settingsSec.style.display = 'block';
      const links = getSocialLinks();
      document.getElementById('social-fb').value = links.facebook || "";
      document.getElementById('social-ig').value = links.instagram || "";
      document.getElementById('social-tw').value = links.twitter || "";
    } else {
      settingsSec.style.display = 'none';
    }
  });

  document.getElementById('social-settings-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const links = {
      facebook: document.getElementById('social-fb').value,
      instagram: document.getElementById('social-ig').value,
      twitter: document.getElementById('social-tw').value
    };
    saveSocialLinks(links);
    renderSocialLinks();
    showToast('Redes Sociales actualizadas', 'success');
  });

  document.getElementById('add-product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    let imgData = document.getElementById('new-prod-img-url').value;
    const fileInput = document.getElementById('new-prod-img-file');
    if (fileInput.files && fileInput.files[0]) {
      imgData = await getBase64(fileInput.files[0]);
    }
    
    if(!imgData) imgData = "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=600";

    const newProduct = {
      id: Date.now(),
      name: document.getElementById('new-prod-name').value,
      category: document.getElementById('new-prod-category').value,
      desc: document.getElementById('new-prod-desc').value,
      img: imgData
    };
    products.push(newProduct);
    saveProducts(products);
    renderAdminTable();
    renderProducts();
    closeModal(addProductModal);
    e.target.reset();
    showToast('Producto añadido exitosamente', 'success');
  });

  document.getElementById('edit-product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById('edit-prod-id').value);
    const idx = products.findIndex(p => p.id === id);
    if(idx !== -1) {
      let imgData = document.getElementById('edit-prod-img-url').value;
      const fileInput = document.getElementById('edit-prod-img-file');
      if (fileInput.files && fileInput.files[0]) {
        imgData = await getBase64(fileInput.files[0]);
      }
      
      if(!imgData && !products[idx].img) imgData = "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=600";
      
      products[idx].name = document.getElementById('edit-prod-name').value;
      products[idx].category = document.getElementById('edit-prod-category').value;
      products[idx].desc = document.getElementById('edit-prod-desc').value;
      if (imgData) {
         products[idx].img = imgData;
      }
      
      saveProducts(products);
      renderAdminTable();
      renderProducts();
      closeModal(document.getElementById('edit-product-modal'));
      e.target.reset();
      showToast('Producto actualizado', 'success');
    }
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
      </div>
    `;

    card.addEventListener('click', () => openProductDetail(product));
    productGrid.appendChild(card);
  });
}

function openProductDetail(product) {
  document.getElementById('modal-img').src = product.img;
  document.getElementById('modal-title').textContent = product.name;
  document.getElementById('modal-category').textContent = product.category;
  document.getElementById('modal-desc').textContent = product.desc;
  
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
      <td><button class="btn btn-outline btn-edit" data-id="${p.id}" style="margin-right:0.5rem; margin-bottom:0.5rem;">Editar</button><button class="btn btn-delete" data-id="${p.id}">Eliminar</button></td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.dataset.id);
      const p = products.find(prod => prod.id === id);
      if(p) {
        document.getElementById('edit-prod-id').value = p.id;
        document.getElementById('edit-prod-name').value = p.name;
        document.getElementById('edit-prod-category').value = p.category;
        document.getElementById('edit-prod-desc').value = p.desc;
        document.getElementById('edit-prod-img-url').value = p.img.startsWith('data:') ? '' : p.img;
        document.getElementById('edit-prod-img-file').value = "";
        openModal(document.getElementById('edit-product-modal'));
      }
    });
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

// Removed renderStarsHTML

function renderSocialLinks() {
  const links = getSocialLinks();
  const fb = document.getElementById('footer-fb');
  const ig = document.getElementById('footer-ig');
  const tw = document.getElementById('footer-tw');
  
  if (fb) fb.href = links.facebook || "#";
  if (ig) ig.href = links.instagram || "#";
  if (tw) tw.href = links.twitter || "#";
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Removed updateAuthUI

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

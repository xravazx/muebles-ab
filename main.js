import { getProducts, saveProducts, getIsAdmin, setIsAdmin, getAdminPassword, setAdminPassword, getSocialLinks, saveSocialLinks, getCategories, saveCategories } from './data.js';

let products = [];
let currentCategory = 'Todos';
let searchQuery = '';
// DOM Elements
const productGrid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const logoBtn = document.getElementById('logo-btn');
const adminNavBtn = document.getElementById('admin-nav-btn');

// Views
const publicView = document.getElementById('public-view');
const adminView = document.getElementById('admin-view');

// Modals
const productModal = document.getElementById('product-modal');
const adminAuthModal = document.getElementById('admin-auth-modal');
const addProductModal = document.getElementById('add-product-modal');
const addCategoryModal = document.getElementById('add-category-modal');
const closeBtns = document.querySelectorAll('.close-modal');

document.addEventListener('DOMContentLoaded', () => {
  products = getProducts();
  if(getIsAdmin()) adminNavBtn.style.display = 'inline-block';
  
  // Dynamic initialization
  populateCategorySelects();
  renderFilters();
  renderProducts();
  renderSocialLinks();

  // Sidebar Toggle
  const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
  const sidebar = document.querySelector('.sidebar');
  const catalogContainer = document.querySelector('.catalog-container');
  if (sidebarToggleBtn && sidebar) {
    sidebarToggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      if (catalogContainer) {
        catalogContainer.classList.toggle('sidebar-collapsed');
      }
    });
  }

  // Search
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderProducts();
  });

  // Nav Actions
  let clickCount = 0;
  let clickTimeout;

  logoBtn.addEventListener('click', (e) => {
    e.preventDefault();
    clickCount++;
    clearTimeout(clickTimeout);
    clickTimeout = setTimeout(() => {
      clickCount = 0;
    }, 1000); // Reset click count after 1 second of inactivity

    if (clickCount === 5) {
      clickCount = 0;
      const currentPass = getAdminPassword();
      if (!currentPass) {
        document.getElementById('admin-auth-title').textContent = "Configurar Admin";
        document.getElementById('admin-auth-desc').textContent = "Crea una contraseña de exactamente 20 caracteres.";
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
    } else {
      showView(publicView);
    }
  });

  adminNavBtn.addEventListener('click', () => {
    renderAdminTable();
    showView(adminView);
  });

  document.getElementById('admin-auth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = document.getElementById('admin-pass-input').value;
    const currentPass = getAdminPassword();
    
    if (!currentPass) {
      // Setup - Enforce exactly 20 characters
      if (pass.length !== 20) {
        showToast('La contraseña debe tener exactamente 20 caracteres', 'error');
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

  // Modal Closers - handles all modals including dynamic category ones
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(btn.closest('.modal'));
    });
  });

  // Admin Actions
  document.getElementById('add-product-btn').addEventListener('click', () => {
    document.getElementById('add-product-form').reset();
    document.getElementById('new-prod-discount-group').style.display = 'none';
    document.getElementById('new-prod-discount-percent').required = false;
    openModal(addProductModal);
  });

  // Category Actions
  const addCategoryBtn = document.getElementById('add-category-btn');
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', () => {
      document.getElementById('add-category-form').reset();
      renderAdminCategoriesList();
      openModal(addCategoryModal);
    });
  }

  const addCategoryForm = document.getElementById('add-category-form');
  if (addCategoryForm) {
    addCategoryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newCat = document.getElementById('new-category-name').value.trim();
      if (!newCat) return;

      // Capitalize first letter
      const formattedCat = newCat.charAt(0).toUpperCase() + newCat.slice(1);

      const categories = getCategories();
      if (categories.includes(formattedCat)) {
        showToast('La categoría ya existe', 'error');
        return;
      }

      categories.push(formattedCat);
      saveCategories(categories);
      
      // Repopulate selects & filter buttons
      populateCategorySelects();
      renderFilters();
      renderAdminCategoriesList();
      
      document.getElementById('add-category-form').reset();
      showToast('Categoría añadida exitosamente', 'success');
    });
  }

  // Toggles dynamically showing the discount percentage input field
  const newDiscountToggle = document.getElementById('new-prod-discount-toggle');
  const newDiscountGroup = document.getElementById('new-prod-discount-group');
  const newDiscountInput = document.getElementById('new-prod-discount-percent');

  newDiscountToggle.addEventListener('change', () => {
    if (newDiscountToggle.value === 'Si') {
      newDiscountGroup.style.display = 'block';
      newDiscountInput.required = true;
    } else {
      newDiscountGroup.style.display = 'none';
      newDiscountInput.required = false;
      newDiscountInput.value = '';
    }
  });

  const editDiscountToggle = document.getElementById('edit-prod-discount-toggle');
  const editDiscountGroup = document.getElementById('edit-prod-discount-group');
  const editDiscountInput = document.getElementById('edit-prod-discount-percent');

  editDiscountToggle.addEventListener('change', () => {
    if (editDiscountToggle.value === 'Si') {
      editDiscountGroup.style.display = 'block';
      editDiscountInput.required = true;
    } else {
      editDiscountGroup.style.display = 'none';
      editDiscountInput.required = false;
      editDiscountInput.value = '';
    }
  });

  document.getElementById('toggle-settings-btn').addEventListener('click', () => {
    const settingsSec = document.getElementById('admin-settings-section');
    if(settingsSec.style.display === 'none') {
      settingsSec.style.display = 'block';
      const links = getSocialLinks();
      document.getElementById('social-fb').value = links.facebook || "";
      document.getElementById('social-ig').value = links.instagram || "";
      document.getElementById('social-tw').value = links.twitter || "";
      document.getElementById('social-wa').value = links.whatsapp || "";
    } else {
      settingsSec.style.display = 'none';
    }
  });

  document.getElementById('social-settings-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const links = {
      facebook: document.getElementById('social-fb').value,
      instagram: document.getElementById('social-ig').value,
      twitter: document.getElementById('social-tw').value,
      whatsapp: document.getElementById('social-wa').value
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

    const priceVal = parseFloat(document.getElementById('new-prod-price').value);
    const hasDiscountVal = document.getElementById('new-prod-discount-toggle').value === 'Si';
    const discountPercentVal = hasDiscountVal ? parseInt(document.getElementById('new-prod-discount-percent').value) : 0;

    const newProduct = {
      id: Date.now(),
      name: document.getElementById('new-prod-name').value,
      category: document.getElementById('new-prod-category').value,
      desc: document.getElementById('new-prod-desc').value,
      price: priceVal,
      hasDiscount: hasDiscountVal,
      discountPercent: discountPercentVal,
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
      products[idx].price = parseFloat(document.getElementById('edit-prod-price').value);
      
      const editHasDiscountVal = document.getElementById('edit-prod-discount-toggle').value === 'Si';
      products[idx].hasDiscount = editHasDiscountVal;
      products[idx].discountPercent = editHasDiscountVal ? parseInt(document.getElementById('edit-prod-discount-percent').value) : 0;

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

  // Setup interactive stars event listeners
  const interactiveStars = document.querySelectorAll('#interactive-stars-container span');
  if (interactiveStars) {
    interactiveStars.forEach(star => {
      star.addEventListener('mouseover', function() {
        const val = parseInt(this.dataset.val);
        interactiveStars.forEach(s => {
          if (parseInt(s.dataset.val) <= val) {
            s.classList.add('hovered');
          } else {
            s.classList.remove('hovered');
          }
        });
      });

      star.addEventListener('mouseout', function() {
        interactiveStars.forEach(s => s.classList.remove('hovered'));
      });

      star.addEventListener('click', function() {
        const val = parseInt(this.dataset.val);
        interactiveStars.forEach(s => {
          if (parseInt(s.dataset.val) <= val) {
            s.classList.add('active');
          } else {
            s.classList.remove('active');
          }
        });
        showToast(`¡Gracias por calificar este producto con ${val} estrellas!`, 'success');
      });
    });
  }

});

// --- RENDER FUNCTIONS ---

function formatPrice(amount) {
  if (amount === undefined || amount === null) return '';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

function populateCategorySelects() {
  const categories = getCategories();
  const newSelect = document.getElementById('new-prod-category');
  const editSelect = document.getElementById('edit-prod-category');
  
  if (newSelect) {
    newSelect.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
  }
  if (editSelect) {
    editSelect.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
  }
}

function renderFilters() {
  const filtersContainer = document.querySelector('.filters');
  if (!filtersContainer) return;
  
  const categories = getCategories();
  filtersContainer.innerHTML = `<button class="filter-btn ${currentCategory === 'Todos' ? 'active' : ''}" data-category="Todos">Todos</button>`;
  
  categories.forEach(cat => {
    let displayName = cat;
    if (cat === 'Silla') displayName = 'Sillas';
    else if (cat === 'Mesa') displayName = 'Mesas';
    else if (cat === 'Buró') displayName = 'Burós';
    else if (cat === 'Cama') displayName = 'Camas';
    
    filtersContainer.innerHTML += `<button class="filter-btn ${currentCategory === cat ? 'active' : ''}" data-category="${cat}">${displayName}</button>`;
  });

  // Re-bind click event listeners to dynamic category filter buttons
  const activeBtns = document.querySelectorAll('.filter-btn');
  activeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      renderProducts();
    });
  });
}

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
    
    let priceHTML = '';
    if (product.price !== undefined && product.price !== null) {
      if (product.hasDiscount) {
        const discounted = product.price * (1 - product.discountPercent / 100);
        priceHTML = `
          <div class="price-box">
            <span class="original-price">${formatPrice(product.price)}</span>
            <div class="current-price-row">
              <span class="discount-price">${formatPrice(discounted)}</span>
              <span class="discount-tag">${product.discountPercent}% OFF</span>
            </div>
          </div>
        `;
      } else {
        priceHTML = `
          <div class="price-box">
            <span class="normal-price">${formatPrice(product.price)}</span>
          </div>
        `;
      }
    }
    
    card.innerHTML = `
      <div class="img-container">
        <img src="${product.img}" alt="${product.name}" loading="lazy">
      </div>
      <div class="product-info">
        <div class="product-text-side">
          <span class="product-category">${product.category}</span>
          <h3>${product.name}</h3>
          ${priceHTML}
        </div>
        <div class="product-action-side">
          <span class="btn-view-details">Ver detalles</span>
        </div>
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
  
  // Dynamic Price Display
  const priceContainer = document.getElementById('modal-price-container');
  let finalPrice = product.price;
  if (priceContainer) {
    let priceHTML = '';
    if (product.price !== undefined && product.price !== null) {
      if (product.hasDiscount) {
        finalPrice = product.price * (1 - product.discountPercent / 100);
        priceHTML = `
          <div class="price-box" style="margin-top: 0;">
            <span class="original-price" style="font-size: 14px;">${formatPrice(product.price)}</span>
            <div class="current-price-row">
              <span class="discount-price" style="font-size: 28px; line-height: 1.1;">${formatPrice(finalPrice)}</span>
              <span class="discount-tag" style="font-size: 14px; padding: 4px 8px; border-radius: 6px;">${product.discountPercent}% OFF</span>
            </div>
          </div>
        `;
      } else {
        priceHTML = `
          <div class="price-box" style="margin-top: 0;">
            <span class="normal-price" style="font-size: 28px; line-height: 1.1;">${formatPrice(product.price)}</span>
          </div>
        `;
      }
    }
    priceContainer.innerHTML = priceHTML;
  }

  // WhatsApp Quote Link
  const whatsappBtn = document.getElementById('modal-whatsapp-btn');
  if (whatsappBtn) {
    const formattedPrice = formatPrice(finalPrice);
    const socialLinks = getSocialLinks();
    let waNum = socialLinks.whatsapp || "+5215555555555";
    // Clean up non-digit characters except for http prefix if full link is provided
    if (!waNum.startsWith('http')) {
      waNum = waNum.replace(/[^\d]/g, '');
    }
    const messageText = `Hola Muebles A&B, me interesa cotizar el mueble *${product.name}* (${product.category}) con precio de *${formattedPrice}*. ¿Me podrían brindar detalles de entrega y personalización?`;
    
    if (waNum.startsWith('http')) {
      whatsappBtn.href = `${waNum}${waNum.includes('?') ? '&' : '?'}text=${encodeURIComponent(messageText)}`;
    } else {
      whatsappBtn.href = `https://wa.me/${waNum}?text=${encodeURIComponent(messageText)}`;
    }
  }
  
  openModal(productModal);
}

function renderAdminTable() {
  const tbody = document.getElementById('admin-table-body');
  tbody.innerHTML = '';
  
  products.forEach(p => {
    const tr = document.createElement('tr');
    
    let priceText = '';
    if (p.price !== undefined && p.price !== null) {
      if (p.hasDiscount) {
        const discounted = p.price * (1 - p.discountPercent / 100);
        priceText = `<span style="text-decoration: line-through; color: #999; font-size: 12px;">${formatPrice(p.price)}</span><br><strong style="color: #388e3c;">${formatPrice(discounted)} (${p.discountPercent}%)</strong>`;
      } else {
        priceText = `<strong>${formatPrice(p.price)}</strong>`;
      }
    } else {
      priceText = '-';
    }

    tr.innerHTML = `
      <td><img src="${p.img}" alt="img"></td>
      <td><strong>${p.name}</strong></td>
      <td>${p.category}</td>
      <td>${priceText}</td>
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
        document.getElementById('edit-prod-price').value = p.price !== undefined && p.price !== null ? p.price : '';
        
        const toggle = document.getElementById('edit-prod-discount-toggle');
        toggle.value = p.hasDiscount ? 'Si' : 'No';
        
        const group = document.getElementById('edit-prod-discount-group');
        const percentInput = document.getElementById('edit-prod-discount-percent');
        if (p.hasDiscount) {
          group.style.display = 'block';
          percentInput.value = p.discountPercent || '';
          percentInput.required = true;
        } else {
          group.style.display = 'none';
          percentInput.value = '';
          percentInput.required = false;
        }

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

function renderSocialLinks() {
  const links = getSocialLinks();
  
  // Footer Links
  const fb = document.getElementById('footer-fb');
  const ig = document.getElementById('footer-ig');
  const tw = document.getElementById('footer-tw');
  const wa = document.getElementById('footer-wa');
  
  if (fb) fb.href = links.facebook || "#";
  if (ig) ig.href = links.instagram || "#";
  if (tw) tw.href = links.twitter || "#";
  if (wa) {
    const rawWa = links.whatsapp || "+5215555555555";
    wa.href = rawWa.startsWith('http') ? rawWa : `https://wa.me/${rawWa.replace('+', '')}`;
  }

  // Sidebar Links
  const sFb = document.getElementById('sidebar-fb');
  const sIg = document.getElementById('sidebar-ig');
  const sTw = document.getElementById('sidebar-tw');
  const sWa = document.getElementById('sidebar-wa');
  
  if (sFb) sFb.href = links.facebook || "#";
  if (sIg) sIg.href = links.instagram || "#";
  if (sTw) sTw.href = links.twitter || "#";
  if (sWa) {
    const rawWa = links.whatsapp || "+5215555555555";
    sWa.href = rawWa.startsWith('http') ? rawWa : `https://wa.me/${rawWa.replace('+', '')}`;
  }
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

function showView(viewElement) {
  document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
  viewElement.style.display = 'block';
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

// Cerrar modales con la tecla Esc
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' || e.key === 'Esc') {
    const activeModals = document.querySelectorAll('.modal.active');
    activeModals.forEach(modal => closeModal(modal));
  }
});

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

function renderAdminCategoriesList() {
  const listContainer = document.getElementById('admin-categories-list');
  if (!listContainer) return;

  const categories = getCategories();
  listContainer.innerHTML = '';

  if (categories.length === 0) {
    listContainer.innerHTML = '<p style="color: var(--text-secondary); font-size: 13px; text-align: center; padding: 10px 0;">No hay categorías activas.</p>';
    return;
  }

  categories.forEach(cat => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';
    item.style.padding = '10px 0';
    item.style.borderBottom = '1px solid #eee';

    item.innerHTML = `
      <span style="font-size: 14px; font-weight: 500; color: var(--text-primary);">${cat}</span>
      <div style="display: flex; gap: 0.35rem;">
        <button class="btn btn-outline btn-cat-edit" data-cat="${cat}" style="padding: 4px 8px; font-size: 11px; font-weight: 600;">Editar</button>
        <button class="btn btn-cat-delete" data-cat="${cat}" style="padding: 4px 8px; font-size: 11px; background: #ff4d4d; color: white; font-weight: 600; border-radius: 6px; cursor: pointer; border: none;">Eliminar</button>
      </div>
    `;
    listContainer.appendChild(item);
  });

  // Bind edit events
  document.querySelectorAll('.btn-cat-edit').forEach(btn => {
    btn.addEventListener('click', function() {
      const oldCat = this.dataset.cat;
      const newCat = prompt(`Editar nombre de categoría "${oldCat}":`, oldCat);
      if (newCat === null) return;
      const formatted = newCat.trim();
      if (!formatted || formatted === oldCat) return;

      const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1);
      
      let categories = getCategories();
      if (categories.includes(capitalized)) {
        alert('Ese nombre de categoría ya existe');
        return;
      }

      // Update categories array
      const idx = categories.indexOf(oldCat);
      if (idx !== -1) {
        categories[idx] = capitalized;
        saveCategories(categories);

        // Update existing products category field
        products.forEach(p => {
          if (p.category === oldCat) {
            p.category = capitalized;
          }
        });
        saveProducts(products);

        // Refresh views
        populateCategorySelects();
        renderFilters();
        renderProducts();
        renderAdminCategoriesList();
        showToast('Categoría actualizada', 'success');
      }
    });
  });

  // Bind delete events
  document.querySelectorAll('.btn-cat-delete').forEach(btn => {
    btn.addEventListener('click', function() {
      const catToDelete = this.dataset.cat;
      if (confirm(`¿Estás seguro de eliminar la categoría "${catToDelete}"?\n\nLos productos asociados a esta categoría se mantendrán pero se reasignarán a la categoría "Otros".`)) {
        let categories = getCategories();
        categories = categories.filter(c => c !== catToDelete);
        saveCategories(categories);

        // Update associated products to 'Otros'
        products.forEach(p => {
          if (p.category === catToDelete) {
            p.category = 'Otros';
          }
        });
        
        // Dynamically add 'Otros' to categories list if not present, to ensure they aren't orphaned
        if (products.some(p => p.category === 'Otros') && !categories.includes('Otros')) {
          categories.push('Otros');
          saveCategories(categories);
        }

        saveProducts(products);

        // Refresh views
        populateCategorySelects();
        renderFilters();
        renderProducts();
        renderAdminCategoriesList();
        showToast('Categoría eliminada', 'success');
      }
    });
  });
}

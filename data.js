export const initialProducts = [
  // --- SILLAS ---
  {
    id: 1,
    name: "Silla Noir Premium",
    category: "Silla",
    desc: "Cuero negro mate, costuras hechas a mano. Minimalismo absoluto.",
    img: "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=600",
    stars: 4.8,
    reviews: 12
  },
  {
    id: 2,
    name: "Silla Accent Oliva",
    category: "Silla",
    desc: "Tapizado en terciopelo verde oliva con patas de acero negro.",
    img: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=600",
    stars: 4.5,
    reviews: 8
  },
  {
    id: 3,
    name: "Taburete Minimal",
    category: "Silla",
    desc: "Madera maciza de fresno en tono claro.",
    img: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=600",
    stars: 4.0,
    reviews: 5
  },
  {
    id: 4,
    name: "Sillón Lounge Earth",
    category: "Silla",
    desc: "Ergonomía perfecta y diseño envolvente para descanso.",
    img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600",
    stars: 5.0,
    reviews: 24
  },
  // --- MESAS ---
  {
    id: 5,
    name: "Mesa Comedor Oakhill",
    category: "Mesa",
    desc: "Roble natural y espacio amplio para 6 personas. Diseño de líneas rectas.",
    img: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=600",
    stars: 4.9,
    reviews: 15
  },
  {
    id: 6,
    name: "Mesa de Centro Glass",
    category: "Mesa",
    desc: "Cristal templado y estructura negra. Invisible pero elegante.",
    img: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=600",
    stars: 4.2,
    reviews: 9
  },
  {
    id: 7,
    name: "Escritorio Studio",
    category: "Mesa",
    desc: "Para el minimalista digital. Superficie mate anti-huellas.",
    img: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=600",
    stars: 4.7,
    reviews: 31
  },
  {
    id: 8,
    name: "Mesa Auxiliar Círculo",
    category: "Mesa",
    desc: "Pequeña, funcional y en un vibrante verde oscuro.",
    img: "https://images.unsplash.com/photo-1499933374294-4584851497cc?auto=format&fit=crop&q=80&w=600",
    stars: 4.1,
    reviews: 4
  },
  // --- BURÓS ---
  {
    id: 9,
    name: "Buró Nocturne",
    category: "Buró",
    desc: "Un cajón invisible, acabado en negro carbón.",
    img: "https://images.unsplash.com/photo-1532372576444-dda954194ad0?auto=format&fit=crop&q=80&w=600",
    stars: 4.6,
    reviews: 18
  },
  {
    id: 10,
    name: "Buró Suspendido",
    category: "Buró",
    desc: "Se ancla a la pared dando la ilusión de flotar. Madera clara.",
    img: "https://images.unsplash.com/photo-1595514535415-eb1025ce252d?auto=format&fit=crop&q=80&w=600",
    stars: 4.8,
    reviews: 11
  },
  {
    id: 11,
    name: "Buró Doble Minimal",
    category: "Buró",
    desc: "Doble espacio de almacenamiento, líneas horizontales puras.",
    img: "https://images.unsplash.com/photo-1540932239986-30128078f3b5?auto=format&fit=crop&q=80&w=600",
    stars: 4.3,
    reviews: 7
  },
  {
    id: 12,
    name: "Buró Edge Metálico",
    category: "Buró",
    desc: "Acero mate resistente y frío. Estilo industrial-minimalista.",
    img: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=600",
    stars: 4.0,
    reviews: 3
  },
  // --- CAMAS ---
  {
    id: 13,
    name: "Cama Base Zen",
    category: "Cama",
    desc: "Plataforma ultra baja. Inspirada en la serenidad oriental.",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600",
    stars: 4.9,
    reviews: 42
  },
  {
    id: 14,
    name: "Cama Velvet Oliva",
    category: "Cama",
    desc: "Cabecera acolchada en terciopelo verde. Majestuosa.",
    img: "https://images.unsplash.com/photo-1536882240095-0379873feb4e?auto=format&fit=crop&q=80&w=600",
    stars: 4.7,
    reviews: 28
  },
  {
    id: 15,
    name: "Cama Cloud",
    category: "Cama",
    desc: "Bordes curvos y estructura blanca inmaculada.",
    img: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=600",
    stars: 4.5,
    reviews: 19
  }
];

export function getProducts() {
  const stored = localStorage.getItem('gkorp_products');
  if (stored) {
    return JSON.parse(stored);
  }
  saveProducts(initialProducts);
  return initialProducts;
}

export function saveProducts(products) {
  localStorage.setItem('gkorp_products', JSON.stringify(products));
}

// Variables globales de usuario
export function getCurrentUser() {
  return localStorage.getItem('gkorp_user');
}

export function setCurrentUser(username) {
  if (username) {
    localStorage.setItem('gkorp_user', username);
  } else {
    localStorage.removeItem('gkorp_user');
  }
}

export function getIsAdmin() {
  return localStorage.getItem('gkorp_is_admin') === 'true';
}

export function setIsAdmin(isAdmin) {
  if (isAdmin) {
    localStorage.setItem('gkorp_is_admin', 'true');
  } else {
    localStorage.removeItem('gkorp_is_admin');
  }
}

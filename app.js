/* =============================================
   SPOTIVI! — Main Premium Application Logic
   ============================================= */

// ─── STATE MANAGEMENT ───────────────────────────
const State = {
  currentUser: null,
  currentPage: 'login',
  designs: JSON.parse(localStorage.getItem('spotivi_designs') || '[]'),
  activeDesignId: null,
  canvas: null,
  zoom: 1,
  history: [],
  historyIndex: -1,
  isSaving: false,
};

// ─── MOCK USERS DATABASE ─────────────────────────
const USERS_KEY = 'spotivi_users';
function getUsers() { 
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); 
}
function saveUsers(users) { 
  localStorage.setItem(USERS_KEY, JSON.stringify(users)); 
}

// ─── PREMIUM TEMPLATES DATA ──────────────────────
const TEMPLATES = [
  { id: 't1', name: 'Luxury Gold Banner', category: 'Banner', width: 1200, height: 630,
    bg: 'linear-gradient(135deg,#0d0d11,#1a1a24,#0d0d11)', accent: '#fbbf24', icon: '✨', badge: 'purple',
    desc: 'Spanduk modern dengan aksen emas berkelas.' },
  { id: 't2', name: 'Cyberpunk Presentation', category: 'Presentasi', width: 1920, height: 1080,
    bg: 'linear-gradient(135deg,#09090e,#1e1b4b,#09090e)', accent: '#ec4899', icon: '📊', badge: 'pink',
    desc: 'Slide presentasi bernuansa futuristik.' },
  { id: 't3', name: 'Neon Party Poster', category: 'Poster', width: 800, height: 1200,
    bg: 'linear-gradient(135deg,#050508,#1e0030)', accent: '#d946ef', icon: '🎨', badge: 'pink',
    desc: 'Poster A4 untuk publikasi acara & musik.' },
  { id: 't4', name: 'Minimalist Logo Studio', category: 'Logo', width: 800, height: 800,
    bg: 'linear-gradient(135deg,#111827,#1f2937)', accent: '#10b981', icon: '💎', badge: 'green',
    desc: 'Desain logo minimalis untuk agensi.' },
  { id: 't5', name: 'Instagram Story Clean', category: 'Social Media', width: 1080, height: 1920,
    bg: 'linear-gradient(135deg,#fbcfe8,#f472b6)', accent: '#db2777', icon: '📸', badge: 'purple',
    desc: 'Tata letak story estetik bergaya visual cerah.' },
  { id: 't6', name: 'Creative Flyer', category: 'Flyer', width: 794, height: 1123,
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)', accent: '#3b82f6', icon: '📅', badge: 'cyan',
    desc: 'Pamflet promosi bisnis bertema modern.' },
  { id: 't7', name: 'YouTube Tech Thumbnail', category: 'YouTube', width: 1280, height: 720,
    bg: 'linear-gradient(135deg,#1e1b4b,#311042)', accent: '#8b5cf6', icon: '▶️', badge: 'purple',
    desc: 'Thumbnail YouTube berdaya tarik tinggi.' },
  { id: 't8', name: 'Exclusive Wedding Card', category: 'Undangan', width: 800, height: 1200,
    bg: 'linear-gradient(135deg,#1c1917,#44403c)', accent: '#fbbf24', icon: '💍', badge: 'gold',
    desc: 'Undangan eksklusif bertema hitam keemasan.' },
  { id: 't9', name: 'Professional Resume', category: 'Dokumen', width: 794, height: 1123,
    bg: 'linear-gradient(135deg,#f4f4f5,#ffffff)', accent: '#0f172a', icon: '📄', badge: 'cyan',
    desc: 'Template resume portofolio bersih dan elegan.' },
  { id: 't10', name: 'Business Card Obsidian', category: 'Kartu Nama', width: 1050, height: 600,
    bg: 'linear-gradient(135deg,#040406,#121217)', accent: '#a78bfa', icon: '💼', badge: 'purple',
    desc: 'Kartu nama premium bergaya gelap minimalis.' },
  { id: 't11', name: 'Spring Sale Banner', category: 'Banner', width: 1200, height: 628,
    bg: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', accent: '#059669', icon: '🏷️', badge: 'green',
    desc: 'Banner diskon bertema segar dedaunan.' },
  { id: 't12', name: 'Inspiring Quote Post', category: 'Social Media', width: 1080, height: 1080,
    bg: 'linear-gradient(135deg,#312e81,#4c1d95)', accent: '#c084fc', icon: '✨', badge: 'pink',
    desc: 'Postingan Instagram berbentuk kutipan inspiratif.' },
];

const CATEGORIES = ['Semua', 'Social Media', 'Presentasi', 'Poster', 'Flyer', 'Logo', 'Banner', 'YouTube', 'Kartu Nama', 'Undangan', 'Dokumen'];

// ─── PREMIUM SVG ICONS DATABASE ──────────────────
// Custom clean vector paths (Lucide style) for canvas insertion
const SVG_ICONS = {
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  sparkles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/><path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z"/><path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"/></svg>`,
  coffee: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>`,
  music: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  leaf: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 2 5.5a7 7 0 0 1-7 7h-3"/></svg>`,
  flame: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  message: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  crown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/></svg>`,
  gift: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 8V22"/><path d="M3 12h18"/><path d="M12 8a3 3 0 1 0-3-3h3Zm0 0a3 3 0 1 1 3-3h-3Z"/></svg>`,
  sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
  award: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
  compass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
  trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/><path d="M12 2a6 6 0 0 1 6 6v3.5c0 3.3-2.7 6-6 6s-6-2.7-6-6V8a6 6 0 0 1 6-6Z"/></svg>`,
};

// ─── ROUTER SYSTEM ───────────────────────────────
function navigate(page, params = {}) {
  // Hide dropdown first
  closeDropdown();
  
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (el) { 
    el.classList.add('active'); 
    State.currentPage = page; 
  }
  
  if (page === 'home') renderHome();
  if (page === 'search') renderSearch(params.query || '');
  if (page === 'editor') initEditor(params.templateId, params.designId);
  
  window.scrollTo(0, 0);
}

// ─── AUTHENTICATION HELPERS ───────────────────────
function hashPass(password) {
  let hash = 0; 
  for (let i = 0; i < password.length; i++) {
    hash = (Math.imul(31, hash) + password.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}

function setSession(user) {
  State.currentUser = user;
  localStorage.setItem('spotivi_session', JSON.stringify(user));
}

function clearSession() {
  State.currentUser = null;
  localStorage.removeItem('spotivi_session');
}

function loadSession() {
  const session = localStorage.getItem('spotivi_session');
  if (session) { 
    State.currentUser = JSON.parse(session); 
    return true; 
  }
  return false;
}

// ─── MAIN APP RENDERING ───────────────────────────
function renderApp() {
  const container = document.getElementById('app');
  if (!container) return;

  container.innerHTML = `
    <!-- Decorative Grid Dot Overlay -->
    <div class="bg-grid-overlay"></div>

    <!-- LOGIN / REGISTER PAGE -->
    <div class="page ${!State.currentUser ? 'active' : ''}" id="page-login">
      <div class="blur-blob blob-violet"></div>
      <div class="blur-blob blob-pink"></div>
      <div class="blur-blob blob-gold"></div>
      
      <div class="login-card">
        <div class="login-logo">
          <div class="login-logo-icon">🚀</div>
          <span>spotivi!</span>
        </div>
        <h1 class="login-title" id="auth-title">Welcome Back</h1>
        <p class="login-subtitle" id="auth-subtitle">Masuk untuk memulai mendesain dengan kreativitas tanpa batas</p>

        <div id="login-error" class="error-msg"></div>

        <button class="btn btn-google btn-lg" id="btn-google-login" onclick="loginWithGoogle()" style="width:100%;">
          <svg width="20" height="20" viewBox="0 0 48 48" style="margin-right:10px;">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Lanjutkan dengan Google
        </button>

        <div class="divider">
          <div class="divider-line"></div>
          <span class="divider-text">atau email</span>
          <div class="divider-line"></div>
        </div>

        <div id="login-form-area">
          <div class="login-form">
            <div class="input-group">
              <label for="login-email">Alamat Email</label>
              <input class="input" id="login-email" type="email" placeholder="nama@email.com" />
            </div>
            <div class="input-group">
              <label for="login-pass">Kata Sandi</label>
              <input class="input" id="login-pass" type="password" placeholder="••••••••" onkeydown="if(event.key==='Enter')doLogin()" />
            </div>
            <button class="btn btn-primary btn-lg" onclick="doLogin()" style="width:100%;margin-top:10px;">
              Sign In
            </button>
          </div>
          <div class="login-footer">
            Belum terdaftar? <a href="#" onclick="showRegister(); return false;">Buat akun gratis</a>
          </div>
        </div>

        <div id="register-form-area" style="display:none;">
          <div class="login-form">
            <div class="input-group">
              <label for="reg-name">Nama Lengkap</label>
              <input class="input" id="reg-name" type="text" placeholder="Nama Lengkap Anda" />
            </div>
            <div class="input-group">
              <label for="reg-email">Alamat Email</label>
              <input class="input" id="reg-email" type="email" placeholder="nama@email.com" />
            </div>
            <div class="input-group">
              <label for="reg-pass">Buat Kata Sandi</label>
              <input class="input" id="reg-pass" type="password" placeholder="Minimal 6 karakter" onkeydown="if(event.key==='Enter')doRegister()" />
            </div>
            <button class="btn btn-gold btn-lg" onclick="doRegister()" style="width:100%;margin-top:10px;">
              Daftar & Mulai
            </button>
          </div>
          <div class="login-footer">
            Sudah memiliki akun? <a href="#" onclick="showLogin(); return false;">Masuk di sini</a>
          </div>
        </div>
      </div>
    </div>

    <!-- HOME PAGE -->
    <div class="page ${State.currentUser ? 'active' : ''}" id="page-home">
      ${renderNavbar()}
      <div class="home-content" id="home-body"></div>
    </div>

    <!-- SEARCH PAGE -->
    <div class="page" id="page-search">
      ${renderNavbar()}
      <div class="search-content" id="search-body"></div>
    </div>

    <!-- EDITOR WORKSPACE -->
    <div class="page" id="page-editor">
      ${renderEditorWorkspace()}
    </div>

    <!-- TOAST CONTAINER -->
    <div class="toast-container" id="toast-container"></div>

    <!-- FLOATING USER DROPDOWN -->
    <div class="user-dropdown" id="user-dropdown">
      <div class="dropdown-header">
        <div class="dropdown-name" id="dd-name">—</div>
        <div class="dropdown-email" id="dd-email">—</div>
      </div>
      <button class="dropdown-item" onclick="navigate('home')">🏠 &nbsp;Beranda Utama</button>
      <div class="dropdown-divider"></div>
      <button class="dropdown-item" onclick="switchAccount()">🔄 &nbsp;Ganti Akun Lain</button>
      <button class="dropdown-item danger" onclick="logout()">🚪 &nbsp;Keluar Sesi</button>
    </div>

    <!-- MODAL NEW CANVAS -->
    <div class="modal-overlay" id="modal-new">
      <div class="modal-box">
        <h2 class="modal-title">✨ Kreasikan Kanvas Baru</h2>
        <p class="modal-desc">Pilih rasio dimensi ideal atau mulai lembar kerja kustom</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px;">
          ${[
            { label: 'Instagram Square', w: 1080, h: 1080, icon: '📸' },
            { label: 'Presentasi HD 16:9', w: 1920, h: 1080, icon: '📊' },
            { label: 'Dokumen Poster A4', w: 794, h: 1123, icon: '📄' },
            { label: 'Kanvas Kustom Bebas', w: 800, h: 600, icon: '✏️' },
          ].map(s => `
            <button class="btn btn-secondary" style="height:auto;flex-direction:column;padding:20px;gap:8px;"
              onclick="createBlankDesign(${s.w},${s.h},'${s.label}')">
              <span style="font-size:28px;">${s.icon}</span>
              <span style="font-size:13px;font-weight:700;">${s.label}</span>
              <span style="font-size:11px;color:var(--text-muted);">${s.w} × ${s.h} px</span>
            </button>
          `).join('')}
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="closeModal('modal-new')">Batal</button>
        </div>
      </div>
    </div>
  `;

  // Bind Enter event for Navbar search
  setTimeout(() => {
    const nInput = document.getElementById('navbar-search-input');
    if (nInput) {
      nInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && nInput.value.trim()) {
          navigate('search', { query: nInput.value.trim() });
        }
      });
    }
    updateDropdownInfo();
  }, 100);
}

// ─── NAVIGATION BAR ──────────────────────────────
function renderNavbar() {
  return `
    <nav class="navbar">
      <a class="navbar-logo" href="#" onclick="navigate('home'); return false;">
        <div class="navbar-logo-icon">🚀</div>
        <span>spotivi!</span>
      </a>
      <div class="navbar-search">
        <span class="search-icon">🔍</span>
        <input id="navbar-search-input" placeholder="Cari template premium, poster, flyer..." />
      </div>
      <div class="navbar-actions">
        <button class="navbar-new-btn" onclick="openModal('modal-new')">
          <span>+</span> Kanvas Baru
        </button>
        <div style="position:relative;">
          <div class="user-avatar-btn" id="avatar-btn" onclick="toggleDropdown()">
            <span id="avatar-initial">?</span>
          </div>
        </div>
      </div>
    </nav>
  `;
}

// ─── HOME COMPONENT ──────────────────────────────
function renderHome() {
  const body = document.getElementById('home-body');
  if (!body) return;

  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 19 ? 'Selamat Sore' : 'Selamat Malam';
  const name = State.currentUser?.name?.split(' ')[0] || 'Kreator';

  // Filter recent designs for active user
  const userDesigns = State.designs
    .filter(d => d.userId === State.currentUser?.id)
    .slice(-4)
    .reverse();

  body.innerHTML = `
    <div class="hero-section">
      <h1 class="hero-greeting">${greeting}, <span>${name}!</span> 🌟</h1>
      <p class="hero-subtitle">Mulai rancang mahakarya visual Anda hari ini.</p>
    </div>

    <!-- Quick action shortcuts -->
    <div class="quick-actions">
      ${[
        { icon: '📸', label: 'Social Media' },
        { icon: '📊', label: 'Presentasi' },
        { icon: '🎨', label: 'Poster' },
        { icon: '📅', label: 'Flyer' },
        { icon: '💎', label: 'Logo' },
        { icon: '🏷️', label: 'Banner' },
      ].map(q => `
        <div class="quick-card" onclick="searchCategory('${q.label}')">
          <div class="quick-card-icon">${q.icon}</div>
          <div class="quick-card-label">${q.label}</div>
        </div>
      `).join('')}
    </div>

    <!-- User's Recent Work -->
    ${userDesigns.length > 0 ? `
    <div class="section-header">
      <h2 class="section-title">📂 Desain Anda</h2>
      <span class="section-link" onclick="navigate('search')">Lihat Semua</span>
    </div>
    <div class="template-grid">
      ${userDesigns.map(d => renderDesignCard(d)).join('')}
    </div>` : ''}

    <!-- Popular Premium Templates -->
    <div class="section-header">
      <h2 class="section-title">✨ Pilihan Template Premium</h2>
      <span class="section-link" onclick="navigate('search')">Jelajahi Semua</span>
    </div>

    <div class="category-tabs" id="home-category-tabs">
      ${CATEGORIES.map((c, i) => `
        <button class="cat-tab ${i === 0 ? 'active' : ''}" onclick="filterHomeTemplates('${c}', this)">${c}</button>
      `).join('')}
    </div>

    <div class="template-grid" id="home-templates-grid">
      ${TEMPLATES.map(t => renderTemplateCard(t)).join('')}
    </div>
  `;

  updateAvatarInitial();
}

function renderTemplateCard(t) {
  return `
    <div class="template-card" onclick="navigate('editor', { templateId: '${t.id}' })">
      <div class="template-thumb" style="background:${t.bg};">
        <div style="font-size:52px;filter:drop-shadow(0 8px 16px rgba(0,0,0,0.4));">${t.icon}</div>
        <div class="template-thumb-overlay">
          <button class="btn btn-gold btn-sm">Gunakan Template</button>
        </div>
      </div>
      <div class="template-info">
        <div class="template-name">${t.name}</div>
        <div style="display:flex;align-items:center;justify-content:between;">
          <span class="badge badge-${t.badge}">${t.category}</span>
          <span style="font-size:11px;color:var(--text-muted);margin-left:auto;">${t.width}×${t.height}</span>
        </div>
      </div>
    </div>
  `;
}

function renderDesignCard(d) {
  return `
    <div class="template-card" onclick="openDesign('${d.id}')">
      <div class="template-thumb" style="background:${d.bg || 'var(--bg-card)'};">
        <div style="font-size:44px;">🖼️</div>
        <div class="template-thumb-overlay">
          <button class="btn btn-primary btn-sm">Buka Lembar Kerja</button>
        </div>
      </div>
      <div class="template-info">
        <div class="template-name">${d.name}</div>
        <div style="display:flex;align-items:center;justify-content:between;font-size:11px;color:var(--text-secondary);">
          <span>Kustom Kanvas</span>
          <span style="margin-left:auto;">${new Date(d.updatedAt).toLocaleDateString('id-ID')}</span>
        </div>
      </div>
    </div>
  `;
}

function filterHomeTemplates(cat, btn) {
  document.querySelectorAll('#home-category-tabs .cat-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const grid = document.getElementById('home-templates-grid');
  if (!grid) return;

  const filtered = cat === 'Semua' ? TEMPLATES : TEMPLATES.filter(t => t.category === cat);
  
  if (filtered.length > 0) {
    grid.innerHTML = filtered.map(t => renderTemplateCard(t)).join('');
  } else {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-icon">🔍</div>
        <h3>Belum Ada Template</h3>
        <p>Template premium untuk kategori ini akan segera hadir.</p>
      </div>
    `;
  }
}

function searchCategory(cat) {
  navigate('search', { query: cat });
}

// ─── SEARCH ENGINE COMPONENT ──────────────────────
let currentSearchQuery = '';
let currentSearchCategory = 'Semua';

function renderSearch(query = '') {
  currentSearchQuery = query;
  currentSearchCategory = 'Semua';

  const body = document.getElementById('search-body');
  if (!body) return;

  body.innerHTML = `
    <div class="search-hero">
      <h1>🔍 Cari Ide Kreatif Anda</h1>
      <div class="search-bar-large">
        <span class="si">🔍</span>
        <input id="search-input-large" placeholder="Cari poster, logo, presentasi..." value="${query}"
          oninput="performLiveSearch(this.value)" />
      </div>
    </div>

    <div class="category-tabs" id="search-category-tabs">
      ${CATEGORIES.map((c, i) => `
        <button class="cat-tab ${i === 0 ? 'active' : ''}" onclick="filterSearchByCategory('${c}', this)">${c}</button>
      `).join('')}
    </div>

    <div id="search-results-count" style="color:var(--text-secondary);font-size:13px;font-weight:600;margin-bottom:20px;"></div>
    <div class="template-grid" id="search-results-grid"></div>
  `;

  executeSearch();
  updateAvatarInitial();

  // Keep navbar input synced
  const navSearch = document.getElementById('navbar-search-input');
  if (navSearch) navSearch.value = query;
}

function executeSearch() {
  const queryLower = currentSearchQuery.toLowerCase();
  let results = TEMPLATES;

  if (currentSearchCategory !== 'Semua') {
    results = results.filter(t => t.category === currentSearchCategory);
  }

  if (queryLower) {
    results = results.filter(t => 
      t.name.toLowerCase().includes(queryLower) || 
      t.category.toLowerCase().includes(queryLower)
    );
  }

  const grid = document.getElementById('search-results-grid');
  const countLabel = document.getElementById('search-results-count');

  if (countLabel) {
    countLabel.textContent = `${results.length} template premium ditemukan`;
  }

  if (!grid) return;

  if (results.length > 0) {
    grid.innerHTML = results.map(t => renderTemplateCard(t)).join('');
  } else {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-icon">😕</div>
        <h3>Tidak Ada Hasil Ditemukan</h3>
        <p>Coba gunakan kata kunci pencarian yang berbeda atau reset kategori.</p>
      </div>
    `;
  }
}

function performLiveSearch(value) {
  currentSearchQuery = value;
  executeSearch();
}

function filterSearchByCategory(cat, btn) {
  document.querySelectorAll('#search-category-tabs .cat-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentSearchCategory = cat;
  executeSearch();
}

// ─── EDITOR SHELL & LAYOUT ─────────────────────────
function renderEditorWorkspace() {
  return `
    <div class="editor-topbar">
      <button class="btn btn-secondary btn-sm" onclick="navigate('home')" title="Kembali ke Beranda">← Beranda</button>
      <div style="width:1px;height:24px;background:var(--border);"></div>
      <input class="editor-title-input" id="design-title" value="Desain Premium Tanpa Judul" />
      
      <div class="editor-tools">
        <button class="editor-tool-btn" title="Urungkan (Undo)" onclick="editorUndo()">↩</button>
        <button class="editor-tool-btn" title="Ulangi (Redo)" onclick="editorRedo()">↪</button>
        
        <div style="width:1px;height:24px;background:var(--border);margin:0 4px;"></div>
        
        <button class="editor-tool-btn" title="Perkecil Zoom" onclick="editorZoom(-0.1)">−</button>
        <span id="zoom-label" style="font-size:12px;font-weight:700;color:var(--text-secondary);min-width:40px;text-align:center;">100%</span>
        <button class="editor-tool-btn" title="Perbesar Zoom" onclick="editorZoom(0.1)">+</button>
        
        <div style="width:1px;height:24px;background:var(--border);margin:0 4px;"></div>
        
        <button class="btn btn-secondary btn-sm" onclick="exportPNG()">⬇ Export PNG</button>
        <button class="btn btn-gold btn-sm" onclick="saveDesign()">💾 Simpan</button>
      </div>
    </div>

    <div class="editor-body">
      <!-- LEFT SIDEBAR CONTROL -->
      <div class="editor-sidebar-left">
        <button class="sidebar-icon-btn active" id="sb-templates" onclick="openPanel('templates', this)">
          <span>📐</span>
          <span class="label">Template</span>
        </button>
        <button class="sidebar-icon-btn" id="sb-elements" onclick="openPanel('elements', this)">
          <span>⬛</span>
          <span class="label">Elemen</span>
        </button>
        <button class="sidebar-icon-btn" id="sb-text" onclick="openPanel('text', this)">
          <span>T</span>
          <span class="label">Teks</span>
        </button>
        <button class="sidebar-icon-btn" id="sb-bg" onclick="openPanel('bg', this)">
          <span>🎨</span>
          <span class="label">BG Warna</span>
        </button>
        <button class="sidebar-icon-btn" id="sb-upload" onclick="openPanel('upload', this)">
          <span>⬆</span>
          <span class="label">Upload</span>
        </button>
      </div>

      <!-- LEFT SLIDING CONSOLE -->
      <div class="editor-panel-left open" id="editor-panel-left">
        <div class="panel-content" id="panel-content">
          <!-- Dynamically populated by openPanel() -->
        </div>
      </div>

      <!-- CANVAS DRAWING AREA -->
      <div class="editor-canvas-area" id="canvas-area">
        <div class="canvas-wrapper" id="canvas-wrapper">
          <canvas id="design-canvas"></canvas>
        </div>
      </div>

      <!-- RIGHT SIDEBAR PROPERTIES -->
      <div class="editor-sidebar-right">
        <!-- Canvas Props -->
        <div class="prop-section">
          <div class="prop-title">Dimensi Kanvas</div>
          <div class="prop-row">
            <span class="prop-label">Lebar (px)</span>
            <input class="prop-input" id="prop-canvas-w" type="number" onchange="resizeCanvasDimension()" />
          </div>
          <div class="prop-row">
            <span class="prop-label">Tinggi (px)</span>
            <input class="prop-input" id="prop-canvas-h" type="number" onchange="resizeCanvasDimension()" />
          </div>
        </div>

        <!-- Object Selected Props (Hidden by default) -->
        <div class="prop-section" id="object-properties-panel" style="display:none;">
          <div class="prop-title">Properti Objek</div>
          <div class="prop-row">
            <span class="prop-label">Posisi X</span>
            <input class="prop-input" id="prop-obj-x" type="number" onchange="updateSelectedObjProp('left', this.value)" />
          </div>
          <div class="prop-row">
            <span class="prop-label">Posisi Y</span>
            <input class="prop-input" id="prop-obj-y" type="number" onchange="updateSelectedObjProp('top', this.value)" />
          </div>
          <div class="prop-row">
            <span class="prop-label">Lebar</span>
            <input class="prop-input" id="prop-obj-w" type="number" onchange="updateSelectedObjProp('scaleX', this.value)" />
          </div>
          <div class="prop-row">
            <span class="prop-label">Tinggi</span>
            <input class="prop-input" id="prop-obj-h" type="number" onchange="updateSelectedObjProp('scaleY', this.value)" />
          </div>
          <div class="prop-row">
            <span class="prop-label">Opasitas (%)</span>
            <input class="prop-input" id="prop-obj-opacity" type="number" min="0" max="100" onchange="updateSelectedObjProp('opacity', this.value / 100)" />
          </div>
          <div class="prop-row" id="color-prop-row">
            <span class="prop-label">Pilihan Warna</span>
            <div class="color-swatch" id="obj-color-swatch">
              <input type="color" id="prop-obj-color" onchange="updateSelectedObjColor(this.value)" />
            </div>
          </div>
          <button class="btn btn-danger btn-sm" style="width:100%;margin-top:14px;justify-content:center;" onclick="deleteSelectedObject()">
            🗑️ Hapus Objek
          </button>
        </div>
      </div>
    </div>
  `;
}

// ─── EDITOR LOGIC & FABRIC.JS INTEGRATION ─────────
let fabricCanvasInstance = null;
let activeDesignWidth = 800;
let activeDesignHeight = 600;

function initEditor(templateId, designId) {
  setTimeout(() => {
    const tmpl = templateId ? TEMPLATES.find(t => t.id === templateId) : null;
    const design = designId ? State.designs.find(d => d.id === designId) : null;

    activeDesignWidth = tmpl?.width || design?.width || 800;
    activeDesignHeight = tmpl?.height || design?.height || 600;

    const titleInput = document.getElementById('design-title');
    if (titleInput) {
      titleInput.value = tmpl?.name || design?.name || 'Desain Premium Baru';
    }

    const cWidth = document.getElementById('prop-canvas-w');
    const cHeight = document.getElementById('prop-canvas-h');
    if (cWidth) cWidth.value = activeDesignWidth;
    if (cHeight) cHeight.value = activeDesignHeight;

    // Reset fabric instance if exists
    if (fabricCanvasInstance) {
      fabricCanvasInstance.dispose();
      fabricCanvasInstance = null;
    }

    const scale = getCanvasFitScale(activeDesignWidth, activeDesignHeight);
    const wrapper = document.getElementById('canvas-wrapper');
    if (wrapper) {
      wrapper.style.width = (activeDesignWidth * scale) + 'px';
      wrapper.style.height = (activeDesignHeight * scale) + 'px';
    }

    fabricCanvasInstance = new fabric.Canvas('design-canvas', {
      width: activeDesignWidth * scale,
      height: activeDesignHeight * scale,
      backgroundColor: '#111116',
    });

    State.canvas = fabricCanvasInstance;
    State.zoom = scale;
    updateZoomPercentageLabel();

    // Check if new template or pre-loaded design
    if (tmpl) {
      applyTemplateGradientBg(tmpl.bg, activeDesignWidth * scale, activeDesignHeight * scale);
      
      // Welcome template text
      const heading = new fabric.IText(tmpl.name, {
        left: (activeDesignWidth * scale) / 2,
        top: (activeDesignHeight * scale) / 2,
        originX: 'center',
        originY: 'center',
        fontSize: Math.round(activeDesignWidth * scale * 0.06),
        fill: tmpl.accent || '#ffffff',
        fontFamily: 'Outfit',
        fontWeight: '800',
        shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: 15, offsetX: 0, offsetY: 4 })
      });
      fabricCanvasInstance.add(heading);
    } else if (design && design.json) {
      fabricCanvasInstance.loadFromJSON(design.json, () => {
        fabricCanvasInstance.renderAll();
      });
    } else {
      // Default clean design layout
      fabricCanvasInstance.backgroundColor = '#181824';
      const text = new fabric.IText('Desain spotivi! Anda', {
        left: (activeDesignWidth * scale) / 2,
        top: (activeDesignHeight * scale) / 2,
        originX: 'center',
        originY: 'center',
        fontSize: 32,
        fill: '#fbbf24',
        fontFamily: 'Outfit',
        fontWeight: '700'
      });
      fabricCanvasInstance.add(text);
    }

    // Fabric canvas change events
    fabricCanvasInstance.on('selection:created', onCanvasSelectionEvent);
    fabricCanvasInstance.on('selection:updated', onCanvasSelectionEvent);
    fabricCanvasInstance.on('selection:cleared', () => {
      const panel = document.getElementById('object-properties-panel');
      if (panel) panel.style.display = 'none';
    });
    fabricCanvasInstance.on('object:modified', () => pushHistoryState());

    fabricCanvasInstance.renderAll();
    
    // Clear history logs for fresh edit session
    State.history = [];
    State.historyIndex = -1;
    pushHistoryState();

    // Default left panel category open
    openPanel('templates', document.getElementById('sb-templates'));
  }, 150);
}

function getCanvasFitScale(w, h) {
  const container = document.getElementById('canvas-area');
  if (!container) return 0.65;
  const targetW = (container.clientWidth || 800) - 90;
  const targetH = (container.clientHeight || 600) - 90;
  return Math.min(1, targetW / w, targetH / h);
}

function applyTemplateGradientBg(gradString, w, h) {
  if (!fabricCanvasInstance) return;
  
  // Custom parsing for multi-stop CSS gradient strings
  const hexColors = gradString.match(/#[0-9a-fA-F]{3,6}/g) || ['#030303', '#111116'];
  const grad = new fabric.Gradient({
    type: 'linear',
    coords: { x1: 0, y1: 0, x2: w, y2: h },
    colorStops: hexColors.map((col, idx) => ({
      offset: idx / (hexColors.length - 1),
      color: col
    }))
  });

  const bgRect = new fabric.Rect({
    width: w,
    height: h,
    left: 0,
    top: 0,
    fill: grad,
    selectable: false,
    evented: false,
    name: '__spotivi_bg__'
  });

  // Remove existing backgrounds first
  removeCanvasBg();
  fabricCanvasInstance.backgroundColor = '';
  fabricCanvasInstance.insertAt(bgRect, 0);
  fabricCanvasInstance.renderAll();
}

function removeCanvasBg() {
  if (!fabricCanvasInstance) return;
  const bg = fabricCanvasInstance.getObjects().find(o => o.name === '__spotivi_bg__');
  if (bg) fabricCanvasInstance.remove(bg);
  clearBackgroundPreset();
}

function clearBackgroundPreset() {
  if (!fabricCanvasInstance) return;
  const objects = [...fabricCanvasInstance.getObjects()];
  objects.forEach(o => {
    if (o.name && o.name.startsWith('__preset_bg_')) {
      fabricCanvasInstance.remove(o);
    }
  });
}

function insertBgObject(obj) {
  if (!fabricCanvasInstance) return;
  obj.set({
    selectable: false,
    evented: false,
    hoverCursor: 'default',
    moveCursor: 'default'
  });
  const bgIndex = fabricCanvasInstance.getObjects().findIndex(o => o.name === '__spotivi_bg__');
  if (bgIndex >= 0) {
    fabricCanvasInstance.insertAt(obj, bgIndex + 1);
  } else {
    fabricCanvasInstance.insertAt(obj, 0);
  }
}

function applyBackgroundTemplatePreset(presetId) {
  if (!fabricCanvasInstance) return;
  
  // Clear any existing preset elements
  clearBackgroundPreset();
  
  const W = fabricCanvasInstance.width;
  const H = fabricCanvasInstance.height;
  
  if (presetId === 'cyberpunk') {
    // Base Background Gradient
    applyTemplateGradientBg('linear-gradient(135deg,#030208,#090515)', W, H);
    
    // Radial glow 1 (neon pink)
    const neonPinkGlow = new fabric.Circle({
      left: W * 0.25,
      top: H * 0.3,
      radius: Math.max(W, H) * 0.35,
      originX: 'center',
      originY: 'center',
      fill: new fabric.Gradient({
        type: 'radial',
        coords: { r1: 0, r2: Math.max(W, H) * 0.35, x1: Math.max(W, H) * 0.35, y1: Math.max(W, H) * 0.35, x2: Math.max(W, H) * 0.35, y2: Math.max(W, H) * 0.35 },
        colorStops: [
          { offset: 0, color: 'rgba(217, 70, 239, 0.22)' },
          { offset: 1, color: 'rgba(217, 70, 239, 0)' }
        ]
      }),
      name: '__preset_bg_glow1'
    });
    insertBgObject(neonPinkGlow);
    
    // Radial glow 2 (neon violet)
    const neonVioletGlow = new fabric.Circle({
      left: W * 0.75,
      top: H * 0.7,
      radius: Math.max(W, H) * 0.4,
      originX: 'center',
      originY: 'center',
      fill: new fabric.Gradient({
        type: 'radial',
        coords: { r1: 0, r2: Math.max(W, H) * 0.4, x1: Math.max(W, H) * 0.4, y1: Math.max(W, H) * 0.4, x2: Math.max(W, H) * 0.4, y2: Math.max(W, H) * 0.4 },
        colorStops: [
          { offset: 0, color: 'rgba(139, 92, 246, 0.18)' },
          { offset: 1, color: 'rgba(139, 92, 246, 0)' }
        ]
      }),
      name: '__preset_bg_glow2'
    });
    insertBgObject(neonVioletGlow);
    
    // Grid Lines
    const gridSpacing = 40;
    for (let x = gridSpacing; x < W; x += gridSpacing) {
      const line = new fabric.Line([x, 0, x, H], {
        stroke: 'rgba(139, 92, 246, 0.08)',
        strokeWidth: 1,
        name: '__preset_bg_grid'
      });
      insertBgObject(line);
    }
    for (let y = gridSpacing; y < H; y += gridSpacing) {
      const line = new fabric.Line([0, y, W, y], {
        stroke: 'rgba(139, 92, 246, 0.08)',
        strokeWidth: 1,
        name: '__preset_bg_grid'
      });
      insertBgObject(line);
    }
  }
  else if (presetId === 'luxury') {
    // Base Background Gradient
    applyTemplateGradientBg('linear-gradient(135deg,#060609,#101015)', W, H);
    
    // Central radial gold gradient glow
    const goldGlow = new fabric.Circle({
      left: W / 2,
      top: H / 2,
      radius: Math.max(W, H) * 0.45,
      originX: 'center',
      originY: 'center',
      fill: new fabric.Gradient({
        type: 'radial',
        coords: { r1: 0, r2: Math.max(W, H) * 0.45, x1: Math.max(W, H) * 0.45, y1: Math.max(W, H) * 0.45, x2: Math.max(W, H) * 0.45, y2: Math.max(W, H) * 0.45 },
        colorStops: [
          { offset: 0, color: 'rgba(251, 191, 36, 0.08)' },
          { offset: 1, color: 'rgba(251, 191, 36, 0)' }
        ]
      }),
      name: '__preset_bg_glow'
    });
    insertBgObject(goldGlow);
    
    // Luxury Corner Geometric Accents (Top-Left Poly)
    const tlPoly = new fabric.Polygon([
      { x: 0, y: 0 },
      { x: Math.min(W, H) * 0.25, y: 0 },
      { x: 0, y: Math.min(W, H) * 0.25 }
    ], {
      fill: 'rgba(251, 191, 36, 0.025)',
      stroke: 'rgba(251, 191, 36, 0.12)',
      strokeWidth: 1,
      name: '__preset_bg_accent1'
    });
    insertBgObject(tlPoly);
    
    // Luxury Corner Geometric Accents (Bottom-Right Poly)
    const brPoly = new fabric.Polygon([
      { x: W, y: H },
      { x: W - Math.min(W, H) * 0.25, y: H },
      { x: W, y: H - Math.min(W, H) * 0.25 }
    ], {
      fill: 'rgba(251, 191, 36, 0.025)',
      stroke: 'rgba(251, 191, 36, 0.12)',
      strokeWidth: 1,
      name: '__preset_bg_accent2'
    });
    insertBgObject(brPoly);

    // Diagonal lines matching premium geometry
    const diagLine1 = new fabric.Line([W - Math.min(W, H) * 0.2, 0, W, Math.min(W, H) * 0.2], {
      stroke: 'rgba(251, 191, 36, 0.15)',
      strokeWidth: 1,
      name: '__preset_bg_line1'
    });
    insertBgObject(diagLine1);
    
    const diagLine2 = new fabric.Line([0, H - Math.min(W, H) * 0.2, Math.min(W, H) * 0.2, H], {
      stroke: 'rgba(251, 191, 36, 0.15)',
      strokeWidth: 1,
      name: '__preset_bg_line2'
    });
    insertBgObject(diagLine2);
  }
  else if (presetId === 'grid') {
    // Base Background Solid Color
    setCanvasSolidColor('#fafafa');
    
    // Fine Grid lines
    const gridSpacing = 30;
    for (let x = gridSpacing; x < W; x += gridSpacing) {
      const line = new fabric.Line([x, 0, x, H], {
        stroke: 'rgba(0, 0, 0, 0.035)',
        strokeWidth: 1,
        name: '__preset_bg_grid'
      });
      insertBgObject(line);
    }
    for (let y = gridSpacing; y < H; y += gridSpacing) {
      const line = new fabric.Line([0, y, W, y], {
        stroke: 'rgba(0, 0, 0, 0.035)',
        strokeWidth: 1,
        name: '__preset_bg_grid'
      });
      insertBgObject(line);
    }
    
    // Red margin line
    const redMargin = new fabric.Line([65, 0, 65, H], {
      stroke: 'rgba(239, 68, 68, 0.25)',
      strokeWidth: 1.5,
      name: '__preset_bg_margin'
    });
    insertBgObject(redMargin);
  }
  else if (presetId === 'waves') {
    // Base Background Gradient
    applyTemplateGradientBg('linear-gradient(135deg,#070612,#0c0e24)', W, H);
    
    // Large indigo glow at bottom-left
    const waveGlow = new fabric.Circle({
      left: W * 0.15,
      top: H * 0.8,
      radius: Math.max(W, H) * 0.45,
      originX: 'center',
      originY: 'center',
      fill: new fabric.Gradient({
        type: 'radial',
        coords: { r1: 0, r2: Math.max(W, H) * 0.45, x1: Math.max(W, H) * 0.45, y1: Math.max(W, H) * 0.45, x2: Math.max(W, H) * 0.45, y2: Math.max(W, H) * 0.45 },
        colorStops: [
          { offset: 0, color: 'rgba(139, 92, 246, 0.15)' },
          { offset: 1, color: 'rgba(139, 92, 246, 0)' }
        ]
      }),
      name: '__preset_bg_glow'
    });
    insertBgObject(waveGlow);
    
    // Wave 1
    const wave1Path = `M 0 ${H * 0.72} Q ${W * 0.25} ${H * 0.58} ${W * 0.5} ${H * 0.72} T ${W} ${H * 0.67} L ${W} ${H} L 0 ${H} Z`;
    const wave1 = new fabric.Path(wave1Path, {
      fill: 'rgba(139, 92, 246, 0.12)',
      stroke: 'rgba(139, 92, 246, 0.2)',
      strokeWidth: 1,
      name: '__preset_bg_wave1'
    });
    insertBgObject(wave1);
    
    // Wave 2
    const wave2Path = `M 0 ${H * 0.82} Q ${W * 0.3} ${H * 0.95} ${W * 0.65} ${H * 0.75} T ${W} ${H * 0.82} L ${W} ${H} L 0 ${H} Z`;
    const wave2 = new fabric.Path(wave2Path, {
      fill: 'rgba(217, 70, 239, 0.08)',
      stroke: 'rgba(217, 70, 239, 0.15)',
      strokeWidth: 1,
      name: '__preset_bg_wave2'
    });
    insertBgObject(wave2);
  }
  else if (presetId === 'sunset') {
    // Base Background Gradient
    applyTemplateGradientBg('linear-gradient(135deg,#120022,#040010)', W, H);
    
    // Golden-Orange Sun
    const sunRadius = Math.min(W, H) * 0.26;
    const sunGrad = new fabric.Gradient({
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: 0, y2: sunRadius * 2 },
      colorStops: [
        { offset: 0, color: '#fef08a' }, // yellow-200
        { offset: 0.5, color: '#f97316' }, // orange-500
        { offset: 1, color: 'rgba(15, 23, 42, 0)' } // fadeout
      ]
    });
    
    const sun = new fabric.Circle({
      left: W / 2,
      top: H * 0.45,
      radius: sunRadius,
      originX: 'center',
      originY: 'center',
      fill: sunGrad,
      name: '__preset_bg_sun'
    });
    insertBgObject(sun);
    
    // Sun Horizon Cutter Lines (Retro Stripes)
    const startCutY = H * 0.45;
    const cutCount = 7;
    for (let i = 0; i < cutCount; i++) {
      const sliceY = startCutY + (sunRadius * (i / cutCount));
      const sliceHeight = 2.5 + (i * 1.5); // progressively thicker cuts down
      const cutRect = new fabric.Rect({
        left: 0,
        top: sliceY,
        width: W,
        height: sliceHeight,
        fill: '#040010', // matching the bottom bg color
        name: '__preset_bg_suncut'
      });
      insertBgObject(cutRect);
    }

    // Converging synthwave grid lines at the bottom
    const gridStartY = H * 0.65;
    const numHlines = 8;
    for (let i = 0; i < numHlines; i++) {
      const progress = i / (numHlines - 1);
      const lineY = gridStartY + (H - gridStartY) * Math.pow(progress, 1.8);
      const line = new fabric.Line([0, lineY, W, lineY], {
        stroke: 'rgba(236, 72, 153, 0.2)',
        strokeWidth: 1.5,
        name: '__preset_bg_sunset_grid'
      });
      insertBgObject(line);
    }
  }
  else if (presetId === 'marble') {
    // Base solid off-white background
    setCanvasSolidColor('#f4f4f7');
    
    // Vein 1
    const vein1 = new fabric.Path(`M -50 -50 Q ${W * 0.3} ${H * 0.25} ${W * 0.55} ${H * 0.68} T ${W + 50} ${H + 50}`, {
      fill: 'transparent',
      stroke: 'rgba(0, 0, 0, 0.04)',
      strokeWidth: 3.5,
      name: '__preset_bg_vein1'
    });
    insertBgObject(vein1);
    
    // Vein 2
    const vein2 = new fabric.Path(`M ${W * 0.2} -50 Q ${W * 0.5} ${H * 0.4} ${W * 0.25} ${H * 0.8} T ${W * 0.85} ${H + 50}`, {
      fill: 'transparent',
      stroke: 'rgba(0, 0, 0, 0.03)',
      strokeWidth: 2,
      name: '__preset_bg_vein2'
    });
    insertBgObject(vein2);
    
    // Vein 3
    const vein3 = new fabric.Path(`M -50 ${H * 0.5} Q ${W * 0.45} ${H * 0.52} ${W * 0.72} ${H * 0.25} T ${W + 50} -50`, {
      fill: 'transparent',
      stroke: 'rgba(0, 0, 0, 0.025)',
      strokeWidth: 1.5,
      name: '__preset_bg_vein3'
    });
    insertBgObject(vein3);
  }
  
  fabricCanvasInstance.renderAll();
  pushHistoryState();
  showToast('Template Latar Belakang berhasil diterapkan!', 'success');
}


// ─── EDITOR PANEL CONSOLE DRAWING ─────────────────
function openPanel(type, btn) {
  document.querySelectorAll('.sidebar-icon-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const panel = document.getElementById('editor-panel-left');
  const content = document.getElementById('panel-content');
  if (!panel || !content) return;

  panel.classList.add('open');

  if (type === 'templates') {
    content.innerHTML = `
      <div class="panel-title">📐 Premium Templates</div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${TEMPLATES.map(t => `
          <div onclick="applyNewTemplate('${t.id}')"
            style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:var(--radius-sm);background:rgba(255,255,255,0.01);border:1px solid var(--border);cursor:pointer;transition:var(--transition);"
            onmouseover="this.style.borderColor='var(--accent-pink)';this.style.background='rgba(255,255,255,0.03)';"
            onmouseout="this.style.borderColor='var(--border)';this.style.background='rgba(255,255,255,0.01)';">
            <div style="width:50px;height:40px;border-radius:6px;background:${t.bg};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,0.4);">${t.icon}</div>
            <div style="overflow:hidden;">
              <div style="font-size:12px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.name}</div>
              <div style="font-size:11px;color:var(--text-secondary);">${t.category} • ${t.width}x${t.height}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } 
  else if (type === 'elements') {
    content.innerHTML = `
      <div class="panel-title">⬛ Elemen & Ikon</div>
      
      <div style="font-size:11px;font-weight:700;color:var(--accent-gold);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">Bentuk Geometri</div>
      <div class="element-grid">
        ${[
          { label: 'Kotak', icon: '⬛', fn: 'insertRectElement' },
          { label: 'Lingkaran', icon: '⬤', fn: 'insertCircleElement' },
          { label: 'Segitiga', icon: '▲', fn: 'insertTriangleElement' },
          { label: 'Bintang', icon: '★', fn: 'insertStarElement' },
          { label: 'Garis', icon: '━', fn: 'insertLineElement' },
        ].map(e => `
          <div class="element-item" onclick="${e.fn}()">
            <span class="element-item-icon">${e.icon}</span>
            <span class="element-item-label">${e.label}</span>
          </div>
        `).join('')}
      </div>

      <div style="font-size:11px;font-weight:700;color:var(--accent-gold);text-transform:uppercase;letter-spacing:0.05em;margin:24px 0 12px 0;">Ikon Premium SVG</div>
      <div class="icon-list-grid">
        ${Object.keys(SVG_ICONS).map(key => `
          <div class="icon-item" onclick="insertPremiumSvgIcon('${key}')" title="Insert ${key}">
            ${SVG_ICONS[key]}
          </div>
        `).join('')}
      </div>
    `;
  } 
  else if (type === 'text') {
    content.innerHTML = `
      <div class="panel-title">T Tambah Teks</div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:24px;">
        <button class="btn btn-primary" onclick="insertTextElement('Judul Utama Premium', 44, 'bold')" style="justify-content:center;font-size:16px;padding:16px;">
          Tambah Judul Besar
        </button>
        <button class="btn btn-secondary" onclick="insertTextElement('Subjudul Desain', 26, '600')" style="justify-content:center;font-size:14px;padding:12px;">
          Tambah Subjudul
        </button>
        <button class="btn btn-secondary" onclick="insertTextElement('Teks isi biasa yang estetik dan elegan.', 16, 'normal')" style="justify-content:center;font-size:12px;padding:10px;">
          Tambah Teks Isi
        </button>
      </div>

      <div style="font-size:11px;font-weight:700;color:var(--accent-gold);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">Pilihan Font</div>
      <select class="input" id="editor-font-selector" style="margin-bottom:16px;padding:10px 14px;" onchange="changeActiveFont(this.value)">
        <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Sans)</option>
        <option value="Outfit">Outfit (Clean Geometric)</option>
        <option value="Inter">Inter (Neo-grotesque)</option>
        <option value="Poppins">Poppins (Friendly Sans)</option>
        <option value="Montserrat">Montserrat (Classic Geometric)</option>
        <option value="Space Grotesk">Space Grotesk (Tech/Futuristic)</option>
        <option value="Unbounded">Unbounded (Ultra Wide Tech)</option>
        <option value="Syne">Syne (Artistic Display)</option>
        <option value="Playfair Display">Playfair Display (Elegant Serif)</option>
        <option value="Cinzel">Cinzel (Luxury Classical Serif)</option>
        <option value="Satisfy">Satisfy (Artisan Script)</option>
        <option value="Sacramento">Sacramento (Luxury Signature)</option>
      </select>

      <div style="font-size:11px;font-weight:700;color:var(--accent-gold);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">Gaya Teks</div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-secondary" style="flex:1;justify-content:center;" onclick="toggleTextStyle('bold')"><b>B</b></button>
        <button class="btn btn-secondary" style="flex:1;justify-content:center;" onclick="toggleTextStyle('italic')"><i>I</i></button>
        <button class="btn btn-secondary" style="flex:1;justify-content:center;text-decoration:underline;" onclick="toggleTextStyle('underline')"><u>U</u></button>
      </div>
    `;
  } 
  else if (type === 'bg') {
    const gradients = [
      'linear-gradient(135deg,#1e1b4b,#311042)',
      'linear-gradient(135deg,#ec4899,#f43f5e)',
      'linear-gradient(135deg,#0284c7,#10b981)',
      'linear-gradient(135deg,#1c1917,#0c0a09)',
      'linear-gradient(135deg,#fbcfe8,#f472b6)',
      'linear-gradient(135deg,#0f172a,#1e293b)',
      'linear-gradient(135deg,#8b5cf6,#d946ef)',
      'linear-gradient(135deg,#fbbf24,#f59e0b)',
      'linear-gradient(135deg,#ecfdf5,#a7f3d0)',
      'linear-gradient(135deg,#09090e,#1a1a24)',
      'linear-gradient(135deg,#c084fc,#818cf8)',
      'linear-gradient(135deg,#4c1d95,#b91c1c)',
      'linear-gradient(135deg,#064e3b,#059669)',
      'linear-gradient(135deg,#0f0c20,#15102a)',
      'linear-gradient(135deg,#e2e8f0,#cbd5e1)',
      'linear-gradient(135deg,#1e3a8a,#3b82f6)'
    ];

    const solids = [
      '#000000', '#111116', '#1e293b', '#f4f4f5', '#ffffff',
      '#ef4444', '#f97316', '#eab308', '#10b981', '#06b6d4',
      '#3b82f6', '#8b5cf6', '#d946ef'
    ];

    const presets = [
      { id: 'cyberpunk', name: 'Cyberpunk Grid', desc: 'Neon glows & digital matrix grid', bg: 'linear-gradient(135deg,#030208,#090515)', icon: '🌐' },
      { id: 'luxury', name: 'Golden Luxury', desc: 'Midnight gold geometric accents', bg: 'linear-gradient(135deg,#060609,#101015)', icon: '👑' },
      { id: 'grid', name: 'Minimalist Paper', desc: 'Stationery drafting paper look', bg: '#fafafa', icon: '📝' },
      { id: 'waves', name: 'Aesthetic Waves', desc: 'Smooth flowing abstract waves', bg: 'linear-gradient(135deg,#070612,#0c0e24)', icon: '🌊' },
      { id: 'sunset', name: 'Retro Outrun', desc: 'Synthwave 80s sun & grid', bg: 'linear-gradient(135deg,#120022,#040010)', icon: '🌇' },
      { id: 'marble', name: 'Luxury Marble', desc: 'Pristine Carrara marble veins', bg: '#f4f4f7', icon: '🏛️' }
    ];

    content.innerHTML = `
      <div class="panel-title">🎨 Ubah Background</div>
      
      <div style="font-size:11px;font-weight:700;color:var(--accent-gold);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">🌅 Template Latar Belakang</div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:24px;">
        ${presets.map(p => `
          <div onclick="applyBackgroundTemplatePreset('${p.id}')"
            style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:var(--radius-sm);background:rgba(255,255,255,0.01);border:1px solid var(--border);cursor:pointer;transition:var(--transition);"
            onmouseover="this.style.borderColor='var(--accent-pink)';this.style.background='rgba(255,255,255,0.03)';"
            onmouseout="this.style.borderColor='var(--border)';this.style.background='rgba(255,255,255,0.01)';"
            title="Terapkan ${p.name}">
            <div style="width:40px;height:32px;border-radius:4px;background:${p.bg};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;box-shadow:0 2px 6px rgba(0,0,0,0.3);">${p.icon}</div>
            <div style="overflow:hidden;flex:1;">
              <div style="font-size:12px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
              <div style="font-size:10px;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="font-size:11px;font-weight:700;color:var(--accent-gold);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">✨ Gradasi Premium</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:24px;">
        ${gradients.map(g => `
          <div onclick="setCanvasBackgroundGradient('${g}')"
            style="aspect-ratio:1;border-radius:8px;background:${g};cursor:pointer;border:2px solid transparent;transition:var(--transition);"
            onmouseover="this.style.borderColor='var(--accent-pink)';this.style.transform='scale(1.08)'"
            onmouseout="this.style.borderColor='transparent';this.style.transform='scale(1)'"
            title="Gunakan Gradasi">
          </div>
        `).join('')}
      </div>

      <div style="font-size:11px;font-weight:700;color:var(--accent-gold);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">🎨 Warna Solid</div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:20px;">
        ${solids.map(s => `
          <div onclick="setCanvasSolidColor('${s}')"
            style="aspect-ratio:1;border-radius:6px;background:${s};cursor:pointer;border:1px solid var(--border);transition:var(--transition);"
            onmouseover="this.style.borderColor='var(--accent-gold)';this.style.transform='scale(1.08)'"
            onmouseout="this.style.borderColor='var(--border)';this.style.transform='scale(1)'"
            title="Gunakan Warna Solid">
          </div>
        `).join('')}
      </div>

      <div class="prop-row" style="padding-top:10px;border-top:1px solid var(--border);">
        <span class="prop-label" style="font-size:12px;font-weight:600;">Warna Custom</span>
        <div class="color-swatch" style="width:36px;height:24px;"><input type="color" value="#111116" onchange="setCanvasSolidColor(this.value)" /></div>
      </div>
    `;
  } 
  else if (type === 'upload') {
    content.innerHTML = `
      <div class="panel-title">⬆ Unggah Media Gambar</div>
      <div style="padding:32px 16px;border:2px dashed var(--border);border-radius:var(--radius-md);text-align:center;background:rgba(255,255,255,0.01);">
        <span style="font-size:36px;display:block;margin-bottom:12px;">📁</span>
        <label class="btn btn-primary btn-sm" style="cursor:pointer;display:inline-flex;">
          Pilih Gambar
          <input type="file" accept="image/*" style="display:none;" onchange="handleImageUpload(this)" />
        </label>
        <span style="display:block;font-size:11px;color:var(--text-muted);margin-top:14px;">JPG, PNG, SVG, WebP (Maks 5MB)</span>
      </div>
    `;
  }
}

// ─── EDITOR ACTIONS ──────────────────────────────
function insertTextElement(textVal, fontSize, fontWeight) {
  if (!fabricCanvasInstance) return;
  const textObj = new fabric.IText(textVal, {
    left: fabricCanvasInstance.width / 2,
    top: fabricCanvasInstance.height / 2,
    originX: 'center',
    originY: 'center',
    fontSize: fontSize,
    fontWeight: fontWeight,
    fill: '#ffffff',
    fontFamily: 'Plus Jakarta Sans',
  });
  
  fabricCanvasInstance.add(textObj);
  fabricCanvasInstance.setActiveObject(textObj);
  fabricCanvasInstance.renderAll();
  pushHistoryState();
}

function insertRectElement() {
  if (!fabricCanvasInstance) return;
  const rectObj = new fabric.Rect({
    left: fabricCanvasInstance.width / 2 - 75,
    top: fabricCanvasInstance.height / 2 - 50,
    width: 150,
    height: 100,
    fill: '#8b5cf6',
    rx: 12,
    ry: 12,
  });
  fabricCanvasInstance.add(rectObj);
  fabricCanvasInstance.setActiveObject(rectObj);
  fabricCanvasInstance.renderAll();
  pushHistoryState();
}

function insertCircleElement() {
  if (!fabricCanvasInstance) return;
  const circObj = new fabric.Circle({
    left: fabricCanvasInstance.width / 2 - 50,
    top: fabricCanvasInstance.height / 2 - 50,
    radius: 50,
    fill: '#d946ef',
  });
  fabricCanvasInstance.add(circObj);
  fabricCanvasInstance.setActiveObject(circObj);
  fabricCanvasInstance.renderAll();
  pushHistoryState();
}

function insertTriangleElement() {
  if (!fabricCanvasInstance) return;
  const triObj = new fabric.Triangle({
    left: fabricCanvasInstance.width / 2 - 50,
    top: fabricCanvasInstance.height / 2 - 50,
    width: 100,
    height: 100,
    fill: '#3b82f6',
  });
  fabricCanvasInstance.add(triObj);
  fabricCanvasInstance.setActiveObject(triObj);
  fabricCanvasInstance.renderAll();
  pushHistoryState();
}

function insertStarElement() {
  if (!fabricCanvasInstance) return;
  const points = [];
  // Calculate standard 5-point star coordinates
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? 50 : 20;
    points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
  }
  const starObj = new fabric.Polygon(points, {
    left: fabricCanvasInstance.width / 2 - 50,
    top: fabricCanvasInstance.height / 2 - 50,
    fill: '#fbbf24',
  });
  fabricCanvasInstance.add(starObj);
  fabricCanvasInstance.setActiveObject(starObj);
  fabricCanvasInstance.renderAll();
  pushHistoryState();
}

function insertLineElement() {
  if (!fabricCanvasInstance) return;
  const lineObj = new fabric.Line([50, 50, 250, 50], {
    left: fabricCanvasInstance.width / 2 - 100,
    top: fabricCanvasInstance.height / 2,
    stroke: '#ffffff',
    strokeWidth: 4,
    strokeLineCap: 'round',
  });
  fabricCanvasInstance.add(lineObj);
  fabricCanvasInstance.setActiveObject(lineObj);
  fabricCanvasInstance.renderAll();
  pushHistoryState();
}

function insertPremiumSvgIcon(iconKey) {
  if (!fabricCanvasInstance || !SVG_ICONS[iconKey]) return;

  fabric.loadSVGFromString(SVG_ICONS[iconKey], (objects, options) => {
    const iconObj = fabric.util.groupSVGElements(objects, options);
    iconObj.set({
      left: fabricCanvasInstance.width / 2,
      top: fabricCanvasInstance.height / 2,
      originX: 'center',
      originY: 'center',
      fill: '#fbbf24',
      stroke: '#fbbf24',
    });
    
    // Scale SVG group nicely
    iconObj.scaleToWidth(80);
    iconObj.scaleToHeight(80);

    fabricCanvasInstance.add(iconObj);
    fabricCanvasInstance.setActiveObject(iconObj);
    fabricCanvasInstance.renderAll();
    pushHistoryState();
    showToast('Ikon premium berhasil disisipkan!', 'success');
  });
}

function handleImageUpload(input) {
  if (!input.files || !input.files[0] || !fabricCanvasInstance) return;

  const reader = new FileReader();
  reader.onload = e => {
    fabric.Image.fromURL(e.target.result, img => {
      // Scale down image if too large
      img.scaleToWidth(Math.min(fabricCanvasInstance.width * 0.6, 400));
      img.set({
        left: fabricCanvasInstance.width / 2 - img.getScaledWidth() / 2,
        top: fabricCanvasInstance.height / 2 - img.getScaledHeight() / 2,
      });

      fabricCanvasInstance.add(img);
      fabricCanvasInstance.setActiveObject(img);
      fabricCanvasInstance.renderAll();
      pushHistoryState();
      showToast('Gambar berhasil diunggah & disisipkan!', 'success');
    });
  };
  reader.readAsDataURL(input.files[0]);
}

function setCanvasSolidColor(color) {
  if (!fabricCanvasInstance) return;
  removeCanvasBg();
  fabricCanvasInstance.backgroundColor = color;
  fabricCanvasInstance.renderAll();
  pushHistoryState();
}

function setCanvasBackgroundGradient(gString) {
  if (!fabricCanvasInstance) return;
  applyTemplateGradientBg(gString, fabricCanvasInstance.width, fabricCanvasInstance.height);
  pushHistoryState();
}

function applyNewTemplate(id) {
  const tmpl = TEMPLATES.find(t => t.id === id);
  if (!tmpl || !fabricCanvasInstance) return;

  fabricCanvasInstance.clear();
  removeCanvasBg();
  applyTemplateGradientBg(tmpl.bg, fabricCanvasInstance.width, fabricCanvasInstance.height);

  const text = new fabric.IText(tmpl.name, {
    left: fabricCanvasInstance.width / 2,
    top: fabricCanvasInstance.height / 2,
    originX: 'center',
    originY: 'center',
    fontSize: Math.round(fabricCanvasInstance.width * 0.06),
    fill: tmpl.accent || '#ffffff',
    fontFamily: 'Outfit',
    fontWeight: '800',
    shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: 15, offsetX: 0, offsetY: 4 })
  });

  fabricCanvasInstance.add(text);
  fabricCanvasInstance.renderAll();
  pushHistoryState();
  showToast(`Template '${tmpl.name}' berhasil diterapkan!`, 'success');
}

function changeActiveFont(fontName) {
  const obj = fabricCanvasInstance?.getActiveObject();
  if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
    obj.set('fontFamily', fontName);
    fabricCanvasInstance.renderAll();
    pushHistoryState();
  }
}

function toggleTextStyle(style) {
  const obj = fabricCanvasInstance?.getActiveObject();
  if (!obj || (obj.type !== 'i-text' && obj.type !== 'text')) return;

  if (style === 'bold') {
    obj.set('fontWeight', obj.fontWeight === 'bold' ? 'normal' : 'bold');
  } 
  else if (style === 'italic') {
    obj.set('fontStyle', obj.fontStyle === 'italic' ? 'normal' : 'italic');
  } 
  else if (style === 'underline') {
    obj.set('underline', !obj.underline);
  }

  fabricCanvasInstance.renderAll();
  pushHistoryState();
}

function deleteSelectedObject() {
  if (!fabricCanvasInstance) return;
  const obj = fabricCanvasInstance.getActiveObject();
  if (obj) {
    fabricCanvasInstance.remove(obj);
    fabricCanvasInstance.discardActiveObject();
    fabricCanvasInstance.renderAll();
    pushHistoryState();
    showToast('Objek berhasil dihapus.', 'info');
  }
}

function updateSelectedObjProp(prop, val) {
  const obj = fabricCanvasInstance?.getActiveObject();
  if (!obj) return;

  if (prop === 'scaleX' || prop === 'scaleY') {
    // Width/Height scale multiplier
    const initialSize = prop === 'scaleX' ? obj.width : obj.height;
    obj.set(prop, parseFloat(val) / initialSize);
  } else {
    obj.set(prop, parseFloat(val));
  }
  
  fabricCanvasInstance.renderAll();
}

function updateSelectedObjColor(color) {
  const obj = fabricCanvasInstance?.getActiveObject();
  if (!obj) return;
  
  obj.set('fill', color);
  if (obj.stroke && obj.stroke !== 'transparent') {
    obj.set('stroke', color);
  }
  fabricCanvasInstance.renderAll();
  pushHistoryState();
}

function onCanvasSelectionEvent() {
  const obj = fabricCanvasInstance?.getActiveObject();
  if (!obj) return;

  const panel = document.getElementById('object-properties-panel');
  if (panel) panel.style.display = 'block';

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = Math.round(val);
  };

  setVal('prop-obj-x', obj.left);
  setVal('prop-obj-y', obj.top);
  setVal('prop-obj-w', obj.getScaledWidth());
  setVal('prop-obj-h', obj.getScaledHeight());
  setVal('prop-obj-opacity', (obj.opacity ?? 1) * 100);

  const swatch = document.getElementById('obj-color-swatch');
  const picker = document.getElementById('prop-obj-color');
  const colorRow = document.getElementById('color-prop-row');
  
  if (colorRow) {
    if (obj.type === 'image' || obj.type === 'line') {
      colorRow.style.display = 'none';
    } else {
      colorRow.style.display = 'flex';
      if (picker && obj.fill && typeof obj.fill === 'string' && obj.fill.startsWith('#')) {
        picker.value = obj.fill;
      }
    }
  }
}

function resizeCanvasDimension() {
  const w = parseInt(document.getElementById('prop-canvas-w')?.value) || activeDesignWidth;
  const h = parseInt(document.getElementById('prop-canvas-h')?.value) || activeDesignHeight;
  
  if (!fabricCanvasInstance) return;

  activeDesignWidth = w;
  activeDesignHeight = h;

  const scale = getCanvasFitScale(w, h);
  
  const wrapper = document.getElementById('canvas-wrapper');
  if (wrapper) {
    wrapper.style.width = (w * scale) + 'px';
    wrapper.style.height = (h * scale) + 'px';
  }

  // Adjust canvas wrapper sizes
  fabricCanvasInstance.setWidth(w * scale);
  fabricCanvasInstance.setHeight(h * scale);
  fabricCanvasInstance.setZoom(scale);
  State.zoom = scale;
  updateZoomPercentageLabel();
  fabricCanvasInstance.renderAll();
}

// ─── ZOOM & HISTORY CONTROLLER ───────────────────
function editorZoom(delta) {
  State.zoom = Math.max(0.1, Math.min(4, State.zoom + delta));
  if (!fabricCanvasInstance) return;
  fabricCanvasInstance.setZoom(State.zoom);
  updateZoomPercentageLabel();
}

function updateZoomPercentageLabel() {
  const label = document.getElementById('zoom-label');
  if (label) {
    label.textContent = Math.round(State.zoom * 100) + '%';
  }
}

function pushHistoryState() {
  if (!fabricCanvasInstance) return;
  const jsonStr = JSON.stringify(fabricCanvasInstance.toJSON(['name']));
  
  // Cut any redo paths if we did new action
  State.history = State.history.slice(0, State.historyIndex + 1);
  State.history.push(jsonStr);

  if (State.history.length > 50) {
    State.history.shift();
  }
  State.historyIndex = State.history.length - 1;
}

function editorUndo() {
  if (State.historyIndex <= 0 || !fabricCanvasInstance) return;
  State.historyIndex--;
  fabricCanvasInstance.loadFromJSON(State.history[State.historyIndex], () => {
    fabricCanvasInstance.renderAll();
    showToast('Tindakan dibatalkan (Undo).', 'info');
  });
}

function editorRedo() {
  if (State.historyIndex >= State.history.length - 1 || !fabricCanvasInstance) return;
  State.historyIndex++;
  fabricCanvasInstance.loadFromJSON(State.history[State.historyIndex], () => {
    fabricCanvasInstance.renderAll();
    showToast('Tindakan diulangi (Redo).', 'info');
  });
}

// ─── SAVE & EXPORT MODULES ───────────────────────
function saveDesign() {
  if (!fabricCanvasInstance || !State.currentUser) return;
  
  State.isSaving = true;
  const title = document.getElementById('design-title')?.value || 'Desain Premium';
  const id = State.activeDesignId || 'design_' + Date.now();
  State.activeDesignId = id;

  const matchIdx = State.designs.findIndex(d => d.id === id);
  const designPayload = {
    id,
    name: title,
    width: activeDesignWidth,
    height: activeDesignHeight,
    json: fabricCanvasInstance.toJSON(['name']),
    bg: 'linear-gradient(135deg,#030303,#111116)',
    userId: State.currentUser.id,
    updatedAt: new Date().toISOString(),
  };

  if (matchIdx >= 0) {
    State.designs[matchIdx] = designPayload;
  } else {
    State.designs.push(designPayload);
  }

  localStorage.setItem('spotivi_designs', JSON.stringify(State.designs));
  
  setTimeout(() => {
    State.isSaving = false;
    showToast('Desain disimpan dengan aman ke sistem! 💾', 'success');
  }, 300);
}

function exportPNG() {
  if (!fabricCanvasInstance) return;
  
  // Clear selection border first
  fabricCanvasInstance.discardActiveObject();
  fabricCanvasInstance.renderAll();

  // Draw clear 2x output
  const dataURL = fabricCanvasInstance.toDataURL({
    format: 'png',
    multiplier: 2,
  });

  const downloadLink = document.createElement('a');
  downloadLink.href = dataURL;
  downloadLink.download = (document.getElementById('design-title')?.value || 'design') + '_spotivi.png';
  downloadLink.click();

  showToast('Desain PNG berhasil diekspor resolusi tinggi! 🖼️', 'success');
}

function openDesign(id) {
  State.activeDesignId = id;
  navigate('editor', { designId: id });
}

function createBlankDesign(w, h, label) {
  closeModal('modal-new');
  State.activeDesignId = null;
  activeDesignWidth = w;
  activeDesignHeight = h;
  navigate('editor', {});
  
  setTimeout(() => {
    const t = document.getElementById('design-title');
    if (t) t.value = label;
  }, 200);
}

// ─── AUTHENTICATION LOGIC ────────────────────────
function doLogin() {
  const email = document.getElementById('login-email')?.value?.trim();
  const pass = document.getElementById('login-pass')?.value;
  const errorBox = document.getElementById('login-error');

  if (!email || !pass) {
    showAuthError(errorBox, 'Harap isi semua kolom email & password!');
    return;
  }

  const users = getUsers();
  const matchedUser = users.find(u => u.email === email && u.pass === hashPass(pass));
  
  if (!matchedUser) {
    showAuthError(errorBox, 'Alamat email atau kata sandi tidak valid.');
    return;
  }

  setSession(matchedUser);
  renderApp();
  navigate('home');
  showToast(`Selamat datang kembali, ${matchedUser.name}! 👋`, 'success');
}

function doRegister() {
  const name = document.getElementById('reg-name')?.value?.trim();
  const email = document.getElementById('reg-email')?.value?.trim();
  const pass = document.getElementById('reg-pass')?.value;
  const errorBox = document.getElementById('login-error');

  if (!name || !email || !pass) {
    showAuthError(errorBox, 'Semua data pendaftaran wajib diisi!');
    return;
  }
  if (pass.length < 6) {
    showAuthError(errorBox, 'Kata sandi minimal 6 karakter demi keamanan.');
    return;
  }

  const users = getUsers();
  if (users.find(u => u.email === email)) {
    showAuthError(errorBox, 'Email tersebut sudah terdaftar di sistem.');
    return;
  }

  const newUser = {
    id: 'u_' + Date.now(),
    name,
    email,
    pass: hashPass(pass),
    provider: 'email'
  };

  users.push(newUser);
  saveUsers(users);

  setSession(newUser);
  renderApp();
  navigate('home');
  showToast('Akun premium spotivi! berhasil dibuat! 🎉', 'success');
}

function loginWithGoogle() {
  const googleMockUser = {
    id: 'g_' + Date.now(),
    name: 'User Premium spotivi!',
    email: 'kreator.premium@gmail.com',
    provider: 'google',
    avatar: 'G'
  };

  const users = getUsers();
  const existUser = users.find(u => u.email === googleMockUser.email);
  
  if (!existUser) {
    users.push(googleMockUser);
    saveUsers(users);
  }

  setSession(existUser || googleMockUser);
  renderApp();
  navigate('home');
  showToast('Google Sign In berhasil diverifikasi! ✅', 'success');
}

function logout() {
  clearSession();
  closeDropdown();
  renderApp();
  showToast('Sesi ditutup. Sampai jumpa kembali! 👋', 'info');
}

function switchAccount() {
  clearSession();
  closeDropdown();
  renderApp();
}

function showRegister() {
  document.getElementById('login-form-area').style.display = 'none';
  document.getElementById('register-form-area').style.display = 'block';
  document.getElementById('auth-title').textContent = 'Buat Akun Baru';
  document.getElementById('auth-subtitle').textContent = 'Nikmati akses penuh ke ribuan template dan ikon premium';
  
  const err = document.getElementById('login-error');
  if (err) { err.classList.remove('visible'); err.textContent = ''; }
}

function showLogin() {
  document.getElementById('register-form-area').style.display = 'none';
  document.getElementById('login-form-area').style.display = 'block';
  document.getElementById('auth-title').textContent = 'Welcome Back';
  document.getElementById('auth-subtitle').textContent = 'Masuk untuk memulai mendesain dengan kreativitas tanpa batas';
  
  const err = document.getElementById('login-error');
  if (err) { err.classList.remove('visible'); err.textContent = ''; }
}

function showAuthError(el, msg) {
  if (!el) return;
  el.innerHTML = `⚠️ &nbsp;${msg}`;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 5000);
}

// ─── FLOATING DROPDOWN PANEL ─────────────────────
function toggleDropdown() {
  const dd = document.getElementById('user-dropdown');
  const btn = document.getElementById('avatar-btn');
  if (!dd || !btn) return;

  if (dd.classList.contains('open')) {
    closeDropdown();
    return;
  }

  const rect = btn.getBoundingClientRect();
  dd.style.position = 'fixed';
  dd.style.top = (rect.bottom + 12) + 'px';
  dd.style.left = (rect.right - 250) + 'px';
  dd.classList.add('open');

  // Bind close outside events
  setTimeout(() => {
    document.addEventListener('click', closeDropdownOutsideHandler, { once: true });
  }, 20);
}

function closeDropdown() {
  const dd = document.getElementById('user-dropdown');
  if (dd) dd.classList.remove('open');
}

function closeDropdownOutsideHandler(e) {
  const dd = document.getElementById('user-dropdown');
  const btn = document.getElementById('avatar-btn');
  if (dd && !dd.contains(e.target) && btn && !btn.contains(e.target)) {
    closeDropdown();
  }
}

function updateDropdownInfo() {
  const user = State.currentUser;
  if (!user) return;

  const dName = document.getElementById('dd-name');
  const dEmail = document.getElementById('dd-email');
  if (dName) dName.textContent = user.name || user.email;
  if (dEmail) dEmail.textContent = user.email;
  
  updateAvatarInitial();
}

function updateAvatarInitial() {
  const btn = document.getElementById('avatar-initial');
  if (btn && State.currentUser) {
    btn.textContent = (State.currentUser.name || State.currentUser.email || '?')[0].toUpperCase();
  }
}

// ─── MODAL DIALOGS ───────────────────────────────
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

// ─── NOTIFICATION TOAST SYSTEM ────────────────────
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const emojis = { success: '✨', error: '❌', info: 'ℹ️' };
  const toastEl = document.createElement('div');
  toastEl.className = `toast ${type}`;
  toastEl.innerHTML = `
    <span style="font-size:18px;">${emojis[type] || 'ℹ️'}</span>
    <span>${msg}</span>
  `;

  container.appendChild(toastEl);

  setTimeout(() => {
    toastEl.style.opacity = '0';
    toastEl.style.transform = 'translateY(15px) scale(0.95)';
    toastEl.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => {
      toastEl.remove();
    }, 350);
  }, 4000);
}

// Bind background click for modal dismissal
document.addEventListener('click', e => {
  document.querySelectorAll('.modal-overlay.open').forEach(modal => {
    if (e.target === modal) {
      modal.classList.remove('open');
    }
  });
});

// ─── INITIALIZATION SCRIPT ───────────────────────
(function initApp() {
  loadSession();
  renderApp();
  if (State.currentUser) {
    navigate('home');
  }
})();

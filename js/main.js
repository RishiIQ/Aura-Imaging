document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons safely
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Theme Toggle Handler (Dark / Light Mode)
  const themeToggle = document.getElementById('themeToggle');
  const htmlElement = document.documentElement;

  const savedTheme = localStorage.getItem('aura_theme') || 'light';
  if (savedTheme === 'dark') {
    htmlElement.classList.add('dark');
  } else {
    htmlElement.classList.remove('dark');
  }

  function updateThemeIcon() {
    const isDark = htmlElement.classList.contains('dark');
    if (themeToggle) {
      themeToggle.innerHTML = isDark
        ? `<svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`
        : `<svg class="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>`;
      themeToggle.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      themeToggle.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    }
  }

  updateThemeIcon();

  themeToggle?.addEventListener('click', () => {
    const isDark = htmlElement.classList.toggle('dark');
    localStorage.setItem('aura_theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
  });

  // 3. RTL / LTR Direction Toggle Handler
  const rtlToggle = document.getElementById('rtlToggle');
  const savedDir = localStorage.getItem('aura_dir') || 'ltr';
  htmlElement.setAttribute('dir', savedDir);

  function updateDirIcon() {
    const currentDir = htmlElement.getAttribute('dir') || 'ltr';
    const isRtl = currentDir === 'rtl';
    if (rtlToggle) {
      rtlToggle.innerHTML = isRtl
        ? `<svg class="w-4 h-4 text-blue-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12H3M21 6H9M21 18H9"/></svg>`
        : `<svg class="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12h18M3 6h12M3 18h12"/></svg>`;
      rtlToggle.setAttribute('title', isRtl ? 'Current: RTL (Click to switch to LTR)' : 'Current: LTR (Click to switch to RTL)');
      rtlToggle.setAttribute('aria-label', isRtl ? 'Switch to LTR text direction' : 'Switch to RTL text direction');
    }
  }

  updateDirIcon();

  rtlToggle?.addEventListener('click', () => {
    const currentDir = htmlElement.getAttribute('dir') || 'ltr';
    const nextDir = currentDir === 'ltr' ? 'rtl' : 'ltr';
    
    htmlElement.setAttribute('dir', nextDir);
    localStorage.setItem('aura_dir', nextDir);
    updateDirIcon();
  });

  // 4. Mobile Menu Drawer Toggle Safety Check
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  mobileMenuBtn?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('hidden');
  });

  // 5. Booking Form Validation & Success Handler
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const successAlert = document.getElementById('bookingSuccess');
      if (successAlert) {
        successAlert.classList.remove('hidden');
        bookingForm.reset();
        setTimeout(() => {
          successAlert.classList.add('hidden');
        }, 5000);
      }
    });
  }
});


// Mobile Hamburger Navigation Drawer Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // 1. Mobile Hamburger Menu Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // 2. Dynamic Active Navigation Highlighting
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  
  document.querySelectorAll('header nav a, #mobileMenu a').forEach(link => {
    const href = link.getAttribute('href');
    
    if (href === currentPath) {
      if (link.closest('#mobileMenu')) {
        link.className = "block px-4 py-3 rounded-xl font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 transition-colors";
      } else {
        link.className = "px-4 py-2 rounded-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold transition-all";
      }
    } else {
      if (link.closest('#mobileMenu')) {
        link.className = "block px-4 py-3 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors";
      } else {
        link.className = "px-4 py-2 rounded-full hover:text-blue-600 dark:hover:text-cyan-400 transition-colors";
      }
    }
  });
});
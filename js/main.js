/* ============================================================
   FirstChild FERTILITY & AURA IMAGING - MAIN APPLICATION
   Complete with State Persistence, Theme & RTL Synchronization
   ============================================================ */

// ============================================================
// 1. STATE MANAGEMENT
// ============================================================

const Store = {
    state: new Proxy({
        user: JSON.parse(localStorage.getItem('nova_user')) || null,
        theme: localStorage.getItem('nova_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
        dir: localStorage.getItem('nova_dir') || 'ltr',
        route: 'home',
        isMobileMenuOpen: false,
        dashboardView: 'main'
    }, {
        set(target, key, value) {
            target[key] = value;
            if (key === 'user') {
                localStorage.setItem('nova_user', JSON.stringify(value));
                if (typeof app !== 'undefined' && app.syncGlobalUI) app.syncGlobalUI();
                if (typeof updateDashboardWithUserData === 'function') {
                    setTimeout(updateDashboardWithUserData, 100);
                }
            }
            if (key === 'theme') {
                localStorage.setItem('nova_theme', value);
                if (typeof app !== 'undefined') app.applyTheme();
            }
            if (key === 'dir') {
                localStorage.setItem('nova_dir', value);
                if (typeof app !== 'undefined') app.applyDir();
            }
            return true;
        }
    })
};

// ============================================================
// 2. USER DATABASE
// ============================================================

const UserDatabase = {
    _users: [
        {
            id: 'NC-7721',
            email: 'sarah@mcallister.com',
            password: 'password123',
            name: 'Sarah McAllister',
            cycle: 'Ovarian Stimulation & Monitoring',
            progress: 65,
            specialist: 'Dr. Julianna Thorne',
            nextAppt: 'Oct 14, 2026 • 10:30 AM',
            avatar: 'https://images.unsplash.com/photo-1644860704769-c61c84be7836?q=80&w=687&auto=format&fit=crop',
            verified: true,
            activeCycle: true,
            messages: 2
        },
        {
            id: 'NC-7722',
            email: 'demo@firstchild.com',
            password: 'demo123',
            name: 'Demo Patient',
            cycle: 'Pre-Cycle Consultation',
            progress: 15,
            specialist: 'Dr. Sophia Chen',
            nextAppt: 'Oct 20, 2026 • 2:00 PM',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=687&auto=format&fit=crop',
            verified: true,
            activeCycle: false,
            messages: 0
        }
    ],

    findUser(email) {
        if (!email) return null;
        return this._users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    },

    findUserByEmailAndPassword(email, password) {
        if (!email || !password) return null;
        return this._users.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.password === password
        ) || null;
    },

    emailExists(email) {
        if (!email) return false;
        return this._users.some(u => u.email.toLowerCase() === email.toLowerCase());
    },

    createUser(data) {
        if (!data || !data.email || !data.password) return null;
        const newUser = {
            id: 'NC-' + Math.floor(1000 + Math.random() * 9000),
            ...data,
            verified: false,
            activeCycle: false,
            messages: 0,
            createdAt: new Date().toISOString()
        };
        this._users.push(newUser);
        return newUser;
    }
};

// ============================================================
// 3. AUTHENTICATION SYSTEM
// ============================================================

const auth = {
    login(e) {
        e.preventDefault();
        try {
            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');
            const errorEl = document.getElementById('login-error');
            const errorMsg = document.getElementById('login-error-message');

            const email = emailInput?.value?.trim() || '';
            const password = passwordInput?.value?.trim() || '';

            if (errorEl) errorEl.classList.add('hidden');

            if (!email || !password) {
                if (errorMsg && errorEl) {
                    errorMsg.textContent = 'Email and password are required';
                    errorEl.classList.remove('hidden');
                }
                return;
            }

            const user = UserDatabase.findUserByEmailAndPassword(email, password);
            if (user) {
                Store.state.user = {
                    ...user,
                    loginTime: new Date().toISOString(),
                    isAuthenticated: true
                };
                app.toast(`✅ Welcome back, ${user.name}!`);
                setTimeout(() => router.navigate('dashboard'), 800);
            } else {
                if (errorMsg && errorEl) {
                    errorMsg.textContent = UserDatabase.emailExists(email) ? 'Incorrect password.' : 'User not found.';
                    errorEl.classList.remove('hidden');
                }
            }
        } catch (err) {
            console.error('Login error:', err);
        }
    },

    logout() {
        Store.state.user = null;
        localStorage.removeItem('remembered_email');
        app.toast('Logged out successfully.');
        router.navigate('home');
    },

    isAuthenticated() {
        return Store.state.user !== null && Store.state.user.isAuthenticated === true;
    }
};

// ============================================================
// 4. APP CONTROLLER & GLOBAL UI SYNC
// ============================================================

const app = {
    init() {
        try {
            // Read saved state immediately from localStorage on boot
            Store.state.theme = localStorage.getItem('nova_theme') || localStorage.getItem('theme') || 'light';
            Store.state.dir = localStorage.getItem('nova_dir') || localStorage.getItem('dir') || 'ltr';

            this.applyTheme();
            this.applyDir();
            this.syncGlobalUI();

            window.addEventListener('scroll', this.handleScroll.bind(this));

            // Bind global toggle buttons dynamically if present
            const themeToggleBtn = document.getElementById('themeToggle');
            if (themeToggleBtn && !themeToggleBtn.dataset.bound) {
                themeToggleBtn.dataset.bound = 'true';
                themeToggleBtn.addEventListener('click', () => this.toggleTheme());
            }

            const rtlToggleBtn = document.getElementById('rtlToggle');
            if (rtlToggleBtn && !rtlToggleBtn.dataset.bound) {
                rtlToggleBtn.dataset.bound = 'true';
                rtlToggleBtn.addEventListener('click', () => this.toggleDir());
            }

            console.log('✅ App initialized successfully with persistent UI state');
        } catch (err) {
            console.error('Init error:', err);
        }
    },

    toggleTheme() {
        Store.state.theme = Store.state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('nova_theme', Store.state.theme);
        localStorage.setItem('theme', Store.state.theme);
        this.applyTheme();
    },

    applyTheme() {
        const isDark = Store.state.theme === 'dark';
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        const themeToggleBtn = document.getElementById('themeToggle');
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = `<span class="material-symbols-outlined">${isDark ? 'light_mode' : 'dark_mode'}</span>`;
        }
    },

    toggleDir() {
        Store.state.dir = Store.state.dir === 'ltr' ? 'rtl' : 'ltr';
        localStorage.setItem('nova_dir', Store.state.dir);
        localStorage.setItem('dir', Store.state.dir);
        this.applyDir();
    },

    applyDir() {
        const isRtl = Store.state.dir === 'rtl';
        document.documentElement.setAttribute('dir', Store.state.dir);
        
        const rtlToggleBtn = document.getElementById('rtlToggle');
        if (rtlToggleBtn) {
            rtlToggleBtn.innerHTML = isRtl
                ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12H3M21 6H6M21 18H9"></path></svg>`
                : `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12h18M3 6h15M3 18h12"></path></svg>`;
        }
    },

    toggleMobileMenu() {
        const menu = document.getElementById('mobileMenu') || document.getElementById('mobile-menu');
        if (!menu) return;
        Store.state.isMobileMenuOpen = !Store.state.isMobileMenuOpen;
        menu.classList.toggle('hidden');
    },

    openModal(id) {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('hidden');
            el.classList.add('flex');
            document.body.style.overflow = 'hidden';
        }
    },

    closeModal(id) {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('flex');
            el.classList.add('hidden');
            document.body.style.overflow = '';
        }
    },

    handleBookingSubmit(e) {
        e.preventDefault();
        this.closeModal('consultation-modal');
        this.toast('✅ Consultation request received! Our team will contact you within 2 hours.');
        e.target.reset();
    },

    syncGlobalUI() {
        const authZone = document.getElementById('auth-nav-zone');
        const mobileZone = document.getElementById('mobile-auth-zone');
        const isLoggedIn = auth.isAuthenticated();

        const htmlContent = isLoggedIn
            ? `<div class="flex items-center gap-2">
                <button onclick="router.navigate('dashboard')" class="bg-blue-600 dark:bg-cyan-400 text-white dark:text-slate-950 px-4 py-2 rounded-full text-[11px] font-bold shadow-lg hover:scale-105 transition-all whitespace-nowrap">
                    <i data-lucide="layout-dashboard" class="w-3.5 h-3.5 inline mr-1"></i> Dashboard
                </button>
                <button onclick="auth.logout()" class="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                    <i data-lucide="log-out" class="w-4 h-4"></i>
                </button>
            </div>`
            : `<button onclick="router.navigate('login')" class="bg-blue-600 dark:bg-white text-white dark:text-slate-950 px-4 py-2 rounded-full text-[11px] font-bold hover:shadow-xl transition-all whitespace-nowrap">
                <i data-lucide="log-in" class="w-3.5 h-3.5 inline mr-1"></i> Login
            </button>`;

        if (authZone) authZone.innerHTML = htmlContent;
        if (mobileZone) mobileZone.innerHTML = htmlContent;

        this.applyTheme();
        this.applyDir();

        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    handleScroll() {
        document.querySelectorAll('.reveal, .reveal-from-left, .reveal-from-right, .reveal-from-bottom, .reveal-from-top').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.9) el.classList.add('is-visible', 'active');
        });
    },

    toast(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        const icon = type === 'success' ? 'check-circle' : 'alert-circle';
        toast.className = `glass px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-l-4 border-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white`;
        toast.innerHTML = `<div class="text-emerald-500"><i data-lucide="${icon}"></i></div><span class="text-sm font-bold">${msg}</span>`;
        container.appendChild(toast);
        if (typeof lucide !== 'undefined') lucide.createIcons();
        setTimeout(() => toast.remove(), 3500);
    }
};

// ============================================================
// 5. ROUTER & VIEWS
// ============================================================

const Views = {
    async loadPage(name) {
        try {
            const res = await fetch(`pages/${name}.html`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.text();
        } catch (err) {
            return `<section class="max-w-7xl mx-auto px-6 py-24 text-center"><h1 class="text-4xl font-bold">Page ${name} missing.</h1><button onclick="router.navigate('home')" class="mt-4 px-6 py-3 bg-blue-600 text-white rounded-full">Return Home</button></section>`;
        }
    }
};

const router = {
    navigate(path) {
        window.location.hash = path;
    },

    async handleRoute() {
        let path = window.location.hash.slice(1) || 'home';
        const valid = ['home', 'home-2', 'treatments', 'doctors', 'stories', 'login', 'signup', 'dashboard', 'privacy', 'terms', '404', 'coming-soon', 'maintenance'];
        if (!valid.includes(path)) path = '404';

        const container = document.getElementById('app-view-container');
        if (!container) return;

        container.innerHTML = await Views.loadPage(path);
        
        app.applyTheme();
        app.applyDir();

        if (typeof lucide !== 'undefined') lucide.createIcons();
        window.scrollTo(0, 0);
        app.handleScroll();
    }
};

window.addEventListener('hashchange', () => router.handleRoute());

document.addEventListener('DOMContentLoaded', () => {
    app.init();
    if (!window.location.hash || window.location.hash === '#') {
        window.location.hash = 'home';
    } else {
        router.handleRoute();
    }
});

window.app = app;
window.auth = auth;
window.router = router;
window.Store = Store;
window.Views = Views;
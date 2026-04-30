window.MIKOTO_DB = [];
try {
    window.MIKOTO_DB = JSON.parse(localStorage.getItem('mikoto_users_db')) || [];
} catch(e) { console.error("Error parsing MIKOTO_DB", e); }

window.MIKOTO_STATE = {
    user: { username: '', avatar: '', email: '' },
    favorites: [],
    plannerItems: [],
    savedPlans: []
};

try {
    const savedUser = localStorage.getItem('mikoto_user');
    if (savedUser) window.MIKOTO_STATE.user = JSON.parse(savedUser);
    
    const savedFavorites = localStorage.getItem('mikoto_favorites');
    if (savedFavorites) window.MIKOTO_STATE.favorites = JSON.parse(savedFavorites);
    
    const savedItems = localStorage.getItem('mikoto_planner_items');
    if (savedItems) window.MIKOTO_STATE.plannerItems = JSON.parse(savedItems);

    const savedPlans = localStorage.getItem('mikoto_saved_plans');
    if (savedPlans) window.MIKOTO_STATE.savedPlans = JSON.parse(savedPlans);
} catch(e) {
    console.error("Error parsing MIKOTO_STATE", e);
}

window.saveState = function() {
    localStorage.setItem('mikoto_users_db', JSON.stringify(window.MIKOTO_DB));
    localStorage.setItem('mikoto_user', JSON.stringify(window.MIKOTO_STATE.user));
    localStorage.setItem('mikoto_favorites', JSON.stringify(window.MIKOTO_STATE.favorites));
    localStorage.setItem('mikoto_planner_items', JSON.stringify(window.MIKOTO_STATE.plannerItems));
    localStorage.setItem('mikoto_saved_plans', JSON.stringify(window.MIKOTO_STATE.savedPlans));
    
    // Save last user for persistence even when logged out
    if(window.MIKOTO_STATE.user.username) {
        localStorage.setItem('mikoto_last_user', JSON.stringify({
            username: window.MIKOTO_STATE.user.username,
            avatar: window.MIKOTO_STATE.user.avatar
        }));
    }
}

/**
 * Loads a predefined route and redirects to the planner
 * @param {string} routeType - 'golden', 'otaku', or 'food'
 */
window.loadPresetRoute = function(routeType) {
    if (typeof MOCK_PLACES === 'undefined') {
        console.error("MOCK_PLACES not found. Make sure data.js is loaded.");
        // Fallback or just redirect
        window.location.href = 'planner.html';
        return;
    }

    let items = [];
    
    if (routeType === 'golden') {
        items = [
            { ...MOCK_PLACES.find(p => p.id === 'p1'), day: 'День 1' }, // Shibuya
            { ...MOCK_PLACES.find(p => p.id === 'p2'), day: 'День 2' }, // Akihabara
            { ...MOCK_PLACES.find(p => p.id === 'p6'), day: 'День 2' }, // Tokyo Tower
            { ...MOCK_PLACES.find(p => p.id === 'p3'), day: 'День 3' }, // Fushimi Inari
            { ...MOCK_PLACES.find(p => p.id === 'p9'), day: 'День 4' }, // Kinkaku-ji
            { ...MOCK_PLACES.find(p => p.id === 'p10'), day: 'День 5' }, // Gion
            { ...MOCK_PLACES.find(p => p.id === 'p11'), day: 'День 6' }, // Dotonbori
            { ...MOCK_PLACES.find(p => p.id === 'p12'), day: 'День 7' }  // Osaka Castle
        ];
    } else if (routeType === 'otaku') {
        items = [
            { ...MOCK_PLACES.find(p => p.id === 'p2'), day: 'День 1' }, // Akihabara
            { ...MOCK_PLACES.find(p => p.id === 'p1'), day: 'День 1' }, // Shibuya (Manga stores)
            { ...MOCK_PLACES.find(p => p.id === 'p2'), name: "Ghibli Museum", city: "Токио", type: "anime", img: "https://images.unsplash.com/photo-1542931287-023b922fa89b?q=80&w=150", cost: 1000, time: "4 часа", lat: 35.6963, lng: 139.5704, day: 'День 2' },
            { ...MOCK_PLACES.find(p => p.id === 'p13'), day: 'День 4' }, // USJ
            { ...MOCK_PLACES.find(p => p.id === 'p5'), day: 'День 4' }  // Ichiran
        ];
    } else if (routeType === 'food') {
        items = [
            { ...MOCK_PLACES.find(p => p.id === 'p8'), day: 'День 1' }, // Omoide Yokocho
            { ...MOCK_PLACES.find(p => p.id === 'p11'), day: 'День 2' }, // Dotonbori
            { ...MOCK_PLACES.find(p => p.id === 'p5'), day: 'День 2' }, // Ichiran
            { ...MOCK_PLACES.find(p => p.id === 'p15'), day: 'День 3' } // Sapporo Beer Museum
        ];
    }

    // Filter out undefined if any place was not found
    MIKOTO_STATE.plannerItems = items.filter(i => i && (i.id || i.name)).map(i => ({
        ...i,
        id: i.id || ('preset_' + Math.random().toString(36).substr(2, 9))
    }));

    saveState();
    window.location.href = 'planner.html';
}

document.addEventListener("DOMContentLoaded", () => {
    
    // Inject Route Drawer UI
    const drawerHTML = `
        <button class="route-fab" id="open-route-drawer" title="Ваш маршрут">
            <i class="fa-solid fa-map"></i>
            <span class="route-fab-badge" id="route-badge">${MIKOTO_STATE.plannerItems.length}</span>
        </button>
        <div class="route-drawer" id="route-drawer">
            <div class="route-drawer-header">
                <h3>Мой маршрут</h3>
                <button class="route-drawer-close" id="close-route-drawer"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="route-drawer-content" id="route-drawer-content">
                <!-- Items will go here -->
            </div>
            <div class="route-drawer-footer">
                <button class="btn-primary" style="width:100%;" onclick="window.location.href='planner.html'">Открыть в Планировщике</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', drawerHTML);

    // Update Profile Link with Avatar (For all pages)
    const profileLinks = document.querySelectorAll('nav a[href="profile.html"], nav a[href="auth.html"]');
    
    let displayUser = window.MIKOTO_STATE.user.username ? window.MIKOTO_STATE.user : null;
    
    // If not logged in, try to get last user
    if(!displayUser) {
        try {
            const lastUserStr = localStorage.getItem('mikoto_last_user');
            if(lastUserStr) {
                displayUser = JSON.parse(lastUserStr);
            }
        } catch(e) {}
    }

    if(displayUser && displayUser.username) {
        profileLinks.forEach(link => {
            const avatarUrl = displayUser.avatar || `https://ui-avatars.com/api/?name=${displayUser.username}&background=d32f2f&color=fff`;
            // Only redirect to profile if actually logged in
            if (window.MIKOTO_STATE.user.username) link.href = 'profile.html';
            link.innerHTML = `<img src="${avatarUrl}" style="width:28px; height:28px; border-radius:50%; object-fit:cover; border:2px solid var(--primary); vertical-align:middle; margin-right:8px;"> ${displayUser.username}`;
        });
    }

    const drawer = document.getElementById('route-drawer');
    document.getElementById('open-route-drawer').addEventListener('click', () => {
        if(window.renderDrawer) window.renderDrawer();
        drawer.classList.add('open');
    });
    document.getElementById('close-route-drawer').addEventListener('click', () => {
        drawer.classList.remove('open');
    });

    window.renderDrawer = function() {
        const content = document.getElementById('route-drawer-content');
        document.getElementById('route-badge').innerText = MIKOTO_STATE.plannerItems.length;
        
        if(MIKOTO_STATE.plannerItems.length === 0) {
            content.innerHTML = '<p style="color:var(--text-muted);text-align:center;">Маршрут пока пуст</p>';
            return;
        }

        const grouped = {};
        const unassigned = [];
        MIKOTO_STATE.plannerItems.forEach(item => {
            if(item.day) {
                if(!grouped[item.day]) grouped[item.day] = [];
                grouped[item.day].push(item);
            } else {
                unassigned.push(item);
            }
        });

        let html = '';
        
        // Days
        for(let day in grouped) {
            html += `<h4 style="margin-top:16px; border-bottom:1px solid var(--glass-border); padding-bottom:8px; color:var(--primary);">${day}</h4>`;
            html += grouped[day].map(item => `
                <div class="route-drawer-item" style="margin-top:8px;">
                    <div>
                        <h4 style="margin-bottom:0;">${item.name}</h4>
                        <p>${item.city || 'Япония'}</p>
                    </div>
                    <button onclick="removePlannerItem('${item.id}')" style="background:none;border:none;color:var(--text-muted);cursor:pointer;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }

        // Unassigned
        if(unassigned.length > 0) {
            if(Object.keys(grouped).length > 0) {
                html += `<h4 style="margin-top:16px; border-bottom:1px solid var(--glass-border); padding-bottom:8px;">Не распределено</h4>`;
            }
            html += unassigned.map(item => `
                <div class="route-drawer-item" style="margin-top:8px;">
                    <div>
                        <h4 style="margin-bottom:0;">${item.name}</h4>
                        <p>${item.city || 'Япония'}</p>
                    </div>
                    <button onclick="removePlannerItem('${item.id}')" style="background:none;border:none;color:var(--text-muted);cursor:pointer;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }

        content.innerHTML = html;
    };

    window.removePlannerItem = function(id) {
        MIKOTO_STATE.plannerItems = MIKOTO_STATE.plannerItems.filter(i => i.id !== id);
        saveState();
        if(window.renderDrawer) window.renderDrawer();
        // If on planner, try to reload UI if possible
        if(window.location.pathname.includes('planner.html')) {
            location.reload();
        }
    };

    // Add To Plan Generic Buttons (Food, Anime, etc)
    document.querySelectorAll('.add-food-btn, .add-to-plan-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const name = btn.dataset.name;
            const cost = parseInt(btn.dataset.cost) || 0;
            const city = btn.dataset.city || 'Любой';
            const type = btn.dataset.type || 'food';
            
            // Check if already in plan
            if(window.MIKOTO_STATE.plannerItems.find(i => i.name === name)) {
                return;
            }

            const newItem = {
                id: 'custom_' + Date.now(),
                name: name,
                city: city,
                type: type,
                img: btn.dataset.img || '',
                cost: cost,
                time: '1-2 часа',
                lat: 35.6895, lng: 139.6917
            };

            MIKOTO_STATE.plannerItems.push(newItem);
            saveState();
            
            // Open drawer and animate button
            if(window.renderDrawer) window.renderDrawer();
            drawer.classList.add('open');
            
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Добавлено';
            btn.style.background = 'var(--primary)';
            btn.style.color = '#fff';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);
        });
    });

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if(target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Favorites Logic
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const itemId = btn.dataset.id;
        
        // Check if active
        if(window.MIKOTO_STATE.favorites.find(f => f.id === itemId)) {
            btn.classList.add('active');
            btn.innerHTML = '<i class="fa-solid fa-heart" style="color:#fff;"></i>';
        }

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const existing = window.MIKOTO_STATE.favorites.find(f => f.id === itemId);
            
            if(existing) {
                window.MIKOTO_STATE.favorites = window.MIKOTO_STATE.favorites.filter(f => f.id !== itemId);
                btn.classList.remove('active');
                btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
            } else {
                // Find parent card to get metadata
                const card = btn.closest('.card, .dish-card, .anime-feature-card, .landmark-item');
                let itemData = { 
                    id: itemId,
                    name: btn.dataset.name || 'Япония',
                    img: btn.dataset.img || '',
                    city: btn.dataset.city || 'Япония'
                };

                if(card) {
                    // Try to find image
                    const img = card.querySelector('img');
                    if(img && !itemData.img) itemData.img = img.src;

                    // Try to find name (h3 or .card-title)
                    const title = card.querySelector('h3, .card-title');
                    if(title && itemData.name === 'Япония') {
                        // Clone to remove spans (like .jp-name)
                        const titleClone = title.cloneNode(true);
                        titleClone.querySelectorAll('span').forEach(s => s.remove());
                        itemData.name = titleClone.innerText.trim();
                    }

                    // Try to find city/meta
                    const meta = card.querySelector('.card-meta, .jp-name, .city-tag');
                    if(meta && itemData.city === 'Япония') itemData.city = meta.innerText.trim();
                }

                window.MIKOTO_STATE.favorites.push(itemData);
                btn.classList.add('active');
                btn.innerHTML = '<i class="fa-solid fa-heart" style="color:#fff;"></i>';
            }
            saveState();
        });
    });


    const errorMsg = document.getElementById('auth-error-msg');

    // Handle Registration
    const regForm = document.getElementById('register-form');
    if(regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;

            // Check if user already exists
            const userExists = MIKOTO_DB.find(u => u.email === email);
            if(userExists) {
                errorMsg.innerText = "Пользователь с таким Email уже существует!";
                return;
            }

            // Save to "Database"
            const newUser = { username, email, password, avatar: '' };
            MIKOTO_DB.push(newUser);

            // Log them in immediately
            MIKOTO_STATE.user = { username, email, avatar: '' };
            saveState();
            window.location.href = 'profile.html';
        });
    }

    // Handle Login
    const loginForm = document.getElementById('login-form');
    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            // Find user in "Database"
            const user = MIKOTO_DB.find(u => u.email === email && u.password === password);
            if(!user) {
                errorMsg.innerText = "Неверный Email или пароль!";
                return;
            }

            // Login success
            MIKOTO_STATE.user = { username: user.username, email: user.email, avatar: user.avatar };
            saveState();
            window.location.href = 'profile.html';
        });
    }

});

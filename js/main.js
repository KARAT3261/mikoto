// Global App Logic, State, Simulated Database

const MIKOTO_DB = JSON.parse(localStorage.getItem('mikoto_users_db')) || [];

const MIKOTO_STATE = {
    user: JSON.parse(localStorage.getItem('mikoto_user')) || {
        username: '',
        avatar: '',
        email: ''
    },
    favorites: JSON.parse(localStorage.getItem('mikoto_favorites')) || [],
    plannerItems: JSON.parse(localStorage.getItem('mikoto_planner_items')) || []
};

function saveState() {
    localStorage.setItem('mikoto_users_db', JSON.stringify(MIKOTO_DB));
    localStorage.setItem('mikoto_user', JSON.stringify(MIKOTO_STATE.user));
    localStorage.setItem('mikoto_favorites', JSON.stringify(MIKOTO_STATE.favorites));
    localStorage.setItem('mikoto_planner_items', JSON.stringify(MIKOTO_STATE.plannerItems));
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
            if(MIKOTO_STATE.plannerItems.find(i => i.name === name)) {
                alert("Уже добавлено в маршрут!");
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
        if(MIKOTO_STATE.favorites.includes(itemId)) {
            btn.classList.add('active');
            btn.innerHTML = '<i class="fa-solid fa-heart" style="color:var(--primary);"></i>';
        }

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if(MIKOTO_STATE.favorites.includes(itemId)) {
                MIKOTO_STATE.favorites = MIKOTO_STATE.favorites.filter(id => id !== itemId);
                btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
            } else {
                MIKOTO_STATE.favorites.push(itemId);
                btn.innerHTML = '<i class="fa-solid fa-heart" style="color:var(--primary);"></i>';
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

// Drag and Drop Logic, Map functionality, and Planner tools

document.addEventListener("DOMContentLoaded", () => {
    const budgetAmount = document.getElementById("budget-amount");
    const itineraryBoard = document.getElementById("itinerary-board");
    const addDayBtn = document.getElementById("add-day-btn");
    
    let currentTotalCost = 0;
    let dayCount = 2; // Starting with 2 days
    let currentEditingDay = null;
    let currentModalTab = 'my-route';
    let jpyToRubRate = 0.62; // Fallback rate

    // Fetch real-time rate
    fetch('https://open.er-api.com/v6/latest/JPY')
        .then(res => res.json())
        .then(data => {
            if (data && data.rates && data.rates.RUB) {
                jpyToRubRate = data.rates.RUB;
                renderPlannerBoard(); // Re-render with new rate
            }
        })
        .catch(err => console.error("Error fetching exchange rate:", err));

    // Initialize Map (Leaflet)
    let map;
    let markers = [];
    
    if (document.getElementById('planner-map')) {
        map = L.map('planner-map').setView([35.6762, 139.6503], 5); // Center on Japan

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(map);
    }

    function addMarkerToMap(place) {
        if(!map) return;
        const marker = L.marker([place.lat, place.lng]).addTo(map);
        marker.bindPopup(`<b>${place.name}</b><br>${place.city}`).openPopup();
        markers.push({ id: place.id, marker: marker });
        
        // Pan to new marker
        map.flyTo([place.lat, place.lng], 12);
    }

    function clearMarkers() {
        if(!map) return;
        markers.forEach(m => map.removeLayer(m.marker));
        markers = [];
    }

    // Modal Logic for Adding Items
    window.openPlaceSelector = function(dayTitle) {
        currentEditingDay = dayTitle;
        document.getElementById('modal-day-title').innerText = `Добавить в ${dayTitle}`;
        document.getElementById('place-selector-modal').style.display = 'flex';
        renderModalList();
    };

    window.switchModalTab = function(tab) {
        currentModalTab = tab;
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.getElementById('tab-' + tab).classList.add('active');
        renderModalList();
    };

    function renderModalList() {
        const list = document.getElementById('modal-places-list');
        const searchInput = document.getElementById('modal-place-search');
        if(!searchInput) return;
        const search = searchInput.value.toLowerCase();
        
        let itemsToRender = [];
        if(currentModalTab === 'my-route') {
            itemsToRender = MIKOTO_STATE.plannerItems.filter(i => !i.day);
        } else {
            itemsToRender = MOCK_PLACES;
        }

        if(search) {
            itemsToRender = itemsToRender.filter(i => i.name.toLowerCase().includes(search) || (i.city && i.city.toLowerCase().includes(search)));
        }

        list.innerHTML = '';
        if(itemsToRender.length === 0) {
            list.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding: 24px;">Ничего не найдено</p>`;
            return;
        }

        itemsToRender.forEach(place => {
            const card = document.createElement("div");
            card.className = "place-card";
            card.style.cursor = "default";
            card.innerHTML = `
                <img src="${place.img}" alt="${place.name}">
                <div class="place-info" style="flex:1;">
                    <h4 style="margin-bottom:4px; font-size:16px;">${place.name}</h4>
                    <p style="font-size:12px; color:var(--text-muted);"><i class="fa-solid fa-location-dot"></i> ${place.city} • ¥${place.cost}</p>
                </div>
                <button class="btn-primary" style="padding:8px 16px;"><i class="fa-solid fa-plus"></i></button>
            `;
            
            card.querySelector('button').addEventListener('click', () => {
                if(currentModalTab === 'my-route') {
                    place.day = currentEditingDay;
                } else {
                    // It's a mock place, clone it
                    const clone = {...place, id: 'custom_'+Date.now(), day: currentEditingDay};
                    window.MIKOTO_STATE.plannerItems.push(clone);
                }
                
                if(typeof window.saveState === 'function') window.saveState();
                
                document.getElementById('place-selector-modal').style.display = 'none';
                renderPlannerBoard();
                if(window.renderDrawer) window.renderDrawer();
            });
            list.appendChild(card);
        });
    }

    if(document.getElementById('modal-place-search')) {
        document.getElementById('modal-place-search').addEventListener('input', renderModalList);
    }

    // Core Planner Board Rendering
    function renderPlannerBoard() {
        if(!window.MIKOTO_STATE) return;

        // Clear columns dropzones
        document.querySelectorAll('.dropzone').forEach(dz => dz.innerHTML = '');
        clearMarkers();
        currentTotalCost = 0;

        // Find max day to create required columns
        let maxDay = 2;
        MIKOTO_STATE.plannerItems.forEach(item => {
            if(item.day && item.day.startsWith("День ")) {
                const dayNum = parseInt(item.day.replace("День ", ""));
                if(dayNum > maxDay) maxDay = dayNum;
            }
        });

        while(dayCount < maxDay) {
            addNewDayColumn();
        }

        // Place items
        MIKOTO_STATE.plannerItems.forEach(item => {
            if(item.day) {
                const dayCols = document.querySelectorAll('.day-column');
                dayCols.forEach(dc => {
                    const h3Text = dc.querySelector('h3').textContent.trim();
                    if(h3Text === item.day.trim()) {
                        const dz = dc.querySelector('.dropzone');
                        
                        const el = document.createElement('div');
                        el.className = "itinerary-item";
                        el.style.borderLeftColor = (typeof TYPE_COLORS !== 'undefined' && TYPE_COLORS[item.type]) ? TYPE_COLORS[item.type] : "var(--primary)";
                        el.innerHTML = `
                            <div class="itinerary-item-header">
                                <strong>${item.name}</strong>
                                <i class="fa-solid fa-xmark remove-btn" style="cursor:pointer; color:var(--text-muted);" title="Убрать из дня"></i>
                            </div>
                            <div class="time-slot"><i class="fa-regular fa-clock"></i> ${item.time || '1 час'}</div>
                        `;
                        
                        el.querySelector('.remove-btn').addEventListener('click', () => {
                            item.day = null; // Unassign instead of delete
                            if(typeof saveState === 'function') saveState();
                            renderPlannerBoard();
                            if(window.renderDrawer) window.renderDrawer();
                        });

                        dz.appendChild(el);
                        
                        currentTotalCost += parseInt(item.cost) || 0;
                        
                        // Fallback coordinates if none exist
                        if(!item.lat) item.lat = 35.6895;
                        if(!item.lng) item.lng = 139.6917;
                        addMarkerToMap(item);
                    }
                });
            }
        });

        budgetAmount.innerText = currentTotalCost.toLocaleString('ru-RU');
        
        const rubAmount = document.getElementById("budget-rub");
        if (rubAmount) {
            const totalRub = Math.round(currentTotalCost * jpyToRubRate);
            rubAmount.innerText = totalRub.toLocaleString('ru-RU');
        }
    }

    function addNewDayColumn() {
        dayCount++;
        const newDayCol = document.createElement("div");
        newDayCol.className = "day-column";
        newDayCol.innerHTML = `
            <div class="day-header">
                <h3>День ${dayCount}</h3>
                <i class="fa-solid fa-trash-can remove-day-btn" onclick="removeDay('День ${dayCount}')" title="Удалить день" style="cursor:pointer; color:var(--text-muted); font-size:14px;"></i>
            </div>
            <div class="dropzone" id="day-${dayCount}" data-day="${dayCount}">
            </div>
            <button class="add-to-day-btn" onclick="openPlaceSelector('День ${dayCount}')">
                <i class="fa-solid fa-plus" style="margin-right:8px;"></i> Добавить место
            </button>
        `;
        itineraryBoard.insertBefore(newDayCol, addDayBtn);
    }

    window.removeDay = function(dayTitle) {
        // Unassign items
        window.MIKOTO_STATE.plannerItems.forEach(item => {
            if (item.day === dayTitle) {
                item.day = null;
            }
        });

        // If it was the last day, decrement dayCount
        if (dayTitle === `День ${dayCount}`) {
            dayCount--;
        }

        // Find the column and remove it
        const columns = document.querySelectorAll('.day-column');
        columns.forEach(col => {
            if (col.querySelector('h3').textContent.trim() === dayTitle) {
                col.remove();
            }
        });

        if (typeof window.saveState === 'function') window.saveState();
        renderPlannerBoard();
        if (window.renderDrawer) window.renderDrawer();
    };

    window.scrollBoard = function(amount) {
        const board = document.getElementById('itinerary-board');
        if (board) {
            board.scrollBy({
                left: amount,
                behavior: 'smooth'
            });
        }
    };

    if(addDayBtn) {
        addDayBtn.addEventListener("click", () => {
            addNewDayColumn();
            itineraryBoard.scrollLeft = itineraryBoard.scrollWidth;
        });
    }

    // Save Button
    const saveBtn = document.getElementById("save-plan-btn");
    if(saveBtn) {
        saveBtn.addEventListener("click", () => {
            if (window.MIKOTO_STATE.plannerItems.length === 0) return;

            const newPlan = {
                id: 'plan_' + Date.now(),
                date: new Date().toLocaleDateString('ru-RU'),
                items: [...window.MIKOTO_STATE.plannerItems],
                totalCost: currentTotalCost
            };

            window.MIKOTO_STATE.savedPlans.push(newPlan);
            if (typeof window.saveState === 'function') window.saveState();
            
            const originalHTML = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Сохранено!';
            saveBtn.style.background = '#2e7d32'; // Green
            setTimeout(() => {
                saveBtn.innerHTML = originalHTML;
                saveBtn.style.background = '';
            }, 2000);
        });
    }

    // Initial load
    setTimeout(renderPlannerBoard, 100);
});

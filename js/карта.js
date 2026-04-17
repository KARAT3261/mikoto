const prefTranslations = {
    "Aichi": "Айти", "Akita": "Акита", "Aomori": "Аомори", "Chiba": "Тиба",
    "Ehime": "Эхиме", "Fukui": "Фукуи", "Fukuoka": "Фукуока", "Fukushima": "Фукусима",
    "Gifu": "Гифу", "Gunma": "Гумма", "Hiroshima": "Хиросима", "Hokkaido": "Хоккайдо",
    "Hyogo": "Хёго", "Ibaraki": "Ибараки", "Ishikawa": "Исикава", "Iwate": "Иватэ",
    "Kagawa": "Кагава", "Kagoshima": "Кагосима", "Kanagawa": "Канагава", "Kochi": "Коти",
    "Kumamoto": "Кумамото", "Kyoto": "Киото", "Mie": "Миэ", "Miyagi": "Мияги",
    "Miyazaki": "Миядзаки", "Nagano": "Нагано", "Nagasaki": "Нагасаки", "Nara": "Нара",
    "Niigata": "Ниигата", "Oita": "Оита", "Okayama": "Окаяма", "Okinawa": "Окинава",
    "Osaka": "Осака", "Saga": "Сага", "Saitama": "Сайтама", "Shiga": "Сига",
    "Shimane": "Симанэ", "Shizuoka": "Сидзуока", "Tochigi": "Тотиги", "Tokushima": "Токусима",
    "Tokyo": "Токио", "Tottori": "Тоттори", "Toyama": "Тояма", "Wakayama": "Вакаяма",
    "Yamagata": "Ямагата", "Yamaguchi": "Ямагути", "Yamanashi": "Яманаси"
};

const D3_PROJECTION_CENTER = [137.0, 38.0]; // Примерный центр Японии
const D3_PROJECTION_SCALE = 1600;

let scene, camera, renderer, controls;
let mapGroup = new THREE.Group();
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let hoveredMesh = null;

const tooltip = document.getElementById('tooltip');

init();
animate();

function init() {
    // 1. Настройка сцены
    const container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    scene.background = null; // Пропускаем фоновый градиент из CSS

    // Настройка камеры (Зафиксированная)
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    // Ракурс будет автоматически подстроен после загрузки карты
    camera.position.set(0, -60, 110);
    camera.lookAt(0, 0, 0);

    // Настройка рендерера
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // OrbitControls для взаимодействия
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Переназначаем кнопки мыши: Левая - перемещение (pan), Правая - вращение
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE
    };

    // Освещение (настроено для белой карты)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(20, -50, 50);
    scene.add(dirLight);

    const softLight = new THREE.DirectionalLight(0xddddff, 0.4);
    softLight.position.set(-20, 50, 20);
    scene.add(softLight);

    scene.add(mapGroup);

    // 2. Загрузка GeoJSON
    loadGeoData();

    // Слушатели событий
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick); // Добавляем клик
}

function loadGeoData() {
    const geojsonUrl = "https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson";

    fetch(geojsonUrl)
        .then(res => res.json())
        .then(data => {
            buildMap(data);
        })
        .catch(err => {
            console.error("Ошибка загрузки, пробуем запасной вариант...", err);
            fetch("https://raw.githubusercontent.com/piuccio/open-data-jp-prefectures-geojson/master/prefectures.json")
                .then(res => res.json())
                .then(data => buildMap(data))
                .catch(e => console.error("Критическая ошибка:", e));
        });
}

function buildMap(geoData) {
    // 3. Настройка проекции D3
    const projection = d3.geoMercator()
        .center(D3_PROJECTION_CENTER)
        .scale(D3_PROJECTION_SCALE)
        .translate([0, 0]);

    // Базовый материал - белый цвет
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff, // Белый цвет
        opacity: 1.0,
        roughness: 0.5,
        metalness: 0.1,
    });

    const extrudeSettings = {
        depth: 1.5, // Глубина (высота)
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.05,
        bevelThickness: 0.05
    };

    geoData.features.forEach(feature => {
        const geometryType = feature.geometry.type;
        const coordinates = feature.geometry.coordinates;

        // Поиск англ. названия в свойствах
        const engName = feature.properties.nam || feature.properties.name || feature.properties.nam_en || "Region";
        
        let ruName = engName;
        // Подготавливаем строку для умного поиска
        const lowerEng = engName.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
        for (const key in prefTranslations) {
            const lowerKey = key.toLowerCase();
            if (lowerEng === lowerKey || lowerEng.startsWith(lowerKey)) {
                ruName = prefTranslations[key];
                break;
            }
        }

        if (geometryType === 'Polygon') {
            createPolygonShape(coordinates[0], projection, material, extrudeSettings, ruName);
        } else if (geometryType === 'MultiPolygon') {
            coordinates.forEach(polygonCoords => {
                createPolygonShape(polygonCoords[0], projection, material, extrudeSettings, ruName);
            });
        }
    });

    // Центрирование карты по координате 0,0,0
    const box = new THREE.Box3().setFromObject(mapGroup);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    mapGroup.position.sub(center);

    // Подстраиваем камеру, чтобы было видно всю карту
    // Вычисляем максимальный размер карты по осям X и Y
    const maxDim = Math.max(size.x, size.y);
    const fov = camera.fov * (Math.PI / 180);
    // Вычисляем дистанцию, на которой объект высотой/шириной maxDim полностью влезет в кадр
    let cameraZ = Math.abs((maxDim / 2) / Math.tan(fov / 2));

    // Добавим множитель отступа (zoom out), чтобы карта не прилипала к краям экрана
    // Уменьшено с 1.35 до 0.95 по просьбе, чтобы карта была крупнее
    cameraZ *= 0.90;

    // Смещаем камеру вниз по Y (чтобы видеть сбоку/снизу) и назад по Z
    // Можно варьировать эти числа, чтобы менять угол просмотра (например -cameraZ * 0.3)
    camera.position.set(0, -cameraZ * 0.25, cameraZ);
    camera.lookAt(0, 0, 0);
}

function createPolygonShape(points, projection, material, extrudeSettings, name) {
    const shape = new THREE.Shape();

    points.forEach((point, index) => {
        const [x, y] = projection(point);
        // Инвертируем Y, так как в Three Y смотрит вверх
        if (index === 0) {
            shape.moveTo(x, -y);
        } else {
            shape.lineTo(x, -y);
        }
    });

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Клонируем материал для возможности отдельной подсветки каждого региона
    const meshMaterial = material.clone();

    const mesh = new THREE.Mesh(geometry, meshMaterial);

    // ДОБАВЛЯЕМ ЧЕРНЫЕ ЛИНИИ ГРАНИЦ
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1 });
    const lineSegments = new THREE.LineSegments(edges, lineMaterial);
    mesh.add(lineSegments);

    mesh.userData = {
        name: name,
        baseColor: meshMaterial.color.getHex(),
        baseZ: mesh.position.z
    };

    mapGroup.add(mesh);
}

function onMouseMove(event) {
    // Нормализация координат от -1 до 1
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Плавное следование тултипа
    gsap.to(tooltip, {
        left: event.clientX + 15,
        top: event.clientY + 15,
        duration: 0.2,
        ease: "power2.out"
    });

    // 4. Raycasting для наведения (с false, чтобы луч не пересекал добавленные черные линии)
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(mapGroup.children, false);

    if (intersects.length > 0) {
        const object = intersects[0].object;

        if (hoveredMesh !== object) {
            // Сброс предыдущего региона
            if (hoveredMesh) {
                gsap.to(hoveredMesh.scale, { z: 1, duration: 0.3, ease: "power2.out" });
                gsap.to(hoveredMesh.material.emissive, { r: 0, g: 0, b: 0, duration: 0.3 });
                gsap.to(hoveredMesh.material.color, { r: 1, g: 1, b: 1, duration: 0.3 }); // Возврат к белому
            }

            hoveredMesh = object;

            // Выделение нового региона
            gsap.to(hoveredMesh.scale, { z: 3, duration: 0.4, ease: "back.out(1.5)" });
            gsap.to(hoveredMesh.material.emissive, { r: 0, g: 0.4, b: 0.7, duration: 0.3 }); // Голубое свечение
            gsap.to(hoveredMesh.material.color, { r: 0.5, g: 0.8, b: 1.0, duration: 0.3 });

            tooltip.innerHTML = hoveredMesh.userData.name;
            tooltip.style.opacity = 1;
            document.body.style.cursor = 'pointer'; // Меняем курсор
        }
    } else {
        if (hoveredMesh) {
            // Сброс, когда мышь уходит с карты
            gsap.to(hoveredMesh.scale, { z: 1, duration: 0.3, ease: "power2.out" });
            gsap.to(hoveredMesh.material.emissive, { r: 0, g: 0, b: 0, duration: 0.3 });
            gsap.to(hoveredMesh.material.color, { r: 1, g: 1, b: 1, duration: 0.3 }); // Возврат к белому

            hoveredMesh = null;
            tooltip.style.opacity = 0;
            document.body.style.cursor = 'default';
        }
    }
}

// 5. Обработка клика
function onClick() {
    if (hoveredMesh) {
        const cityName = hoveredMesh.userData.name;
        // Переход на созданный HTML-файл города/региона
        window.location.href = cityName + ".html";
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update(); // Обновляем для плавности (damping)
    renderer.render(scene, camera);
}

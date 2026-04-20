const fs = require('fs');
const path = require('path');

const cities = [
    { name: "Айти", title: "Айти", desc: "Префектура Айти — промышленное сердце Японии, родина компании Toyota. Здесь находится величественный замок Нагоя и музей под открытым небом Мэйдзи-мура.", tags: "nagoya,japan,industrial" },
    { name: "Акита", title: "Акита", desc: "Акита славится своей дикой природой, горячими источниками и верными собаками породы Акита-ину. Здесь проходит один из самых ярких фестивалей Японии — Канто Мацури.", tags: "akita,japan,nature" },
    { name: "Аомори", title: "Аомори", desc: "Аомори — самая северная префектура острова Хонсю. Она знаменита своими яблоками и грандиозным летним фестивалем Нэбута с огромными подсвеченными бумажными фигурами.", tags: "aomori,japan,festival" },
    { name: "Вакаяма", title: "Вакаяма", desc: "Священный регион, где находятся гора Коя-сан и водопад Нати. Вакаяма — духовный центр Японии, конечная точка паломнического пути Кумано-кодо.", tags: "wakayama,japan,temple" },
    { name: "Гифу", title: "Гифу", desc: "Префектура Гифу известна своими горами и деревней Сиракава-го, внесенной в список ЮНЕСКО за уникальные домики с соломенными крышами гассё-дзукури.", tags: "gifu,japan,village" },
    { name: "Гумма", title: "Гумма", desc: "Гумма — это край горячих источников (онсэнов). Знаменитый курорт Кусацу привлекает тысячи туристов своими целебными водами и уникальными традициями охлаждения воды 'юмоми'.", tags: "gunma,japan,onsen" },
    { name: "Ибараки", title: "Ибараки", desc: "Ибараки славится парком Хитачи-Сисайд, где весной расцветают миллионы незабудок (немофил), превращая поля в бескрайнее синее море.", tags: "ibaraki,japan,park" },
    { name: "Иватэ", title: "Иватэ", desc: "Иватэ — вторая по площади префектура Японии. Здесь находятся великолепные храмы Хираидзуми и живописное побережье Санрику с высокими скалами.", tags: "iwate,japan,coast" },
    { name: "Исикава", title: "Исикава", desc: "Культурный центр Канадзава в Исикаве сохранил дух древней Японии. Главная жемчужина — Кэнроку-эн, один из трех самых красивых садов страны.", tags: "ishikawa,japan,garden" },
    { name: "Кагава", title: "Кагава", desc: "Самая маленькая префектура Японии, называемая 'королевством удона'. Здесь находится прекрасный парк Рицурин и священное святилище Компира-сан.", tags: "kagawa,japan,shrine" },
    { name: "Кагосима", title: "Кагосима", desc: "Южный форпост Японии с активным вулканом Сакурадзима. Кагосиму часто называют 'японским Неаполем' за ее климат и близость к морю.", tags: "kagoshima,japan,volcano" },
    { name: "Канагава", title: "Канагава", desc: "Префектура Канагава включает в себя современную Иокогаму, историческую Камакуру с Большим Буддой и живописные виды на Фудзи из Хаконе.", tags: "kanagawa,japan,kamakura" },
    { name: "Коти", title: "Коти", desc: "Расположенная на юге острова Сикоку, префектура Коти славится своей дикой природой, чистейшими реками и гостеприимством местных жителей.", tags: "kochi,japan,river" },
    { name: "Кумамото", title: "Кумамото", desc: "Здесь находится один из крупнейших замков Японии и величественная гора Асо — один из самых больших действующих вулканов в мире.", tags: "kumamoto,japan,castle" },
    { name: "Миэ", title: "Миэ", desc: "Миэ — дом для самой священной святыни Японии, Исэ-дзингу. Также префектура известна как родина ниндзя (Ига) и жемчуга Микимото.", tags: "mie,japan,ninja" },
    { name: "Мияги", title: "Мияги", desc: "Центр региона Тохоку. Здесь находятся знаменитые сосны острова Мацусима, которые считаются одним из трех самых красивых видов Японии.", tags: "miyagi,japan,matsushima" },
    { name: "Миядзаки", title: "Миядзаки", desc: "Миядзаки — настоящая японская Ривьера с пальмами на побережье, мистическим ущельем Такатихо и уникальными легендами о рождении императорского рода.", tags: "miyazaki,japan,coast" },
    { name: "Нагано", title: "Нагано", desc: "Горный рай, принимавший Зимнюю Олимпиаду-1998. Славится своими 'снежными обезьянами', принимающими горячие ванны в Дзигокудани.", tags: "nagano,japan,snow" },
    { name: "Нагасаки", title: "Нагасаки", desc: "Нагасаки — город с уникальной историей, долгое время бывший единственным окном Японии в мир. Сочетает европейские, китайские и японские традиции.", tags: "nagasaki,japan,port" },
    { name: "Нара", title: "Нара", desc: "Первая постоянная столица Японии. Здесь ручные олени гуляют по городу, а в храме Тодай-дзи восседает Великий Будда.", tags: "nara,japan,deer" },
    { name: "Ниигата", title: "Ниигата", desc: "Рисовая житница Японии. Ниигата производит лучший рис и самое качественное сакэ в стране, а зимой превращается в горнолыжный курорт Сноу-Кантри.", tags: "niigata,japan,rice" },
    { name: "Оита", title: "Оита", desc: "Столица онсэнов — Бэппу и Юфуин предлагают невероятное разнообразие горячих источников: от 'кровавых прудов' до грязевых ванн.", tags: "oita,japan,onsen" },
    { name: "Окаяма", title: "Окаяма", desc: "Известна как 'колыбель Момотаро' (Мальчика-персика) и дом одного из красивейших садов Кораку-эн и аутентичного квартала Курасики Бикан.", tags: "okayama,japan,garden" },
    { name: "Окинава", title: "Окинава", desc: "Тропический рай Японии с бирюзовым морем, белыми пляжами и уникальной культурой Рюкю, отличающейся от основной страны.", tags: "okinawa,japan,beach" },
    { name: "Осака", title: "Осака", desc: "Гастрономическая столица Японии, родина ярких огней Дотонбори, грандиозного замка Осака и самых веселых людей в стране.", tags: "osaka,japan,neon" },
    { name: "Сага", title: "Сага", desc: "Префектура Сага знаменита своим фарфором Арита и Имари, который высоко ценился даже европейскими королями столетия назад.", tags: "saga,japan,porcelain" },
    { name: "Сайтама", title: "Сайтама", desc: "Расположенная рядом с Токио, Сайтама привлекает туристов историческим 'Маленьким Эдо' — городом Кавагоэ с его старинными складами.", tags: "saitama,japan,city" },
    { name: "Сига", title: "Сига", desc: "В центре префектуры Сига лежит озеро Бива — самое большое пресноводное озеро в Японии, окруженное живописными храмами и горами.", tags: "shiga,japan,lake" },
    { name: "Сидзуока", title: "Сидзуока", desc: "Родина лучшего японского зеленого чая и обладательница лучших видов на священную гору Фудзи с побережья Тихого океана.", tags: "shizuoka,japan,tea" },
    { name: "Симанэ", title: "Симанэ", desc: "Регион мифов и легенд. Здесь находится святилище Идзумо-тайся, куда, по преданиям, раз в год слетаются все боги Японии.", tags: "shimane,japan,shrine" },
    { name: "Тиба", title: "Тиба", desc: "Врата Японии через аэропорт Нарита. Здесь расположены Токийский Диснейленд и великолепное побережье Кудзюкури.", tags: "chiba,japan,disney" },
    { name: "Токио", title: "Токио", desc: "Самый населенный мегаполис мира. Город, где небоскребы Синдзюку соседствуют со старыми храмами Асакусы в бесконечном движении.", tags: "tokyo,japan,shibuya" },
    { name: "Токусима", title: "Токусима", desc: "Знаменита фестивалем танца Ава-одори и впечатляющими водоворотами Наруто в проливе между островами Сикоку и Авадзи.", tags: "tokushima,japan,sea" },
    { name: "Тотиги", title: "Тотиги", desc: "Главная достопримечательность — Никко. Роскошные святилища и храмы, окруженные древними кедрами и живописными водопадами.", tags: "tochigi,japan,nikko" },
    { name: "Тоттори", title: "Тоттори", desc: "Единственное место в Японии с настоящими песчаными дюнами, которые создают ощущение пустыни на берегу Японского моря.", tags: "tottori,japan,dunes" },
    { name: "Тояма", title: "Тояма", desc: "Известна своим заливом и 'снежным коридором' на горном маршруте Татэяма Куробэ, где высота стен из снега достигает 20 метров.", tags: "toyama,japan,snow" },
    { name: "Фукуи", title: "Фукуи", desc: "Рай для любителей динозавров и дзен-буддизма. Здесь находится один из лучших в мире музеев динозавров и монастырь Эйхэй-дзи.", tags: "fukui,japan,temple" },
    { name: "Фукуока", title: "Фукуока", desc: "Главный город острова Кюсю, известный своим раменом 'Хаката' и уникальными ночными палатками с едой — ятаи.", tags: "fukuoka,japan,ramen" },
    { name: "Фукусима", title: "Фукусима", desc: "Регион самурайского духа, красивых озер Бандай-сан и великолепной сакуры. Традиции здесь живы в каждом уголке.", tags: "fukushima,japan,nature" },
    { name: "Хиросима", title: "Хиросима", desc: "Город мира на берегу залива. Здесь находится остров Ицукусима со знаменитыми 'плавающими' красными ториями.", tags: "hiroshima,japan,peace" },
    { name: "Хоккайдо", title: "Хоккайдо", desc: "Край нетронутой природы, снежных фестивалей и широких лавандовых полей. Хоккайдо дарит ощущение простора и свежести.", tags: "hokkaido,japan,nature" },
    { name: "Хёго", title: "Хёго", desc: "В Хёго находится замок Белой Цапли (Химэдзи) — самый красивый и сохранный замок Японии, а также город Кобе со знаменитой говядиной.", tags: "hyogo,japan,castle" },
    { name: "Эхиме", title: "Эхиме", desc: "Знаменита старейшим в Японии онсэном Дого и своими цитрусовыми. Здесь можно проехать живописным маршрутом Симанами Кайдо над морем.", tags: "ehime,japan,ocean" },
    { name: "Ямагата", title: "Ямагата", desc: "Горная префектура, известная храмом Ямадэра на скале и заснеженными деревьями 'снежными монстрами' на горе Дзао.", tags: "yamagata,japan,temple" },
    { name: "Ямагути", title: "Ямагути", desc: "Здесь находятся изящный мост Кинтай и святилище Мотоносуми с цепочкой из 123 красных торий на берегу моря.", tags: "yamaguchi,japan,tori" },
    { name: "Яманаси", title: "Яманаси", desc: "Регион Пяти озер Фудзи и лучшие виноградники Японии. Отсюда открываются классические открыточные виды на гору Фудзияма.", tags: "yamanashi,japan,fuji" }
];

const template = `<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}} - Микото</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Infant:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;600&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="../css/города.css">
</head>

<body>
    <div class="city-container">
        <nav class="city-nav">
            <a href="../начало и карта/карта.html" class="nav-link">Карта</a>
            <a href="../Мифология/Мифология.html" class="nav-link">Мифология</a>
        </nav>

        <!-- Картинки (Слайдер) -->
        <div class="carousel-container">
            <div class="carousel-slide" id="carouselSlide">
                <img src="https://images.unsplash.com/photo-{{IMG1}}?q=80&w=2070&auto=format&fit=crop" alt="{{TITLE}} 1">
                <img src="https://images.unsplash.com/photo-{{IMG2}}?q=80&w=2070&auto=format&fit=crop" alt="{{TITLE}} 2">
                <img src="https://images.unsplash.com/photo-{{IMG3}}?q=80&w=2070&auto=format&fit=crop" alt="{{TITLE}} 3">
            </div>

            <button class="carousel-btn prev" id="prevBtn">&#10094;</button>
            <button class="carousel-btn next" id="nextBtn">&#10095;</button>
        </div>

        <div class="city-info">
            <h1 class="city-huge-title">{{TITLE}}</h1>

            <div class="wiki-desc">
                <p>{{DESC}}</p>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener("DOMContentLoaded", () => {
            const slide = document.getElementById('carouselSlide');
            const images = slide.querySelectorAll('img');
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');

            let counter = 0;
            let size = images[0].clientWidth;

            // Автоматическое переключение
            let autoSlide = setInterval(() => {
                moveToNext();
            }, 5000);

            function updateSlidePosition() {
                size = images[0].clientWidth;
                slide.style.transition = "transform 0.5s ease-in-out";
                slide.style.transform = 'translateX(' + (-size * counter) + 'px)';
            }

            function moveToNext() {
                if (counter >= images.length - 1) {
                    counter = 0;
                } else {
                    counter++;
                }
                updateSlidePosition();
            }

            function moveToPrev() {
                if (counter <= 0) {
                    counter = images.length - 1;
                } else {
                    counter--;
                }
                updateSlidePosition();
            }

            nextBtn.addEventListener('click', () => {
                clearInterval(autoSlide);
                moveToNext();
                autoSlide = setInterval(moveToNext, 5000);
            });

            prevBtn.addEventListener('click', () => {
                clearInterval(autoSlide);
                moveToPrev();
                autoSlide = setInterval(moveToNext, 5000);
            });

            window.addEventListener('resize', () => {
                slide.style.transition = 'none';
                size = images[0].clientWidth;
                slide.style.transform = 'translateX(' + (-size * counter) + 'px)';
            });
        });
    </script>
</body>

</html>`;

// Заранее выбранные ID изображений с Unsplash для разнообразия (просто заглушки для некоторых)
const stockImages = [
    "1493976040374-85c8e12f0c0e", "1545569341-9eb8b30979d9", "1624253321171-1be53e12f5f4",
    "1528164344705-4754268799af", "1475116127127-da3347c1c68a", "15420518418c7-4737b7929239",
    "1551641506-ee5bf4cb45f1", "1518709268805-4e9042af9f23", "1490730141103-6cac27aaab94",
    "1516483642780-6c66bca02923", "1540959733332-e9ab42bf0ad1", "1526481280693-3bfa756180f1",
    "1545127398-14699f92334b", "1554123168-b3d1f046424e", "1503899036084-c55cdd92da26"
];

function getRandomImg() {
    return stockImages[Math.floor(Math.random() * stockImages.length)];
}

const citiesDir = path.join(__dirname, 'Города');

cities.forEach(city => {
    let content = template.replace(/{{TITLE}}/g, city.title)
                          .replace(/{{DESC}}/g, city.desc)
                          .replace(/{{IMG1}}/g, getRandomImg())
                          .replace(/{{IMG2}}/g, getRandomImg())
                          .replace(/{{IMG3}}/g, getRandomImg());
    
    const filePath = path.join(citiesDir, `${city.name}.html`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Generated ${city.name}.html`);
});

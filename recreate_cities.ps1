$template = @"
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}} - Микото</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Infant:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/города.css">
</head>
<body>
    <div class="city-container">
        <nav class="city-nav">
            <a href="../начало и карта/карта.html" class="nav-link">Карта</a>
            <a href="../Мифология/Мифология.html" class="nav-link">Мифология</a>
        </nav>
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
            <div class="wiki-desc"><p>{{DESC}}</p></div>
        </div>
    </div>
    <script>
        document.addEventListener("DOMContentLoaded", () => {
            const slide = document.getElementById('carouselSlide');
            const images = slide.querySelectorAll('img');
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            let counter = 0;
            const size = () => images[0] ? images[0].clientWidth : 0;
            let autoSlide = setInterval(moveToNext, 5000);
            function updateSlidePosition() {
                const s = size();
                if (s === 0) return;
                slide.style.transition = "transform 0.5s ease-in-out";
                slide.style.transform = 'translateX(' + (-s * counter) + 'px)';
            }
            function moveToNext() {
                counter = (counter >= images.length - 1) ? 0 : counter + 1;
                updateSlidePosition();
            }
            function moveToPrev() {
                counter = (counter <= 0) ? images.length - 1 : counter - 1;
                updateSlidePosition();
            }
            nextBtn.addEventListener('click', () => { clearInterval(autoSlide); moveToNext(); autoSlide = setInterval(moveToNext, 5000); });
            prevBtn.addEventListener('click', () => { clearInterval(autoSlide); moveToPrev(); autoSlide = setInterval(moveToNext, 5000); });
            window.addEventListener('resize', () => { slide.style.transition = 'none'; updateSlidePosition(); });
            setTimeout(updateSlidePosition, 500);
        });
    </script>
</body>
</html>
"@

$cities = @(
    @{ name = "Хоккайдо"; desc = "Самый северный остров Японии, знаменитый своей первозданной природой, снежными фестивалями и лучшими морепродуктами."; img = "1551641506-ee5bf4cb45f1" },
    @{ name = "Окинава"; desc = "Тропический рай Японии с бирюзовым морем, коралловыми рифами и уникальной культурой Рюкю."; img = "1540959733332-e9ab42bf0ad1" },
    @{ name = "Хиросима"; desc = "Город мира на берегу моря, известный своим мемориальным парком и прекрасным островом Ицукусима."; img = "15420518418c7-4737b7929239" },
    @{ name = "Айти"; desc = "Промышленное сердце Японии и родина Toyota, где современные технологии встречаются с наследием замка Нагоя."; img = "1493976040374-85c8e12f0c0e" }
)

foreach ($city in $cities) {
    $c = $template.Replace("{{TITLE}}", $city.name)
    $c = $c.Replace("{{DESC}}", $city.desc)
    $c = $c.Replace("{{IMG1}}", $city.img)
    $c = $c.Replace("{{IMG2}}", "1518709268805-4e9042af9f23")
    $c = $c.Replace("{{IMG3}}", "1490730141103-6cac27aaab94")
    
    $path = "Города\$($city.name).html"
    [System.IO.File]::WriteAllText($path, $c, [System.Text.Encoding]::UTF8)
}

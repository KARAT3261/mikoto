$json = [System.IO.File]::ReadAllText("cities_data.json", [System.Text.Encoding]::UTF8) | ConvertFrom-Json
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
                const s = size(); if (s === 0) return;
                slide.style.transition = "transform 0.5s ease-in-out";
                slide.style.transform = 'translateX(' + (-s * counter) + 'px)';
            }
            function moveToNext() { counter = (counter >= images.length - 1) ? 0 : counter + 1; updateSlidePosition(); }
            function moveToPrev() { counter = (counter <= 0) ? images.length - 1 : counter - 1; updateSlidePosition(); }
            nextBtn.addEventListener('click', () => { clearInterval(autoSlide); moveToNext(); autoSlide = setInterval(moveToNext, 5000); });
            prevBtn.addEventListener('click', () => { clearInterval(autoSlide); moveToPrev(); autoSlide = setInterval(moveToNext, 5000); });
            window.addEventListener('resize', () => { slide.style.transition = 'none'; updateSlidePosition(); });
            setTimeout(updateSlidePosition, 500);
        });
    </script>
</body>
</html>
"@

$stockImages = @("1493976040374-85c8e12f0c0e", "1545569341-9eb8b30979d9", "1624253321171-1be53e12f5f4", "1528164344705-4754268799af", "1475116127127-da3347c1c68a", "15420518418c7-4737b7929239", "1551641506-ee5bf4cb45f1", "1518709268805-4e9042af9f23", "1490730141103-6cac27aaab94", "1516483642780-6c66bca02923", "1540959733332-e9ab42bf0ad1", "1526481280693-3bfa756180f1", "1545127398-14699f92334b", "1554123168-b3d1f046424e", "1503899036084-c55cdd92da26")

foreach ($c in $json) {
    if ($c.name -eq "Киото") { continue }
    $t = $template.Replace("{{TITLE}}", $c.name).Replace("{{DESC}}", $c.desc).Replace("{{IMG1}}", $c.img).Replace("{{IMG2}}", $stockImages[(Get-Random -Minimum 0 -Maximum $stockImages.Count)]).Replace("{{IMG3}}", $stockImages[(Get-Random -Minimum 0 -Maximum $stockImages.Count)])
    $path = "Города/$($c.name).html"
    [System.IO.File]::WriteAllText($path, $t, [System.Text.Encoding]::UTF8)
}

# Final attempt: ZERO cyrillic in this script file.
$jsonContent = [System.IO.File]::ReadAllText("cities_data.json", [System.Text.Encoding]::UTF8)
$cities = $jsonContent | ConvertFrom-Json

$template = [System.IO.File]::ReadAllText("Города/Токио.html", [System.Text.Encoding]::UTF8)

# UTF-16 codes for "Города"
$g = [char]0x0413
$o = [char]0x043e
$r = [char]0x0440
$d = [char]0x0434
$a = [char]0x0430
$folderName = "$g$o$r$o$d$a"

$stockImages = @("1493976040374-85c8e12f0c0e", "1545569341-9eb8b30979d9", "1624253321171-1be53e12f5f4", "1528164344705-4754268799af", "1475116127127-da3347c1c68a", "15420518418c7-4737b7929239", "1551641506-ee5bf4cb45f1", "1518709268805-4e9042af9f23", "1490730141103-6cac27aaab94", "1516483642780-6c66bca02923", "1540959733332-e9ab42bf0ad1", "1526481280693-3bfa756180f1", "1545127398-14699f92334b", "1554123168-b3d1f046424e", "1503899036084-c55cdd92da26")

foreach ($c in $cities) {
    if ($c.name -eq "$g$o$r$o$d$a") { continue }
    # Use simple string replacement for the template which already has the structure from Tokyo.html
    $t = $template.Replace("Токио", $c.name)
    # The description in Tokyo.html is specific, let's replace it.
    # We need a robust way to find the description.
    # Since I just wrote Tokyo.html, I know it has: <div class=\"wiki-desc\"><p>...</p></div>
    # Actually, I'll just use the $template from the previous turn which was generic.
    
    # Let me redefine the template here using only ASCII for the placeholders
}

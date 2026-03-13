$text = Get-Content tools\generate_exercises.py -Encoding UTF8 -Raw
$text = $text -replace '(?s).*text = """(.*?)""".*', '$1'
$lines = $text -split "`n" | Where-Object { $_.Trim() -ne "" }

$categoryMap = @{
    "Pecho" = "pecho"
    "Espalda" = "espalda"
    "Hombros" = "hombros"
    "Piernas - Cuádriceps" = "piernas"
    "Piernas - Femorales, Glúteos y Cadera" = "piernas"
    "Pantorrillas y Tibiales" = "piernas"
    "Bíceps y Antebrazos" = "brazos"
    "Tríceps" = "brazos"
    "Antebrazos y Cuello" = "brazos"
    "Core y Abdomen" = "core"
    "Cuerpo Completo, Halterofilia, Pliometría y Cardio funcional" = "cardio"
}

function Remove-Diacritics($string) {
    if ([string]::IsNullOrEmpty($string)) { return $string }
    $normalized = $string.Normalize([Text.NormalizationForm]::FormD)
    $sb = New-Object System.Text.StringBuilder
    foreach ($c in $normalized.ToCharArray()) {
        $uc = [System.Globalization.CharUnicodeInfo]::GetUnicodeCategory($c)
        if ($uc -ne [System.Globalization.UnicodeCategory]::NonSpacingMark) {
            $sb.Append($c) | Out-Null
        }
    }
    return $sb.ToString().Normalize([Text.NormalizationForm]::FormC)
}

function Get-Id($name) {
    if ([string]::IsNullOrEmpty($name)) { return "" }
    $name = ($name -split " -")[0].Trim().ToLower()
    $name = Remove-Diacritics $name
    $name = $name -replace "[^a-z0-9]", "-"
    $name = $name -replace "-+", "-"
    $name = $name.Trim("-")
    return $name
}

$exercises = @{
    pecho = @()
    espalda = @()
    piernas = @()
    hombros = @()
    brazos = @()
    core = @()
    cardio = @()
}

$currentCat = ""

foreach ($line in $lines) {
    $line = $line.Trim()
    if ($line.Contains("(") -and $line.EndsWith(")")) {
        $catName = ($line -split "\(")[0].Trim()
        if ($categoryMap.ContainsKey($catName)) {
            $currentCat = $categoryMap[$catName]
        }
    } elseif ($line.Contains(" - ")) {
        $exName = ($line -split " - ")[0].Trim()
        $exId = Get-Id $exName
        
        if ($currentCat -ne "") {
            $sets = 3
            $reps = "'10-12'"
            $rest = 60
            if ($currentCat -eq "cardio") {
                $sets = 1
                $reps = "'20 min'"
                $rest = 0
            }
            
            $exNameEscaped = $exName -replace "'", "\'"
            $objStr = "      { id: '$exId', name: '$exNameEscaped', sets: $sets, reps: $reps, rest: $rest, instructions: '' },"
            $exercises[$currentCat] += $objStr
        }
    }
}

$out = New-Object System.Text.StringBuilder
[void]$out.AppendLine("export const EXERCISE_LIBRARY = {")
foreach ($cat in @("pecho", "espalda", "piernas", "hombros", "brazos", "core", "cardio")) {
    $label = ""
    $icon = ""
    $color = ""
    switch ($cat) {
        "pecho" { $label = "Pecho"; $icon = "\uD83E\uDEC1"; $color = "var(--pecho)" }
        "espalda" { $label = "Espalda"; $icon = "\uD83D\uDD19"; $color = "var(--espalda)" }
        "piernas" { $label = "Piernas"; $icon = "\uD83E\uDDB5"; $color = "var(--piernas)" }
        "hombros" { $label = "Hombros"; $icon = "\uD83D\uDCAA"; $color = "var(--hombros)" }
        "brazos" { $label = "Brazos"; $icon = "\uD83E\uDDBE"; $color = "var(--brazos)" }
        "core" { $label = "Core / Abdomen"; $icon = "\uD83C\uDFAF"; $color = "var(--core)" }
        "cardio" { $label = "Cardio"; $icon = "\uD83C\uDFC3"; $color = "var(--cardio)" }
    }
    
    [void]$out.AppendLine("  ${cat}: {")
    [void]$out.AppendLine("    label: '$label', icon: '$icon', color: '$color',")
    [void]$out.AppendLine("    exercises: [")
    foreach ($ex in $exercises[$cat]) {
        [void]$out.AppendLine($ex)
    }
    [void]$out.AppendLine("    ]")
    [void]$out.AppendLine("  },")
}
$finalOutput = $out.ToString().TrimEnd().TrimEnd(",") + "`r`n};`r`n"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$fullPath = Resolve-Path "tools" | Select-Object -ExpandProperty Path
$fullPath = Join-Path $fullPath "output_library_utf8.js"
[System.IO.File]::WriteAllText($fullPath, $finalOutput, $utf8NoBom)
Write-Host "Generated tools\output_library_utf8.js"

$orig = [IO.File]::ReadAllText("js/data.js", [System.Text.Encoding]::UTF8)
$newLib = [IO.File]::ReadAllText("tools/output_library_utf8.js", [System.Text.Encoding]::UTF8)
$pattern = '(?s)export const EXERCISE_LIBRARY = \{.*?\};\r?\n'
$newContent = [regex]::Replace($orig, $pattern, $newLib)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[IO.File]::WriteAllText("js/data.js", $newContent, $utf8NoBom)
Write-Host "Replaced EXERCISE_LIBRARY successfully."

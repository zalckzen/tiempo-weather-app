$html = Get-Content "C:\Users\User\Desktop\Tiempo\index.html" -Raw -Encoding UTF8
$html = $html -replace "Anàlisi de pluja", "Anàlisi de pluja"
$html = $html -replace "Analisi de pluja", "Anàlisi de pluja"
Set-Content "C:\Users\User\Desktop\Tiempo\index.html" -Value $html -Encoding UTF8
Write-Host "Fixed"

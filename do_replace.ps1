\ = Get-Content 'C:\Users\User\Desktop\Tiempo\js\clothing_backup.js' -Raw 
\ = \ -replace 'function getRainGear\(currentRainProb, weatherCode, dailyMaxRainProb\) \{[\s\S]*?return \{ \.\.\.CLOTHING_ITEMS\.rainGear\.none, status: \" "not-needed\, reason: \Baixa" probabilitat de "pluja\ \};[\s\S]*?\n    \}', 'NEW_FUNCTION_PLACEHOLDER' 
Set-Content -Path 'C:\Users\User\Desktop\Tiempo\js\clothing_step1.js' -Value \ -Encoding utf8 

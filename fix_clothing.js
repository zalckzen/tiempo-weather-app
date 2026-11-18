const fs = require('fs'); 
const content = fs.readFileSync('C:\\Users\\User\\Desktop\\Tiempo\\js\\clothing.js', 'utf8'); 
const pattern = /function getRainGear\(currentRainProb, weatherCode, dailyMaxRainProb\) \{[\s\S]*?return \{ \.\.\.CLOTHING_ITEMS\.rainGear\.none, status: \" "not-needed\, reason: \Baixa" probabilitat de "pluja\ \};[\s\S]*?\n    \}/; 
const newContent = content.replace(pattern, newFunction); 
fs.writeFileSync('C:\\Users\\User\\Desktop\\Tiempo\\js\\clothing.js', newContent, 'utf8'); 
console.log('Done'); 

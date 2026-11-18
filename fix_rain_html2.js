const fs = require('fs');
const html = fs.readFileSync('C:/Users/User/Desktop/Tiempo/index.html', 'utf8');

const fixedHtml = html.replace(
    'Anàlisi de pluja i paraigua',
    'Anàlisi de pluja i paraigua'
).replace(
    'Analisi de pluja',
    'Anàlisi de pluja'
);

fs.writeFileSync('C:/Users/User/Desktop/Tiempo/index.html', fixedHtml);
console.log('Fixed Catalan accents');

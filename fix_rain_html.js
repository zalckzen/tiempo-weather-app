const fs = require('fs');
const html = fs.readFileSync('C:/Users/User/Desktop/Tiempo/index.html', 'utf8');

// Fix the rain section with proper Catalan
const fixedHtml = html.replace(
    '<section class=\"rain-section\" aria-label=\"Analisi de pluja\">\n                <h2 class=\"section-title\">Analisi de pluja i paraigua</h2>',
    '<section class=\"rain-section\" aria-label=\"Analisi de pluja\">\n                <h2 class=\"section-title\">Anàlisi de pluja i paraigua</h2>'
);

fs.writeFileSync('C:/Users/User/Desktop/Tiempo/index.html', fixedHtml);
console.log('Fixed Catalan accents');

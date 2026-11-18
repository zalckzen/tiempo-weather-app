const fs = require('fs');
const html = fs.readFileSync('C:/Users/User/Desktop/Tiempo/index.html', 'utf8');

const rainSection = '            <section class=\"rain-section\" aria-label=\"Analisi de pluja\">\n                <h2 class=\"section-title\">Analisi de pluja i paraigua</h2>\n                <div class=\"rain-grid\" id=\"rainGrid\"></div>\n            </section>\n';

const updated = html.replace(
    '</section>\n            <section class=\"forecast-section\"',
    '</section>\n' + rainSection + '            <section class=\"forecast-section\"'
);

fs.writeFileSync('C:/Users/User/Desktop/Tiempo/index.html', updated);
console.log('Rain section added');

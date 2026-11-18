const fs = require('fs');
const content = fs.readFileSync('js/api.js', 'utf8');
const fixed = content.replace('Lloc d" \\\estudis', 'Lloc d\'estudis');
fs.writeFileSync('js/api.js', fixed);
console.log('Fixed');

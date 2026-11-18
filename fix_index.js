const fs = require('fs');
const html = fs.readFileSync('C:/Users/User/Desktop/Tiempo/index.html', 'utf8');
const oldStr = '<script src="js/api.js"></script>\n    <script src="js/clothing.js"></script>';
const newStr = '<script src="js/api.js"></script>\n    <script src="js/schedule.js"></script>\n    <script src="js/rain-analysis.js"></script>\n    <script src="js/clothing.js"></script>';
const updated = html.replace(oldStr, newStr);
fs.writeFileSync('C:/Users/User/Desktop/Tiempo/index.html', updated);
console.log('done');

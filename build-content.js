const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'content', 'site.html'), 'utf8').replace(/^﻿/, '');
const out = 'module.exports = ' + JSON.stringify(html) + ';\n';
fs.writeFileSync(path.join(__dirname, 'api', '_site-content.js'), out, 'utf8');
console.log('Wrote api/_site-content.js, html length =', html.length);

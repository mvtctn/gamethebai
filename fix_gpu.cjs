const fs = require('fs');
const path = require('path');

const appJsxPath = path.join(__dirname, 'src', 'App.jsx');
let appJsx = fs.readFileSync(appJsxPath, 'utf8');

// Remove backdrop-blur-* classes
appJsx = appJsx.replace(/backdrop-blur-(?:sm|md|lg|xl|2xl|3xl|none)/g, '');
// Remove heavy continuous animations
appJsx = appJsx.replace(/animate-pulse-subtle/g, '');
appJsx = appJsx.replace(/animate-breathing-glow/g, '');

fs.writeFileSync(appJsxPath, appJsx);

const indexCssPath = path.join(__dirname, 'src', 'index.css');
let indexCss = fs.readFileSync(indexCssPath, 'utf8');

// Comment out all backdrop-filter
indexCss = indexCss.replace(/backdrop-filter:\s*[^;]+;/g, '/* backdrop-filter removed for GPU perf */');
indexCss = indexCss.replace(/-webkit-backdrop-filter:\s*[^;]+;/g, '/* -webkit-backdrop-filter removed */');

// Stop heavy animations in keyframes
indexCss = indexCss.replace(/animation:\s*breathing-glow[^;]+;/g, '/* animation removed for GPU perf */');
indexCss = indexCss.replace(/animation:\s*pulseGlow[^;]+;/g, '/* animation removed for GPU perf */');
indexCss = indexCss.replace(/animation:\s*bounceSubtle[^;]+;/g, '/* animation removed for GPU perf */');
indexCss = indexCss.replace(/animation:\s*shake[^;]+;/g, '/* animation removed for GPU perf */');
indexCss = indexCss.replace(/animation:\s*float[^;]+;/g, '/* animation removed for GPU perf */');

// Also tone down inset box-shadows which are very heavy when combined with glass panels
indexCss = indexCss.replace(/box-shadow:\s*inset[^;]+;/g, '/* heavy inset box-shadow removed */');

fs.writeFileSync(indexCssPath, indexCss);
console.log('Done optimizing App.jsx and index.css for GPU performance.');

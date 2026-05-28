const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../Campus-Buddy单网页版.html');
if (fs.existsSync(filePath)) {
  let html = fs.readFileSync(filePath, 'utf8');
  // Replace type="module" script tags with normal script tags to prevent CORS blocks on file://
  html = html.replace(/<script type="module" crossorigin>/g, '<script>');
  html = html.replace(/<script type="module">/g, '<script>');
  // Remove preloads which are blocked under local file:// protocol
  html = html.replace(/<link rel="modulepreload"[^>]*>/g, '');
  fs.writeFileSync(filePath, html, 'utf8');
  console.log('[Post-Build] Patched Campus-Buddy单网页版.html for direct local browser double-click compatibility.');
} else {
  console.error('[Post-Build] Target patch file not found at:', filePath);
}

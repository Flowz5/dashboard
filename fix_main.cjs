const fs = require('fs');
let main = fs.readFileSync('src/main.jsx', 'utf8');
main = main.replace(
  "import App from './App.jsx'",
  "import App from './App.jsx'\nimport ErrorBoundary from './ErrorBoundary.jsx'"
);
main = main.replace(
  "<App />",
  "<ErrorBoundary>\n      <App />\n    </ErrorBoundary>"
);
fs.writeFileSync('src/main.jsx', main);

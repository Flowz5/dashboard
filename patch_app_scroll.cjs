const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const scrollEffect = `// --- GESTION DU SCROLL ET HIGHLIGHT TICKET (VENANT DU CALENDRIER) ---
  useEffect(() => {
    // Si on a un #ticket-ID dans l'URL
    const hash = window.location.hash;
    if (hash && hash.startsWith('#ticket-')) {
      // On met un petit délai pour être sûr que le DOM a fini de render les tickets
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('highlight-blink');
          setTimeout(() => el.classList.remove('highlight-blink'), 3000);
          
          // Nettoyer l'URL sans recharger
          window.history.replaceState(null, null, ' ');
        }
      }, 500);
    }
  }, [id, tickets]);`;

code = code.replace(
  "  // Récupérer les boards pour le sidebar",
  scrollEffect + "\n\n  // Récupérer les boards pour le sidebar"
);

fs.writeFileSync('src/App.jsx', code);

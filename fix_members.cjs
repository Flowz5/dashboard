const fs = require('fs');
let nav = fs.readFileSync('src/components/Navbar/Navbar.jsx', 'utf8');
nav = nav.replace(/\{board\.members\.map\(/g, "{(board.members || []).map(");
fs.writeFileSync('src/components/Navbar/Navbar.jsx', nav);

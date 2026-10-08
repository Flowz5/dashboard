const fs = require('fs');
let code = fs.readFileSync('src/store/useUserStore.js', 'utf8');
code = code.replace(
  "users: {},",
  "users: {},\n  myTickets: [],\n  unsubscribeMyTickets: null,"
);
code = code.replace(
  "listenToUsers: () => {",
  "listenToMyTickets: (email) => {\n    const state = get();\n    if (state.unsubscribeMyTickets) state.unsubscribeMyTickets();\n    if (!email) return;\n    const q = query(collection(db, 'tickets'), where('assignee', '==', email));\n    const unsub = onSnapshot(q, (snapshot) => {\n      const t = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));\n      set({ myTickets: t });\n    });\n    set({ unsubscribeMyTickets: unsub });\n  },\n\n  listenToUsers: () => {"
);
code = code.replace(
  "import { doc, getDoc, setDoc, updateDoc, collection, onSnapshot }",
  "import { doc, getDoc, setDoc, updateDoc, collection, onSnapshot, query, where }"
);
fs.writeFileSync('src/store/useUserStore.js', code);

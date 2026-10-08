const fs = require('fs');

let content = fs.readFileSync('src/components/TicketModal/TicketModal.jsx', 'utf8');

const handlers = `
  // -- GESTION DU DRAG & DROP (BASE64 + COMPRESSION) --
  const handleDragOver = (e) => {
    e.preventDefault();
    if (isViewer) return;
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (isViewer) return;
    setIsDragActive(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (isViewer) return;
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    for (const file of files) {
      await processAndUploadFile(file);
    }
  };

  const processAndUploadFile = async (file) => {
    try {
      let finalDataUrl = "";
      let finalSize = file.size;

      // Si c'est une image, on la compresse !
      if (file.type.startsWith('image/')) {
        finalDataUrl = await compressImage(file);
        // Approximation de la taille après compression Base64
        finalSize = Math.round((finalDataUrl.length * 3) / 4);
      } else {
        // Pour les PDF ou autres, on lit juste en Base64
        // On monte la limite à 800 Ko pour les PDF
        if (file.size > 800 * 1024) {
          alert(\`Le fichier "\${file.name}" est trop lourd (Max 800 Ko pour les non-images).\`);
          return;
        }
        finalDataUrl = await readFileAsBase64(file);
      }

      // Si même après compression c'est > 900 Ko, on bloque pour sauver Firestore
      if (finalSize > 900 * 1024) {
         alert(\`Le fichier "\${file.name}" reste trop volumineux après compression.\`);
         return;
      }

      const newAttachment = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        name: file.name,
        data: finalDataUrl,
        size: finalSize,
        type: file.type
      };
      setAttachments(prev => [...prev, newAttachment]);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du traitement du fichier.");
    }
  };

  // Petite fonction magique pour compresser les images côté client
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          // Redimensionnement proportionnel
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // On exporte en JPEG avec 70% de qualité (réduit drastiquement la taille)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleDeleteAttachment = (attachmentToDelete) => {
    if (isViewer) return;
    setAttachments(prev => prev.filter(att => att.id !== attachmentToDelete.id));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // -- SOUMISSION DU FORMULAIRE --
`;
content = content.replace(/  \/\/ -- GESTION DU DRAG & DROP \(BASE64\) --[\s\S]*?\/\/ -- SOUMISSION DU FORMULAIRE --/, handlers);

// Mettre à jour le texte de la modale
content = content.replace(
  "<label>Pièces jointes (Optionnel - Max 500 Ko/fichier)</label>",
  "<label>Pièces jointes (Optionnel)</label>"
);
content = content.replace(
  '<div className="dropzone-subtext">Images, petits PDF (Max 500 Ko)</div>',
  '<div className="dropzone-subtext">Images automagiquement compressées ! PDF max 800 Ko.</div>'
);

fs.writeFileSync('src/components/TicketModal/TicketModal.jsx', content);

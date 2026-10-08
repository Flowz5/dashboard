import { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import useThemeStore from '../../store/useThemeStore';
import useUserStore from '../../store/useUserStore';
import rehypeSanitize from 'rehype-sanitize';
import Button from '../Button/Button';
import './TicketModal.css';

// La modale qui s'ouvre au clic sur un ticket ou sur "+"
// Elle sert à la fois pour CRÉER un nouveau ticket et pour MODIFIER un ticket existant.
const TicketModal = ({ onClose, onSubmit, onDelete, ticket, boardMembers = [], userRole }) => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  // Petite astuce : si on nous passe un "ticket" dans les props, c'est qu'on est en mode édition !
  const isEditing = !!ticket;
  const isViewer = userRole === 'viewer';
  
  // États locaux du formulaire (pré-remplis si on est en édition)
  const [title, setTitle] = useState(ticket?.title || '');
  const [description, setDescription] = useState(ticket?.description || '');
  
  // -- VÉRIFICATION DE L'ASSIGNATION --
  // On s'assure que si l'ancien assigné a été supprimé du board entre temps,
  // il n'est plus assigné automatiquement pour éviter les bugs fantômes.
  const initialAssignee = ticket?.assignee;
  const isAssigneeStillMember = boardMembers.includes(initialAssignee);
  const [assignee, setAssignee] = useState(
    initialAssignee && isAssigneeStillMember ? initialAssignee : 'Non assigné'
  );
  
  const [dueDate, setDueDate] = useState(ticket?.dueDate || '');
  const [link, setLink] = useState(ticket?.link || '');
  const [attachments, setAttachments] = useState(ticket?.attachments || []);
  const [isDragActive, setIsDragActive] = useState(false);
  const [priority, setPriority] = useState(ticket?.priority || 'Moyenne');
  const [tags, setTags] = useState(ticket?.tags?.join(', ') || '');

  // Bloquer le scroll du body en arrière-plan quand la modale est ouverte
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);



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
          alert(`Le fichier "${file.name}" est trop lourd (Max 800 Ko pour les non-images).`);
          return;
        }
        finalDataUrl = await readFileAsBase64(file);
      }

      // Si même après compression c'est > 900 Ko, on bloque pour sauver Firestore
      if (finalSize > 900 * 1024) {
         alert(`Le fichier "${file.name}" reste trop volumineux après compression.`);
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


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return; // On empêche les tickets sans titre
    
    // On renvoie un gros objet ticket à App.jsx qui va le balancer dans Firestore
    onSubmit({
      // Si isEditing est false, l'ID est mis à null car on va laisser 
      // la fonction addDoc de Firestore générer un vrai ID unique côté serveur.
      id: isEditing ? ticket.id : null,
      title: title.trim(),
      description: description.trim(),
      assignee,
      dueDate,
      link: link.trim(),
      priority,
      tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      // Si nouveau ticket, on le met par défaut dans la colonne 'To do'
      attachments: attachments,
      status: isEditing ? ticket.status : 'To do',
      date: isEditing ? ticket.date : new Date().toLocaleDateString(),
      // Un vrai timestamp technique pour faciliter les tris
      createdAt: isEditing ? (ticket.createdAt || Date.now()) : Date.now()
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? "Modifier le ticket" : "Créer un nouveau ticket"}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="ticket-title">Titre du ticket *</label>
              <input disabled={isViewer} 
                type="text" 
                id="ticket-title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Corriger le bug de la navbar"
                required
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="ticket-desc">Description détaillée</label>
              <div data-color-mode={isDarkMode ? "dark" : "light"}>
                <MDEditor previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
                  id="ticket-desc"
                  value={description}
                  onChange={setDescription}
                  preview={isViewer ? "preview" : "edit"} hideToolbar={isViewer}
                  height={200}
                  textareaProps={{
                    placeholder: "Décrivez la tâche à accomplir (Markdown supporté)..."
                  }}
                />
              </div>
            </div>

            
            {/* -- Pièces jointes (Drag & Drop Base64) -- */}
            <div className="form-group">
              <label>Pièces jointes (Optionnel)</label>
              
              {!isViewer && (
                <div 
                  className={`dropzone ${isDragActive ? 'active' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="dropzone-icon">📥</div>
                  <div className="dropzone-text">Glissez-déposez vos fichiers ici</div>
                  <div className="dropzone-subtext">Images automagiquement compressées ! PDF max 800 Ko.</div>
                </div>
              )}

              {attachments.length > 0 && (
                <div className="attachments-list">
                  {attachments.map((att, idx) => (
                    <div key={idx} className="attachment-item">
                      <div className="attachment-info">
                        <span className="attachment-icon">📎</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <a href={att.data} download={att.name} className="attachment-name" title={att.name}>
                            {att.name}
                          </a>
                          <span className="attachment-size">{formatFileSize(att.size)}</span>
                        </div>
                      </div>
                      {!isViewer && (
                        <button type="button" className="btn-remove-attachment" onClick={() => handleDeleteAttachment(att)} title="Supprimer la pièce jointe">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="ticket-assignee">Assigné à</label>
                <select disabled={isViewer} 
                  id="ticket-assignee" 
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                >
                  <option value="Non assigné">Non assigné</option>
                  {boardMembers.map(member => {
                    // On récupère son profil pour afficher son joli pseudo dans la liste
                    const profile = useUserStore.getState().users?.[member];
                    return <option key={member} value={member}>{profile?.displayName || member}</option>;
                  })}
                </select>
              </div>

              <div className="form-group half">
                <label htmlFor="ticket-date">Date butoire</label>
                <input disabled={isViewer} 
                  type="date" 
                  id="ticket-date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="ticket-priority">Priorité</label>
                <select disabled={isViewer} 
                  id="ticket-priority" 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Basse">🟢 Basse</option>
                  <option value="Moyenne">🟠 Moyenne</option>
                  <option value="Haute">🔴 Haute</option>
                </select>
              </div>

              <div className="form-group half">
                <label htmlFor="ticket-link">Image ou Lien (Optionnel)</label>
                <input disabled={isViewer} 
                  type="url" 
                  id="ticket-link" 
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
              {link && (
                <div className="link-preview" style={{ marginTop: '8px' }}>
                  <a href={link} target="_blank" rel="noopener noreferrer">Ouvrir le lien attaché</a>
                </div>
              )}

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label htmlFor="ticket-tags">Étiquettes (Tags)</label>
              <input disabled={isViewer} 
                type="text" 
                id="ticket-tags" 
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Ex: bug, design, frontend (séparés par des virgules)"
              />
            </div>
          </div>
          
          <div className="modal-footer" style={{ justifyContent: isEditing && !isViewer ? 'space-between' : 'flex-end' }}>
            {isEditing && !isViewer && (
              <button 
                type="button" 
                className="btn-delete" 
                onClick={() => {
                  if(window.confirm("Es-tu sûr de vouloir supprimer ce ticket ?")) {
                    onDelete(ticket.id);
                  }
                }}
              >
                Supprimer
              </button>
            )}
            
            <div className="footer-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                {isViewer ? "Fermer" : "Annuler"}
              </button>
              {!isViewer && (
                <Button type="submit" disabled={!title.trim()}>
                  {isEditing ? "Mettre à jour" : "Ajouter"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketModal;

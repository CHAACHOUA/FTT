import React, { useState } from 'react';
import './CompaniesList.css';

const EnvelopeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="12" fill="none"/>
    <path d="M4 8.5V16a2 2 0 002 2h12a2 2 0 002-2V8.5m-16 0A2 2 0 016 6.5h12a2 2 0 012 2v0m-16 0l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const SuccessIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#dcfce7"/><path d="M8 12.5l2.5 2.5 5-5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const ErrorIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fee2e2"/><path d="M9 9l6 6m0-6l-6 6" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/></svg>
);
const SendIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M3 12l18-7-7 18-2.5-7L3 12z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/></svg>
);
const MailInputIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="12" fill="none"/><path d="M4 8.5V16a2 2 0 002 2h12a2 2 0 002-2V8.5m-16 0A2 2 0 016 6.5h12a2 2 0 012 2v0m-16 0l8 5 8-5" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const InviteRecruiterModal = ({ open, onClose, onInvite, company, forum, accessToken, apiBaseUrl, onRecruiterAdded }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setStatus({ type: 'error', msg: "Email invalide." });
      return;
    }

    // Debug: afficher les données reçues
    console.log('Company data:', company);
    console.log('Forum data:', forum);

    if (!company) {
      setStatus({ type: 'error', msg: "Aucune entreprise sélectionnée." });
      return;
    }

    if (!forum) {
      setStatus({ type: 'error', msg: "Aucun forum sélectionné." });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      const requestData = {
        email: email,
        company: company,  // Envoyer l'objet company complet
        forum: forum       // Envoyer l'objet forum complet
      };

      console.log('Sending request with data:', requestData);
      
      const response = await fetch(`${apiBaseUrl}/api/users/auth/invite-recruiter/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      console.log('Response:', response.status, data);

      if (response.ok) {
        setStatus({ type: 'success', msg: data.message || "Invitation envoyée avec succès !" });
        setEmail('');
        
        // Appeler le callback si fourni
        if (onInvite) {
          onInvite(email, company, forum);
        }
        
        // Rafraîchir les données après invitation
        if (onRecruiterAdded) {
          onRecruiterAdded();
        }
        
        // Fermer le modal après 2 secondes
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setStatus({ 
          type: 'error', 
          msg: data.error || data.message || "Erreur lors de l'envoi de l'invitation." 
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'invitation:', error);
      setStatus({ 
        type: 'error', 
        msg: "Erreur de connexion. Veuillez réessayer." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} title="Fermer">×</button>
        <div className="modal-illustration"><EnvelopeIcon /></div>
        <h2 className="modal-title">Inviter un recruteur</h2>
        <p className="modal-subtitle">
          Entreprise : <b>{company?.name || 'Non sélectionnée'}</b><br/>
          Forum : <b>{forum?.name || 'Non sélectionné'}</b>
        </p>
        <form className="invite-form" onSubmit={handleSubmit}>
          <div className="invite-input-group">
            <span className="invite-input-icon"><MailInputIcon /></span>
            <input
              type="email"
              placeholder="Email du recruteur"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="invite-input"
              required
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            className={`invite-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            <span>{isLoading ? 'Envoi en cours...' : 'Envoyer l\'invitation'}</span>
            {!isLoading && <SendIcon />}
          </button>
        </form>
        {status && (
          <div className={`invite-status ${status.type}`}>
            {status.type === 'success' ? <SuccessIcon /> : <ErrorIcon />}
            {status.msg}
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteRecruiterModal; 
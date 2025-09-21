import React, { useState } from 'react';
import Modal from '../../../components/common/Modal';
import { FaEnvelope, FaPaperPlane, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import axios from 'axios';


const InviteRecruiterModal = ({ open, onClose, onInvite, company, forum, apiBaseUrl }) => {
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
      
      const response = await axios.post(`${apiBaseUrl}/users/auth/invite-recruiter/`, requestData, {
        withCredentials: true
      });

      console.log('Response:', response.status, response.data);

      if (response.status === 200) {
        setStatus({ type: 'success', msg: response.data.message || "Invitation envoyée avec succès !" });
        setEmail('');
        // Appeler le callback si fourni
        if (onInvite) {
          onInvite(email, company, forum);
        }
      } else {
        setStatus({ 
          type: 'error', 
          msg: response.data?.error || response.data?.message || "Erreur lors de l'envoi de l'invitation." 
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
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Inviter un recruteur"
      subtitle={
        <>
          Entreprise : <strong>{company?.name || 'Non sélectionnée'}</strong><br/>
          Forum : <strong>{forum?.name || 'Non sélectionné'}</strong>
        </>
      }
      size="small"
    >
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-form-group">
          <label className="modal-form-label">
            <FaEnvelope />
            Email du recruteur
          </label>
          <input
            type="email"
            placeholder="exemple@entreprise.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="modal-form-input"
            required
            disabled={isLoading}
          />
        </div>

        {status && (
          <div className={`modal-status modal-status-${status.type}`}>
            {status.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
            {status.msg}
          </div>
        )}

        <div className="modal-actions">
          <button 
            type="button" 
            className="modal-btn modal-btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </button>
          <button 
            type="submit" 
            className="modal-btn modal-btn-primary"
            disabled={isLoading}
          >
            <FaPaperPlane />
            {isLoading ? 'Envoi en cours...' : 'Envoyer l\'invitation'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InviteRecruiterModal; 
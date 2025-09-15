import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../pages/styles/candidate/Education.css';
import { useAuth } from '../../context/AuthContext';
// import { getUserFromToken } from '../../context/decoder-jwt' // Fichier supprimé
const DeleteAccount = () => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_BASE_URL;
  const { role } = useAuth(); // 👈 récupère le rôle depuis AuthContext

  const handleDelete = async () => {
    const reasonToSend = selectedReason === 'Autre' ? customReason.trim() : selectedReason;

    if (!reasonToSend) {
      toast.error("Merci de sélectionner ou de saisir une raison.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.delete(`${API}/api/users/auth/delete-account/`, {
        withCredentials: true,
        data: { reason: reasonToSend },
      });

      toast.success(response.data.message || 'Compte supprimé avec succès.');

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const msg = err.response?.data?.error || 'Une erreur est survenue.';
      toast.error(msg);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  // 📋 Raisons selon le rôle
  const reasons = role === 'candidate'
    ? ['J’ai trouvé un emploi', 'Je ne suis pas satisfait de l’expérience', 'Autre']
    : ['Je ne suis pas satisfait de l’expérience', 'Autre'];

  return (
    <div className="account-settings-section">
      <h2 className="account-title">Supprimer le compte</h2>

      <p className="account-description">
        Cette action supprimera définitivement votre compte.
      </p>

      <button
        onClick={() => setShowModal(true)}
        className="delete-account-button"
      >
        Supprimer mon compte
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Pourquoi voulez-vous supprimer votre compte ?</h3>

            <div className="radio-group">
              {reasons.map((reason) => (
                <label key={reason}>
                  <input
                    type="radio"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                  />
                  {reason}
                </label>
              ))}
            </div>

            {selectedReason === 'Autre' && (
              <textarea
                className="custom-reason-textarea"
                placeholder="Veuillez préciser..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
              />
            )}

            <div className="modal-actions">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="delete-confirm-btn"
              >
                {loading ? 'Suppression...' : 'Confirmer la suppression'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="cancel-btn"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAccount;

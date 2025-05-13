import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../features/styles/candidate/Education.css';

const DeleteAccount = () => {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_BASE_URL;

  const handleDelete = async () => {
    setError('');
    setMessage('');

    const reasonToSend = selectedReason === 'Autre' ? customReason.trim() : selectedReason;

    if (!reasonToSend) {
      setError("Merci de sélectionner ou de saisir une raison.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access');
      const response = await axios.delete(`${API}/api/users/auth/delete-account/`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { reason: reasonToSend }  // important: axios.delete accepte un `data` dans une requête DELETE
      });

      setMessage(response.data.message || 'Compte supprimé avec succès.');
      localStorage.removeItem('access');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <div className="account-settings-section">
      <h2 className="account-title">Supprimer le compte</h2>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <p style={{ marginBottom: '20px', color: '#2b3a5a' }}>
        Cette action supprimera définitivement votre compte.
      </p>

      <button
        onClick={() => setShowModal(true)}
        className="save-button-modern"
        style={{ backgroundColor: '#e53935' }}
      >
        Supprimer mon compte
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Pourquoi voulez-vous supprimer votre compte ?</h3>

            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="Je ne suis pas satisfait de l’expérience"
                  checked={selectedReason === "Je ne suis pas satisfait de l’expérience"}
                  onChange={(e) => setSelectedReason(e.target.value)}
                />
                Je ne suis pas satisfait de l’expérience
              </label>

              <label>
                <input
                  type="radio"
                  value="J’ai trouvé un emploi"
                  checked={selectedReason === "J’ai trouvé un emploi"}
                  onChange={(e) => setSelectedReason(e.target.value)}
                />
                J’ai trouvé un emploi
              </label>

              <label>
                <input
                  type="radio"
                  value="Autre"
                  checked={selectedReason === "Autre"}
                  onChange={(e) => setSelectedReason(e.target.value)}
                />
                Autre
              </label>
            </div>

            {selectedReason === 'Autre' && (
              <textarea
                placeholder="Veuillez préciser..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
                style={{ width: '100%', marginTop: '10px' }}
              />
            )}

           <div className="modal-actions">
  <button onClick={handleDelete} disabled={loading} className="delete-confirm-btn">
    {loading ? 'Suppression...' : 'Confirmer la suppression'}
  </button>
  <button onClick={() => setShowModal(false)} disabled={loading} className="cancel-btn">
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

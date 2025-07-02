import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaMapMarkerAlt, FaBriefcase, FaIndustry } from 'react-icons/fa';
import '../../styles/recruiter/OffersList.css';
import OfferModal from './OfferModal';

const OffersList = ({ forum, accessToken, apiBaseUrl }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  const forum_id = forum.id;

  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return apiBaseUrl.replace(/\/$/, '') + url;
  };

  // Récupération des offres liées au forum
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiBaseUrl}/api/recruiters/company-offers/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { forum_id },
        });
        setOffers(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.detail || 'Erreur lors du chargement des offres');
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [accessToken, apiBaseUrl, forum_id]);

  // Ouvre modal pour ajout
  const onAddOffer = () => {
    setEditingOffer(null);
    setModalOpen(true);
  };

  // Ouvre modal pour modification
  const onUpdateOffer = (offer) => {
    setEditingOffer(offer);
    setModalOpen(true);
  };

  // Supprime une offre
  const onDeleteOffer = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette offre ?')) return;
    try {
      await axios.delete(`${apiBaseUrl}/api/recruiters/offers/${id}/delete/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setOffers((prev) => prev.filter((offer) => offer.id !== id));
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  // Envoie les données du formulaire au backend (create ou update)
  const handleSubmit = async (formData) => {
    try {
      if (editingOffer) {
        const response = await axios.put(
          `${apiBaseUrl}/api/recruiters/offers/${editingOffer.id}/update/`,
          { ...formData, forum_id },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setOffers((prev) =>
          prev.map((offer) => (offer.id === editingOffer.id ? response.data : offer))
        );
      } else {
        const response = await axios.post(
          `${apiBaseUrl}/api/recruiters/offers/create/`,
          { ...formData, forum_id },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setOffers((prev) => [response.data, ...prev]);
      }
      setModalOpen(false);
    } catch {
      alert('Erreur lors de la sauvegarde');
    }
  };

  if (loading) return <p>Chargement des offres...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="offers-list-wrapper">
      <div className="offers-list-header">
        <h2>Liste des Offres</h2>
        <button className="btn-add-offer" onClick={onAddOffer}>
          <FaPlus /> Ajouter
        </button>
      </div>

      {offers.length === 0 ? (
        <p>Aucune offre trouvée.</p>
      ) : (
        <div className="offers-list-container">
          {offers.map((offer) => (
            <div key={offer.id} className="offer-card">
              <div className="logo-section">
                <img
                  src={getFullUrl(offer.company_logo) || '/default-company.png'}
                  alt="Logo entreprise"
                  className="company-logo-large"
                  onError={(e) => (e.target.src = '/default-company.png')}
                />
              </div>

              <div className="offer-main-content">
                <div className="recruiter-info">
                  {offer.recruiter_photo ? (
                    <img
                      src={getFullUrl(offer.recruiter_photo)}
                      alt="Recruteur"
                      className="recruiter-avatar"
                      onError={(e) => (e.target.src = '/default-avatar.png')}
                    />
                  ) : (
                    <div className="recruiter-initials">
                      {offer.recruiter_name?.split(' ').map((n) => n[0]).join('') || '??'}
                    </div>
                  )}
                  <p className="recruiter-name">
                    {offer.recruiter_name}{' '}
                    <span className="company-handle">@{offer.company_name}</span>
                  </p>
                </div>

                <h3 className="offer-title">{offer.title}</h3>
                <p className="offer-description">{offer.description}</p>

                <div className="offer-meta-row">
                  <span>
                    <FaBriefcase /> {offer.contract_type || 'Contrat non précisé'}
                  </span>
                  <span>
                    <FaIndustry /> {offer.sector || 'Secteur non précisé'}
                  </span>
                  {offer.location?.split(',').map((city, idx) => (
                    <span key={idx} className="location-item">
                      <FaMapMarkerAlt /> {city.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="offer-actions">
                <button className="btn-action" onClick={() => onUpdateOffer(offer)}>
                  <FaEdit />
                </button>
                <button className="btn-action" onClick={() => onDeleteOffer(offer.id)}>
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <OfferModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingOffer}
        forumId={forum_id}
      />
    </div>
  );
};

export default OffersList;

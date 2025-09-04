import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaMapMarkerAlt, FaBriefcase, FaIndustry } from 'react-icons/fa';
import '../../styles/recruiter/OffersList.css';
import OfferModal from './OfferModal';
import OfferDetailPopup from '../../../components/recruiter/OfferDetailPopup';
import logoFTT from '../../../assets/Logo-FTT.png';

const OffersList = ({ forum, accessToken, apiBaseUrl }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isOfferDetailPopupOpen, setIsOfferDetailPopupOpen] = useState(false);

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

  // Ouvre la popup de détails d'offre
  const handleOfferClick = (offer) => {
    setSelectedOffer(offer);
    setIsOfferDetailPopupOpen(true);
  };

  const handleCloseOfferPopup = () => {
    setIsOfferDetailPopupOpen(false);
    setSelectedOffer(null);
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
      <div className="offers-list-content">
        <div className="page-title-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1>Liste des Offres</h1>
              <p>Gérez toutes vos offres d'emploi</p>
            </div>
            <button className="btn-add-offer" onClick={onAddOffer}>
              <FaPlus /> Ajouter une offre
            </button>
          </div>
        </div>

        {/* Liste des offres */}
        {offers.length === 0 ? (
          <div className="no-offers">
            <p>Aucune offre trouvée.</p>
          </div>
        ) : (
          <div className="offers-grid offers-list-horizontal">
            {offers.map((offer) => {
              const recruiterFirst = offer.recruiter_name?.split(' ')[0] || '';
              const recruiterLast = offer.recruiter_name?.split(' ')[1] || '';
              const initials = `${recruiterFirst?.[0] || ''}${recruiterLast?.[0] || ''}`.toUpperCase() || 'HR';
              const bannerSrc = offer.company_logo ? getFullUrl(offer.company_logo) : logoFTT;
              
              return (
                <div
                  key={offer.id}
                  className="offer-card horizontal"
                  onClick={() => handleOfferClick(offer)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="offer-left-banner">
                    <img src={bannerSrc} alt="Bannière entreprise" onError={(e) => {e.target.src = logoFTT;}} />
                    <div className="company-logo-badge">
                      <img
                        src={offer.company_logo ? getFullUrl(offer.company_logo) : logoFTT}
                        alt={offer.company_name}
                        onError={(e) => {e.target.src = logoFTT;}}
                      />
                    </div>
                  </div>

                  <div className="offer-right-content">
                    <div className="offer-top-line">
                      <div className="recruiter-avatar">{initials}</div>
                      <div className="recruiter-block">
                        <div className="recruiter-name-line">{offer.recruiter_name} @ {offer.company_name}</div>
                      </div>
                      <span className="offer-date">Publiée le {new Date(offer.created_at || Date.now()).toLocaleDateString('fr-FR')}</span>
                    </div>

                    <h4 className="offer-title large">{offer.title}</h4>
                    <div className="offer-location-line">
                      <FaMapMarkerAlt />
                      <span>{offer.location || 'Non précisé'}</span>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="offer-actions">
                    <button 
                      className="btn-action" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateOffer(offer);
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-action" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteOffer(offer.id);
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      <OfferModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingOffer}
        forumId={forum_id}
      />

      {/* Popup pour les détails de l'offre */}
      {isOfferDetailPopupOpen && selectedOffer && (
        <OfferDetailPopup
          offer={selectedOffer}
          onClose={handleCloseOfferPopup}
        />
      )}
    </div>
  );
};

export default OffersList;

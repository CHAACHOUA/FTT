import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import '../../../../pages/styles/recruiter/OffersList.css';
import OfferModal from '../../../../components/card/offer/OfferModal';
import VirtualOfferModal from '../../../../components/offers/VirtualOfferModal';
import CompanyApprovalCheck from '../../../../utils/CompanyApprovalCheck';
import Offer from '../../../../components/card/offer/Offer';
import Loading from '../../../../components/loyout/Loading';
import { Button, Input, Card, Badge } from '../../../../components/common';
import RecruiterOfferFilters from '../../../../components/filters/offer/RecruiterOfferFilters';

const OffersList = ({ forum, accessToken, apiBaseUrl }) => {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  const forum_id = forum.id;



  // Fonction pour rafraîchir les offres
  const refreshOffers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiBaseUrl}/recruiters/company-offers/`, {
        withCredentials: true,
        params: { forum_id },
      });
      console.log('Offers refreshed:', response.data); // Debug log
      setOffers(response.data);
      setFilteredOffers(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors du chargement des offres');
    } finally {
      setLoading(false);
    }
  };

  // Récupération des offres liées au forum
  useEffect(() => {
    refreshOffers();
  }, [accessToken, apiBaseUrl, forum_id]);


  // Vérifier si c'est un forum virtuel
  const isVirtualForum = forum?.type === 'virtuel' || forum?.is_virtual;

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
      await axios.delete(`${apiBaseUrl}/recruiters/offers/${id}/delete/`, {
        withCredentials: true
      });
      console.log('Offre supprimée avec succès');
      // Rafraîchir la liste des offres pour avoir les données les plus récentes
      await refreshOffers();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Gestion du clic sur une offre (navigation gérée par le composant Offer)
  const handleOfferClick = (offer) => {
    console.log('Offer clicked:', offer);
  };

  // Envoie les données du formulaire au backend (create ou update)
  const handleSubmit = async (formData) => {
    try {
      if (editingOffer) {
        const response = await axios.put(
          `${apiBaseUrl}/recruiters/offers/${editingOffer.id}/update/`,
          { ...formData, forum_id },
          { withCredentials: true }
        );
        console.log('Offre mise à jour:', response.data);
        // Rafraîchir la liste des offres pour avoir les données les plus récentes
        await refreshOffers();
      } else {
        const response = await axios.post(
          `${apiBaseUrl}/recruiters/offers/create/`,
          { ...formData, forum_id },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        console.log('Offre créée:', response.data);
        // Rafraîchir la liste des offres pour avoir les données les plus récentes
        await refreshOffers();
      }
      setModalOpen(false);
      setEditingOffer(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  // Fonction pour gérer la sauvegarde depuis VirtualOfferModal
  const handleVirtualOfferSave = async (savedOffer) => {
    console.log('VirtualOfferModal - Offre sauvegardée:', savedOffer);
    // Rafraîchir la liste des offres
    await refreshOffers();
    setModalOpen(false);
    setEditingOffer(null);
  };

  if (loading) return <Loading />;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <CompanyApprovalCheck 
      forumId={forum.id} 
      apiBaseUrl={apiBaseUrl}
      fallbackMessage="L'ajout d'offres n'est pas disponible car votre entreprise n'est pas encore approuvée pour ce forum."
    >
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

        {/* Filtres et recherche */}
        <RecruiterOfferFilters 
          offers={offers} 
          onFilter={setFilteredOffers} 
        />
        {console.log('Passing to RecruiterOfferFilters:', { offers: offers.length, onFilter: typeof setFilteredOffers })} {/* Debug log */}


        {/* Liste des offres */}
        {filteredOffers.length === 0 ? (
          <div className="no-offers">
            <p>{offers.length === 0 ? 'Aucune offre trouvée.' : 'Aucune offre ne correspond aux critères de recherche.'}</p>
          </div>
        ) : (
          <div className="offers-grid offers-list-horizontal">
            {filteredOffers.map((offer) => (
              <Offer
                  key={offer.id}
                offer={offer}
                onClick={handleOfferClick}
                onEdit={onUpdateOffer}
                onDelete={onDeleteOffer}
                space="recruiter"
                forum={forum}
                activeTab="offres"
              />
            ))}
          </div>
        )}

      </div>

      {/* Modal conditionnel selon le type de forum */}
      {isVirtualForum ? (
        <VirtualOfferModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          offer={editingOffer}
          forum={forum}
          onSave={handleVirtualOfferSave}
          accessToken={accessToken}
          apiBaseUrl={apiBaseUrl}
        />
      ) : (
        <OfferModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          initialData={editingOffer}
          forumId={forum_id}
        />
      )}

    </div>
    </CompanyApprovalCheck>
  );
};

export default OffersList;

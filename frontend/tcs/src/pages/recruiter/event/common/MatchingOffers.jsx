import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../../../pages/styles/recruiter/OffersList.css';
import '../../../../pages/styles/recruiter/Matching.css';
import Loading from '../../../../components/loyout/Loading';
import { useNavigate } from 'react-router-dom';
import CompanyApprovalCheck from '../../../../utils/CompanyApprovalCheck';
import Offer from '../../../../components/card/offer/Offer';
import RecruiterOfferFilters from '../../../../components/filters/offer/RecruiterOfferFilters';

const MatchingOffers = ({ forum, accessToken, apiBaseUrl }) => {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [errorOffers, setErrorOffers] = useState(null);
  const [matchingInProgressForOffer, setMatchingInProgressForOffer] = useState(null);

  const navigate = useNavigate();
  const forum_id = forum.id;

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoadingOffers(true);
        const response = await axios.get(`${apiBaseUrl}/recruiters/company-offers/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { forum_id },
        });
        console.log('Offers data:', response.data); // Debug pour voir la structure
        setOffers(response.data);
        setFilteredOffers(response.data);
        setErrorOffers(null);
      } catch (err) {
        setErrorOffers(err.response?.data?.detail || 'Erreur lors du chargement des offres');
      } finally {
        setLoadingOffers(false);
      }
    };
    fetchOffers();
  }, [accessToken, apiBaseUrl, forum_id]);

  // Initialiser filteredOffers avec toutes les offres
  useEffect(() => {
    setFilteredOffers(offers);
  }, [offers]);

  const handleStartMatching = async (offerId) => {
    setMatchingInProgressForOffer(offerId);

    try {
      const res = await axios.post(
        `${apiBaseUrl}/matching/start/${offerId}/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const candidates = res.data.candidates || [];
      const offer = offers.find(o => o.id === offerId);
      
      // Navigation vers la page de détails de matching
      navigate('/matching/detail', {
        state: {
          offer: offer,
          candidates: candidates,
          forum: forum,
          activeTab: 'matching',
          space: 'recruiter'
        }
      });

    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors du matching');
    } finally {
      setMatchingInProgressForOffer(null);
    }
  };

  if (matchingInProgressForOffer) {
    return <Loading />;
  }

  return (
    <CompanyApprovalCheck 
      forumId={forum.id} 
      apiBaseUrl={apiBaseUrl}
      fallbackMessage="L'accès au matching n'est pas disponible car votre entreprise n'est pas encore approuvée pour ce forum."
    >
      <div className="offers-list-wrapper">
        <div className="offers-list-content">
        {loadingOffers && <Loading />}
        {errorOffers && <div className="error">{errorOffers}</div>}
        {!loadingOffers && offers.length === 0 && <p>Aucune offre disponible.</p>}

        {/* Filtres et recherche */}
        <RecruiterOfferFilters 
          offers={offers} 
          onFilter={setFilteredOffers} 
        />

        {/* Loader global pendant matching (optionnel) */}
        {matchingInProgressForOffer && (
          <div className="global-loading-overlay">
            <Loading />
          </div>
        )}

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
                onClick={() => {}} // Pas de popup de détails dans matching
                onMatching={() => handleStartMatching(offer.id)}
                space="matching"
                isMatchingInProgress={matchingInProgressForOffer === offer.id}
              />
            ))}
          </div>
        )}

      </div>
    </div>
    </CompanyApprovalCheck>
  );
};

export default MatchingOffers;
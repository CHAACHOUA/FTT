import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUsers } from 'react-icons/fa';
import '../../styles/recruiter/OffersList.css';
import Loading from '../../common/Loading';
import { useNavigate } from 'react-router-dom';

const MatchingOffers = ({ forum, accessToken, apiBaseUrl }) => {
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [errorOffers, setErrorOffers] = useState(null);
  const [matchingInProgressForOffer, setMatchingInProgressForOffer] = useState(null);

  const navigate = useNavigate();
  const forum_id = forum.id;

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoadingOffers(true);
        const response = await axios.get(`${apiBaseUrl}/api/recruiters/company-offers/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { forum_id },
        });
        setOffers(response.data);
        setErrorOffers(null);
      } catch (err) {
        setErrorOffers(err.response?.data?.detail || 'Erreur lors du chargement des offres');
      } finally {
        setLoadingOffers(false);
      }
    };
    fetchOffers();
  }, [accessToken, apiBaseUrl, forum_id]);

  const handleStartMatching = async (offerId) => {
    setMatchingInProgressForOffer(offerId);

    try {
      const res = await axios.post(
        `${apiBaseUrl}/api/matching/start/${offerId}/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      navigate('/matching-candidates', {
        state: {
          candidates: res.data.candidates || [],
        },
      });

    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors du matching');
    } finally {
      setMatchingInProgressForOffer(null);
    }
  };

  return (
    <div className="matching-container">
      <h2>Offres pour le forum : {forum.name}</h2>

      {loadingOffers && <Loading />}
      {errorOffers && <div className="error">{errorOffers}</div>}
      {!loadingOffers && offers.length === 0 && <p>Aucune offre disponible.</p>}

      {/* Loader global pendant matching (optionnel) */}
      {matchingInProgressForOffer && (
        <div className="global-loading" style={{ marginBottom: '1rem' }}>
          <Loading />
          <p>Matching en cours pour l'offre #{matchingInProgressForOffer}...</p>
        </div>
      )}

      <div className="offers-list">
        {offers.map((offer) => (
          <div key={offer.id} className="offer-card">
            <h3>{offer.title}</h3>
            <p>{offer.description}</p>
            <p><strong>Lieu :</strong> {offer.location || 'Non spécifié'}</p>

            <button
              onClick={() => handleStartMatching(offer.id)}
              disabled={matchingInProgressForOffer !== null}
              className="btn btn-primary"
            >
              {matchingInProgressForOffer === offer.id
                ? <Loading />
                : <><FaUsers /> Matching candidat</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchingOffers;

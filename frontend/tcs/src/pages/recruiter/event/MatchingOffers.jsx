import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUsers } from 'react-icons/fa';
import '../../styles/recruiter/OffersList.css';
import Loading from '../../common/Loading';
import { useNavigate } from 'react-router-dom';
import MatchingCandidates from './MatchingCandidates';

const MatchingOffers = ({ forum, accessToken, apiBaseUrl }) => {
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [errorOffers, setErrorOffers] = useState(null);
  const [matchingInProgressForOffer, setMatchingInProgressForOffer] = useState(null);
  const [showCandidatesModal, setShowCandidatesModal] = useState(false);
  const [candidatesData, setCandidatesData] = useState([]);

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

      setCandidatesData(res.data.candidates || []);
      setShowCandidatesModal(true);

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
    <div className="matching-offers-section">
      <h2 className="matching-title">Offres pour le forum : {forum.name}</h2>

      {loadingOffers && <Loading />}
      {errorOffers && <div className="error">{errorOffers}</div>}
      {!loadingOffers && offers.length === 0 && <p>Aucune offre disponible.</p>}

      {/* Loader global pendant matching (optionnel) */}
      {matchingInProgressForOffer && (
        <div className="global-loading-overlay">
          <Loading />
        </div>
      )}

      <div className="matching-offers-list">
        {offers.map((offer) => (
          <div key={offer.id} className="matching-offer-card">
            <h3 className="offer-title">{offer.title}</h3>
            <p className="offer-description">{offer.description}</p>
            <div className="offer-meta-row">
              <span><strong>Lieu :</strong> {offer.location || 'Non spécifié'}</span>
            </div>
            <button
              onClick={() => handleStartMatching(offer.id)}
              disabled={matchingInProgressForOffer !== null}
              className="btn-matching-offer"
            >
              {matchingInProgressForOffer === offer.id
                ? <Loading />
                : <><FaUsers /> Matching candidat</>}
            </button>
          </div>
        ))}
      </div>

      {showCandidatesModal && (
        <div className="modal-backdrop" onClick={() => setShowCandidatesModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '900px', width: '95vw', minHeight: '60vh'}}>
            <button style={{float: 'right', fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#4f2cc6'}} onClick={() => setShowCandidatesModal(false)}>&times;</button>
            <MatchingCandidates candidates={candidatesData} onClose={() => setShowCandidatesModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingOffers;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUsers } from 'react-icons/fa';
import '../../styles/recruiter/OffersList.css';
import Loading from '../../common/Loading';
import CandidatesList from './CandidatesList';

const Matching = ({ forum, accessToken, apiBaseUrl }) => {
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [errorOffers, setErrorOffers] = useState(null);

  const [matchingInProgressForOffer, setMatchingInProgressForOffer] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [errorCandidates, setErrorCandidates] = useState(null);

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
    setCandidates([]);
    setErrorCandidates(null);
    setLoadingCandidates(true);

    try {
      // Appel direct synchrone : la réponse contient les candidats directement
      const res = await axios.post(
        `${apiBaseUrl}/api/matching/start/${offerId}/`, // modifie selon ton endpoint synchrone
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      setCandidates(res.data.candidates || []);
      setLoadingCandidates(false);
      setMatchingInProgressForOffer(null);
    } catch (err) {
      setErrorCandidates(err.response?.data?.detail || 'Erreur lors du matching');
      setLoadingCandidates(false);
      setMatchingInProgressForOffer(null);
    }
  };

  return (
    <div className="matching-container">
      <h2>Offres pour le forum : {forum.name}</h2>

      {loadingOffers && <Loading />}
      {errorOffers && <div className="error">{errorOffers}</div>}

      {!loadingOffers && offers.length === 0 && <p>Aucune offre disponible.</p>}

      <div className="offers-list">
        {offers.map((offer) => (
          <div key={offer.id} className="offer-card">
            <h3>{offer.title}</h3>
            <p>{offer.description}</p>
            <p><strong>Lieu :</strong> {offer.location || 'Non spécifié'}</p>

            <button
              onClick={() => handleStartMatching(offer.id)}
              disabled={matchingInProgressForOffer === offer.id}
              className="btn btn-primary"
              title="Lancer matching candidats"
            >
              <FaUsers /> Matching candidat
            </button>

            {matchingInProgressForOffer === offer.id && (
              <div className="matching-result">
                {loadingCandidates && <Loading />}
                {errorCandidates && <div className="error">{errorCandidates}</div>}
                {!loadingCandidates && candidates.length > 0 && (
                  <CandidatesList candidates={candidates} />
                )}
                {!loadingCandidates && candidates.length === 0 && !errorCandidates && (
                  <p>Aucun candidat trouvé pour cette offre.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Matching;

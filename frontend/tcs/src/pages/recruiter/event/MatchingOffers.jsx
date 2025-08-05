import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUsers, FaMapMarkerAlt, FaBuilding, FaUser, FaCalendar, FaBriefcase } from 'react-icons/fa';
import { MdBusiness, MdLocationOn, MdPerson } from 'react-icons/md';
import '../../styles/recruiter/OffersList.css';
import Loading from '../../common/Loading';
import { useNavigate } from 'react-router-dom';
import MatchingCandidates from './MatchingCandidates';
import logoFTT from '../../../assets/Logo-FTT.png';

const MatchingOffers = ({ forum, accessToken, apiBaseUrl }) => {
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [errorOffers, setErrorOffers] = useState(null);
  const [matchingInProgressForOffer, setMatchingInProgressForOffer] = useState(null);
  const [showCandidatesModal, setShowCandidatesModal] = useState(false);
  const [candidatesData, setCandidatesData] = useState([]);

  const navigate = useNavigate();
  const forum_id = forum.id;

  // Fonction pour générer les initiales du recruteur
  const getInitials = (name) => {
    if (!name) return 'R';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoadingOffers(true);
        const response = await axios.get(`${apiBaseUrl}/api/recruiters/company-offers/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { forum_id },
        });
        console.log('Offers data:', response.data); // Debug pour voir la structure
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
            {/* Section Logo et Entreprise */}
            <div className="matching-company-section">
              <img 
                src={offer.company_logo || logoFTT} 
                alt={`Logo ${offer.company_name || 'Entreprise'}`}
                className="matching-company-logo"
                onError={(e) => {
                  e.target.src = '/logo-digitalio.png';
                }}
              />
              <div className="matching-company-name">
                {offer.company_name || 'Entreprise non spécifiée'}
              </div>
            </div>

            {/* Section Contenu Principal */}
            <div className="matching-content-section">
              <h3 className="offer-title">{offer.title}</h3>
              <p className="offer-description">{offer.description}</p>
              
              {/* Métadonnées avec icônes */}
              <div className="matching-meta-section">
                {offer.location && (
                  <div className="matching-meta-item">
                    <MdLocationOn className="matching-meta-icon" />
                    <span>{offer.location}</span>
                  </div>
                )}
                {offer.sector && (
                  <div className="matching-meta-item">
                    <FaBriefcase className="matching-meta-icon" />
                    <span>{offer.sector}</span>
                  </div>
                )}
                {offer.contract_type && (
                  <div className="matching-meta-item">
                    <MdBusiness className="matching-meta-icon" />
                    <span>{offer.contract_type}</span>
                  </div>
                )}
                {offer.created_at && (
                  <div className="matching-meta-item">
                    <FaCalendar className="matching-meta-icon" />
                    <span>Postée le {new Date(offer.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
              </div>

              {/* Section Recruteur */}
              <div className="matching-recruiter-section">
                {offer.recruiter_photo ? (
                  <img 
                    src={offer.recruiter_photo} 
                    alt={`${offer.recruiter_name || 'Recruteur'}`}
                    className="matching-recruiter-avatar"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="matching-recruiter-initials"
                  style={{ 
                    display: offer.recruiter_photo ? 'none' : 'flex',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#4f2cc6',
                    color: 'white',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {getInitials(offer.recruiter_name)}
                </div>
                <div className="matching-recruiter-info">
                  <div className="matching-recruiter-name">
                    {offer.recruiter_name || 'Recruteur'}
                  </div>
                  <div className="matching-recruiter-role">
                    Recruteur • {offer.company_name || 'Entreprise'}
                  </div>
                </div>
              </div>
            </div>

            {/* Bouton Matching */}
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
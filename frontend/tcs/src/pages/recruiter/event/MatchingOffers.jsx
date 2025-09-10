import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUsers, FaMapMarkerAlt, FaBuilding, FaUser, FaCalendar, FaBriefcase, FaIndustry } from 'react-icons/fa';
import { MdBusiness, MdLocationOn, MdPerson } from 'react-icons/md';
import '../../styles/recruiter/OffersList.css';
import '../../styles/recruiter/Matching.css';
import Loading from '../../common/Loading';
import { useNavigate } from 'react-router-dom';
import MatchingCandidates from './MatchingCandidates';
import CompanyApprovalCheck from '../../../components/CompanyApprovalCheck';
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
    <CompanyApprovalCheck 
      forumId={forum.id} 
      accessToken={accessToken} 
      apiBaseUrl={apiBaseUrl}
      fallbackMessage="L'accès au matching n'est pas disponible car votre entreprise n'est pas encore approuvée pour ce forum."
    >
      <div className="offers-list-wrapper">
        <div className="offers-list-content">
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

      <div className="offers-grid offers-list-horizontal">
        {offers.map((offer) => {
          const recruiterFirst = offer.recruiter_name?.split(' ')[0] || '';
          const recruiterLast = offer.recruiter_name?.split(' ')[1] || '';
          const initials = `${recruiterFirst?.[0] || ''}${recruiterLast?.[0] || ''}`.toUpperCase() || 'HR';
          const bannerSrc = offer.company_banner 
            ? (offer.company_banner.startsWith('http') ? offer.company_banner : `${apiBaseUrl}${offer.company_banner}`)
            : (offer.company_logo ? (offer.company_logo.startsWith('http') ? offer.company_logo : `${apiBaseUrl}${offer.company_logo}`) : logoFTT);
          
          return (
            <div key={offer.id} className="offer-card horizontal">
              <div className="offer-left-banner">
                <img src={bannerSrc} alt="Bannière entreprise" onError={(e) => {e.target.src = logoFTT;}} />
                <div className="company-logo-badge">
                  <img
                    src={offer.company_logo || logoFTT}
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
                </div>

                <h4 className="offer-title large">{offer.title}</h4>
                
                <div className="offer-meta-tags">
                  {offer.sector && (
                    <div className="offer-meta-tag sector">
                      <FaIndustry />
                      <span>{offer.sector}</span>
                    </div>
                  )}
                  {offer.contract_type && (
                    <div className="offer-meta-tag contract">
                      <FaBriefcase />
                      <span>{offer.contract_type}</span>
                    </div>
                  )}
                </div>
                
                <div className="offer-location-line">
                  <FaMapMarkerAlt />
                  <span>{offer.location || 'Non précisé'}</span>
                </div>
                
                <div style={{ textAlign: 'right', marginTop: 'auto' }}>
                  <span className="offer-date">Publiée le {new Date(offer.created_at || Date.now()).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              <div className="offer-actions">
                <button
                  onClick={() => handleStartMatching(offer.id)}
                  disabled={matchingInProgressForOffer !== null}
                  className="btn-matching-offer"
                  style={{
                    background: 'linear-gradient(135deg, #18386c 0%, #06b6d4 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(24, 56, 108, 0.3)',
                    fontSize: '0.95rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {matchingInProgressForOffer === offer.id
                    ? <Loading />
                    : <><FaUsers /> Matching candidat</>}
                </button>
              </div>
            </div>
          );
        })}
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
    </div>
    </CompanyApprovalCheck>
  );
};

export default MatchingOffers;
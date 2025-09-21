import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../common/NavBar';
import SubMenu from './SubMenu';
import Loading from '../../../pages/common/Loading';
import { FaArrowLeft, FaBuilding, FaMapMarkerAlt, FaGlobe, FaPhone, FaEnvelope, FaUsers, FaBriefcase, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faUserTie, faMapMarkerAlt as faMapMarker } from '@fortawesome/free-solid-svg-icons';
import logo from '../../../assets/Logo-FTT.png';
import '../../styles/candidate/Dashboard.css';
import '../../../pages/styles/forum/ForumOffer.css';
import './CompanyDetail.css';
import Offer from '../../../components/Offer';
import PersonCard from '../../../components/common/PersonCard';

const CompanyDetail = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [company, setCompany] = useState(null);
  const [forum, setForum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    // Récupérer les données depuis l'état de navigation ou les paramètres
    if (location.state?.company && location.state?.forum) {
      setCompany(location.state.company);
      setForum(location.state.forum);
      setLoading(false);
    } else {
      // Si pas de données dans l'état, rediriger vers la page entreprises
      navigate('/event/candidate/dashboard/');
    }
  }, [companyId, location.state, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  // Fonction pour gérer la navigation du sous-menu
  const handleSubMenuNavigation = (tabId) => {
    navigate('/event/candidate/dashboard/', { 
      state: { 
        forum, 
        activeTab: tabId 
      } 
    });
  };

  if (loading) return <Loading />;
  if (!company || !forum) return <p className="px-6">Entreprise introuvable.</p>;

  return (
    <div className="dashboard-container" style={{ paddingTop: '120px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />
      <div className="candidate-dashboard-layout">
        <div className="candidate-sidebar">
          <SubMenu active={activeTab} setActive={handleSubMenuNavigation} forumType={forum.type} />
        </div>
        <div className="candidate-main-content">
          {/* Header avec bouton retour */}
          <div className="company-detail-header">
            <button 
              className="back-button"
              onClick={() => navigate('/event/candidate/dashboard/', { state: { forum, activeTab: 'entreprises' } })}
            >
              <FaArrowLeft />
              Retour
            </button>
            <div className="forum-info">
              <h1 className="company-detail-title">{forum.name}</h1>
              <div className="forum-date">
                <FaCalendarAlt className="date-icon" />
                {formatDate(forum.start_date)} - {formatDate(forum.end_date)}
              </div>
            </div>
          </div>

          <div className="company-detail-content">
            {/* Section informations entreprise */}
            <div className="company-info-section">
              <div className="company-header">
                <div className="company-logo-container">
                  <img
                    src={company.logo || logo}
                    alt={company.name}
                    className="company-logo"
                  />
                </div>
                <div className="company-basic-info">
                  <h2 className="company-name">{company.name}</h2>
                  {company.description && (
                    <p className="company-description">{company.description}</p>
                  )}
                  {company.sectors && company.sectors.length > 0 && (
                    <div className="company-sectors">
                      {company.sectors.map((sector, index) => (
                        <span key={index} className="sector-tag">{sector}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Informations de contact en bas */}
              <div className="company-contact-info">
                {company.website && (
                  <div className="contact-item">
                    <FaGlobe className="contact-icon" />
                    <div className="contact-content">
                      <span className="contact-label">SITE WEB</span>
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="contact-value">
                        {company.website}
                      </a>
                    </div>
                  </div>
                )}
                
                {company.stand && (
                  <div className="contact-item">
                    <FaBuilding className="contact-icon" />
                    <div className="contact-content">
                      <span className="contact-label">STAND</span>
                      <span className="contact-value">Stand {company.stand}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section recruteurs */}
            {company.recruiters && company.recruiters.length > 0 && (
              <div className="company-recruiters-section">
                <h3 className="section-title">
                  <FaUsers className="section-icon" />
                  Recruteurs ({company.recruiters.length})
                </h3>
                
                <div className="recruiters-person-cards-container">
                  {company.recruiters.map((recruiter, index) => (
                    <PersonCard
                      key={recruiter.id || index}
                      person={{
                        ...recruiter,
                        company: company,
                        company_name: company.name,
                        full_name: `${recruiter.first_name} ${recruiter.last_name}`,
                        photo: recruiter.profile_picture
                      }}
                      type="recruiter"
                      showActions={false}
                      showContact={false}
                      showView={false}
                      showSend={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Section offres d'emploi */}
            {company.offers && company.offers.length > 0 && (
              <div className="company-offers-section">
                <h3 className="section-title">
                  <FaBriefcase className="section-icon" />
                  Offres d'emploi ({company.offers.length})
                </h3>
                
                <div className="forum-offers-container">
                  {company.offers.map((offer, index) => {
                    // Transformer les données pour le composant Offer
                    const offerData = {
                      ...offer,
                      company: {
                        name: company.name,
                        logo: company.logo
                      },
                      recruiter: {
                        name: offer.recruiter_name || 'Recruteur'
                      }
                    };
                    
                    return (
                      <Offer
                        key={index}
                        offer={offerData}
                        onClick={() => {}} // Pas d'action de clic
                        space="company" // Nouvel espace sans boutons
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Message si pas d'offres */}
            {(!company.offers || company.offers.length === 0) && (
              <div className="no-offers-message">
                <FaBriefcase className="no-offers-icon" />
                <p>Cette entreprise n'a pas encore publié d'offres d'emploi.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;

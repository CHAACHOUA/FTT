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

  if (loading) return <Loading />;
  if (!company || !forum) return <p className="px-6">Entreprise introuvable.</p>;

  return (
    <div className="dashboard-container" style={{ paddingTop: '120px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />
      <div className="candidate-dashboard-layout">
        <div className="candidate-sidebar">
          <SubMenu active={activeTab} setActive={setActiveTab} forumType={forum.type} />
        </div>
        <div className="candidate-main-content">
          {/* Header avec bouton retour */}
          <div className="company-detail-header">
            <button 
              className="back-button"
              onClick={() => navigate('/event/candidate/dashboard/', { state: { forum, activeTab: 'entreprises' } })}
            >
              <FaArrowLeft />
              Retour aux entreprises
            </button>
            <h1 className="company-detail-title">{company.name}</h1>
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
                
                <div className="recruiters-container">
                  {company.recruiters.map((recruiter, index) => (
                    <div key={index} className="recruiter-card">
                      <div className="recruiter-photo">
                        <img
                          src={recruiter.profile_picture || logo}
                          alt={`${recruiter.first_name} ${recruiter.last_name}`}
                        />
                      </div>
                      <div className="recruiter-info">
                        <h4 className="recruiter-name">
                          {recruiter.first_name} {recruiter.last_name}
                        </h4>
                      </div>
                    </div>
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
                  {company.offers.map((offer, index) => (
                    <div key={index} className="forum-offer-card">
                      {/* Section Logo et Entreprise */}
                      <div className="forum-offer-company-section">
                        <img
                          src={company.logo || logo}
                          alt={company.name}
                          className="forum-offer-logo"
                        />
                        <div className="forum-offer-company-info">
                          <h4 className="forum-offer-company-name">
                            {company.name}
                          </h4>
                          <div className="forum-offer-company-meta">
                            <FaBuilding className="forum-offer-meta-icon" />
                            <span>{offer.sector || 'Secteur non précisé'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section Contenu Principal */}
                      <div className="forum-offer-content">
                        <h3 className="forum-offer-title">{offer.title}</h3>
                        <p className="forum-offer-description">{offer.description}</p>
                        
                        {/* Métadonnées avec icônes */}
                        <div className="forum-offer-meta">
                          {offer.location && (
                            <div className="forum-offer-meta-item">
                              <FaMapMarkerAlt className="forum-offer-meta-icon" />
                              <span className="forum-meta-text">{offer.location}</span>
                            </div>
                          )}
                          {offer.contract_type && (
                            <div className="forum-offer-meta-item">
                              <FaBriefcase className="forum-offer-meta-icon" />
                              <span className="forum-meta-text">
                                <strong>Type :</strong> {offer.contract_type}
                              </span>
                            </div>
                          )}
                          {offer.start_date && (
                            <div className="forum-offer-meta-item">
                              <FaCalendarAlt className="forum-offer-meta-icon" />
                              <span className="forum-meta-text">
                                Début: {formatDate(offer.start_date)}
                              </span>
                            </div>
                          )}
                          {offer.salary && (
                            <div className="forum-offer-meta-item">
                              <FaUsers className="forum-offer-meta-icon" />
                              <span className="forum-meta-text">{offer.salary}</span>
                            </div>
                          )}
                        </div>

                        {/* Section Recruteur */}
                        <div className="forum-offer-recruiter-section">
                          <div 
                            className="forum-offer-recruiter-initials"
                            style={{ 
                              display: 'flex',
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
                            R
                          </div>
                          <div className="forum-offer-recruiter-info">
                            <div className="forum-offer-recruiter-name">
                              Recruteur
                            </div>
                            <div className="forum-offer-recruiter-role">
                              Recruteur • {company.name}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="forum-offer-actions">
                        <button 
                          className="forum-offer-action-button" 
                          title="Voir les détails"
                        >
                          <FaBriefcase />
                        </button>
                      </div>
                    </div>
                  ))}
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

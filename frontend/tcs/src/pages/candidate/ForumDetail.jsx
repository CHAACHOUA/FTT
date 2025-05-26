import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Calendar, Building2 } from 'lucide-react';
import '../../pages/styles/forum/ForumDetail.css';

const ForumDetail = () => {
  const { id } = useParams();
  const [forum, setForum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const API = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    axios.get(`${API}/api/forums/${id}/`)
      .then(res => {
        setForum(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur de récupération du forum:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Chargement...</p>;
  if (!forum) return <p>Forum introuvable.</p>;

  const recruiterCount = forum.companies.reduce((sum, company) => sum + company.recruiters.length, 0);

  return (
    <div className="forum-detail-card">
      <div className="forum-detail-header">
        <div className="forum-detail-logo">
          {forum.organizer.logo ? (
            <img src={forum.organizer.logo} alt={forum.organizer.name} />
          ) : (
            <div className="forum-detail-logo-placeholder">Logo</div>
          )}
        </div>
        <div>
          <h1 className="forum-detail-title">{forum.name}</h1>
          <p className="forum-detail-organizer">Organisé par {forum.organizer.name}</p>
        </div>
      </div>

      <div className="forum-detail-tabs">
        <div className={`forum-detail-tab ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>Informations générales</div>
        <div className={`forum-detail-tab ${activeTab === 'companies' ? 'active' : ''}`} onClick={() => setActiveTab('companies')}>Entreprises</div>
        <div className={`forum-detail-tab ${activeTab === 'offers' ? 'active' : ''}`} onClick={() => setActiveTab('offers')}>Offres</div>
      </div>

      {activeTab === 'general' && (
        <div className="forum-detail-main">
          <div className="forum-detail-left">
            <h3 className="forum-detail-subtitle">À propos du Forum :</h3>
            <p className="forum-detail-description">{forum.description}</p>
          </div>

          <div className="forum-detail-right">
            <h3 className="forum-detail-right-title">Détails de l’évènement</h3>
            <div className="forum-detail-line">
              <Calendar size={20} className="icon" />
              <span>{forum.date}</span>
            </div>
            <div className="forum-detail-line">
              <Building2 size={20} className="icon" />
              <span>{forum.type}</span>
            </div>
            <div className="forum-detail-line">
              <span>Nombre d'entreprises participantes :</span>
              <strong>{forum.companies.length}</strong>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'companies' && (
        <div className="forum-detail-companies-list">
          {forum.companies.map((company, index) => (
            <div key={index} className="forum-detail-company-card">
              {company.logo && (
                <img src={company.logo} alt={company.name} className="forum-detail-company-logo" />
              )}
              <h3 className="forum-detail-company-name">{company.name}</h3>
              <p className="forum-detail-company-recruiters">Recruteurs : {company.recruiters.length}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'offers' && (
        <div className="forum-detail-offers">
          <p>Aucune offre pour le moment.</p>
        </div>
      )}
    </div>
  );
};

export default ForumDetail;

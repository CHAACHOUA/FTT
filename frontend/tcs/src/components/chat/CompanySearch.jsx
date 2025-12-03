import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatService from '../../services/ChatService';
import { FaSearch } from 'react-icons/fa';
import './CompanySearch.css';

const CompanySearch = ({ forumId, onConversationCreated }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  // Charger les entreprises du forum
  useEffect(() => {
    if (forumId) {
      loadCompanies();
    }
  }, [forumId]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      // Récupérer les entreprises participantes au forum
      const response = await axios.get(`${API_BASE_URL}/forums/${forumId}/`, {
        withCredentials: true
      });
      
      if (response.data && response.data.companies) {
        setCompanies(response.data.companies);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = async (company) => {
    try {
      // Créer directement une conversation avec l'entreprise
      // Tous les recruteurs de l'entreprise verront cette conversation
      console.log('📝 [CompanySearch] Création conversation:', { forumId, companyId: company.id });
      const conversation = await ChatService.createConversation(forumId, company.id);
      console.log('✅ [CompanySearch] Conversation créée:', conversation);
      
      if (onConversationCreated) {
        onConversationCreated(conversation);
      }
      
      // Réinitialiser
      setSearchTerm('');
    } catch (error) {
      console.error('❌ [CompanySearch] Erreur lors de la création de la conversation:', error);
      console.error('❌ [CompanySearch] Détails erreur:', error.response?.data);
      const errorMessage = error.response?.data?.error 
        || (typeof error.response?.data === 'object' ? JSON.stringify(error.response.data) : 'Erreur lors de la création de la conversation');
      alert(errorMessage);
    }
  };



  const filteredCompanies = companies.filter(company =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.sectors?.some(sector => sector?.toLowerCase().includes(searchTerm.toLowerCase()))
  );


  return (
    <div className="company-search">
      <div className="company-search-header">
        <h3>Rechercher une entreprise</h3>
      </div>
      
      <div className="search-input-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Rechercher une entreprise..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="companies-list">
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : filteredCompanies.length === 0 ? (
          <div className="no-results">
            <p>Aucune entreprise trouvée.</p>
          </div>
        ) : (
          filteredCompanies.map((company) => {
            // Fonction pour obtenir l'URL du logo
            const getLogoUrl = () => {
              if (!company.logo) return null;
              if (typeof company.logo === 'string') {
                if (company.logo.startsWith('http')) return company.logo;
                const mediaBaseUrl = process.env.REACT_APP_API_BASE_URL_MEDIA || process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
                return `${mediaBaseUrl}${company.logo}`;
              }
              return null;
            };

            // Fonction pour obtenir les initiales
            const getInitials = () => {
              if (company.name) {
                return company.name[0].toUpperCase();
              }
              return 'E';
            };

            const logoUrl = getLogoUrl();
            const initials = getInitials();

            return (
              <div
                key={company.id}
                className="company-item"
                onClick={() => handleCompanySelect(company)}
              >
                <div className="company-avatar">
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt={company.name || 'Entreprise'} 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <span style={{ display: logoUrl ? 'none' : 'flex' }}>
                    {initials}
                  </span>
                </div>
                <div className="company-info">
                  <h4>{company.name}</h4>
                  {company.sectors && company.sectors.length > 0 && (
                    <p className="company-sectors">
                      {company.sectors.join(', ')}
                    </p>
                  )}
                </div>
                <div className="company-action">
                  <span className="contact-badge">Contacter</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CompanySearch;


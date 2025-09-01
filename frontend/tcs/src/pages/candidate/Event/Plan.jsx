// ✅ Plan.jsx
import React, { useState, useEffect } from 'react';
import '../../styles/forum/Plan.css';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { getSectorsForSelect, getContractsForSelect } from '../../../constants/choices';
import { FaMapMarkerAlt, FaBuilding, FaBriefcase, FaClock, FaRoute, FaDownload } from 'react-icons/fa';
import LogoFTT from '../../../assets/Logo-FTT.png';

const Plan = ({ companies, forumId }) => {
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedContract, setSelectedContract] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [candidateSearch, setCandidateSearch] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { accessToken } = useAuth();

  useEffect(() => {
    const loadChoices = async () => {
      try {
        setLoading(true);
        const [sectorsData, contractsData] = await Promise.all([
          getSectorsForSelect(),
          getContractsForSelect()
        ]);
        setSectors(sectorsData);
        setContracts(contractsData);
      } catch (error) {
        console.error('Erreur lors du chargement des choix:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChoices();
  }, []);

  useEffect(() => {
    const fetchCandidateSearch = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/forums/candidate/${forumId}/search`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setCandidateSearch(response.data);
        setSelectedSector(response.data.sector || '');
        setSelectedContract(response.data.contract_type || '');
        setLocationTerm(response.data.region || '');
      } catch (error) {
        console.error('Erreur lors de la récupération des filtres du candidat:', error);
      }
    };

    if (accessToken) {
      fetchCandidateSearch();
    }
  }, [accessToken, forumId]);

  // Utiliser les secteurs et contrats standardisés au lieu des données des entreprises
  const allSectors = sectors.map(s => s.value);
  const allContractTypes = contracts.map(c => c.value);

  const companiesWithStand = companies.filter(c => c.stand);
  const filteredCompanies = companiesWithStand.filter(company => {
    // Basé sur les offres de l'entreprise, pas sur le secteur de l'entreprise
    const sectorMatch = !selectedSector || company.offers?.some(o => o.sector === selectedSector);
    const contractMatch = !selectedContract || company.offers?.some(o => o.contract_type === selectedContract);
    const nameMatch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const titleMatch = company.offers?.some(o => o.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const locationMatch = !locationTerm || company.offers?.some(o => o.location.toLowerCase().includes(locationTerm.toLowerCase()));
    return sectorMatch && contractMatch && (nameMatch || titleMatch) && locationMatch;
  });

  const timeEstimate = filteredCompanies.length * 10;

  // Fonction pour sauvegarder la nouvelle recherche
  const saveSearch = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/forums/candidate/${forumId}/search`, {
        sector: selectedSector,
        contract_type: selectedContract,
        region: locationTerm
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setShowFilters(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la recherche:', error);
    }
  };

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setSelectedSector('');
    setSelectedContract('');
    setSearchTerm('');
    setLocationTerm('');
  };

  // Fonction pour télécharger le plan en PDF
  const downloadPlan = () => {
    generatePDFPlan();
  };

  // Fonction pour générer le PDF du plan
  const generatePDFPlan = () => {
    // Import dynamique de jsPDF
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      const currentDate = new Date().toLocaleDateString('fr-FR');
      const currentTime = new Date().toLocaleTimeString('fr-FR');
      
      // Configuration des styles
      const titleFontSize = 20;
      const subtitleFontSize = 14;
      const normalFontSize = 12;
      const smallFontSize = 10;
      
      let yPosition = 20;
      
      // Titre principal
      doc.setFontSize(titleFontSize);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246); // Bleu
      doc.text('PLAN PERSONNALISÉ FORUM', 105, yPosition, { align: 'center' });
      
      yPosition += 15;
      
      // Date et heure
      doc.setFontSize(smallFontSize);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128); // Gris
      doc.text(`Généré le ${currentDate} à ${currentTime}`, 105, yPosition, { align: 'center' });
      
      yPosition += 20;
      
      // Critères de recherche
      doc.setFontSize(subtitleFontSize);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55); // Noir foncé
      doc.text('CRITÈRES DE RECHERCHE', 20, yPosition);
      
      yPosition += 10;
      
      doc.setFontSize(normalFontSize);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Secteur : ${selectedSector || 'Tous secteurs'}`, 25, yPosition);
      yPosition += 7;
      doc.text(`• Type de contrat : ${selectedContract || 'Tous contrats'}`, 25, yPosition);
      yPosition += 7;
      doc.text(`• Localisation : ${locationTerm || 'Toutes localisations'}`, 25, yPosition);
      yPosition += 7;
      doc.text(`• Recherche libre : ${searchTerm || 'Aucune'}`, 25, yPosition);
      
      yPosition += 15;
      
      // Statistiques
      doc.setFontSize(subtitleFontSize);
      doc.setFont('helvetica', 'bold');
      doc.text('STATISTIQUES', 20, yPosition);
      
      yPosition += 10;
      
      doc.setFontSize(normalFontSize);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Nombre d'entreprises : ${filteredCompanies.length}`, 25, yPosition);
      yPosition += 7;
      doc.text(`• Temps estimé : ${timeEstimate} minutes`, 25, yPosition);
      yPosition += 7;
      doc.text(`• Nombre total d'offres : ${filteredCompanies.reduce((total, company) => total + (company.offers?.length || 0), 0)}`, 25, yPosition);
      
      yPosition += 20;
      
      // Parcours recommandé
      doc.setFontSize(subtitleFontSize);
      doc.setFont('helvetica', 'bold');
      doc.text('PARCOURS RECOMMANDÉ', 20, yPosition);
      
      yPosition += 10;
      
      // Vérifier si on doit passer à une nouvelle page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Liste des entreprises
      filteredCompanies.forEach((company, idx) => {
        // Vérifier l'espace disponible
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(normalFontSize);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246); // Bleu
        doc.text(`${idx + 1}. ${company.name.toUpperCase()}`, 25, yPosition);
        
        yPosition += 8;
        
                 doc.setFontSize(smallFontSize);
         doc.setFont('helvetica', 'normal');
         doc.setTextColor(31, 41, 55); // Noir foncé
         doc.text(`Stand : ${company.stand}`, 30, yPosition);
         yPosition += 6;
         doc.text(`Durée estimée : ~10 minutes`, 30, yPosition);
         yPosition += 6;
         
         if (company.offers && company.offers.length > 0) {
           doc.text(`Offres disponibles : ${company.offers.length}`, 30, yPosition);
           yPosition += 6;
          
          company.offers.forEach((offer, offerIdx) => {
            if (yPosition > 250) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(`   ${offerIdx + 1}. ${offer.title}`, 35, yPosition);
            yPosition += 5;
            doc.text(`      - Secteur : ${offer.sector || 'Non spécifié'}`, 40, yPosition);
            yPosition += 5;
            doc.text(`      - Contrat : ${offer.contract_type || 'Non spécifié'}`, 40, yPosition);
            yPosition += 5;
            doc.text(`      - Localisation : ${offer.location || 'Non spécifiée'}`, 40, yPosition);
            yPosition += 5;
          });
        }
        
                 if (company.sectors && company.sectors.length > 0) {
           if (yPosition > 250) {
             doc.addPage();
             yPosition = 20;
           }
           doc.text(`Secteurs : ${company.sectors.join(', ')}`, 30, yPosition);
           yPosition += 6;
         }
        
        yPosition += 8;
      });
      
      // Conseils pour le forum
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(subtitleFontSize);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text('CONSEILS POUR LE FORUM', 20, yPosition);
      
      yPosition += 10;
      
      doc.setFontSize(normalFontSize);
      doc.setFont('helvetica', 'normal');
      const conseils = [
        '• Arrivez 15 minutes avant l\'ouverture',
        '• Préparez votre CV et lettre de motivation',
        '• Notez les questions importantes pour chaque entreprise',
        '• Gardez un stylo et un carnet pour prendre des notes',
        '• N\'oubliez pas de demander les coordonnées des recruteurs'
      ];
      
      conseils.forEach(conseil => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(conseil, 25, yPosition);
        yPosition += 7;
      });
      
      // Message de fin
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }
      
             yPosition += 10;
       doc.setFontSize(subtitleFontSize);
       doc.setFont('helvetica', 'bold');
       doc.setTextColor(16, 185, 129); // Vert
       doc.text('BONNE CHANCE POUR VOTRE FORUM !', 105, yPosition, { align: 'center' });
      
      // Sauvegarder le PDF
      doc.save(`plan-forum-${new Date().toISOString().split('T')[0]}.pdf`);
    }).catch(error => {
      console.error('Erreur lors de la génération du PDF:', error);
      // Fallback vers le format texte si jsPDF n'est pas disponible
      const planContent = generatePlanContent();
      const blob = new Blob([planContent], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `plan-forum-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
  };

  // Fonction pour générer le contenu du plan (fallback)
  const generatePlanContent = () => {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const currentTime = new Date().toLocaleTimeString('fr-FR');
    
    let content = `=== PLAN PERSONNALISÉ FORUM ===\n`;
    content += `Généré le ${currentDate} à ${currentTime}\n\n`;
    
    content += `CRITÈRES DE RECHERCHE :\n`;
    content += `• Secteur : ${selectedSector || 'Tous secteurs'}\n`;
    content += `• Type de contrat : ${selectedContract || 'Tous contrats'}\n`;
    content += `• Localisation : ${locationTerm || 'Toutes localisations'}\n`;
    content += `• Recherche libre : ${searchTerm || 'Aucune'}\n\n`;
    
    content += `STATISTIQUES :\n`;
    content += `• Nombre d'entreprises : ${filteredCompanies.length}\n`;
    content += `• Temps estimé : ${timeEstimate} minutes\n`;
    content += `• Nombre total d'offres : ${filteredCompanies.reduce((total, company) => total + (company.offers?.length || 0), 0)}\n\n`;
    
    content += `PARCOURS RECOMMANDÉ :\n`;
    content += `================================\n\n`;
    
         filteredCompanies.forEach((company, idx) => {
       content += `${idx + 1}. ${company.name.toUpperCase()}\n`;
       content += `   Stand : ${company.stand}\n`;
       content += `   Durée estimée : ~10 minutes\n`;
       
       if (company.offers && company.offers.length > 0) {
         content += `   Offres disponibles : ${company.offers.length}\n`;
         company.offers.forEach((offer, offerIdx) => {
           content += `      ${offerIdx + 1}. ${offer.title}\n`;
           content += `         - Secteur : ${offer.sector || 'Non spécifié'}\n`;
           content += `         - Contrat : ${offer.contract_type || 'Non spécifié'}\n`;
           content += `         - Localisation : ${offer.location || 'Non spécifiée'}\n`;
         });
       }
       
       if (company.sectors && company.sectors.length > 0) {
         content += `   Secteurs : ${company.sectors.join(', ')}\n`;
       }
       
       content += `\n`;
     });
    
    content += `CONSEILS POUR LE FORUM :\n`;
    content += `• Arrivez 15 minutes avant l'ouverture\n`;
    content += `• Préparez votre CV et lettre de motivation\n`;
    content += `• Notez les questions importantes pour chaque entreprise\n`;
    content += `• Gardez un stylo et un carnet pour prendre des notes\n`;
    content += `• N'oubliez pas de demander les coordonnées des recruteurs\n\n`;
    
         content += `BONNE CHANCE POUR VOTRE FORUM !\n`;
    
    return content;
  };

  return (
    <div className="plan-wrapper">
      {/* Header avec parcours prédéfini */}
      <div className="plan-header-new">
        <div className="plan-header-left-new">
          <div className="plan-title-section">
            <h2 className="plan-main-title">
              <FaRoute className="plan-icon" />
              Votre Parcours Personnalisé
            </h2>
            <p className="plan-subtitle">
              Basé sur votre recherche : {selectedSector || 'Tous secteurs'} • {selectedContract || 'Tous contrats'} • {locationTerm || 'Toutes localisations'}
            </p>
          </div>

                     <div className="plan-stats">
             <div className="stat-item">
               <span className="stat-number">{filteredCompanies.length}</span>
               <span className="stat-label">Entreprises</span>
             </div>
             <div className="stat-item">
               <span className="stat-number">{timeEstimate}</span>
               <span className="stat-label">Minutes</span>
             </div>
             <div className="stat-item">
               <span className="stat-number">
                 {filteredCompanies.reduce((total, company) => total + (company.offers?.length || 0), 0)}
               </span>
               <span className="stat-label">Offres</span>
             </div>
           </div>
        </div>

        <div className="plan-header-right-new">
          <div className="plan-actions">
            <button 
              className="download-plan-btn"
              onClick={downloadPlan}
              disabled={filteredCompanies.length === 0}
            >
              <FaDownload className="download-icon" />
              Télécharger le plan (PDF)
            </button>
            <button 
              className="modify-search-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Fermer' : 'Modifier ma recherche'}
            </button>
          </div>
        </div>
      </div>

      {/* Filtres modifiables */}
      {showFilters && (
        <div className="filters-panel">
          <h3 className="filters-title">Modifier votre recherche</h3>
          <div className="filters-grid">
            <div className="filter-block">
              <label>Secteur :</label>
              <select value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)} className="filter-select">
                <option value="">Tous les secteurs</option>
                {sectors.map((sector) => (
                  <option key={sector.value} value={sector.value}>
                    {sector.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-block">
              <label>Type de contrat :</label>
              <select value={selectedContract} onChange={(e) => setSelectedContract(e.target.value)} className="filter-select">
                <option value="">Tous les contrats</option>
                {contracts.map((contract) => (
                  <option key={contract.value} value={contract.value}>
                    {contract.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-block">
              <label>Localisation :</label>
              <input 
                type="text" 
                value={locationTerm} 
                onChange={(e) => setLocationTerm(e.target.value)} 
                className="filter-select" 
                placeholder="Ville, région..." 
              />
            </div>
            <div className="filter-block">
              <label>Recherche libre :</label>
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="filter-select" 
                placeholder="Nom d'entreprise, poste..." 
              />
            </div>
          </div>
          <div className="filters-actions">
            <button className="btn-secondary" onClick={resetFilters}>
              Réinitialiser
            </button>
            <button className="btn-primary" onClick={saveSearch}>
              Sauvegarder et appliquer
            </button>
          </div>
        </div>
      )}

      {/* Grille des entreprises */}
      <div className="companies-grid-section">
        <h3 className="section-title">Entreprises participantes ({filteredCompanies.length})</h3>
        
        {filteredCompanies.length === 0 ? (
          <div className="no-companies">
            <FaBuilding className="no-companies-icon" />
            <p>Aucune entreprise ne correspond à vos critères</p>
            <button className="btn-primary" onClick={() => setShowFilters(true)}>
              Modifier mes critères
            </button>
          </div>
        ) : (
          <div className="companies-grid">
            {filteredCompanies.map((company, idx) => (
              <div key={company.id || idx} className="company-card">
                                 <div className="company-card-header">
                   <div className="company-logo">
                     {company.logo ? (
                       <img 
                         src={`${process.env.REACT_APP_API_BASE_URL}${company.logo}`} 
                         alt={company.name}
                         onError={(e) => {
                           e.target.style.display = 'none';
                           e.target.nextSibling.style.display = 'block';
                         }}
                       />
                     ) : null}
                     <img 
                       src={LogoFTT} 
                       alt="Logo FTT"
                       className="company-logo-default"
                       style={{ display: company.logo ? 'none' : 'block' }}
                       onError={(e) => {
                         e.target.style.display = 'none';
                         e.target.nextSibling.style.display = 'flex';
                       }}
                     />
                     <div className="company-logo-placeholder" style={{ display: 'none' }}>
                       {company.name.charAt(0).toUpperCase()}
                     </div>
                   </div>
                  <div className="company-info">
                    <h4 className="company-name">{company.name}</h4>
                    <div className="company-meta">
                      <span className="stand-number">Stand {company.stand}</span>
                      <span className="step-number">Étape {idx + 1}</span>
                    </div>
                  </div>
                </div>
                
                <div className="company-details">
                  {company.sectors && company.sectors.length > 0 && (
                    <div className="company-sectors">
                      {company.sectors.slice(0, 2).map((sector, sectorIdx) => (
                        <span key={sectorIdx} className="sector-tag">
                          {sector}
                        </span>
                      ))}
                      {company.sectors.length > 2 && (
                        <span className="sector-tag more">+{company.sectors.length - 2}</span>
                      )}
                    </div>
                  )}
                  
                  {company.offers && company.offers.length > 0 && (
                    <div className="company-offers">
                      <span className="offers-count">
                        {company.offers.length} offre{company.offers.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                <div className="company-actions">
                  <button className="btn-visit-stand">
                    Visiter le stand
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Parcours détaillé */}
      <div className="route-details">
        <h3 className="section-title">Votre itinéraire recommandé</h3>
        <div className="route-steps">
          {filteredCompanies.map((company, idx) => (
            <div key={company.id || idx} className="route-step">
              <div className="step-indicator">
                <div className="step-number-large">{idx + 1}</div>
                {idx < filteredCompanies.length - 1 && <div className="step-connector"></div>}
              </div>
              <div className="step-content">
                <h4>{company.name}</h4>
                <p className="step-location">
                  <FaMapMarkerAlt className="location-icon" />
                  Stand {company.stand}
                </p>
                <p className="step-duration">~10 minutes</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Plan;

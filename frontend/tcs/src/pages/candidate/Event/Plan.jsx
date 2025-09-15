// ✅ Plan.jsx
import React, { useState, useEffect } from 'react';
import '../../styles/forum/Plan.css';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { getSectorsForSelect, getContractsForSelect } from '../../../constants/choices';
import { FaMapMarkerAlt, FaBuilding, FaBriefcase, FaClock, FaRoute, FaDownload, FaUsers, FaFileAlt, FaCheckCircle, FaCircle, FaStar, FaEdit } from 'react-icons/fa';
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
  const [showFilters, setShowFilters] = useState(true);
  const [visitedCompanies, setVisitedCompanies] = useState(new Set());
  const [companyNotes, setCompanyNotes] = useState({});
  const [editingNote, setEditingNote] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const { isAuthenticated, isAuthLoading } = useAuth();

  // Initialisation complète du composant
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setLoading(true);
        console.log('🚀 Initializing Plan component...');
        
        // 1. Charger les choix (secteurs, contrats)
        const [sectorsData, contractsData] = await Promise.all([
          getSectorsForSelect(),
          getContractsForSelect()
        ]);
        setSectors(sectorsData);
        setContracts(contractsData);
        console.log('✅ Choices loaded');
        
        // 2. Charger les critères de recherche candidat depuis localStorage
        const savedCriteria = localStorage.getItem(`search-criteria-${forumId}`);
        if (savedCriteria) {
          try {
            const criteria = JSON.parse(savedCriteria);
            setSelectedSector(criteria.sector || '');
            setSelectedContract(criteria.contract_type || '');
            setLocationTerm(criteria.region || '');
            setSearchTerm(criteria.search_term || '');
            console.log('✅ Search criteria loaded from localStorage');
          } catch (error) {
            console.error('❌ Error parsing saved criteria:', error);
          }
        }
        
        // 3. Charger les données du candidat depuis l'API
        if (isAuthenticated) {
          try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/forums/candidate/${forumId}/search`, {
              withCredentials: true,
            });
            setCandidateSearch(response.data);
            console.log('📡 API data loaded:', response.data);
          } catch (error) {
            console.error('❌ Error loading API data:', error);
          }
        }
        
        setIsInitialized(true);
        console.log('🎉 Component initialization complete');
        
      } catch (error) {
        console.error('❌ Error during initialization:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeComponent();
  }, [isAuthenticated, forumId]);

  // Sauvegarder automatiquement les critères de recherche candidat dans localStorage
  useEffect(() => {
    if (!isInitialized) return;
    
    const searchCriteria = {
      sector: selectedSector,
      contract_type: selectedContract,
      region: locationTerm,
      search_term: searchTerm
    };
    
    localStorage.setItem(`search-criteria-${forumId}`, JSON.stringify(searchCriteria));
    console.log('✅ Search criteria saved to localStorage');
  }, [selectedSector, selectedContract, searchTerm, locationTerm, forumId, isInitialized]);

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

  // Fonction pour formater le temps en heures et minutes
  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  };

  // Charger les données de gamification depuis l'API
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/candidates/forum/${forumId}/progress/`, {
          withCredentials: true,
        });
        
        const data = response.data;
        setVisitedCompanies(new Set(data.visited_companies));
        setCompanyNotes(data.company_notes);
        console.log('Loaded progress from API:', data);
      } catch (error) {
        console.error('Error loading progress:', error);
        // Initialiser avec des valeurs vides si l'API échoue
        setVisitedCompanies(new Set());
        setCompanyNotes({});
      }
    };

    if (isAuthenticated && forumId) {
      loadProgress();
    }
  }, [forumId, isAuthenticated]);


  // Sauvegarder les entreprises visitées via API
  const toggleCompanyVisited = async (companyId) => {
    try {
      console.log('Toggle company visited:', companyId, 'Forum ID:', forumId);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/candidates/forum/${forumId}/company/${companyId}/toggle-visited/`,
        {},
        { withCredentials: true }
      );
      
      const data = response.data;
      setVisitedCompanies(new Set(data.visited_companies));
      console.log('Updated visited companies via API:', data);
      
    } catch (error) {
      console.error('Error toggling company visited:', error);
      // Fallback local si l'API échoue
      const newVisited = new Set(visitedCompanies);
      if (newVisited.has(companyId)) {
        newVisited.delete(companyId);
      } else {
        newVisited.add(companyId);
      }
      setVisitedCompanies(newVisited);
    }
  };

  // Sauvegarder les notes via API
  const saveCompanyNote = async (companyId, note) => {
    try {
      console.log('Saving note for company:', companyId, 'Note:', note);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/candidates/forum/${forumId}/company/${companyId}/note/`,
        { note },
        { withCredentials: true }
      );
      
      const data = response.data;
      setCompanyNotes(data.company_notes);
      console.log('Updated notes via API:', data);
      
      setEditingNote(null);
      
    } catch (error) {
      console.error('Error saving note:', error);
      // Fallback local si l'API échoue
      const newNotes = { ...companyNotes, [companyId]: note };
      setCompanyNotes(newNotes);
      setEditingNote(null);
    }
  };

  // Calculer la progression (avec protection contre les pourcentages > 100%)
  const progressPercentage = filteredCompanies.length > 0 
    ? Math.min(100, Math.round((visitedCompanies.size / filteredCompanies.length) * 100))
    : 0;


  // Fonction pour appliquer les nouveaux critères et nettoyer la progression
  const applyFilters = async () => {
    setIsApplying(true);
    console.log('🔄 Applying filters...');
    console.log('📊 Current visited companies:', [...visitedCompanies]);
    console.log('🏢 Current filtered companies:', filteredCompanies.length);
    
    try {
      // Utiliser directement filteredCompanies qui est déjà calculé
      const validCompanyIds = new Set(filteredCompanies.map(company => company.id));
      console.log('✅ Valid company IDs:', [...validCompanyIds]);
      
      // Garder seulement les entreprises visitées qui correspondent aux nouveaux critères
      const newVisitedCompanies = new Set();
      const newCompanyNotes = {};
      
      visitedCompanies.forEach(companyId => {
        if (validCompanyIds.has(companyId)) {
          newVisitedCompanies.add(companyId);
          if (companyNotes[companyId]) {
            newCompanyNotes[companyId] = companyNotes[companyId];
          }
        }
      });
      
      console.log('🎯 New visited companies after filter:', [...newVisitedCompanies]);
      console.log('📝 New company notes after filter:', Object.keys(newCompanyNotes).length, 'notes');
      
      // Mettre à jour les états
      setVisitedCompanies(newVisitedCompanies);
      setCompanyNotes(newCompanyNotes);
      setEditingNote(null);
      
      // Sauvegarder en base de données via l'API
      try {
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/candidates/forum/${forumId}/progress/`,
          {
            visited_companies: [...newVisitedCompanies],
            company_notes: newCompanyNotes
          },
          { withCredentials: true }
        );
        console.log('✅ Applied filters and updated progression in database');
      } catch (error) {
        console.error('❌ Error applying filters in database:', error);
      }
      
      // Afficher un message de confirmation
      const keptCount = newVisitedCompanies.size;
      const totalCount = visitedCompanies.size;
      setApplyMessage(`Critères appliqués ! ${keptCount} entreprise${keptCount > 1 ? 's' : ''} visitée${keptCount > 1 ? 's' : ''} conservée${keptCount > 1 ? 's' : ''} sur ${totalCount}.`);
      
      // Effacer le message après 3 secondes
      setTimeout(() => setApplyMessage(''), 3000);
      
      console.log('🎉 Applied filters - kept', keptCount, 'visited companies out of', totalCount);
      
    } catch (error) {
      console.error('❌ Error applying filters:', error);
      setApplyMessage('Erreur lors de l\'application des critères.');
      setTimeout(() => setApplyMessage(''), 3000);
    } finally {
      setIsApplying(false);
    }
  };

  // Fonction pour réinitialiser les filtres
  const resetFilters = async () => {
    setSelectedSector('');
    setSelectedContract('');
    setSearchTerm('');
    setLocationTerm('');
    
    // Réinitialiser la progression de gamification
    setVisitedCompanies(new Set());
    setCompanyNotes({});
    setEditingNote(null);
    
    // Réinitialiser en base de données via l'API
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/candidates/forum/${forumId}/progress/`,
        {
          visited_companies: [],
          company_notes: {}
        },
        { withCredentials: true }
      );
      console.log('Reset progression in database via API');
    } catch (error) {
      console.error('Error resetting progression in database:', error);
    }
    
    console.log('Reset filters and progression');
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
      doc.text(`• Temps estimé : ${formatTime(timeEstimate)}`, 25, yPosition);
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
    content += `• Temps estimé : ${formatTime(timeEstimate)}\n`;
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
          </div>
        </div>
      </div>

      {/* Filtres modifiables */}
        <div className="filters-panel">
        <h3 className="filters-title">Critères de recherche</h3>
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
            <button 
              className="btn-primary" 
              onClick={applyFilters}
              disabled={isApplying}
            >
              {isApplying ? 'Application...' : 'Appliquer'}
            </button>
          </div>
          {applyMessage && (
            <div className="apply-message">
              {applyMessage}
            </div>
          )}
        </div>

        {/* Statistiques après les filtres */}
        <div className="plan-stats">
          <div className="stat-item">
            <div className="stat-content">
              <span className="stat-number">{filteredCompanies.length}</span>
            </div>
            <span className="stat-label">Entreprises</span>
          </div>
          <div className="stat-item">
            <div className="stat-content">
              <span className="stat-number">{formatTime(timeEstimate)}</span>
            </div>
            <span className="stat-label">Temps estimé</span>
          </div>
          <div className="stat-item">
            <div className="stat-content">
              <span className="stat-number">
                {filteredCompanies.reduce((total, company) => total + (company.offers?.length || 0), 0)}
              </span>
            </div>
            <span className="stat-label">Offres</span>
          </div>
        </div>
                
        {/* Barre de progression */}
        {filteredCompanies.length > 0 && (
          <div className="progress-section">
            <div className="progress-header">
              <h3 className="progress-title">Votre progression</h3>
              <span className="progress-percentage">{progressPercentage}%</span>
                    </div>
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="progress-stats">
              <span className="progress-text">
                {visitedCompanies.size} sur {filteredCompanies.length} entreprises visitées
              </span>
            </div>
          </div>
        )}


      {/* Parcours détaillé */}
      <div className="route-details">
        <h3 className="section-title">Votre itinéraire recommandé</h3>
        <div className="route-steps">
          {filteredCompanies.map((company, idx) => (
            <div key={company.id || idx} className={`route-step ${visitedCompanies.has(company.id) ? 'visited' : ''}`}>
              <div className="step-indicator">
                <div className="step-number-large">{idx + 1}</div>
                {idx < filteredCompanies.length - 1 && <div className="step-connector"></div>}
              </div>
              <div className="step-content">
                <div className="step-header">
                <h4>{company.name}</h4>
                  <div className="step-actions">
                    <button 
                      className={`visit-toggle ${visitedCompanies.has(company.id) ? 'visited' : ''}`}
                      onClick={() => toggleCompanyVisited(company.id)}
                      title={visitedCompanies.has(company.id) ? 'Marquer comme non visitée' : 'Marquer comme visitée'}
                    >
                      {visitedCompanies.has(company.id) ? <FaCheckCircle /> : <FaCircle />}
                    </button>
                    <button 
                      className="note-toggle"
                      onClick={() => setEditingNote(editingNote === company.id ? null : company.id)}
                      title="Ajouter une note"
                    >
                      <FaEdit />
                    </button>
                  </div>
                </div>
                <p className="step-location">
                  <FaMapMarkerAlt className="location-icon" />
                  Stand {company.stand}
                </p>
                {company.sectors && company.sectors.length > 0 && (
                  <div className="step-sectors">
                    {company.sectors.map((sector, sectorIdx) => (
                      <span key={sectorIdx} className="sector-tag">
                        {sector}
                      </span>
                    ))}
                  </div>
                )}
                <p className="step-duration">~10 minutes</p>
                
                {/* Zone de note */}
                {editingNote === company.id && (
                  <div className="note-section">
                    <textarea
                      className="note-input"
                      placeholder="Ajoutez vos notes sur cette entreprise..."
                      value={companyNotes[company.id] || ''}
                      onChange={(e) => setCompanyNotes({...companyNotes, [company.id]: e.target.value})}
                      rows={3}
                    />
                    <div className="note-actions">
                      <button 
                        className="btn-save-note"
                        onClick={() => saveCompanyNote(company.id, companyNotes[company.id] || '')}
                      >
                        Sauvegarder
                      </button>
                      <button 
                        className="btn-cancel-note"
                        onClick={() => setEditingNote(null)}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Affichage de la note existante */}
                {companyNotes[company.id] && editingNote !== company.id && (
                  <div className="note-display">
                    <div className="note-content">
                      <FaStar className="note-icon" />
                      <span>{companyNotes[company.id]}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Plan;

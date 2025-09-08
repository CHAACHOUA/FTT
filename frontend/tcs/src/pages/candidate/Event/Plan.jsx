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
  const { accessToken } = useAuth();

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
        
        // 2. Charger les critères sauvegardés en priorité
        const savedCriteria = localStorage.getItem(`search-criteria-${forumId}`);
        if (savedCriteria) {
          try {
            const criteria = JSON.parse(savedCriteria);
            console.log('📁 Loading saved criteria:', criteria);
            setSelectedSector(criteria.selectedSector || '');
            setSelectedContract(criteria.selectedContract || '');
            setSearchTerm(criteria.searchTerm || '');
            setLocationTerm(criteria.locationTerm || '');
            console.log('✅ Saved criteria applied');
          } catch (error) {
            console.error('❌ Error loading saved criteria:', error);
          }
        }
        
        // 3. Charger les données du candidat depuis l'API (seulement si pas de critères sauvegardés)
        if (accessToken && !savedCriteria) {
          try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/forums/candidate/${forumId}/search`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });
            setCandidateSearch(response.data);
            console.log('📡 API data loaded:', response.data);
            
            // Utiliser les critères de l'API seulement si aucun critère n'est défini
            if (!selectedSector && !selectedContract && !locationTerm && !searchTerm) {
              setSelectedSector(response.data.sector || '');
              setSelectedContract(response.data.contract_type || '');
              setLocationTerm(response.data.region || '');
              console.log('✅ API criteria applied');
            }
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
  }, [accessToken, forumId]);

  // Sauvegarder automatiquement les critères quand ils changent (après initialisation)
  useEffect(() => {
    if (!isInitialized) return;
    
    const criteria = {
      selectedSector,
      selectedContract,
      searchTerm,
      locationTerm
    };
    localStorage.setItem(`search-criteria-${forumId}`, JSON.stringify(criteria));
    console.log('💾 Auto-saved criteria:', criteria);
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
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        
        const data = response.data;
        setVisitedCompanies(new Set(data.visited_companies));
        setCompanyNotes(data.company_notes);
        console.log('Loaded progress from API:', data);
      } catch (error) {
        console.error('Error loading progress:', error);
        // Fallback vers localStorage si l'API échoue
        const visitedKey = `visited-companies-${forumId}`;
        const notesKey = `company-notes-${forumId}`;
        
        const savedVisited = localStorage.getItem(visitedKey);
        const savedNotes = localStorage.getItem(notesKey);
        
        if (savedVisited) {
          try {
            const visitedArray = JSON.parse(savedVisited);
            setVisitedCompanies(new Set(visitedArray));
          } catch (error) {
            console.error('Error parsing visited companies:', error);
          }
        }
        if (savedNotes) {
          try {
            const notes = JSON.parse(savedNotes);
            setCompanyNotes(notes);
          } catch (error) {
            console.error('Error parsing notes:', error);
          }
        }
      }
    };

    if (accessToken && forumId) {
      loadProgress();
    }
  }, [forumId, accessToken]);

  // Charger les critères sauvegardés depuis localStorage (PRIORITÉ)
  useEffect(() => {
    const filtersKey = `forum-filters-${forumId}`;
    const savedFilters = localStorage.getItem(filtersKey);
    
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        console.log('Loading saved filters (PRIORITY):', filters);
        setSelectedSector(filters.sector || '');
        setSelectedContract(filters.contract || '');
        setLocationTerm(filters.location || '');
        setSearchTerm(filters.search || '');
      } catch (error) {
        console.error('Error parsing saved filters:', error);
      }
    }
  }, [forumId]);

  // Sauvegarder les critères dans localStorage quand ils changent
  useEffect(() => {
    const filtersKey = `forum-filters-${forumId}`;
    const filters = {
      sector: selectedSector,
      contract: selectedContract,
      location: locationTerm,
      search: searchTerm
    };
    
    localStorage.setItem(filtersKey, JSON.stringify(filters));
    console.log('Saved filters to localStorage:', filters);
  }, [selectedSector, selectedContract, locationTerm, searchTerm, forumId]);

  // Sauvegarder les entreprises visitées via API
  const toggleCompanyVisited = async (companyId) => {
    try {
      console.log('Toggle company visited:', companyId, 'Forum ID:', forumId);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/candidates/forum/${forumId}/company/${companyId}/toggle-visited/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      const data = response.data;
      setVisitedCompanies(new Set(data.visited_companies));
      console.log('Updated visited companies via API:', data);
      
      // Sauvegarder aussi en localStorage comme backup
      localStorage.setItem(`visited-companies-${forumId}`, JSON.stringify(data.visited_companies));
      
    } catch (error) {
      console.error('Error toggling company visited:', error);
      // Fallback vers localStorage si l'API échoue
      const newVisited = new Set(visitedCompanies);
      if (newVisited.has(companyId)) {
        newVisited.delete(companyId);
      } else {
        newVisited.add(companyId);
      }
      setVisitedCompanies(newVisited);
      localStorage.setItem(`visited-companies-${forumId}`, JSON.stringify([...newVisited]));
    }
  };

  // Sauvegarder les notes via API
  const saveCompanyNote = async (companyId, note) => {
    try {
      console.log('Saving note for company:', companyId, 'Note:', note);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/candidates/forum/${forumId}/company/${companyId}/note/`,
        { note },
        {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        }
      );
      
      const data = response.data;
      setCompanyNotes(data.company_notes);
      console.log('Updated notes via API:', data);
      
      // Sauvegarder aussi en localStorage comme backup
      localStorage.setItem(`company-notes-${forumId}`, JSON.stringify(data.company_notes));
      
      setEditingNote(null);
      
    } catch (error) {
      console.error('Error saving note:', error);
      // Fallback vers localStorage si l'API échoue
      const newNotes = { ...companyNotes, [companyId]: note };
      setCompanyNotes(newNotes);
      localStorage.setItem(`company-notes-${forumId}`, JSON.stringify(newNotes));
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
      
      // Sauvegarder en localStorage
      localStorage.setItem(`visited-companies-${forumId}`, JSON.stringify([...newVisitedCompanies]));
      localStorage.setItem(`company-notes-${forumId}`, JSON.stringify(newCompanyNotes));
      
      // Sauvegarder les critères de filtrage actuels
      const criteria = {
        selectedSector,
        selectedContract,
        searchTerm,
        locationTerm
      };
      localStorage.setItem(`search-criteria-${forumId}`, JSON.stringify(criteria));
      console.log('💾 Saved criteria:', criteria);
      
      // Sauvegarder en base de données via l'API
      try {
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/candidates/forum/${forumId}/progress/`,
          {
            visited_companies: [...newVisitedCompanies],
            company_notes: newCompanyNotes
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
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
    
    // Nettoyer aussi le localStorage
    const filtersKey = `forum-filters-${forumId}`;
    localStorage.removeItem(filtersKey);
    
    // Réinitialiser aussi la progression de gamification
    setVisitedCompanies(new Set());
    setCompanyNotes({});
    setEditingNote(null);
    
    // Nettoyer le localStorage de la gamification
    localStorage.removeItem(`visited-companies-${forumId}`);
    localStorage.removeItem(`company-notes-${forumId}`);
    localStorage.removeItem(`search-criteria-${forumId}`);
    
    // Réinitialiser aussi en base de données via l'API
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/candidates/forum/${forumId}/progress/`,
        {
          visited_companies: [],
          company_notes: {}
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log('Reset progression in database via API');
    } catch (error) {
      console.error('Error resetting progression in database:', error);
    }
    
    console.log('Reset filters, progression and cleared all localStorage');
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
              <FaBuilding className="stat-icon" />
            </div>
            <span className="stat-label">Entreprises</span>
          </div>
          <div className="stat-item">
            <div className="stat-content">
              <span className="stat-number">{formatTime(timeEstimate)}</span>
              <FaClock className="stat-icon" />
                     </div>
            <span className="stat-label">Temps estimé</span>
                   </div>
          <div className="stat-item">
            <div className="stat-content">
              <span className="stat-number">
                {filteredCompanies.reduce((total, company) => total + (company.offers?.length || 0), 0)}
              </span>
              <FaFileAlt className="stat-icon" />
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

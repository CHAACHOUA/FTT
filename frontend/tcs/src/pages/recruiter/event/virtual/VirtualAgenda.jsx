import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faPlus,
  faEdit,
  faTrash,
  faVideo,
  faPhone,
  faClock,
  faList,
  faCalendar,
  faChevronDown,
  faUsers,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import CompanyApprovalCheck from '../../../../utils/CompanyApprovalCheck';
import Loading from '../../../../components/loyout/Loading';
import AgendaCard from '../../../../components/card/agenda/AgendaCard';
import AgendaCalendar from '../../../../components/calendar/AgendaCalendar';
import { Button, Input, Card, Badge } from '../../../../components/common';
import '../../../../pages/styles/recruiter/CompanyRecruiter.css';
import '../../../../components/card/agenda/AgendaCard.css';
import '../../../../components/calendar/AgendaCalendar.css';
import { useAuth } from '../../../../context/AuthContext';
import { formatAgendaSlots } from '../../../../utils/timezoneUtils';
import ZoomService from '../../../../services/ZoomService';

// Styles pour les contrôles d'agenda
const agendaStyles = `
  .agenda-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: var(--space-lg);
    background: #f8fafc;
    border-radius: var(--radius-lg);
    border: 1px solid #e5e7eb;
  }

  .view-toggle {
    display: flex;
    gap: 8px;
  }

  .view-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: var(--space-sm) 16px;
    border: 1px solid #d1d5db;
    background: white;
    color: #6b7280;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: var(--text-base);
    font-weight: 500;
  }

  .view-btn:hover {
    background: #f3f4f6;
    color: #374151;
  }

  .view-btn.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }

  .agenda-filters {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .agenda-filters label {
    font-weight: 500;
    color: #374151;
    font-size: var(--text-base);
  }

  .agenda-filters input,
  .agenda-filters select {
    padding: var(--space-sm) 12px;
    border: 1px solid #d1d5db;
    border-radius: var(--radius-md);
    font-size: var(--text-base);
  }

  .interview-period-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: var(--space-sm) 12px;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: var(--radius-md);
    color: #0369a1;
    font-size: var(--text-base);
  }

  .period-label {
    font-weight: 500;
  }

  .period-dates {
    font-weight: 600;
  }

  .agenda-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
  }

  .recruiter-selector {
    display: flex;
    align-items: center;
    margin-bottom: 0;
  }

  .company-recruiters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .add-slot-section-above-filters {
    display: flex;
    justify-content: flex-end;
    margin: var(--space-lg) 0;
    padding: 0 16px;
  }

  .invite-recruiter-btn-small {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: var(--space-sm) 12px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: var(--text-sm);
    font-weight: 500;
    white-space: nowrap;
  }

  .invite-recruiter-btn-small:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
  }

  .invite-recruiter-btn-small:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .recruiter-dropdown {
    position: relative;
    min-width: 250px;
  }

  .recruiter-dropdown-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: var(--space-md) 16px;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
    text-align: left;
  }

  .recruiter-dropdown-btn:hover {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .recruiter-dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: var(--radius-lg);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    margin-top: 4px;
  }

  .recruiter-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-md) 16px;
    border: none;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
    text-align: left;
  }

  .recruiter-option:hover {
    background: #f3f4f6;
  }

  .recruiter-option.selected {
    background: #eff6ff;
    color: #1d4ed8;
  }

  .recruiter-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .recruiter-name {
    font-weight: 500;
    font-size: var(--text-base);
  }

  .recruiter-role {
    font-size: var(--text-sm);
    color: #6b7280;
  }

      .current-user-badge {
        background: #3b82f6;
        color: white;
        padding: 2px 8px;
        border-radius: var(--radius-xl);
        font-size: 11px;
        font-weight: 500;
        margin-left: 8px;
      }

      .recruiter-name {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .recruiter-name .you-badge {
        background: #3b82f6;
        color: white;
        padding: 2px 6px;
        border-radius: var(--radius-lg);
        font-size: var(--text-xs);
        font-weight: 600;
        margin-left: 4px;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e5e7eb;
      }

      .modal-header h3 {
        margin: 0;
        color: #1f2937;
        font-size: var(--text-2xl);
        font-weight: 600;
      }

      .modal-close-btn:hover {
        background: #f3f4f6 !important;
        color: #374151 !important;
      }

  @media (max-width: 768px) {
    .agenda-controls {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }

    .agenda-filters {
      flex-direction: column;
      align-items: stretch;
    }

    .agenda-cards-grid {
      grid-template-columns: 1fr;
    }
  }
`;

// Injecter les styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = agendaStyles;
  document.head.appendChild(styleSheet);
}

const VirtualAgenda = ({ forum, accessToken, apiBaseUrl }) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'calendar'
  const [filterType, setFilterType] = useState('all');
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showRecruiterDropdown, setShowRecruiterDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const { isAuthenticated, user } = useAuth(); // Use isAuthenticated and user from AuthContext
  
  // Debug pour voir le timezone actuel
  console.log('🔍 VirtualAgenda - user timezone:', user?.timezone);
  
  // Effet pour recharger les données quand le timezone change
  useEffect(() => {
    if (user?.timezone && timeSlots.length > 0) {
      console.log('🔄 Timezone changé, rechargement des données d\'agenda...');
      // Forcer le rechargement des créneaux pour appliquer le nouveau fuseau horaire
      fetchTimeSlots();
    }
  }, [user?.timezone]);
  const [newSlot, setNewSlot] = useState({
    start_time: '',
    end_time: '',
    type: 'video', // video ou phone
    duration: 30,
    description: ''
  });

  useEffect(() => {
    checkAuthAndFetchData();
  }, [forum]);


  const checkAuthAndFetchData = async () => {
    try {
      console.log('🔍 Vérification de l\'authentification...');
      console.log('🔑 AccessToken disponible:', accessToken ? 'OUI' : 'NON');
      console.log('🌐 API Base URL:', apiBaseUrl);
      
      // Tester d'abord l'authentification avec une route simple (comme AuthContext)
      const authResponse = await axios.get(`${apiBaseUrl}/users/auth/me/`, {
        withCredentials: true
      });
      
      console.log('✅ Utilisateur authentifié:', authResponse.data);
      
      // Si authentifié, récupérer les membres
      await fetchTeamMembers();
    } catch (error) {
      console.error('❌ Problème d\'authentification:', error);
      if (error.response) {
        console.error('📊 Détails de l\'erreur d\'authentification:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      
      // Fallback avec des données de test
      const mockTeamMembers = [
        {
          id: 1,
          full_name: 'Camille Recruteur',
          email: 'camille@company.com',
          is_current_user: true
        }
      ];
      setTeamMembers(mockTeamMembers);
      setSelectedRecruiter(mockTeamMembers[0]);
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Récupération des membres de l\'équipe...');
      console.log('🔑 AccessToken disponible:', accessToken ? 'OUI' : 'NON');
      console.log('🌐 API Base URL:', apiBaseUrl);
      console.log('📋 Forum ID:', forum?.id);
      
      // CORRECTION: Utiliser l'endpoint correct pour récupérer tous les recruteurs de l'entreprise
      const response = await axios.get(`${apiBaseUrl}/recruiters/company-recruiters/`, {
        withCredentials: true
      });
      
      console.log('✅ Membres récupérés:', response.data);
      console.log('📊 Type de données:', typeof response.data);
      console.log('📊 Nombre de membres:', response.data?.length);
      console.log('📊 Premier membre:', response.data?.[0]);
      
      // Adapter les données pour correspondre à la structure attendue
      const currentUserEmail = user?.email || 'recruiter6@example.com';
      console.log('🔍 User object:', user);
      console.log('🔍 Email de l\'utilisateur connecté:', currentUserEmail);
      console.log('🔍 Données brutes des membres:', response.data);
      
      const adaptedMembers = response.data.map(member => {
        const isCurrentUser = member.email?.toLowerCase() === currentUserEmail.toLowerCase();
        console.log(`🔍 Membre: ${member.first_name} ${member.last_name}, Email: ${member.email}, isCurrentUser: ${isCurrentUser}`);
        return {
          id: member.id,
          full_name: `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Recruteur',
          email: member.email || 'email@example.com',
          first_name: member.first_name || 'Recruteur',
          last_name: member.last_name || 'Équipe',
          is_current_user: isCurrentUser
        };
      });
      
      console.log('🔍 Détail de chaque membre adapté:');
      adaptedMembers.forEach((member, index) => {
        console.log(`🔍 Membre ${index}:`, {
          id: member.id,
          full_name: member.full_name,
          email: member.email,
          is_current_user: member.is_current_user
        });
      });
      
      // Trier les membres pour que l'utilisateur actuel soit en premier
      const sortedMembers = adaptedMembers.sort((a, b) => {
        if (a.is_current_user) return -1;
        if (b.is_current_user) return 1;
        return 0;
      });
      
      setTeamMembers(sortedMembers);
      
      // Sélectionner automatiquement l'utilisateur actuel
      const currentUser = sortedMembers.find(member => member.is_current_user);
      
      console.log('🔍 Utilisateur actuel recherché par email:', currentUserEmail);
      console.log('🔍 Utilisateur actuel trouvé:', currentUser);
      console.log('🔍 Email de l\'utilisateur connecté depuis useAuth:', user);
      console.log('🔍 Tous les membres adaptés:', adaptedMembers);
      
      if (currentUser) {
        setSelectedRecruiter(currentUser);
        console.log('✅ Recruteur sélectionné (current_user):', currentUser.full_name);
      } else {
        console.log('⚠️ Aucun utilisateur actuel trouvé, sélection du premier membre');
        if (sortedMembers.length > 0) {
          setSelectedRecruiter(sortedMembers[0]);
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des membres:', error);
      if (error.response) {
        console.error('📊 Détails de l\'erreur:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      // toast.error('Erreur lors du chargement des membres de l\'équipe');
      
      // Fallback avec des données de test
      const mockTeamMembers = [
        {
          id: 1,
          full_name: 'Camille Recruteur',
          email: 'camille@company.com',
          is_current_user: true
        }
      ];
      setTeamMembers(mockTeamMembers);
      setSelectedRecruiter(mockTeamMembers[0]);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les slots au chargement initial et quand le recruteur change
  useEffect(() => {
    if (forum && isAuthenticated) {
      fetchTimeSlots();
    }
  }, [forum, isAuthenticated, selectedRecruiter]);


  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Récupération des créneaux pour le forum:', forum.id);
      console.log('🔑 AccessToken disponible:', accessToken ? 'OUI' : 'NON');
      console.log('🌐 API Base URL:', apiBaseUrl);
      console.log('📋 Forum ID:', forum?.id);
      console.log('📋 URL complète:', `${apiBaseUrl}/virtual/forums/${forum.id}/agenda/`);
      console.log('🕐 Timezone actuel:', user?.timezone);
      
      // Récupérer tous les slots du forum
      const response = await axios.get(`${apiBaseUrl}/virtual/forums/${forum.id}/agenda/`, {
        withCredentials: true
      });
      
      console.log('✅ Créneaux récupérés:', response.data);
      console.log('📊 Nombre total de créneaux:', response.data.length);
      console.log('📊 Structure du premier créneau:', response.data[0]);
      console.log('📊 URL de la requête:', `${apiBaseUrl}/virtual/forums/${forum.id}/agenda/`);
      console.log('📊 Status de la réponse:', response.status);
      
      // DEBUG: Afficher chaque slot reçu
      if (response.data && response.data.length > 0) {
        console.log('🔍 DÉTAIL DES SLOTS REÇUS:');
        response.data.forEach((slot, index) => {
          console.log(`🔍 Slot ${index}:`, {
            id: slot.id,
            date: slot.date,
            start_time: slot.start_time,
            end_time: slot.end_time,
            type: slot.type,
            status: slot.status,
            recruiter: slot.recruiter
          });
        });
      } else {
        console.log('⚠️ AUCUN SLOT REÇU DE L\'API');
      }
      
      // Ne pas filtrer par recruteur ici, on le fera dans le rendu
      let filteredSlots = response.data;
      console.log('🔍 Tous les créneaux récupérés:', filteredSlots.length);
      
      console.log('📊 Créneaux finaux à afficher:', filteredSlots);
      setTimeSlots(filteredSlots);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des créneaux:', error);
      if (error.response) {
        console.error('📊 Détails de l\'erreur:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
        console.error('📊 URL de la requête:', error.config?.url);
        console.error('📊 Méthode de la requête:', error.config?.method);
        console.error('📊 Headers de la requête:', error.config?.headers);
      } else if (error.request) {
        console.error('📊 Pas de réponse reçue:', error.request);
      } else {
        console.error('📊 Erreur de configuration:', error.message);
      }
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    try {
      if (!selectedRecruiter) {
        toast.error('❌ Veuillez sélectionner un recruteur', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      // Validation des champs requis
      if (!newSlot.start_time || !newSlot.end_time) {
        toast.error('❌ Veuillez remplir les heures de début et de fin', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      const newSlotData = {
        date: newSlot.date || getCurrentInterviewDate(),
        start_time: newSlot.start_time,
        end_time: newSlot.end_time,
        type: newSlot.type,
        duration: newSlot.duration,
        description: newSlot.description,
        status: 'available',
        recruiter: selectedRecruiter.email // CORRECTION: Associer le créneau au recruteur sélectionné (utiliser l'email)
      };

      console.log('🔍 Création d\'un nouveau créneau:', newSlotData);
      console.log('🔍 Données du formulaire:', newSlot);
      console.log('🔍 selectedRecruiter au moment de la création:', selectedRecruiter);
      console.log('🔍 selectedRecruiter.id:', selectedRecruiter?.id);
      console.log('🔑 AccessToken disponible:', accessToken ? 'OUI' : 'NON');
      console.log('🌐 API Base URL:', apiBaseUrl);
      console.log('📋 Forum ID:', forum?.id);
      console.log('📋 URL complète:', `${apiBaseUrl}/virtual/forums/${forum.id}/agenda/`);
      console.log('📋 Données envoyées (JSON):', JSON.stringify(newSlotData, null, 2));

      const response = await axios.post(`${apiBaseUrl}/virtual/forums/${forum.id}/agenda/`, newSlotData, {
        withCredentials: true
      });

          console.log('✅ Créneau créé:', response.data);
          
          // Fermer le modal
          setShowAddModal(false);
          
          // Réinitialiser le formulaire
          setNewSlot({
            start_time: '',
            end_time: '',
            type: 'video',
            duration: 30,
            description: '',
            date: ''
          });
          
          
          // Rafraîchir depuis l'API
          fetchTimeSlots();
          
          toast.success('✅ Créneau créé avec succès', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du créneau:', error);
      if (error.response) {
        console.error('📊 Détails de l\'erreur:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        // Gestion spécifique des conflits de créneaux
        if (error.response.status === 409 && error.response.data?.error === 'Conflit de créneaux détecté') {
          const conflictData = error.response.data;
          const conflictMessage = conflictData.message || 'Conflit de créneaux détecté';
          
          console.error('🚫 Conflit de créneaux:', conflictMessage);
          console.error('🚫 Détails du conflit:', conflictData);
          
          // Afficher le message d'erreur avec le nom du forum en conflit
          toast.error(conflictMessage, {
            position: "top-right",
            autoClose: 6000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          return;
        }
        
        console.error('📋 Headers de la réponse:', error.response.headers);
        console.error('📋 Configuration de la requête:', error.config);
        console.error('📋 Données d\'erreur du serveur:', JSON.stringify(error.response.data, null, 2));
        console.error('📋 URL de la requête:', error.config?.url);
        console.error('📋 Méthode de la requête:', error.config?.method);
        console.error('📋 Données envoyées dans la requête:', JSON.stringify(error.config?.data, null, 2));
      }
      console.error('📋 Erreur complète:', error);
      toast.error('❌ Erreur lors de la création du créneau. Veuillez réessayer.', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setShowEditModal(true);
  };

  const handleSaveEditSlot = async () => {
    if (!editingSlot) return;

    try {
      console.log('🔍 Modification du créneau:', editingSlot.id);
      
      await axios.put(`${apiBaseUrl}/virtual/forums/${forum.id}/agenda/${editingSlot.id}/`, {
        date: editingSlot.date,
        start_time: editingSlot.start_time,
        end_time: editingSlot.end_time,
        type: editingSlot.type,
        description: editingSlot.description || ''
      }, {
        withCredentials: true
      });

      console.log('✅ Créneau modifié');
      
      // Rafraîchir depuis l'API
      fetchTimeSlots();
      
      // Fermer le modal
      setShowEditModal(false);
      setEditingSlot(null);
      
      toast.success('✅ Créneau modifié avec succès', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('❌ Erreur lors de la modification du créneau:', error);
      toast.error('❌ Erreur lors de la modification du créneau', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleCancelEditSlot = () => {
    setShowEditModal(false);
    setEditingSlot(null);
  };

  const handleDeleteSlot = async (slot) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) {
      try {
        console.log('🔍 Suppression du créneau:', slot.id);
        
        await axios.delete(`${apiBaseUrl}/virtual/forums/${forum.id}/agenda/${slot.id}/`, {
          withCredentials: true
        });

        console.log('✅ Créneau supprimé');
        
        // Rafraîchir depuis l'API
        fetchTimeSlots();
        
        toast.success('✅ Créneau supprimé avec succès', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (error) {
        console.error('❌ Erreur lors de la suppression du créneau:', error);
        toast.error('❌ Erreur lors de la suppression du créneau', {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const handleRecruiterSelect = (recruiter) => {
    console.log('🔍 handleRecruiterSelect appelé avec:', recruiter);
    console.log('🔍 Nouveau recruteur sélectionné:', recruiter.full_name, 'ID:', recruiter.id);
    setSelectedRecruiter(recruiter);
    setShowRecruiterDropdown(false);
  };

  const handleStartInterview = (slot) => {
    // TODO: Implémenter le démarrage d'entretien
    console.log('Start interview:', slot);
  };

  const handleCreateMeetingLink = async (slot) => {
    try {
      console.log('🔍 Création du lien de réunion pour le créneau:', slot.id);
      
      const response = await ZoomService.createMeeting(forum.id, slot.id);
      
      console.log('✅ Lien de réunion créé:', response);
      
      // Rafraîchir les créneaux pour afficher le nouveau lien
      fetchTimeSlots();
      
      toast.success('✅ Lien de visioconférence créé avec succès', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('❌ Erreur lors de la création du lien de réunion:', error);
      
      let errorMessage = 'Erreur lors de la création du lien de réunion';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleJoinMeeting = async (slot) => {
    try {
      console.log('🔍 Tentative de connexion à la réunion:', slot.id);
      
      // Utiliser directement le lien Zoom
      if (slot.meeting_link) {
        await ZoomService.joinMeeting(slot.meeting_link);
      } else {
        throw new Error('Aucun lien de réunion disponible');
      }
      
      toast.success('✅ Ouverture de la réunion Zoom...', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('❌ Erreur lors de la connexion à la réunion Zoom:', error);
      
      let errorMessage = 'Erreur lors de la connexion à la réunion Zoom';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleCalendarDateClick = (date) => {
    // La date est maintenant gérée automatiquement par la période d'entretiens
    console.log('Date clicked:', date);
  };

  const handleCalendarSlotClick = (slot) => {
    // TODO: Afficher les détails du créneau
    console.log('Calendar slot clicked:', slot);
  };


  // Fonctions pour gérer les dates d'entretien du forum
  const getInterviewStartDate = () => {
    console.log('🔍 Forum complet:', forum);
    console.log('🔍 Forum interview_start:', forum?.interview_start);
    console.log('🔍 Forum interview_end:', forum?.interview_end);
    
    if (forum?.interview_start) {
      console.log('🔍 Forum interview_start:', forum.interview_start);
      return new Date(forum.interview_start);
    }
    console.log('🔍 Pas de interview_start défini, utilisation de la date actuelle');
    return new Date();
  };

  const getInterviewEndDate = () => {
    if (forum?.interview_end) {
      console.log('🔍 Forum interview_end:', forum.interview_end);
      return new Date(forum.interview_end);
    }
    console.log('🔍 Pas de interview_end défini, utilisation de +7 jours');
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 jours par défaut
  };

  const getCurrentInterviewDate = () => {
    const startDate = getInterviewStartDate();
    const today = new Date();
    
    // Si on est avant la période d'entretien, utiliser la date de début
    if (today < startDate) {
      return startDate.toISOString().split('T')[0];
    }
    
    // Si on est dans la période d'entretien, utiliser aujourd'hui
    const endDate = getInterviewEndDate();
    if (today <= endDate) {
      return today.toISOString().split('T')[0];
    }
    
    // Si on est après la période d'entretien, utiliser la date de fin
    return endDate.toISOString().split('T')[0];
  };

  const isDateInInterviewPeriod = (date) => {
    // TEMPORAIRE: Accepter toutes les dates pour le moment
    console.log('🔍 Date acceptée (vérification désactivée):', date);
    return true;
  };

  // Filtrer les créneaux selon les critères
  console.log('🔍 Slots reçus de l\'API:', timeSlots);
  console.log('🔍 Nombre de slots reçus:', timeSlots.length);
  
  const filteredSlots = timeSlots.filter(slot => {
    const isInPeriod = isDateInInterviewPeriod(slot.date);
    const matchesType = filterType === 'all' || slot.type === filterType;
    
    // Filtrer par recruteur sélectionné (utiliser l'email au lieu de l'ID)
    const slotRecruiterEmail = typeof slot.recruiter === 'object' ? slot.recruiter?.email : slot.recruiter;
    const matchesRecruiter = selectedRecruiter ? slotRecruiterEmail === selectedRecruiter.email : true;
    
    console.log('--- DEBUG FILTRE RECRUTEUR ---');
    console.log('Slot:', slot.id, 'Date:', slot.date);
    console.log('slot.recruiter (raw):', slot.recruiter);
    console.log('slotRecruiterEmail (extracted):', slotRecruiterEmail);
    console.log('selectedRecruiter.email:', selectedRecruiter?.email);
    console.log('Comparison (slotRecruiterEmail === selectedRecruiter.email):', slotRecruiterEmail === selectedRecruiter?.email);
    console.log('isInPeriod:', isInPeriod, 'matchesType:', matchesType, 'matchesRecruiter:', matchesRecruiter);
    console.log('------------------------------');
    
    return isInPeriod && matchesType && matchesRecruiter;
  });
  
  console.log('🔍 Slots après filtrage:', filteredSlots);
  console.log('🔍 Nombre de slots après filtrage:', filteredSlots.length);



  // Fonction pour détecter les conflits de créneaux
  const detectConflicts = (slots) => {
    const conflicts = [];
    const sortedSlots = [...slots].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.start_time.localeCompare(b.start_time);
    });

    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const current = sortedSlots[i];
      const next = sortedSlots[i + 1];
      
      // Vérifier si les créneaux sont le même jour et se chevauchent
      if (current.date === next.date && 
          current.recruiter === next.recruiter &&
          current.end_time > next.start_time) {
        conflicts.push({
          slot1: current,
          slot2: next,
          type: 'overlap'
        });
      }
    }
    
    return conflicts;
  };

  // Détecter les conflits dans les créneaux actuels
  const conflicts = detectConflicts(timeSlots);
  console.log('🔍 Conflits détectés:', conflicts);


  if (loading) {
    return <Loading />;
  }

  return (
    <CompanyApprovalCheck 
      forumId={forum?.id} 
      apiBaseUrl={apiBaseUrl}
      fallbackMessage="L'accès à l'agenda n'est pas disponible car votre entreprise n'est pas encore approuvée pour ce forum."
    >
      <div className="offers-list-wrapper">
        <div className="offers-list-content">
              <div className="company-recruiters-header">
                <h2 className="company-recruiters-title">Agenda des entretiens</h2>
                
                {/* Sélecteur de recruteur - maintenant à droite du titre */}
                <div className="recruiter-selector">
                  <div className="recruiter-dropdown">
                    <button
                      className="recruiter-dropdown-btn"
                      onClick={() => setShowRecruiterDropdown(!showRecruiterDropdown)}
                    >
                      <FontAwesomeIcon icon={faUsers} />
                      <span>
                        {selectedRecruiter ? (
                          <>
                            {selectedRecruiter.full_name}
                            {console.log('🔍 selectedRecruiter.is_current_user:', selectedRecruiter.is_current_user)}
                            {selectedRecruiter.is_current_user && (
                              <Badge type="user" size="small">Vous</Badge>
                            )}
                          </>
                        ) : (
                          'Sélectionner un recruteur'
                        )}
                      </span>
                      <FontAwesomeIcon icon={faChevronDown} />
                    </button>
                    
                    {showRecruiterDropdown && (
                      <div className="recruiter-dropdown-menu">
                        {teamMembers.map(member => {
                          console.log('🔍 Member:', member.full_name, 'is_current_user:', member.is_current_user);
                          return (
                            <button
                              key={member.id}
                              className={`recruiter-option ${selectedRecruiter?.id === member.id ? 'selected' : ''}`}
                              onClick={() => handleRecruiterSelect(member)}
                            >
                              <div className="recruiter-info">
                                <div className="recruiter-name">
                                  <span>{member.full_name}</span>
                                  {member.is_current_user && (
                                    <Badge type="user" size="small">Vous</Badge>
                                  )}
                                </div>
                                <span className="recruiter-role">{member.email}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

          {/* Bouton Ajouter un créneau - au-dessus des filtres, aligné à droite */}
          <div className="add-slot-section-above-filters">
            <button
              className="invite-recruiter-btn-small"
              onClick={() => setShowAddModal(true)}
              disabled={!selectedRecruiter}
            >
              <FontAwesomeIcon icon={faPlus} />
              Ajouter un créneau
            </button>
          </div>

          <div className="agenda-controls">
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <FontAwesomeIcon icon={faList} />
                Liste
              </button>
              <button 
                className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                onClick={() => setViewMode('calendar')}
              >
                <FontAwesomeIcon icon={faCalendar} />
                Calendrier
              </button>
            </div>

            <div className="agenda-filters">
              <div className="type-filter">
                <label>Type :</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Tous</option>
                  <option value="video">Visioconférence</option>
                  <option value="phone">Téléphone</option>
                </select>
              </div>
              
                  <div className="interview-period-info">
                    <span className="period-label">Période d'entretiens :</span>
                    <span className="period-dates">
                      {getInterviewStartDate().toLocaleDateString('fr-FR')} - {getInterviewEndDate().toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  {/* Indicateur de conflits */}
                  {conflicts.length > 0 && (
                    <div className="conflict-warning" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '6px',
                      color: '#DC2626',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      <span>⚠️</span>
                      <span>{conflicts.length} conflit(s) de créneaux détecté(s)</span>
                    </div>
                  )}
            </div>
          </div>

          <div className="agenda-content">
            {viewMode === 'list' ? (
              <div className="agenda-list">
                {filteredSlots.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '3rem', 
                    color: '#6b7280',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    border: '2px dashed #d1d5db',
                    margin: '2rem 0'
                  }}>
                    <h3 style={{ marginBottom: '1rem', color: '#374151' }}>
                      Aucun créneau dans la période d'entretiens
                    </h3>
                    <p style={{ fontSize: '1rem' }}>
                      Ajoutez des créneaux d'entretien pour la période du {getInterviewStartDate().toLocaleDateString('fr-FR')} au {getInterviewEndDate().toLocaleDateString('fr-FR')}.
                    </p>
                  </div>
                ) : (
                  <div className="agenda-cards-grid">
                    {filteredSlots.map(slot => {
                      // Vérifier si ce créneau est en conflit
                      const isInConflict = conflicts.some(conflict => 
                        conflict.slot1.id === slot.id || conflict.slot2.id === slot.id
                      );
                      
                      return (
                        <AgendaCard
                          key={slot.id}
                          slot={slot}
                          onEdit={handleEditSlot}
                          onDelete={handleDeleteSlot}
                          onStartInterview={handleStartInterview}
                          onCreateMeetingLink={handleCreateMeetingLink}
                          onJoinMeeting={handleJoinMeeting}
                          isPast={new Date(slot.date) < new Date()}
                          isInConflict={isInConflict}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="agenda-calendar">
                <AgendaCalendar
                  key={`calendar-${user?.timezone || 'Europe/Paris'}`}
                  timeSlots={filteredSlots}
                  selectedDate={getCurrentInterviewDate()}
                  interviewStartDate={getInterviewStartDate().toISOString().split('T')[0]}
                  interviewEndDate={getInterviewEndDate().toISOString().split('T')[0]}
                  onDateClick={handleCalendarDateClick}
                  onSlotClick={handleCalendarSlotClick}
                      onAddSlot={async (slot) => {
                        // Ajouter le créneau via l'API
                        if (selectedRecruiter) {
                          try {
                            // CORRECTION: Associer le créneau au recruteur sélectionné (utiliser l'email)
                            const slotWithRecruiter = {
                              ...slot,
                              recruiter: selectedRecruiter.email
                            };
                            
                            console.log('🔍 Création de créneau depuis le calendrier:', slotWithRecruiter);
                            console.log('📋 URL complète:', `${apiBaseUrl}/virtual/forums/${forum.id}/agenda/`);
                            console.log('📋 Données envoyées (JSON):', JSON.stringify(slotWithRecruiter, null, 2));
                            
                            const response = await axios.post(`${apiBaseUrl}/virtual/forums/${forum.id}/agenda/`, slotWithRecruiter, {
                              withCredentials: true
                            });

                            console.log('✅ Créneau créé depuis le calendrier:', response.data);
                            
                            // Rafraîchir depuis l'API
                            fetchTimeSlots();
                          } catch (error) {
                            console.error('❌ Erreur lors de la création du créneau:', error);
                            if (error.response) {
                              console.error('📊 Détails de l\'erreur:', {
                                status: error.response.status,
                                statusText: error.response.statusText,
                                data: error.response.data
                              });
                              
                              // Gestion spécifique des conflits de créneaux
                              if (error.response.status === 409 && error.response.data?.error === 'Conflit de créneaux détecté') {
                                const conflictData = error.response.data;
                                const conflictMessage = conflictData.message || 'Conflit de créneaux détecté';
                                
                                console.error('🚫 Conflit de créneaux:', conflictMessage);
                                console.error('🚫 Détails du conflit:', conflictData);
                                
                                // Afficher le message d'erreur avec le nom du forum en conflit
                                toast.error(conflictMessage, {
                                  position: "top-right",
                                  autoClose: 6000,
                                  hideProgressBar: false,
                                  closeOnClick: true,
                                  pauseOnHover: true,
                                  draggable: true,
                                });
                                return;
                              }
                              
                              console.error('📋 Headers de la réponse:', error.response.headers);
                              console.error('📋 Configuration de la requête:', error.config);
                              console.error('📋 Données d\'erreur du serveur:', JSON.stringify(error.response.data, null, 2));
                              console.error('📋 URL de la requête:', error.config?.url);
                              console.error('📋 Méthode de la requête:', error.config?.method);
                              console.error('📋 Données envoyées dans la requête:', JSON.stringify(error.config?.data, null, 2));
                            }
                            console.error('📋 Erreur complète:', error);
                            toast.error('❌ Erreur lors de la création du créneau. Veuillez réessayer.', {
                              position: "top-right",
                              autoClose: 4000,
                              hideProgressBar: false,
                              closeOnClick: true,
                              pauseOnHover: true,
                              draggable: true,
                            });
                          }
                        }
                      }}
                />
              </div>
            )}
          </div>

      {/* Modal d'ajout de créneau */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Ajouter un créneau</h3>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAddSlot(); }}>
              <div className="form-group">
                <label>Date :</label>
                <input
                  type="date"
                  value={newSlot.date || getCurrentInterviewDate()}
                  onChange={(e) => setNewSlot({...newSlot, date: e.target.value})}
                  min={getInterviewStartDate().toISOString().split('T')[0]}
                  max={getInterviewEndDate().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Heure de début :</label>
                <input
                  type="time"
                  value={newSlot.start_time}
                  onChange={(e) => setNewSlot({...newSlot, start_time: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Heure de fin :</label>
                <input
                  type="time"
                  value={newSlot.end_time}
                  onChange={(e) => setNewSlot({...newSlot, end_time: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Type d'entretien :</label>
                <select
                  value={newSlot.type}
                  onChange={(e) => setNewSlot({...newSlot, type: e.target.value})}
                >
                  <option value="video">Visioconférence</option>
                  <option value="phone">Téléphone</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description :</label>
                <textarea
                  value={newSlot.description}
                  onChange={(e) => setNewSlot({...newSlot, description: e.target.value})}
                  placeholder="Description de l'entretien..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition de créneau */}
      {showEditModal && editingSlot && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Modifier le créneau</h3>
              <button 
                className="modal-close-btn"
                onClick={handleCancelEditSlot}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEditSlot(); }}>
              <div className="form-group">
                <label>Date :</label>
                <input
                  type="date"
                  value={editingSlot.date}
                  onChange={(e) => setEditingSlot({...editingSlot, date: e.target.value})}
                  min={getInterviewStartDate().toISOString().split('T')[0]}
                  max={getInterviewEndDate().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Heure de début :</label>
                <input
                  type="time"
                  value={editingSlot.start_time}
                  onChange={(e) => setEditingSlot({...editingSlot, start_time: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Heure de fin :</label>
                <input
                  type="time"
                  value={editingSlot.end_time}
                  onChange={(e) => setEditingSlot({...editingSlot, end_time: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Type d'entretien :</label>
                <select
                  value={editingSlot.type}
                  onChange={(e) => setEditingSlot({...editingSlot, type: e.target.value})}
                >
                  <option value="video">Visioconférence</option>
                  <option value="phone">Téléphone</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description (optionnel) :</label>
                <textarea
                  value={editingSlot.description || ''}
                  onChange={(e) => setEditingSlot({...editingSlot, description: e.target.value})}
                  rows="3"
                  placeholder="Ajouter une description..."
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleCancelEditSlot}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      </div>
    </CompanyApprovalCheck>
  );
};

export default VirtualAgenda;

import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  faCheck, 
  faTimes, 
  faClock, 
  faUser, 
  faCalendar,
  faBuilding,
  faEnvelope,
  faPhone,
  faVideo
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const RecruiterApplications = ({ forumId: propForumId }) => {
  const { forumId: paramForumId } = useParams();
  const location = useLocation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected

  // Récupérer le forumId depuis les props, params ou depuis le state
  const currentForumId = propForumId || paramForumId || location.state?.forum?.id;

  useEffect(() => {
    if (currentForumId) {
      loadApplications();
    }
  }, [currentForumId]);

  // Écouter les mises à jour de slots depuis d'autres composants
  useEffect(() => {
    const handleSlotUpdate = (event) => {
      console.log('🔄 [CANDIDATURES] Slot mis à jour:', event.detail);
      // Recharger les candidatures pour refléter les changements
      loadApplications();
    };

    window.addEventListener('slotUpdated', handleSlotUpdate);
    
    return () => {
      window.removeEventListener('slotUpdated', handleSlotUpdate);
    };
  }, []);

  const loadApplications = async () => {
    try {
      console.log('🔍 [RECRUTEUR] Chargement des candidatures pour le forum:', currentForumId);
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/virtual/forums/${currentForumId}/applications/recruiter/`,
        { withCredentials: true }
      );
      
      console.log('✅ [RECRUTEUR] Candidatures chargées:', response.data);
      setApplications(response.data);
    } catch (error) {
      console.error('❌ [RECRUTEUR] Erreur lors du chargement des candidatures:', error);
      toast.error('Erreur lors du chargement des candidatures');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateApplication = async (applicationId) => {
    try {
      console.log('🔍 [RECRUTEUR] Validation de la candidature:', applicationId);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/virtual/applications/${applicationId}/validate/`,
        {},
        { withCredentials: true }
      );
      
      console.log('✅ [RECRUTEUR] Candidature validée:', response.data);
      toast.success('Candidature validée avec succès');
      
      // Recharger les candidatures
      loadApplications();
      
      // Déclencher un événement pour rafraîchir le calendrier
      window.dispatchEvent(new CustomEvent('slotUpdated', { 
        detail: { 
          action: 'validated', 
          applicationId,
          slotId: response.data.selected_slot 
        } 
      }));
      
      // Sauvegarder dans localStorage pour communication entre onglets
      localStorage.setItem('slotUpdate', JSON.stringify({
        action: 'validated',
        applicationId,
        slotId: response.data.selected_slot,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('❌ [RECRUTEUR] Erreur lors de la validation:', error);
      if (error.response) {
        console.error('📊 [RECRUTEUR] Détails de l\'erreur:', error.response.data);
        toast.error(error.response.data.detail || 'Erreur lors de la validation');
      } else {
        toast.error('Erreur lors de la validation');
      }
    }
  };

  const handleRejectApplication = async (applicationId) => {
    try {
      console.log('🔍 [RECRUTEUR] Rejet de la candidature:', applicationId);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/virtual/applications/${applicationId}/reject/`,
        {},
        { withCredentials: true }
      );
      
      console.log('✅ [RECRUTEUR] Candidature rejetée:', response.data);
      toast.success('Candidature rejetée');
      
      // Recharger les candidatures
      loadApplications();
      
      // Déclencher un événement pour rafraîchir le calendrier
      window.dispatchEvent(new CustomEvent('slotUpdated', { 
        detail: { 
          action: 'rejected', 
          applicationId,
          slotId: response.data.selected_slot 
        } 
      }));
      
      // Sauvegarder dans localStorage pour communication entre onglets
      localStorage.setItem('slotUpdate', JSON.stringify({
        action: 'rejected',
        applicationId,
        slotId: response.data.selected_slot,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('❌ [RECRUTEUR] Erreur lors du rejet:', error);
      if (error.response) {
        console.error('📊 [RECRUTEUR] Détails de l\'erreur:', error.response.data);
        toast.error(error.response.data.detail || 'Erreur lors du rejet');
      } else {
        toast.error('Erreur lors du rejet');
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: faClock, text: 'En attente' },
      accepted: { color: 'bg-green-100 text-green-800', icon: faCheck, text: 'Acceptée' },
      rejected: { color: 'bg-red-100 text-red-800', icon: faTimes, text: 'Rejetée' }
    };
    
    const badge = badges[status] || badges.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <FontAwesomeIcon icon={badge.icon} className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const icons = {
      video: faVideo,
      phone: faPhone,
      in_person: faUser
    };
    
    return icons[type] || faVideo;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (timeString && timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    }
    return timeString;
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Candidatures reçues</h1>
        <p className="mt-2 text-gray-600">Gérez les candidatures pour vos offres</p>
      </div>

      {/* Filtres */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Toutes ({applications.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'pending' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            En attente ({applications.filter(app => app.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'accepted' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Acceptées ({applications.filter(app => app.status === 'accepted').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'rejected' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rejetées ({applications.filter(app => app.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Liste des candidatures */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faUser} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune candidature</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'Aucune candidature reçue pour le moment.' 
              : `Aucune candidature ${filter === 'pending' ? 'en attente' : filter === 'accepted' ? 'acceptée' : 'rejetée'}.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredApplications.map((application) => (
            <div key={application.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.candidate_name || application.candidate_email}
                    </h3>
                    {getStatusBadge(application.status)}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faBuilding} className="w-4 h-4 mr-2" />
                      {application.offer?.company?.name || 'Entreprise non spécifiée'}
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 mr-2" />
                      {application.candidate_email}
                    </div>
                  </div>
                </div>
                
                {application.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleValidateApplication(application.id)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <FontAwesomeIcon icon={faCheck} className="w-4 h-4 mr-2" />
                      Valider
                    </button>
                    <button
                      onClick={() => handleRejectApplication(application.id)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-2" />
                      Rejeter
                    </button>
                  </div>
                )}
              </div>

              {/* Détails de l'offre */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Offre</h4>
                <p className="text-gray-700">{application.offer?.title || 'Titre non spécifié'}</p>
              </div>

              {/* Créneau sélectionné */}
              {application.selected_slot && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Créneau sélectionné</h4>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faCalendar} className="w-4 h-4 mr-2 text-blue-600" />
                      {formatDate(application.selected_slot.date)}
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={getTypeIcon(application.selected_slot.type)} className="w-4 h-4 mr-2 text-blue-600" />
                      {formatTime(application.selected_slot.start_time)} - {formatTime(application.selected_slot.end_time)}
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-600 font-medium">
                        {application.selected_slot.type === 'video' ? 'Vidéo' : 
                         application.selected_slot.type === 'phone' ? 'Téléphone' : 'Présentiel'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Réponses au questionnaire */}
              {application.questionnaire_responses && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Réponses au questionnaire</h4>
                  <div className="text-sm text-gray-600">
                    {Object.keys(application.questionnaire_responses).length} réponse(s) fournie(s)
                  </div>
                </div>
              )}

              {/* Date de candidature */}
              <div className="text-xs text-gray-500 mt-4">
                Candidature du {formatDate(application.created_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterApplications;

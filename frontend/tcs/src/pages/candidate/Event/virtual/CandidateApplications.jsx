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
  faVideo,
  faPhone,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const CandidateApplications = ({ forumId: propForumId }) => {
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

  const loadApplications = async () => {
    try {
      console.log('🔍 [CANDIDAT] Chargement des candidatures pour le forum:', currentForumId);
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/virtual/forums/${currentForumId}/applications/candidate/`,
        { withCredentials: true }
      );
      
      console.log('✅ [CANDIDAT] Candidatures chargées:', response.data);
      setApplications(response.data);
    } catch (error) {
      console.error('❌ [CANDIDAT] Erreur lors du chargement des candidatures:', error);
      toast.error('Erreur lors du chargement des candidatures');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: faClock, 
        text: 'En attente de validation',
        description: 'Votre candidature est en cours d\'examen'
      },
      accepted: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: faCheck, 
        text: 'Acceptée',
        description: 'Félicitations ! Votre candidature a été acceptée'
      },
      rejected: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: faTimes, 
        text: 'Rejetée',
        description: 'Votre candidature n\'a pas été retenue'
      }
    };
    
    const badge = badges[status] || badges.pending;
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${badge.color}`}>
        <FontAwesomeIcon icon={badge.icon} className="w-4 h-4 mr-2" />
        {badge.text}
      </div>
    );
  };

  const getStatusDescription = (status) => {
    const descriptions = {
      pending: 'Votre candidature est en cours d\'examen par le recruteur.',
      accepted: 'Félicitations ! Votre candidature a été acceptée. Vous devriez recevoir un email de confirmation.',
      rejected: 'Votre candidature n\'a pas été retenue pour ce poste.'
    };
    
    return descriptions[status] || descriptions.pending;
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
        <h1 className="text-3xl font-bold text-gray-900">Mes candidatures</h1>
        <p className="mt-2 text-gray-600">Suivez l'état de vos candidatures</p>
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
              ? 'Vous n\'avez pas encore postulé à des offres.' 
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
                      {application.offer?.title || 'Titre non spécifié'}
                    </h3>
                    {getStatusBadge(application.status)}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faBuilding} className="w-4 h-4 mr-2" />
                      {application.offer?.company?.name || 'Entreprise non spécifiée'}
                    </div>
                  </div>

                  {/* Description du statut */}
                  <p className="text-sm text-gray-600 mb-4">
                    {getStatusDescription(application.status)}
                  </p>
                </div>
              </div>

              {/* Créneau sélectionné */}
              {application.selected_slot && (
                <div className={`rounded-lg p-4 mb-4 ${
                  application.status === 'accepted' 
                    ? 'bg-green-50 border border-green-200' 
                    : application.status === 'rejected'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <h4 className="font-medium text-gray-900 mb-2">Créneau sélectionné</h4>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faCalendar} className="w-4 h-4 mr-2" />
                      {formatDate(application.selected_slot.date)}
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={getTypeIcon(application.selected_slot.type)} className="w-4 h-4 mr-2" />
                      {formatTime(application.selected_slot.start_time)} - {formatTime(application.selected_slot.end_time)}
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">
                        {application.selected_slot.type === 'video' ? 'Vidéo' : 
                         application.selected_slot.type === 'phone' ? 'Téléphone' : 'Présentiel'}
                      </span>
                    </div>
                  </div>
                  
                  {application.status === 'accepted' && (
                    <div className="mt-2 text-sm text-green-700">
                      ✅ Ce créneau a été confirmé par le recruteur
                    </div>
                  )}
                  
                  {application.status === 'rejected' && (
                    <div className="mt-2 text-sm text-red-700">
                      ❌ Ce créneau n'est plus disponible
                    </div>
                  )}
                  
                  {application.status === 'pending' && (
                    <div className="mt-2 text-sm text-blue-700">
                      ⏳ En attente de confirmation du recruteur
                    </div>
                  )}
                </div>
              )}

              {/* Réponses au questionnaire */}
              {application.questionnaire_responses && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Réponses au questionnaire</h4>
                  <div className="text-sm text-gray-600">
                    {Object.keys(application.questionnaire_responses).length} réponse(s) fournie(s)
                  </div>
                </div>
              )}

              {/* Date de candidature */}
              <div className="text-xs text-gray-500">
                Candidature du {formatDate(application.created_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateApplications;

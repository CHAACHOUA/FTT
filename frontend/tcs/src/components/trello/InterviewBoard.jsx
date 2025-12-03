import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPhone, 
  faClock,
  faBuilding,
  faPlay,
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import './InterviewBoard.css';

const InterviewBoard = ({ forumId, onCardClick, onInterviewsChange }) => {
  console.log('🎯 InterviewBoard loaded with forumId:', forumId);
  
  const { role } = useAuth();
  const [interviews, setInterviews] = useState({
    scheduled: [], // Liste des réunions
    inProgress: [], // Réunion en cours
    completed: [] // Réunion terminée
  });
  const [loading, setLoading] = useState(true);

  // Charger les entretiens depuis l'API
  useEffect(() => {
    loadInterviews();
  }, [forumId, role]);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Loading interviews for role:', role);
      
      // Choisir le bon endpoint selon le rôle
      const endpoint = role === 'recruiter' 
        ? `/virtual/forums/${forumId}/applications/recruiter/`
        : `/virtual/forums/${forumId}/applications/candidate/`;
      
      console.log('🔍 Using endpoint:', endpoint);
      
      // Récupérer les candidatures acceptées avec créneaux vidéo
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}${endpoint}`,
        { withCredentials: true }
      );

      const applications = response.data;
      console.log('🔍 Applications loaded:', applications);
      
      // Filtrer et organiser les entretiens
      const scheduledInterviews = applications
        .filter(app => 
          app.status === 'accepted' && 
          app.selected_slot_info?.type === 'video' &&
          app.selected_slot_info?.meeting_link
        )
        .map(app => ({
          id: `interview-${app.id}`,
          applicationId: app.id,
          application: app, // Garder la référence complète à l'application
          candidate: app.candidate || {
            first_name: app.candidate_name?.split(' ')[0] || '',
            last_name: app.candidate_name?.split(' ').slice(1).join(' ') || '',
            profile_picture: app.candidate_photo || null
          },
          candidate_photo: app.candidate_photo,
          recruiter: app.selected_slot_info?.recruiter,
          company: app.offer?.company,
          offerTitle: app.offer?.title,
          slotInfo: app.selected_slot_info,
          meetingLink: app.selected_slot_info?.meeting_link,
          status: app.interview_status || 'scheduled', // Utiliser le statut d'entretien
          createdAt: app.created_at
        }));

      // Organiser les entretiens selon leur statut
      const organizedInterviews = {
        scheduled: [],
        inProgress: [],
        completed: []
      };

      scheduledInterviews.forEach(interview => {
        if (interview.status === 'scheduled') {
          organizedInterviews.scheduled.push(interview);
        } else if (interview.status === 'inProgress') {
          organizedInterviews.inProgress.push(interview);
        } else if (interview.status === 'completed') {
          organizedInterviews.completed.push(interview);
        } else {
          // Par défaut, mettre en scheduled
          organizedInterviews.scheduled.push(interview);
        }
      });

      console.log('🔍 Organized interviews:', organizedInterviews);
      setInterviews(organizedInterviews);
      
      // Notifier le parent des interviews chargés
      if (onInterviewsChange) {
        const allInterviews = [
          ...organizedInterviews.scheduled,
          ...organizedInterviews.inProgress,
          ...organizedInterviews.completed
        ];
        onInterviewsChange(allInterviews);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des entretiens:', error);
      toast.error('Erreur lors du chargement des entretiens');
    } finally {
      setLoading(false);
    }
  };

  // Gérer le drag & drop HTML5
  const [draggedItem, setDraggedItem] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e, interview) => {
    setIsDragging(true);
    setDraggedItem(interview);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    // Réinitialiser isDragging immédiatement pour permettre les clics
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.status === targetStatus) {
      return;
    }

    // Déplacer l'entretien vers la nouvelle colonne
    const sourceColumn = interviews[draggedItem.status];
    const destColumn = interviews[targetStatus];
    
    const updatedInterview = {
      ...draggedItem,
      status: targetStatus,
      application: draggedItem.application || draggedItem // S'assurer que application est préservé
    };

    const newSourceColumn = sourceColumn.filter(item => item.id !== draggedItem.id);
    const newDestColumn = [...destColumn, updatedInterview];

    setInterviews(prev => {
      const updated = {
        ...prev,
        [draggedItem.status]: newSourceColumn,
        [targetStatus]: newDestColumn
      };
      
      // Notifier le parent du changement
      if (onInterviewsChange) {
        const allInterviews = [
          ...updated.scheduled,
          ...updated.inProgress,
          ...updated.completed
        ];
        onInterviewsChange(allInterviews);
      }
      
      return updated;
    });

    // Sauvegarder le changement d'état côté backend
    updateInterviewStatus(draggedItem.applicationId, targetStatus);
    
    toast.success(`Entretien déplacé vers ${getStatusLabel(targetStatus)}`);
  };

  // Mettre à jour le statut d'un entretien côté backend
  const updateInterviewStatus = async (applicationId, newStatus) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/virtual/applications/${applicationId}/interview-status/`,
        { status: newStatus },
        { withCredentials: true }
      );
      
      toast.success('Statut de l\'entretien mis à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  // Rejoindre une réunion et changer le statut
  const handleJoinMeeting = async (interview) => {
    try {
      // Ouvrir la réunion Zoom
      window.open(interview.meetingLink, '_blank');
      
      // Déplacer automatiquement vers "Réunion en cours"
      if (interview.status === 'scheduled') {
        const sourceColumn = interviews[interview.status];
        const destColumn = interviews.inProgress;
        
        const updatedInterview = {
          ...interview,
          status: 'inProgress',
          application: interview.application || interview // S'assurer que application est préservé
        };

        const newSourceColumn = sourceColumn.filter(item => item.id !== interview.id);
        const newDestColumn = [...destColumn, updatedInterview];

        setInterviews(prev => {
          const updated = {
            ...prev,
            scheduled: newSourceColumn,
            inProgress: newDestColumn
          };
          
          // Notifier le parent du changement
          if (onInterviewsChange) {
            const allInterviews = [
              ...updated.scheduled,
              ...updated.inProgress,
              ...updated.completed
            ];
            onInterviewsChange(allInterviews);
          }
          
          return updated;
        });

        // Sauvegarder côté backend
        await updateInterviewStatus(interview.applicationId, 'inProgress');
        
        toast.success('Entretien démarré !');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture de la réunion:', error);
      toast.error('Erreur lors de l\'ouverture de la réunion');
    }
  };

  // Marquer un entretien comme terminé
  const handleCompleteInterview = async (interview) => {
    try {
      const sourceColumn = interviews[interview.status];
      const destColumn = interviews.completed;
      
      const updatedInterview = {
        ...interview,
        status: 'completed',
        application: interview.application || interview // S'assurer que application est préservé
      };

      const newSourceColumn = sourceColumn.filter(item => item.id !== interview.id);
      const newDestColumn = [...destColumn, updatedInterview];

      setInterviews(prev => {
        const updated = {
          ...prev,
          [interview.status]: newSourceColumn,
          completed: newDestColumn
        };
        
        // Notifier le parent du changement
        if (onInterviewsChange) {
          const allInterviews = [
            ...updated.scheduled,
            ...updated.inProgress,
            ...updated.completed
          ];
          onInterviewsChange(allInterviews);
        }
        
        return updated;
      });

      // Sauvegarder côté backend
      await updateInterviewStatus(interview.applicationId, 'completed');
      
      toast.success('Entretien marqué comme terminé !');
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      toast.error('Erreur lors de la finalisation');
    }
  };

  // Fonction pour obtenir le label du statut
  const getStatusLabel = (status) => {
    const labels = {
      scheduled: 'Liste des réunions',
      inProgress: 'Réunion en cours',
      completed: 'Réunion terminée'
    };
    return labels[status] || status;
  };

  // Fonction pour obtenir les initiales du candidat
  const getCandidateInitials = (candidate) => {
    if (!candidate) return '??';
    const firstName = candidate.first_name || '';
    const lastName = candidate.last_name || '';
    return `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase() || '??';
  };

  // Fonction pour obtenir l'URL de la photo du candidat
  const getCandidatePhotoUrl = (candidate, candidatePhoto) => {
    // Essayer d'abord candidate_photo direct, puis profile_picture du candidat
    const photo = candidatePhoto || candidate?.profile_picture;
    if (!photo) return null;
    if (photo.startsWith('http')) {
      return photo;
    }
    return `${process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000'}${photo}`;
  };

  // Rendu d'une carte d'entretien
  const renderInterviewCard = (interview, index) => {
    const candidatePhotoUrl = getCandidatePhotoUrl(interview.candidate, interview.candidate_photo);
    const candidateInitials = getCandidateInitials(interview.candidate);
    
    return (
    <div
      key={interview.id}
      draggable
      onDragStart={(e) => handleDragStart(e, interview)}
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        // Ne pas déclencher si on clique sur un bouton
        if (e.target.closest('button')) {
          return;
        }
        
        // Ne pas déclencher si on vient de faire un drag
        if (isDragging) {
          return;
        }
        
        if (onCardClick) {
          const applicationData = interview.application || interview;
          if (applicationData) {
            console.log('✅ Card clicked, calling onCardClick with:', applicationData);
            onCardClick(applicationData);
          } else {
            console.error('❌ No application data available');
          }
        }
      }}
      className="interview-card"
      style={{ cursor: onCardClick ? 'pointer' : 'grab' }}
    >
      {/* Informations de l'entretien */}
      <div className="card-content">
        {/* Candidat avec photo/initiales */}
        <div className="card-candidate">
          <div className="candidate-avatar">
            {candidatePhotoUrl ? (
              <img
                src={candidatePhotoUrl}
                alt={`${interview.candidate?.first_name} ${interview.candidate?.last_name}`}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="candidate-initials"
              style={{ display: candidatePhotoUrl ? 'none' : 'flex' }}
            >
              {candidateInitials}
            </div>
          </div>
          <div className="candidate-name">
            <span className="participant-name">
              {interview.candidate?.first_name && interview.candidate?.last_name
                ? `${interview.candidate.first_name} ${interview.candidate.last_name}`
                : interview.application?.candidate_name || 'Candidat'}
            </span>
          </div>
        </div>

        {/* Informations du créneau */}
        <div className="card-slot-info">
          <div className="slot-time">
            <FontAwesomeIcon icon={faClock} />
            <span className="time-range">
              {formatTime(interview.slotInfo?.start_time)} - {formatTime(interview.slotInfo?.end_time)}
            </span>
          </div>
          <div className="slot-date">
            <span>{formatDate(interview.slotInfo?.date)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card-actions">
        {interview.status === 'scheduled' && (
          <button 
            className="join-meeting-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleJoinMeeting(interview);
            }}
            title="Rejoindre la réunion"
          >
            <FontAwesomeIcon icon={faPlay} />
            Rejoindre
          </button>
        )}
        
        {interview.status === 'inProgress' && (
          <button 
            className="complete-meeting-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleCompleteInterview(interview);
            }}
            title="Marquer comme terminé"
          >
            <FontAwesomeIcon icon={faCheck} />
            Terminer
          </button>
        )}
        
        {interview.status === 'completed' && (
          <div className="completed-meeting-badge">
            <FontAwesomeIcon icon={faCheck} />
            Terminé
          </div>
        )}
      </div>

    </div>
    );
  };

  // Rendu d'une colonne
  const renderColumn = (columnId, title, interviews, icon) => (
    <div 
      key={columnId}
      className="board-column"
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, columnId)}
    >
      <div className="column-header">
        <span className="column-title">{title}</span>
        <span className="column-count">{interviews.length}</span>
      </div>
      
      <div className="column-cards">
        {interviews.map((interview, index) => 
          renderInterviewCard(interview, index)
        )}
        
        {interviews.length === 0 && (
          <div className="empty-column">
            <p>Aucun entretien</p>
          </div>
        )}
      </div>
    </div>
  );

  // Fonctions utilitaires
  const formatDate = (dateString) => {
    if (!dateString) return 'Date non définie';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Heure non définie';
    try {
      const time = new Date(`2000-01-01T${timeString}`);
      return time.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return timeString;
    }
  };

  if (loading) {
    return (
      <div className="interview-board-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des entretiens...</p>
      </div>
    );
  }

  return (
    <div className="interview-board">
      <div className="board-header">
        <h2>Gestion des Entretiens</h2>
        <p>Organisez vos entretiens par statut</p>
      </div>

      <div className="board-columns">
        {renderColumn('scheduled', 'Liste des réunions', interviews.scheduled, faClock)}
        {renderColumn('inProgress', 'Réunion en cours', interviews.inProgress, faPlay)}
        {renderColumn('completed', 'Réunion terminée', interviews.completed, faCheck)}
      </div>
    </div>
  );
};

export default InterviewBoard;

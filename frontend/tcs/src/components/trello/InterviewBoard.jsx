import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPhone, 
  faClock,
  faUser,
  faBuilding,
  faPlay,
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import './InterviewBoard.css';

const InterviewBoard = ({ forumId }) => {
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
          candidate: app.candidate_profile,
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

    } catch (error) {
      console.error('Erreur lors du chargement des entretiens:', error);
      toast.error('Erreur lors du chargement des entretiens');
    } finally {
      setLoading(false);
    }
  };

  // Gérer le drag & drop HTML5
  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = (e, interview) => {
    setDraggedItem(interview);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
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
      status: targetStatus
    };

    const newSourceColumn = sourceColumn.filter(item => item.id !== draggedItem.id);
    const newDestColumn = [...destColumn, updatedInterview];

    setInterviews(prev => ({
      ...prev,
      [draggedItem.status]: newSourceColumn,
      [targetStatus]: newDestColumn
    }));

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
          status: 'inProgress'
        };

        const newSourceColumn = sourceColumn.filter(item => item.id !== interview.id);
        const newDestColumn = [...destColumn, updatedInterview];

        setInterviews(prev => ({
          ...prev,
          scheduled: newSourceColumn,
          inProgress: newDestColumn
        }));

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
        status: 'completed'
      };

      const newSourceColumn = sourceColumn.filter(item => item.id !== interview.id);
      const newDestColumn = [...destColumn, updatedInterview];

      setInterviews(prev => ({
        ...prev,
        [interview.status]: newSourceColumn,
        completed: newDestColumn
      }));

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

  // Rendu d'une carte d'entretien
  const renderInterviewCard = (interview, index) => (
    <div
      key={interview.id}
      draggable
      onDragStart={(e) => handleDragStart(e, interview)}
      onDragEnd={handleDragEnd}
      className="interview-card"
    >
      {/* Header avec type et statut */}
      <div className="card-header">
        <div className="card-type">
          <span>Visioconférence</span>
        </div>
        <div className={`card-status status-${interview.status === 'scheduled' ? 'scheduled' : interview.status === 'inProgress' ? 'in-progress' : 'completed'}`}>
          {interview.status === 'scheduled' ? 'Programmé' : 
           interview.status === 'inProgress' ? 'En cours' : 'Terminé'}
        </div>
      </div>

      {/* Informations de l'entretien */}
      <div className="card-content">
        {/* Participants */}
        <div className="card-participants">
          <div className="participant">
            <FontAwesomeIcon icon={faUser} className="participant-icon" />
            <span className="participant-name">
              {interview.candidate?.first_name} {interview.candidate?.last_name}
            </span>
          </div>
          <div className="participant">
            <FontAwesomeIcon icon={faUser} className="participant-icon" />
            <span className="participant-name">
              {interview.recruiter?.first_name} {interview.recruiter?.last_name}
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
            onClick={() => handleJoinMeeting(interview)}
            title="Rejoindre la réunion"
          >
            <FontAwesomeIcon icon={faPlay} />
            Rejoindre
          </button>
        )}
        
        {interview.status === 'inProgress' && (
          <button 
            className="complete-meeting-btn"
            onClick={() => handleCompleteInterview(interview)}
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

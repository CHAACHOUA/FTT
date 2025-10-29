import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faVideo, 
  faPhone, 
  faCalendarAlt,
  faClock,
  faUser,
  faPlay,
  faPause,
  faStop,
  faMicrophone,
  faMicrophoneSlash,
  faVideoSlash,
  faCheck,
  faTimes,
  faEdit,
  faTrash,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import CompanyApprovalCheck from '../../../../utils/CompanyApprovalCheck';
import Loading from '../../../../components/loyout/Loading';
import '../../../../pages/styles/recruiter/CompanyRecruiter.css';
import { Button, Input, Card, Badge } from '../../../../components/common';

const VirtualInterviews = ({ forum, accessToken, apiBaseUrl }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentInterview, setCurrentInterview] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInterview, setNewInterview] = useState({
    candidate_id: '',
    date: '',
    start_time: '',
    end_time: '',
    type: 'video',
    meeting_link: '',
    notes: ''
  });

  useEffect(() => {
    fetchInterviews();
  }, [forum]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      // TODO: Remplacer par l'API réelle
      // const response = await fetch(`${apiBaseUrl}/virtual/forums/${forum.id}/interviews/`, {
      //   credentials: 'include',
      //   headers: { 'Authorization': `Bearer ${accessToken}` }
      // });
      
      // Données de test
      const mockData = [
        {
          id: 1,
          candidate: {
            id: 1,
            name: 'Marie Dubois',
            email: 'marie.dubois@email.com',
            profile_picture: null
          },
          date: '2024-01-15',
          start_time: '14:00',
          end_time: '14:30',
          type: 'video',
          status: 'scheduled', // scheduled, in_progress, completed, cancelled
          meeting_link: 'https://meet.google.com/abc-defg-hij',
          notes: 'Entretien pour le poste de développeur React',
          created_at: '2024-01-10T10:00:00Z'
        },
        {
          id: 2,
          candidate: {
            id: 2,
            name: 'Pierre Martin',
            email: 'pierre.martin@email.com',
            profile_picture: null
          },
          date: '2024-01-15',
          start_time: '15:00',
          end_time: '15:30',
          type: 'phone',
          status: 'completed',
          meeting_link: null,
          notes: 'Entretien téléphonique pour le poste de marketing',
          created_at: '2024-01-08T14:00:00Z'
        }
      ];
      
      setInterviews(mockData);
    } catch (error) {
      console.error('Erreur lors du chargement des entretiens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = (interview) => {
    setCurrentInterview(interview);
    setIsInCall(true);
    // TODO: Implémenter la logique de démarrage d'entretien
    console.log('Démarrage de l\'entretien:', interview);
  };

  const handleEndInterview = () => {
    setIsInCall(false);
    setCurrentInterview(null);
    // TODO: Implémenter la logique de fin d'entretien
    console.log('Fin de l\'entretien');
  };

  const handleStatusChange = async (interviewId, newStatus) => {
    try {
      // TODO: Implémenter l'API pour changer le statut
      console.log('Changement de statut:', interviewId, newStatus);
      
      setInterviews(prev => prev.map(interview => 
        interview.id === interviewId 
          ? { ...interview, status: newStatus }
          : interview
      ));
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const handleAddInterview = async () => {
    try {
      // TODO: Implémenter l'API pour ajouter un entretien
      console.log('Ajout d\'un entretien:', newInterview);
      setShowAddModal(false);
      setNewInterview({
        candidate_id: '',
        date: '',
        start_time: '',
        end_time: '',
        type: 'video',
        meeting_link: '',
        notes: ''
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'entretien:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#F59E0B'; // Orange
      case 'in_progress': return '#3B82F6'; // Bleu
      case 'completed': return '#10B981'; // Vert
      case 'cancelled': return '#EF4444'; // Rouge
      default: return '#6B7280'; // Gris
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled': return 'Programmé';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return faCalendarAlt;
      case 'in_progress': return faPlay;
      case 'completed': return faCheck;
      case 'cancelled': return faTimes;
      default: return faClock;
    }
  };

  const filteredInterviews = interviews.filter(interview => 
    interview.date === selectedDate
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <CompanyApprovalCheck 
      forumId={forum?.id} 
      apiBaseUrl={apiBaseUrl}
      fallbackMessage="L'accès aux entretiens n'est pas disponible car votre entreprise n'est pas encore approuvée pour ce forum."
    >
      <div className="offers-list-wrapper">
        <div className="offers-list-content">
          <div className="company-recruiters-header">
            <h2 className="company-recruiters-title">Entretiens virtuels</h2>
            <button 
              className="invite-recruiter-btn"
              onClick={() => setShowAddModal(true)}
            >
              <FontAwesomeIcon icon={faPlus} />
              Programmer un entretien
            </button>
          </div>

          <div className="interviews-filters">
            <div className="date-filter">
              <label>Date :</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="status-filter">
              <label>Statut :</label>
              <select>
                <option value="all">Tous</option>
                <option value="scheduled">Programmés</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminés</option>
                <option value="cancelled">Annulés</option>
              </select>
            </div>
          </div>

      {/* Interface d'entretien en cours */}
      {isInCall && currentInterview && (
        <div className="interview-call-interface">
          <div className="call-header">
            <h3>Entretien en cours avec {currentInterview.candidate.name}</h3>
            <button 
              className="btn-end-call"
              onClick={handleEndInterview}
            >
              <FontAwesomeIcon icon={faStop} />
              Terminer l'entretien
            </button>
          </div>
          
          <div className="call-controls">
            <button className="btn-mute">
              <FontAwesomeIcon icon={faMicrophone} />
            </button>
            <button className="btn-video">
              <FontAwesomeIcon icon={faVideo} />
            </button>
            <button className="btn-pause">
              <FontAwesomeIcon icon={faPause} />
            </button>
          </div>
        </div>
      )}

      <div className="interviews-list">
        {filteredInterviews.map(interview => (
          <div key={interview.id} className="interview-card">
            <div className="interview-header">
              <div className="candidate-info">
                <div className="candidate-avatar">
                  {interview.candidate.profile_picture ? (
                    <img src={interview.candidate.profile_picture} alt={interview.candidate.name} />
                  ) : (
                    <FontAwesomeIcon icon={faUser} />
                  )}
                </div>
                <div className="candidate-details">
                  <h3>{interview.candidate.name}</h3>
                  <p>{interview.candidate.email}</p>
                </div>
              </div>
              
              <div className="interview-status">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(interview.status) }}
                >
                  <FontAwesomeIcon icon={getStatusIcon(interview.status)} />
                  {getStatusText(interview.status)}
                </span>
              </div>
            </div>

            <div className="interview-content">
              <div className="interview-time">
                <FontAwesomeIcon icon={faClock} />
                <span>{interview.start_time} - {interview.end_time}</span>
              </div>

              <div className="interview-type">
                <FontAwesomeIcon icon={interview.type === 'video' ? faVideo : faPhone} />
                <span>{interview.type === 'video' ? 'Visioconférence' : 'Téléphone'}</span>
              </div>

              {interview.meeting_link && (
                <div className="meeting-link">
                  <a 
                    href={interview.meeting_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-join-meeting"
                  >
                    <FontAwesomeIcon icon={faPlay} />
                    Rejoindre la réunion
                  </a>
                </div>
              )}

              {interview.notes && (
                <div className="interview-notes">
                  <p><strong>Notes :</strong> {interview.notes}</p>
                </div>
              )}

              <div className="interview-actions">
                {interview.status === 'scheduled' && (
                  <button 
                    className="btn-start"
                    onClick={() => handleStartInterview(interview)}
                  >
                    <FontAwesomeIcon icon={faPlay} />
                    Commencer l'entretien
                  </button>
                )}

                {interview.status === 'scheduled' && (
                  <div className="status-actions">
                    <button 
                      className="btn-complete"
                      onClick={() => handleStatusChange(interview.id, 'completed')}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                      Marquer comme terminé
                    </button>
                    <button 
                      className="btn-cancel"
                      onClick={() => handleStatusChange(interview.id, 'cancelled')}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                      Annuler
                    </button>
                  </div>
                )}

                <div className="edit-actions">
                  <button className="btn-edit">
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button className="btn-delete">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal d'ajout d'entretien */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Programmer un entretien</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleAddInterview(); }}>
              <div className="form-group">
                <label>Candidat :</label>
                <select
                  value={newInterview.candidate_id}
                  onChange={(e) => setNewInterview({...newInterview, candidate_id: e.target.value})}
                  required
                >
                  <option value="">Sélectionner un candidat</option>
                  {/* TODO: Charger la liste des candidats acceptés */}
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Date :</label>
                  <input
                    type="date"
                    value={newInterview.date}
                    onChange={(e) => setNewInterview({...newInterview, date: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Heure de début :</label>
                  <input
                    type="time"
                    value={newInterview.start_time}
                    onChange={(e) => setNewInterview({...newInterview, start_time: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Heure de fin :</label>
                  <input
                    type="time"
                    value={newInterview.end_time}
                    onChange={(e) => setNewInterview({...newInterview, end_time: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Type d'entretien :</label>
                <select
                  value={newInterview.type}
                  onChange={(e) => setNewInterview({...newInterview, type: e.target.value})}
                >
                  <option value="video">Visioconférence</option>
                  <option value="phone">Téléphone</option>
                </select>
              </div>

              {newInterview.type === 'video' && (
                <div className="form-group">
                  <label>Lien de la réunion :</label>
                  <input
                    type="url"
                    value={newInterview.meeting_link}
                    onChange={(e) => setNewInterview({...newInterview, meeting_link: e.target.value})}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              )}

              <div className="form-group">
                <label>Notes :</label>
                <textarea
                  value={newInterview.notes}
                  onChange={(e) => setNewInterview({...newInterview, notes: e.target.value})}
                  placeholder="Notes sur l'entretien..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Programmer
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

export default VirtualInterviews;

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faGraduationCap,
  faBriefcase,
  faEye,
  faVideo,
  faCheck,
  faTimes,
  faClock,
  faSearch,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import CompanyApprovalCheck from '../../../../utils/CompanyApprovalCheck';
import Loading from '../../../../components/loyout/Loading';
import '../../../../pages/styles/recruiter/CompanyRecruiter.css';

const VirtualCandidates = ({ forum, accessToken, apiBaseUrl }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, [forum]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      // TODO: Remplacer par l'API réelle
      // const response = await fetch(`${apiBaseUrl}/virtual/forums/${forum.id}/candidates/`, {
      //   credentials: 'include',
      //   headers: { 'Authorization': `Bearer ${accessToken}` }
      // });
      
      // Données de test
      const mockData = [
        {
          id: 1,
          name: 'Marie Dubois',
          email: 'marie.dubois@email.com',
          phone: '+33 6 12 34 56 78',
          school: 'École Polytechnique',
          experience: 2,
          skills: ['React', 'Node.js', 'Python'],
          status: 'pending', // pending, accepted, rejected
          application_date: '2024-01-10',
          cv_url: '/cvs/marie_dubois.pdf',
          profile_picture: null
        },
        {
          id: 2,
          name: 'Pierre Martin',
          email: 'pierre.martin@email.com',
          phone: '+33 6 98 76 54 32',
          school: 'HEC Paris',
          experience: 1,
          skills: ['Marketing', 'Analytics', 'Excel'],
          status: 'accepted',
          application_date: '2024-01-08',
          cv_url: '/cvs/pierre_martin.pdf',
          profile_picture: null
        },
        {
          id: 3,
          name: 'Sophie Laurent',
          email: 'sophie.laurent@email.com',
          phone: '+33 6 55 44 33 22',
          school: 'ESCP Business School',
          experience: 3,
          skills: ['Finance', 'Excel', 'PowerBI'],
          status: 'rejected',
          application_date: '2024-01-05',
          cv_url: '/cvs/sophie_laurent.pdf',
          profile_picture: null
        }
      ];
      
      setCandidates(mockData);
    } catch (error) {
      console.error('Erreur lors du chargement des candidats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (candidateId, newStatus) => {
    try {
      // TODO: Implémenter l'API pour changer le statut
      console.log('Changement de statut:', candidateId, newStatus);
      
      setCandidates(prev => prev.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, status: newStatus }
          : candidate
      ));
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const handleViewProfile = (candidate) => {
    setSelectedCandidate(candidate);
    setShowCandidateModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#F59E0B'; // Orange
      case 'accepted': return '#10B981'; // Vert
      case 'rejected': return '#EF4444'; // Rouge
      default: return '#6B7280'; // Gris
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Accepté';
      case 'rejected': return 'Rejeté';
      default: return 'Inconnu';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return faClock;
      case 'accepted': return faCheck;
      case 'rejected': return faTimes;
      default: return faUser;
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.school.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <CompanyApprovalCheck 
      forumId={forum?.id} 
      apiBaseUrl={apiBaseUrl}
      fallbackMessage="L'accès aux candidatures n'est pas disponible car votre entreprise n'est pas encore approuvée pour ce forum."
    >
      <div className="offers-list-wrapper">
        <div className="offers-list-content">
          <div className="company-recruiters-header">
            <h2 className="company-recruiters-title">Candidatures reçues ({candidates.length})</h2>
          </div>

          <div className="candidates-filters">
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder="Rechercher un candidat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="status-filter">
              <FontAwesomeIcon icon={faFilter} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="accepted">Acceptés</option>
                <option value="rejected">Rejetés</option>
              </select>
            </div>
          </div>

          <div className="candidates-stats">
            <div className="stat-card">
              <div className="stat-number">{candidates.length}</div>
              <div className="stat-label">Total candidatures</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{candidates.filter(c => c.status === 'pending').length}</div>
              <div className="stat-label">En attente</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{candidates.filter(c => c.status === 'accepted').length}</div>
              <div className="stat-label">Acceptés</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{candidates.filter(c => c.status === 'rejected').length}</div>
              <div className="stat-label">Rejetés</div>
            </div>
          </div>

          <div className="candidates-list">
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
                Liste des candidatures
              </h3>
              <p style={{ fontSize: '1rem' }}>
                Les candidatures apparaîtront ici une fois que les candidats postuleront aux offres.
              </p>
            </div>
          </div>

      {/* Modal de détail du candidat */}
      {showCandidateModal && selectedCandidate && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Profil de {selectedCandidate.name}</h3>
              <button 
                className="btn-close"
                onClick={() => setShowCandidateModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="candidate-profile">
                <div className="profile-section">
                  <h4>Informations personnelles</h4>
                  <p><strong>Email :</strong> {selectedCandidate.email}</p>
                  <p><strong>Téléphone :</strong> {selectedCandidate.phone}</p>
                  <p><strong>École :</strong> {selectedCandidate.school}</p>
                  <p><strong>Expérience :</strong> {selectedCandidate.experience} an(s)</p>
                </div>
                
                <div className="profile-section">
                  <h4>Compétences</h4>
                  <div className="skills-list">
                    {selectedCandidate.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </CompanyApprovalCheck>
  );
};

export default VirtualCandidates;

import React, { useEffect, useState } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import CandidateProfile from '../../../candidate/profile/CandidateProfile';
import CompanyApprovalCheck from '../../../../utils/CompanyApprovalCheck';
import CandidateCard from '../../../../components/card/candidate/CandidateCard';
import Loading from '../../../../components/loyout/Loading';
import './RencontresList.css';
import { Button, Input, Card, Badge } from '../../../../components/common';

const RencontresList = ({ forumId, apiBaseUrl }) => {
  const [allCandidates, setAllCandidates] = useState([]); // Tous les candidats du forum
  const [meetings, setMeetings] = useState([]); // Candidats rencontrés
  const [searchResults, setSearchResults] = useState([]); // Résultats de recherche
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Charger tous les candidats du forum
  useEffect(() => {
    const fetchAllCandidates = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/forums/${forumId}/candidates/`, {
          withCredentials: true,
        });

        setAllCandidates(response.data);
      } catch (err) {
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (forumId) {
      fetchAllCandidates();
    }
  }, [forumId, apiBaseUrl]);

  // Charger les rencontres existantes
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/recruiters/meetings/candidates/?forum=${forumId}`, {
          withCredentials: true,
        });

        const formatted = response.data.map(entry => ({
          ...entry.candidate,
          search: entry.search,
        }));
        setMeetings(formatted);
      } catch (err) {
        console.error('Erreur lors du chargement des rencontres:', err);
      }
    };

    if (forumId) {
      fetchMeetings();
    }
  }, [forumId, apiBaseUrl]);

  // Rechercher parmi tous les candidats
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const term = searchTerm.toLowerCase();
    
    console.log('Recherche en cours:', {
      searchTerm: term,
      allCandidatesCount: allCandidates.length,
      meetingsCount: meetings.length,
      meetings: meetings.map(m => ({ id: m.id, public_token: m.public_token, name: `${m.first_name} ${m.last_name}` }))
    });
    
    // Filtrer les candidats qui ne sont pas déjà dans les rencontres
    const availableCandidates = allCandidates.filter(({ candidate }) => {
      // Vérifier si le candidat est déjà dans les rencontres
      const isAlreadyInMeetings = meetings.some(meeting => {
        // Comparer uniquement par public_token car les IDs sont undefined
        const isMatch = meeting.public_token === candidate.public_token;
        
        if (isMatch) {
          console.log('Candidat déjà dans les rencontres:', {
            candidate: `${candidate.first_name} ${candidate.last_name}`,
            candidateToken: candidate.public_token,
            meetingToken: meeting.public_token
          });
        }
        
        return isMatch;
      });
      
      if (isAlreadyInMeetings) return false;

      const fullName = `${candidate.first_name} ${candidate.last_name}`.toLowerCase();
      const email = candidate.email?.toLowerCase() || '';
      
      const matches = fullName.includes(term) || email.includes(term);
      if (matches) {
        console.log('Candidat trouvé dans la recherche:', `${candidate.first_name} ${candidate.last_name}`);
      }
      
      return matches;
    });

    console.log('Résultats de recherche:', availableCandidates.length);
    setSearchResults(availableCandidates);
    setIsSearching(false);
  }, [searchTerm, allCandidates, meetings]);

  // Ajouter un candidat aux rencontres
  const addToMeetings = async (candidate) => {
    try {
      const url = `${apiBaseUrl}/recruiters/meetings/candidates/add/`;
      const requestData = {
        candidate_public_token: candidate.public_token,
        forum_id: parseInt(forumId),
      };
      
      console.log('Tentative d\'ajout de rencontre:', {
        url,
        requestData,
        candidate_public_token: candidate.public_token,
        forum_id: forumId,
        candidate_object: candidate
      });

      // Vérifier que les données sont valides
      if (!requestData.candidate_public_token || !requestData.forum_id) {
        throw new Error('Données invalides: candidate_public_token ou forum_id manquant');
      }

      const response = await axios.post(url, requestData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('Réponse du serveur:', {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        headers: response.headers
      });

      console.log('Réponse de succès:', response.data);

      // Ajouter aux rencontres locales immédiatement
      setMeetings(prev => {
        const newMeetings = [...prev, candidate];
        console.log('Nouvelle liste des rencontres:', newMeetings.map(m => ({ id: m.id, public_token: m.public_token, name: `${m.first_name} ${m.last_name}` })));
        return newMeetings;
      });
      
      // Vider la recherche pour forcer la mise à jour
      setSearchTerm('');
      
      // Retirer des résultats de recherche
      setSearchResults(prev => {
        const filtered = prev.filter(item => item.candidate.public_token !== candidate.public_token);
        console.log('Résultats de recherche après ajout:', filtered.length);
        return filtered;
      });
      
      // Feedback visuel silencieux (optionnel)
      console.log('Candidat ajouté aux rencontres avec succès');
      
    } catch (err) {
      console.error('Erreur complète:', err);
      // Feedback d'erreur non bloquant
      console.error('Erreur lors de l\'ajout à la rencontre:', err.message);
    }
  };

  // Supprimer un candidat des rencontres
  const removeFromMeetings = async (candidate) => {
    try {
      // Retirer immédiatement des rencontres locales (optimistic update)
      setMeetings(prev => prev.filter(c => c.public_token !== candidate.public_token));
      
      await axios.delete(`${apiBaseUrl}/recruiters/meetings/candidates/${candidate.public_token}/remove/?forum=${forumId}`, {
        withCredentials: true,
      });
      
      // Forcer la mise à jour de la recherche si elle est active
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const availableCandidates = allCandidates.filter(({ candidate: cand }) => {
          const isAlreadyInMeetings = meetings.some(meeting => 
            meeting.public_token === cand.public_token
          );
          if (isAlreadyInMeetings) return false;

          const fullName = `${cand.first_name} ${cand.last_name}`.toLowerCase();
          const email = cand.email?.toLowerCase() || '';
          
          return fullName.includes(term) || email.includes(term);
        });
        setSearchResults(availableCandidates);
      }

      // Feedback visuel silencieux (optionnel)
      console.log('Candidat retiré des rencontres avec succès');
      
    } catch (err) {
      console.error('Erreur lors de la suppression de la rencontre:', err.message);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <CompanyApprovalCheck 
      forumId={forumId} 
      apiBaseUrl={apiBaseUrl}
      fallbackMessage="L'accès aux rencontres n'est pas disponible car votre entreprise n'est pas encore approuvée pour ce forum."
    >
      <div className="rencontres-list-wrapper">
        {/* Header avec titre principal */}
        <div className="rencontres-list-header">
          <div className="rencontres-list-header-left">
            <div className="rencontres-list-title-section">
              <h2 className="rencontres-list-main-title">
                Mes Rencontres
              </h2>
              <p className="rencontres-list-subtitle">
                Gérez vos rencontres avec les candidats du forum
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="rencontres-list-stats">
          <div className="rencontres-list-stat-item">
            <div className="rencontres-list-stat-content">
              <span className="rencontres-list-stat-number">{meetings.length}</span>
            </div>
            <span className="rencontres-list-stat-label">Rencontres</span>
          </div>
          <div className="rencontres-list-stat-item">
            <div className="rencontres-list-stat-content">
              <span className="rencontres-list-stat-number">{allCandidates.length}</span>
            </div>
            <span className="rencontres-list-stat-label">Candidats disponibles</span>
          </div>
          <div className="rencontres-list-stat-item">
            <div className="rencontres-list-stat-content">
              <span className="rencontres-list-stat-number">{searchResults.length}</span>
            </div>
            <span className="rencontres-list-stat-label">Résultats de recherche</span>
          </div>
        </div>

        {/* Section de recherche */}
        <div className="rencontres-list-search-section">
          <h3>Ajouter des candidats aux rencontres</h3>
          <div className="rencontres-list-search-bar">
            <FaSearch className="rencontres-list-search-icon" />
            <input
              type="text"
              placeholder="Rechercher un candidat par nom, prénom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rencontres-list-search-input"
            />
          </div>

          {/* Résultats de recherche */}
          {searchTerm && (
            <div className="rencontres-list-search-results">
              <h4>Résultats de recherche ({searchResults.length})</h4>
              {isSearching ? (
                <p>Recherche en cours...</p>
              ) : searchResults.length === 0 ? (
                <p>Aucun candidat trouvé ou tous les candidats sont déjà dans vos rencontres.</p>
              ) : (
                <div className="rencontres-list-search-cards">
                  {searchResults.map(({ candidate, search }, index) => (
                    <div className="rencontres-list-search-candidate-card" key={index}>
                      <CandidateCard
                        candidate={{ ...candidate, search }}
                        apiBaseUrl={apiBaseUrl}
                        onCandidateClick={null}
                        onRemoveFromMeetings={null}
                        showRemoveButton={false}
                        className="candidate-card"
                      />
                      <button
                        className="rencontres-list-add-meeting-btn"
                        onClick={() => addToMeetings(candidate)}
                        title="Ajouter aux rencontres"
                      >
                        <FaPlus />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section des rencontres */}
        <div className="rencontres-list-meetings-section">
          <h3>Mes rencontres programmées</h3>
          {meetings.length === 0 ? (
            <div className="rencontres-list-no-candidates">
              <p>Aucune rencontre programmée. Utilisez la recherche ci-dessus pour ajouter des candidats.</p>
            </div>
          ) : (
            <div className="rencontres-list-cards-container">
              {meetings.map((candidate, index) => (
                <CandidateCard
                  key={index}
                  candidate={candidate}
                  apiBaseUrl={apiBaseUrl}
                  onCandidateClick={setSelectedCandidate}
                  onRemoveFromMeetings={removeFromMeetings}
                  showRemoveButton={true}
                  className="candidate-card meeting-card"
                />
              ))}
            </div>
          )}
        </div>

        {selectedCandidate && (
          <CandidateProfile
            candidateData={selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
          />
        )}
      </div>
    </CompanyApprovalCheck>
  );
};

export default RencontresList;

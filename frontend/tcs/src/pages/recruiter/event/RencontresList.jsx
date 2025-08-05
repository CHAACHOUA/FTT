import React, { useEffect, useState } from 'react';
import { FaDownload, FaUserCircle, FaMapMarkerAlt, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import CandidateProfile from '../../candidate/CandidateProfile';
import './CandidateListRecruiter.css';

const RencontresList = ({ forumId, accessToken, apiBaseUrl }) => {
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
        const response = await fetch(`${apiBaseUrl}/api/forums/${forumId}/candidates/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des candidats');
        }

        const data = await response.json();
        setAllCandidates(data);
      } catch (err) {
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (forumId) {
      fetchAllCandidates();
    }
  }, [forumId, accessToken, apiBaseUrl]);

  // Charger les rencontres existantes
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/recruiters/meetings/candidates/?forum=${forumId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des rencontres');
        }

        const data = await response.json();
        const formatted = data.map(entry => ({
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
  }, [forumId, accessToken, apiBaseUrl]);

  // Rechercher parmi tous les candidats
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const term = searchTerm.toLowerCase();
    
    // Filtrer les candidats qui ne sont pas déjà dans les rencontres
    const availableCandidates = allCandidates.filter(({ candidate }) => {
      const isAlreadyInMeetings = meetings.some(meeting => meeting.id === candidate.id);
      if (isAlreadyInMeetings) return false;

      const fullName = `${candidate.first_name} ${candidate.last_name}`.toLowerCase();
      const email = candidate.email?.toLowerCase() || '';
      
      return fullName.includes(term) || email.includes(term);
    });

    setSearchResults(availableCandidates);
    setIsSearching(false);
  }, [searchTerm, allCandidates, meetings]);

  // Ajouter un candidat aux rencontres
  const addToMeetings = async (candidate) => {
    try {
      const url = `${apiBaseUrl}/api/recruiters/meetings/candidates/add/`;
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

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Réponse du serveur:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.log('Contenu de la réponse d\'erreur:', responseText);
        
        let errorMessage = 'Erreur lors de l\'ajout à la rencontre';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.detail || errorMessage;
          console.log('Données d\'erreur parsées:', errorData);
        } catch (e) {
          console.log('Impossible de parser la réponse JSON:', e);
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('Réponse de succès:', responseData);

      // Ajouter aux rencontres locales immédiatement
      setMeetings(prev => [...prev, candidate]);
      
      // Retirer des résultats de recherche
      setSearchResults(prev => prev.filter(item => item.candidate.public_token !== candidate.public_token));
      
      // Vider la recherche
      setSearchTerm('');
      
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
      
      const response = await fetch(`${apiBaseUrl}/api/recruiters/meetings/candidates/${candidate.public_token}/remove/?forum=${forumId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        // En cas d'erreur, remettre le candidat dans la liste
        setMeetings(prev => [...prev, candidate]);
        throw new Error(errorData.error || errorData.detail || 'Erreur lors de la suppression de la rencontre');
      }

      // Feedback visuel silencieux (optionnel)
      console.log('Candidat retiré des rencontres avec succès');
      
    } catch (err) {
      console.error('Erreur lors de la suppression de la rencontre:', err.message);
    }
  };

  if (loading) return <div>Chargement des rencontres...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="candidates-list">
      <div className="candidates-header">
        <h2>Mes rencontres - {meetings.length} candidat{meetings.length > 1 ? 's' : ''}</h2>
      </div>

      {/* Barre de recherche pour ajouter des candidats */}
      <div className="search-section">
        <h3>Ajouter des candidats aux rencontres</h3>
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un candidat par nom, prénom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Résultats de recherche */}
        {searchTerm && (
          <div className="search-results">
            <h4>Résultats de recherche ({searchResults.length})</h4>
            {isSearching ? (
              <p>Recherche en cours...</p>
            ) : searchResults.length === 0 ? (
              <p>Aucun candidat trouvé ou tous les candidats sont déjà dans vos rencontres.</p>
            ) : (
              <div className="search-cards">
                {searchResults.map(({ candidate, search }, index) => (
                  <div className="search-candidate-card" key={index}>
                    <div className="candidate-photo">
                      {candidate.profile_picture ? (
                        <img
                          src={
                            candidate.profile_picture.startsWith('http')
                              ? candidate.profile_picture
                              : `${apiBaseUrl}${candidate.profile_picture}`
                          }
                          alt={`${candidate.first_name} ${candidate.last_name}`}
                        />
                      ) : (
                        <FaUserCircle className="default-avatar" />
                      )}
                    </div>
                    <div className="candidate-info">
                      <h3>{candidate.first_name} {candidate.last_name}</h3>
                      {candidate.email && <p>{candidate.email}</p>}

                      <div className="sectors-container">
                        {(search?.sector?.length ?? 0) > 0
                          ? search.sector.map((sector, i) => (
                              <span key={i} className="sector-badge">{sector}</span>
                            ))
                          : <span className="sector-badge empty">Non renseigné</span>
                        }
                      </div>

                      <p className="region">
                        <FaMapMarkerAlt className="icon-location" />
                        {search?.region || 'Non renseignée'}
                      </p>
                    </div>
                    <button
                      className="add-meeting-btn"
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

      {/* Liste des rencontres */}
      <div className="meetings-section">
        <h3>Mes rencontres programmées</h3>
        {meetings.length === 0 ? (
          <div className="no-candidates">
            <p>Aucune rencontre programmée. Utilisez la recherche ci-dessus pour ajouter des candidats.</p>
          </div>
        ) : (
          <div className="cards-container">
            {meetings.map((candidate, index) => (
              <div className="candidate-card meeting-card" key={index}>
                <div className="candidate-photo">
                  {candidate.profile_picture ? (
                    <img
                      src={
                        candidate.profile_picture.startsWith('http')
                          ? candidate.profile_picture
                          : `${apiBaseUrl}${candidate.profile_picture}`
                      }
                      alt={`${candidate.first_name} ${candidate.last_name}`}
                    />
                  ) : (
                    <FaUserCircle className="default-avatar" />
                  )}
                </div>
                <div
                  className="candidate-info"
                  onClick={() => setSelectedCandidate(candidate)}
                  style={{ cursor: 'pointer' }}
                >
                  <h3>{candidate.first_name} {candidate.last_name}</h3>
                  {candidate.email && <p>{candidate.email}</p>}

                  <div className="sectors-container">
                    {(candidate.search?.sector?.length ?? 0) > 0
                      ? candidate.search.sector.map((sector, i) => (
                          <span key={i} className="sector-badge">{sector}</span>
                        ))
                      : <span className="sector-badge empty">Non renseigné</span>
                    }
                  </div>

                  <p className="region">
                    <FaMapMarkerAlt className="icon-location" />
                    {candidate.search?.region || 'Non renseignée'}
                  </p>
                </div>
                <div className="meeting-actions">
                  {candidate.cv_file && (
                    <a
                      className="cv-download"
                      href={
                        candidate.cv_file.startsWith('http')
                          ? candidate.cv_file
                          : `${apiBaseUrl}${candidate.cv_file}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Télécharger le CV"
                      onClick={e => e.stopPropagation()}
                    >
                      <FaDownload />
                    </a>
                  )}
                  <button
                    className="remove-meeting-btn"
                    onClick={() => removeFromMeetings(candidate)}
                    title="Retirer des rencontres"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
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
  );
};

export default RencontresList;

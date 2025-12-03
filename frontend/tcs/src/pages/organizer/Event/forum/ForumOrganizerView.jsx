import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ForumCard from '../../../../components/card/forum/ForumCard';
import SearchBar from '../../../../components/filters/offer/SearchBar';
import ForumCardRegistered from '../../../../components/card/forum/ForumCardRegistered';
import '../../../../pages/styles/forum/ForumList.css';
import { useAuth } from '../../../../context/AuthContext';
import Navbar from '../../../../components/loyout/NavBar';
import { FaSearch } from 'react-icons/fa';
import Loading from '../../../../components/loyout/Loading'; 
// import { getUserFromToken } from "../../context/decoder-jwt" // Fichier supprimé

const ForumOrganizerView = () => {
  const [registeredForums, setRegisteredForums] = useState([]);
  const [unregisteredForums, setUnregisteredForums] = useState([]);
  const [allForums, setAllForums] = useState([]);
  const [displayedForums, setDisplayedForums] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [statusFilter, setStatusFilter] = useState('ongoing');
  const { isAuthenticated, role, isAuthLoading } = useAuth();
  const API = process.env.REACT_APP_API_BASE_URL;

  const fetchForums = useCallback(async () => {
    try {
      setIsLoading(true);
      if (isAuthenticated) {
        const res = await axios.get(`${API}/forums/organizer/my-forums/`, {
          withCredentials: true
        });
        setRegisteredForums(res.data.organized || []);
        setUnregisteredForums(res.data.not_organized || []);
        setDisplayedForums(res.data.not_organized || []);
        console.log(res.data)
      } else if (!isAuthLoading) {
        // Seulement si l'authentification est complètement terminée et que l'utilisateur n'est pas connecté
        const res = await axios.get(`${API}/forums/`);
        setAllForums(res.data || []);
        setDisplayedForums(res.data || []);
      }
    } catch (err) {
      setError("Erreur lors du chargement des forums.");
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAuthLoading, API]);

  useEffect(() => {
    fetchForums();
  }, [fetchForums]);

  // Un forum est en cours/à venir si sa date de fin (avec heure) est dans le futur
  const isOngoing = forum => {
    if (!forum.end_date) return false;
    
    // Normaliser le format de la date (enlever l'heure si présente)
    let dateStr = forum.end_date;
    if (dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    }
    
    // Normaliser le format de l'heure (ajouter les secondes si manquantes)
    let timeStr = '23:59:59';
    if (forum.end_time) {
      const timeParts = forum.end_time.split(':');
      if (timeParts.length === 2) {
        // Format HH:MM -> ajouter :00 pour les secondes
        timeStr = `${timeParts[0]}:${timeParts[1]}:00`;
      } else if (timeParts.length === 3) {
        // Format HH:MM:SS -> utiliser tel quel
        timeStr = forum.end_time;
      }
    }
    
    const endDateTime = new Date(`${dateStr}T${timeStr}`);
    const now = new Date();
    
    // Vérifier que la date est valide
    if (isNaN(endDateTime.getTime())) {
      return false;
    }
    
    return endDateTime >= now;
  };
  
  // Un forum est terminé si sa date de fin (avec heure) est passée
  const isEnded = forum => {
    if (!forum.end_date) return false;
    
    // Normaliser le format de la date
    let dateStr = forum.end_date;
    if (dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    }
    
    // Normaliser le format de l'heure
    let timeStr = '23:59:59';
    if (forum.end_time) {
      const timeParts = forum.end_time.split(':');
      if (timeParts.length === 2) {
        timeStr = `${timeParts[0]}:${timeParts[1]}:00`;
      } else if (timeParts.length === 3) {
        timeStr = forum.end_time;
      }
    }
    
    const endDateTime = new Date(`${dateStr}T${timeStr}`);
    const now = new Date();
    
    if (isNaN(endDateTime.getTime())) {
      return false;
    }
    
    return endDateTime < now;
  };

  const filteredRegisteredForums = registeredForums.filter(forum =>
    statusFilter === 'ongoing' ? isOngoing(forum) : isEnded(forum)
  );

  // Calculer le nombre de forums en cours et terminés (basé sur date de fin)
  const ongoingCount = registeredForums.filter(forum => isOngoing(forum)).length;
  const endedCount = registeredForums.filter(forum => isEnded(forum)).length;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div style={{ paddingTop: '80px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
     <Navbar />

      <section className="forum-section">
        {error && <div className="error-message">{error}</div>}

        {!isAuthenticated && (
          <>
            <h2>Explorez nos forums</h2>
            <p>Accédez à nos évènements et rencontrez directement des recruteurs</p>
            <SearchBar
              forums={allForums}
              onSearch={setDisplayedForums}
            />
          </>
        )}

        {isAuthenticated ? (
          <>
            {registeredForums.length > 0 && (
              <>
                <div className="forum-header-line">
                  <h2>Vos événements</h2>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="status-dropdown"
                  >
                    <option value="ongoing" disabled={statusFilter !== 'ongoing' && ongoingCount === 0}>
                      En ce moment {ongoingCount > 0 && `(${ongoingCount})`}
                    </option>
                    <option value="ended" disabled={statusFilter !== 'ended' && endedCount === 0}>
                      Terminés {endedCount > 0 && `(${endedCount})`}
                    </option>
                  </select>
                </div>

                {filteredRegisteredForums.length > 0 ? (
                  <div className="forum-row">
                    {filteredRegisteredForums.map(forum => (
                      <ForumCardRegistered role={role}key={forum.id} forum={forum} />
                    ))}
                  </div>
                ) : (
                  <p>Vous n’avez aucun forum {statusFilter === 'ongoing' ? 'en cours' : 'terminé'}.</p>
                )}
              </>
            )}

            <>
              <h2>Explorez nos forums</h2>
              <p>Accédez à nos évènements et rencontrez directement des recruteurs</p>

              <SearchBar
                forums={unregisteredForums}
                onSearch={setDisplayedForums}
              />

              {unregisteredForums.length > 0 ? (
                displayedForums.length === 0 ? (
                  <div className="no-results-message">
                    <FaSearch className="no-results-icon" />
                    <p>Aucun forum ne correspond à votre recherche.</p>
                  </div>
                ) : (
                  <div className="forum-grid">
                    {displayedForums.map(forum => (
                      <ForumCard
                        key={forum.id}
                        role={role}
                        forum={forum}
                        isRegistered={false}
                        onRegistered={fetchForums}
                      />
                    ))}
                  </div>
                )
              ) : (
                <div className="no-results-message">
                  <FaSearch className="no-results-icon" />
                  <p>Aucun forum disponible pour le moment.</p>
                </div>
              )}
            </>
          </>
        ) : (
          displayedForums.length === 0 ? (
            <div className="no-results-message">
              <FaSearch className="no-results-icon" />
              <p>Aucun forum ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div className="forum-grid">
              {displayedForums.map(forum => (
                <ForumCard
                  key={forum.id}
                  forum={forum}
                  isRegistered={false}
                  onRegistered={fetchForums}
                />
              ))}
            </div>
          )
        )}
      </section>
    </div>
  
  );
};

export default ForumOrganizerView;

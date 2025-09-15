import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ForumCard from '../../components/forum/ForumCard';
import SearchBar from '../../components/forum/SearchBar';
import ForumCardRegistered from '../../components/forum/ForumCardRegistered';
import '../../pages/styles/forum/ForumList.css';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../common/NavBar';
import { FaSearch } from 'react-icons/fa';
import Loading from '../../pages/common/Loading'; 
// import { getUserFromToken } from "../../context/decoder-jwt" // Fichier supprimé

const ForumRecruiterView = () => {
  const [registeredForums, setRegisteredForums] = useState([]);
  const [unregisteredForums, setUnregisteredForums] = useState([]);
  const [allForums, setAllForums] = useState([]);
  const [displayedForums, setDisplayedForums] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [statusFilter, setStatusFilter] = useState('ongoing');
  const { isAuthenticated, role } = useAuth();
  const API = process.env.REACT_APP_API_BASE_URL;

  const fetchForums = useCallback(async () => {
    try {
      setIsLoading(true);
      if (isAuthenticated) {
        const res = await axios.get(`${API}/api/forums/recruiter/my-forums/`, {
          withCredentials: true
        });
        setRegisteredForums(res.data.registered || []);
        setUnregisteredForums(res.data.unregistered || []);
        setDisplayedForums(res.data.unregistered || []);
      } else {
        const res = await axios.get(`${API}/api/forums/`);
        setAllForums(res.data || []);
        setDisplayedForums(res.data || []);
      }
    } catch (err) {
      setError("Erreur lors du chargement des forums.");
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, API]);

  useEffect(() => {
    fetchForums();
  }, [fetchForums]);

  const isOngoing = forum => new Date(forum.start_date) >= new Date();
  const isEnded = forum => new Date(forum.start_date) < new Date();

  const filteredRegisteredForums = registeredForums.filter(forum =>
    statusFilter === 'ongoing' ? isOngoing(forum) : isEnded(forum)
  );

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
                    <option value="ongoing">En ce moment</option>
                    <option value="ended">Terminés</option>
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

            {unregisteredForums.length > 0 && (
              <>
                <h2>Explorez nos forums</h2>
                <p>Accédez à nos évènements et rencontrez directement des recruteurs</p>

                <SearchBar
                  forums={unregisteredForums}
                  onSearch={setDisplayedForums}
                />

                {displayedForums.length === 0 ? (
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
                )}
              </>
            )}
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

export default ForumRecruiterView;

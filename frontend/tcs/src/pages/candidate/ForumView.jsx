import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ForumCard from '../../components/forum/ForumCard';
import ForumCardRegistered from '../../components/forum/ForumCardRegistered';
import '../../pages/styles/forum/ForumList.css';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../common/NavBar';

const ForumView = () => {
  const [registeredForums, setRegisteredForums] = useState([]);
  const [unregisteredForums, setUnregisteredForums] = useState([]);
  const [allForums, setAllForums] = useState([]);
  const [error, setError] = useState(null);
  const { accessToken } = useAuth();
  const API = process.env.REACT_APP_API_BASE_URL;

  const fetchForums = useCallback(async () => {
    if (accessToken) {
      try {
        const response = await axios.get(`${API}/api/forums/candidate/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setRegisteredForums(response.data.registered);
        setUnregisteredForums(response.data.unregistered);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des forums inscrits :', err.message);
        setError("Erreur lors du chargement des forums.");
      }
    } else {
      try {
        const response = await axios.get(`${API}/api/forums/`);
        setAllForums(response.data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des forums :', err.message);
        setError("Erreur lors du chargement des forums.");
      }
    }
  }, [accessToken, API]);

  useEffect(() => {
    fetchForums();
  }, [fetchForums]);

  return (
    <div>
      <Navbar />
      <section className="forum-section">
        {error && <div className="error-message">{error}</div>}

        {accessToken ? (
          <>
            <div className="forum-row">
              {registeredForums.map(forum => (
                <ForumCardRegistered key={forum.id} forum={forum} />
              ))}
            </div>

            <div className="forum-grid">
              {unregisteredForums.map(forum => (
                <ForumCard
                  key={forum.id}
                  forum={forum}
                  isRegistered={false}
                  onRegistered={fetchForums} // ✅ pour actualiser les forums après inscription
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <h2>Liste des Forums</h2>
            <div className="forum-grid">
              {allForums.map(forum => (
                <ForumCard
                  key={forum.id}
                  forum={forum}
                  isRegistered={false}
                  onRegistered={fetchForums}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default ForumView;

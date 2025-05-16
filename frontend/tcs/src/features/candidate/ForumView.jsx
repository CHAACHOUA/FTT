""// ForumView.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ForumCard from '../forum/ForumCard';
import  ForumCardRegistered from'../forum/ForumCardRegistered'
import '../../features/styles/forum/ForumList.css';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../common/NavBar';

const ForumView = () => {
  const [registeredForums, setRegisteredForums] = useState([]);
  const [unregisteredForums, setUnregisteredForums] = useState([]);
  const [allForums, setAllForums] = useState([]);
  const [error, setError] = useState(null);
  const { accessToken } = useAuth();
  const API = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchForums = async () => {
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
        // Requête pour récupérer tous les forums s'il n'est pas connecté
        try {
          const response = await axios.get(`${API}/api/forums/`);
          setAllForums(response.data);
          setError(null);
        } catch (err) {
          console.error('Erreur lors de la récupération des forums :', err.message);
          setError("Erreur lors du chargement des forums.");
        }
      }
    };

    fetchForums();
  }, [accessToken]);

  return (
    <div>
      <Navbar />
      <section className="forum-section">
        {error && <div className="error-message">{error}</div>}

        {accessToken ? (
          <>
            <h2>Forums où vous êtes inscrit</h2>
            <div className="forum-row">
              {registeredForums.map(forum => (
                <ForumCardRegistered key={forum.id} forum={forum} isRegistered={true} />
              ))}
            </div>

            <h2>Autres forums</h2>
            <div className="forum-grid">
              {unregisteredForums.map(forum => (
                <ForumCard key={forum.id} forum={forum} isRegistered={false} />
              ))}
            </div>
          </>
        ) : (
          <>
            <h2>Liste des Forums</h2>
            <div className="forum-grid">
              {allForums.map(forum => (
                <ForumCard key={forum.id} forum={forum} isRegistered={false} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default ForumView;

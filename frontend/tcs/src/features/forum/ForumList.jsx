import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ForumCard from './ForumCard';
import '../../features/styles/forum/ForumList.css';  // Assure-toi d'importer le bon fichier CSS

const ForumList = () => {
  const [forums, setForums] = useState([]);
  const [error, setError] = useState(null);
const API = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    // Faire la requête GET vers l'API pour récupérer les forums
    axios.get(`${API}/api/forums/`)
      .then(res => {
        setForums(res.data);  // Met à jour la liste des forums
        setError(null);  // Réinitialiser l'erreur s'il n'y en a pas
      })
      .catch(err => {
        console.error('Erreur lors du chargement des forums', err);
        setError('Erreur lors du chargement des forums. Veuillez réessayer plus tard.');
      });
  }, []);

  return (
    <section className="forum-section">
   

      {error && <div className="error-message">{error}</div>} {/* Affiche l'erreur si elle existe */}

      <div className="forum-grid">
        {forums.length > 0 ? (
          forums.map(forum => (
            <ForumCard key={forum.id} forum={forum} />
          ))
        ) : (
          <p>Aucun forum disponible pour le moment.</p>
        )}
      </div>
    </section>
  );
};

export default ForumList;

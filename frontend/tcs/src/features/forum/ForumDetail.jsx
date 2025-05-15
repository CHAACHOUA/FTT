import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../../features/styles/forum/ForumDetail.css';

const ForumDetail = () => {
  const { id } = useParams(); // récupère l'id du forum dans l'URL
  const [forum, setForum] = useState(null);
  const [loading, setLoading] = useState(true);
  const API = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    axios.get(`${API}/api/forums/${id}/`)
      .then(res => {
        setForum(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur de récupération du forum:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Chargement...</p>;
  if (!forum) return <p>Forum introuvable.</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{forum.name}</h1>
      
      {forum.photo && (
        <img
          src={forum.photo}
          alt={forum.name}
          className="w-full h-64 object-cover rounded mb-6"
        />
      )}

      <p className="text-gray-600 mb-2"><strong>Date:</strong> {forum.date}</p>
      <p className="text-gray-600 mb-2"><strong>Type:</strong> {forum.type}</p>
      <p className="mb-6"><strong>Description:</strong> {forum.description}</p>

      {/* Organisateur */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Organisateur</h2>
        <p><strong>Nom:</strong> {forum.organizer.name}</p>
        <p><strong>Téléphone:</strong> {forum.organizer.phone_number}</p>
        {forum.organizer.logo && (
          <img
            src={forum.organizer.logo}
            alt={forum.organizer.name}
            className="w-32 mt-2"
          />
        )}
      </div>

      {/* Entreprises participantes */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Entreprises participantes</h2>
        {forum.companies.map((company, index) => (
          <div key={index} className="border p-4 rounded mb-6">
            <div className="flex items-center mb-2">
              {company.logo && (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-16 h-16 object-contain mr-4"
                />
              )}
              <h3 className="text-xl font-semibold">{company.name}</h3>
            </div>

            {/* Recruteurs */}
            <div>
              <h4 className="text-lg font-semibold mb-2">Recruteurs :</h4>
              {company.recruiters.length > 0 ? (
                company.recruiters.map((recruiter, rIndex) => (
                  <div key={rIndex} className="ml-4 mb-2">
                    <p>{recruiter.first_name} {recruiter.last_name}</p>
                    {recruiter.photo && (
                      <img
                        src={recruiter.photo}
                        alt={`${recruiter.first_name} ${recruiter.last_name}`}
                        className="w-16 h-16 rounded-full object-cover mt-1"
                      />
                    )}
                  </div>
                ))
              ) : (
                <p className="ml-4 text-gray-500">Aucun recruteur.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForumDetail;

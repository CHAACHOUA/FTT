import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/recruiter/CompanyRecruiter.css';
import recruiter_photo from '../../../assets/recruiter.jpg';

function Members({ accessToken, apiBaseUrl }) {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecruiters = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/recruiters/company-recruiters/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setRecruiters(response.data);
        console.log(response.data)
      } catch (err) {
        setError(err.response?.data?.detail || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchRecruiters();
  }, [accessToken, apiBaseUrl]);

  return (
    <div className="company-recruiters-section">
      <h2 className="company-recruiters-title">Vos recruteurs</h2>

      {loading && <p>Chargement...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && !recruiters.length && <p>Aucun recruteur trouvé.</p>}

      <div className="recruiters-grid">
        {recruiters.map((r) => (
          <div key={r.id} className="recruiter-card">
         <img
  src={r.profile_picture ? `${apiBaseUrl}${r.profile_picture}` : recruiter_photo}
  alt={`${r.first_name} ${r.last_name}`}
  className="recruiter-photo"
/>
            <p className="recruiter-name">
              {r.first_name} {r.last_name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Members;

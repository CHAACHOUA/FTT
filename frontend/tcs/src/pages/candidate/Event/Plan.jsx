// ✅ Plan.jsx
import React, { useState, useEffect } from 'react';
import '../../styles/forum/Plan.css';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const Plan = ({ companies, forumId }) => {
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedContract, setSelectedContract] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [candidateSearch, setCandidateSearch] = useState(null);
  const { accessToken } = useAuth();

  useEffect(() => {
    const fetchCandidateSearch = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/forums/candidate/${forumId}/search`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setCandidateSearch(response.data);
        setSelectedSector(response.data.sector || '');
        setSelectedContract(response.data.contract_type || '');
        setLocationTerm(response.data.region || '');
      } catch (error) {
        console.error('Erreur lors de la récupération des filtres du candidat:', error);
      }
    };

    if (accessToken) {
      fetchCandidateSearch();
    }
  }, [accessToken, forumId]);

  const allSectors = Array.from(new Set(companies.flatMap(c => c.sectors).filter(Boolean)));
  const allContractTypes = Array.from(new Set(companies.flatMap(c => c.offers).map(o => o.contract_type).filter(Boolean)));

  const companiesWithStand = companies.filter(c => c.stand);
  const filteredCompanies = companiesWithStand.filter(company => {
    const sectorMatch = !selectedSector || (company.sectors?.includes(selectedSector));
    const contractMatch = !selectedContract || company.offers?.some(o => o.contract_type === selectedContract);
    const nameMatch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const titleMatch = company.offers?.some(o => o.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const locationMatch = !locationTerm || company.offers?.some(o => o.location.toLowerCase().includes(locationTerm.toLowerCase()));
    return sectorMatch && contractMatch && (nameMatch || titleMatch) && locationMatch;
  });

  const timeEstimate = filteredCompanies.length * 10;

  return (
    <div className="plan-wrapper">
      <div className="plan-header">
        <div className="plan-header-left">
          <h3 className="plan-title">Plan du Forum</h3>

          <div className="stand-grid">
            {["A1","A2","A3","A4","A5","B1","B2","B3","B4","B5",
              "C1","C2","C3","C4","","D1","D2","D3","D4","D5",
              "E1","E2","E3","E4","F5","F1","F2","F3","F4","F5",
              "G1","G2","G3","G4","F5","F1","H2","H3","H4","H5",
              "I1","I2","I3","I4","I5","J1","J2","J3","J4","J5"]
              .map((stand) => {
                const isCorridor = /^F\d$/.test(stand);
                const companyIndex = filteredCompanies.findIndex(c => c.stand === stand);
                return (
                  <div
                    key={stand}
                    className={`stand-cell ${companyIndex !== -1 ? 'path-step' : ''} ${isCorridor ? 'corridor' : ''}`}
                  >
                    {!isCorridor && <div className="stand-label">{stand}</div>}
                    {companyIndex !== -1 && !isCorridor && (
                      <div className="stand-step-number">{companyIndex + 1}</div>
                    )}
                  </div>
                );
              })}
            <div className="stand-cell entry">
              <div className="stand-label">J1</div>
              <div className="entry-label">ENTRÉE</div>
            </div>
          </div>
        </div>

        <div className="plan-header-right">
          <h3 className="plan-title">Filtres candidats</h3>
          <div className="filter-block">
            <label>Secteur :</label>
            <select value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)} className="filter-select">
              <option value="">Tous</option>
              {allSectors.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-block">
            <label>Type de contrat :</label>
            <select value={selectedContract} onChange={(e) => setSelectedContract(e.target.value)} className="filter-select">
              <option value="">Tous</option>
              {allContractTypes.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="filter-block">
            <label>Nom d'entreprise ou poste :</label>
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="filter-select" placeholder="Recherche..." />
          </div>
          <div className="filter-block">
            <label>Localisation :</label>
            <input type="text" value={locationTerm} onChange={(e) => setLocationTerm(e.target.value)} className="filter-select" placeholder="Ville..." />
          </div>
          <div className="time-estimate">
            ⏱️ Temps estimé : <strong>{timeEstimate} minutes</strong>
          </div>
        </div>
      </div>

      <div className="plan-bottom">
        <h3 className="plan-title">Votre Parcours Personnalisé</h3>
        {filteredCompanies.map((company, idx) => (
          <div key={idx} className="company-step-card">
            <div className="step-number">{idx + 1}</div>
            <div className="company-info">
              <h4>{company.name}</h4>
              <p>Stand {company.stand}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plan;

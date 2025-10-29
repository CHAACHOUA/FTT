import React, { useState, useEffect } from 'react';
import './SearchBar.css';
import { FaSearch, FaTimes, FaChevronDown } from 'react-icons/fa';
import { Badge, Button, Card, Input } from '../../common';
// import { getSectorsForSelect, getContractsForSelect } from '../../../constants/choices'; // Plus utilisé
import axios from 'axios';

const RecruiterOfferFilters = ({ offers = [], onFilter }) => {
  console.log('RecruiterOfferFilters props:', { offers, onFilter }); // Debug log
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContracts, setSelectedContracts] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [selectedRecruiters, setSelectedRecruiters] = useState([]);
  const [showContractDropdown, setShowContractDropdown] = useState(false);
  const [showSectorDropdown, setShowSectorDropdown] = useState(false);
  const [showRecruiterDropdown, setShowRecruiterDropdown] = useState(false);
  const [contractOptions, setContractOptions] = useState([]);
  const [sectorOptions, setSectorOptions] = useState([]);
  const [recruiterOptions, setRecruiterOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Supprimé le chargement initial des choix statiques
  // Les options sont maintenant générées dynamiquement depuis les offres

  // Charger les recruteurs depuis les offres (pas depuis l'API séparée)
  useEffect(() => {
    console.log('Processing offers for recruiters:', offers); // Debug log
    
    if (offers && offers.length > 0) {
      const recruiterMap = {};
      
      // Compter les offres par recruteur
      offers.forEach(offer => {
        console.log('Processing offer:', offer.title, 'recruiter:', offer.recruiter); // Debug log
        
        if (offer.recruiter && offer.recruiter.id) {
          const recruiterId = offer.recruiter.id;
          const recruiterName = `${offer.recruiter.first_name || ''} ${offer.recruiter.last_name || ''}`.trim();
          
          if (!recruiterMap[recruiterId]) {
            recruiterMap[recruiterId] = {
              value: recruiterId,
              label: recruiterName || `Recruteur ${recruiterId}`,
              count: 0
            };
          }
          recruiterMap[recruiterId].count++;
        }
      });
      
      const recruiters = Object.values(recruiterMap);
      console.log('Recruiters from offers:', recruiters); // Debug log
      setRecruiterOptions(recruiters);
    } else {
      console.log('No offers or empty offers array'); // Debug log
      setRecruiterOptions([]);
    }
  }, [offers]);

  useEffect(() => {
    console.log('Offers received in filter:', offers); // Debug log
    
    const contracts = {};
    const sectors = {};

    offers.forEach(offer => {
      const contract = offer.contract_type?.trim();
      const sector = offer.sector?.trim();

      console.log('Processing offer:', offer.title, 'contract:', contract, 'sector:', sector); // Debug log

      if (contract) contracts[contract] = (contracts[contract] || 0) + 1;
      if (sector) sectors[sector] = (sectors[sector] || 0) + 1;
    });

    console.log('Counts calculated:', { contracts, sectors }); // Debug log

    // Créer des options dynamiques basées sur les vraies valeurs des offres
    const dynamicContractOptions = Object.keys(contracts).map(contract => ({
      value: contract,
      label: contract,
      count: contracts[contract]
    }));

    const dynamicSectorOptions = Object.keys(sectors).map(sector => ({
      value: sector,
      label: sector,
      count: sectors[sector]
    }));

    console.log('Dynamic options:', { dynamicContractOptions, dynamicSectorOptions }); // Debug log

    // Mettre à jour les options avec les vraies valeurs
    setContractOptions(dynamicContractOptions);
    setSectorOptions(dynamicSectorOptions);
  }, [offers]);

  const toggleValue = (value, list, setList) => {
    setList(
      list.includes(value)
        ? list.filter(v => v !== value)
        : [...list, value]
    );
  };

  const handleFilter = () => {
    console.log('Filtering with:', { searchTerm, selectedContracts, selectedSectors, selectedRecruiters }); // Debug log
    
    const filtered = offers.filter(offer => {
      const titleMatch = !searchTerm || offer.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const contractMatch = selectedContracts.length === 0 || selectedContracts.includes(offer.contract_type);
      const sectorMatch = selectedSectors.length === 0 || selectedSectors.includes(offer.sector);
      const recruiterMatch = selectedRecruiters.length === 0 || selectedRecruiters.includes(offer.recruiter?.id);
      
      console.log('Offer filtering:', { 
        offer: offer.title, 
        titleMatch, 
        contractMatch, 
        sectorMatch, 
        recruiterMatch,
        passes: titleMatch && contractMatch && sectorMatch && recruiterMatch
      }); // Debug log
      
      return titleMatch && contractMatch && sectorMatch && recruiterMatch;
    });

    console.log('Filtered results:', filtered.length); // Debug log
    onFilter(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [searchTerm, selectedContracts, selectedSectors, selectedRecruiters]);

  return (
    <div className="search-bar-wrapper-search">
      <div className="search-bar-search">
        <input
          className="search-input-search"
          type="text"
          placeholder="Intitulé du poste ou mot-clé"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {searchTerm && <FaTimes className="clear-icon-search" onClick={() => setSearchTerm('')} />}

        {/* Dropdown contrat */}
        <div className="dropdown-wrapper-search">
          <button className={`dropdown-toggle-search ${showContractDropdown ? 'active' : ''}`} onClick={() => {
            setShowContractDropdown(!showContractDropdown);
            setShowSectorDropdown(false);
            setShowRecruiterDropdown(false);
          }}>
            Contrat <FaChevronDown />
            {selectedContracts.length > 0 && (
              <Badge type="counter" size="small">{selectedContracts.length}</Badge>
            )}
          </button>
          {showContractDropdown && (
            <div className="dropdown-menu-search">
              <div style={{ padding: '8px 16px', borderBottom: '1px solid #e5e7eb', marginBottom: '8px' }}>
                <strong style={{ color: '#374151', fontSize: '0.9rem' }}>Types de contrats</strong>
              </div>
              {contractOptions.map((contract) => (
                <label key={contract.value} className="dropdown-item-search">
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={selectedContracts.includes(contract.value)}
                      onChange={() => toggleValue(contract.value, selectedContracts, setSelectedContracts)}
                      style={{ marginRight: '12px' }}
                    />
                    <span style={{ flex: 1 }}>{contract.label}</span>
                  </div>
                  <span className="count-search">{contract.count || 0}</span>
                </label>
              ))}
              {selectedContracts.length > 0 && (
                <div style={{ padding: '8px 16px', borderTop: '1px solid #e5e7eb', marginTop: '8px' }}>
                  <button
                    onClick={() => setSelectedContracts([])}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Effacer la sélection
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dropdown secteur */}
        <div className="dropdown-wrapper-search">
          <button className={`dropdown-toggle-search ${showSectorDropdown ? 'active' : ''}`} onClick={() => {
            setShowSectorDropdown(!showSectorDropdown);
            setShowContractDropdown(false);
            setShowRecruiterDropdown(false);
          }}>
            Secteur <FaChevronDown />
            {selectedSectors.length > 0 && (
              <Badge type="counter" size="small">{selectedSectors.length}</Badge>
            )}
          </button>
          {showSectorDropdown && (
            <div className="dropdown-menu-search">
              <div style={{ padding: '8px 16px', borderBottom: '1px solid #e5e7eb', marginBottom: '8px' }}>
                <strong style={{ color: '#374151', fontSize: '0.9rem' }}>Secteurs d'activité</strong>
              </div>
              {sectorOptions.map((sector) => (
                <label key={sector.value} className="dropdown-item-search">
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={selectedSectors.includes(sector.value)}
                      onChange={() => toggleValue(sector.value, selectedSectors, setSelectedSectors)}
                      style={{ marginRight: '12px' }}
                    />
                    <span style={{ flex: 1 }}>{sector.label}</span>
                  </div>
                  <span className="count-search">{sector.count || 0}</span>
                </label>
              ))}
              {selectedSectors.length > 0 && (
                <div style={{ padding: '8px 16px', borderTop: '1px solid #e5e7eb', marginTop: '8px' }}>
                  <button
                    onClick={() => setSelectedSectors([])}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Effacer la sélection
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dropdown recruteur */}
        <div className="dropdown-wrapper-search">
          <button className={`dropdown-toggle-search ${showRecruiterDropdown ? 'active' : ''}`} onClick={() => {
            setShowRecruiterDropdown(!showRecruiterDropdown);
            setShowContractDropdown(false);
            setShowSectorDropdown(false);
          }}>
            Recruteur <FaChevronDown />
            {selectedRecruiters.length > 0 && (
              <Badge type="counter" size="small">{selectedRecruiters.length}</Badge>
            )}
          </button>
          {showRecruiterDropdown && (
            <div className="dropdown-menu-search">
              <div style={{ padding: '8px 16px', borderBottom: '1px solid #e5e7eb', marginBottom: '8px' }}>
                <strong style={{ color: '#374151', fontSize: '0.9rem' }}>Membres de l'équipe</strong>
              </div>
              {recruiterOptions.length > 0 ? (
                recruiterOptions.map((recruiter) => (
                  <label key={recruiter.value} className="dropdown-item-search">
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={selectedRecruiters.includes(recruiter.value)}
                        onChange={() => toggleValue(recruiter.value, selectedRecruiters, setSelectedRecruiters)}
                        style={{ marginRight: '12px' }}
                      />
                      <span style={{ flex: 1 }}>{recruiter.label}</span>
                    </div>
                    <span className="count-search">{recruiter.count || 0}</span>
                  </label>
                ))
              ) : (
                <div style={{ padding: '12px 16px', color: '#6b7280', fontSize: '0.9rem' }}>
                  {offers && offers.length > 0 ? 'Aucun membre trouvé dans les offres' : 'Chargement des offres...'}
                </div>
              )}
              {selectedRecruiters.length > 0 && (
                <div style={{ padding: '8px 16px', borderTop: '1px solid #e5e7eb', marginTop: '8px' }}>
                  <button
                    onClick={() => setSelectedRecruiters([])}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Effacer la sélection
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button className="search-btn-search" onClick={handleFilter}>
          <FaSearch />
        </button>
      </div>
    </div>
  );
};

export default RecruiterOfferFilters;

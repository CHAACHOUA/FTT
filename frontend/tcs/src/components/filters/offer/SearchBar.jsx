import React, { useState, useEffect } from 'react';
import './SearchBar.css';
import { FaSearch, FaTimes, FaChevronDown } from 'react-icons/fa';
import { Badge, Button, Card, Input } from '../../common';
import { getSectorsForSelect, getContractsForSelect } from '../../../constants/choices';

const SearchBar = ({ forums, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContracts, setSelectedContracts] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [showContractDropdown, setShowContractDropdown] = useState(false);
  const [showSectorDropdown, setShowSectorDropdown] = useState(false);
  const [contractCounts, setContractCounts] = useState({});
  const [sectorCounts, setSectorCounts] = useState({});
  const [contractOptions, setContractOptions] = useState([]);
  const [sectorOptions, setSectorOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChoices = async () => {
      try {
        setLoading(true);
        const [contractsData, sectorsData] = await Promise.all([
          getContractsForSelect(),
          getSectorsForSelect()
        ]);
        setContractOptions(contractsData);
        setSectorOptions(sectorsData);
      } catch (error) {
        console.error('Erreur lors du chargement des choix:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChoices();
  }, []);

  useEffect(() => {
    const contracts = {};
    const sectors = {};

    // Initialiser à 0 toutes les options
    contractOptions.forEach(c => contracts[c.value] = 0);
    sectorOptions.forEach(s => sectors[s.value] = 0);

    // Compter dans toutes les offres
    forums.forEach(forum => {
      forum.companies?.forEach(company => {
        company.offers?.forEach(offer => {
          const contract = offer.contract_type?.trim();
          const sector = offer.sector?.trim();
          if (contract && contracts.hasOwnProperty(contract)) {
            contracts[contract]++;
          }
          if (sector && sectors.hasOwnProperty(sector)) {
            sectors[sector]++;
          }
        });
      });
    });

    setContractCounts(contracts);
    setSectorCounts(sectors);
  }, [forums, contractOptions, sectorOptions]);

  const handleSearch = () => {
    const filtered = forums.filter(forum => {
      const keywordMatch =
        !searchTerm ||
        forum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        forum.organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        forum.companies?.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const contractMatch =
        selectedContracts.length === 0 ||
        forum.companies?.some(c =>
          c.offers?.some(o => selectedContracts.includes(o.contract_type))
        );

      const sectorMatch =
        selectedSectors.length === 0 ||
        forum.companies?.some(c =>
          c.offers?.some(o => selectedSectors.includes(o.sector))
        );

      return keywordMatch && contractMatch && sectorMatch;
    });

    onSearch(filtered);
  };

  const toggleValue = (list, value, setter) => {
    setter(
      list.includes(value)
        ? list.filter(v => v !== value)
        : [...list, value]
    );
  };

  return (
    <div className="search-bar-wrapper-search">
      <div className="search-bar-search">
        <input
          className="search-input-search"
          type="text"
          placeholder="Cherchez un job par intitulé, mot clé ou entreprise"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <FaTimes className="clear-icon-search" onClick={() => setSearchTerm('')} />
        )}

        {/* Contrats */}
        <div className="dropdown-wrapper-search">
          <button
            className="dropdown-toggle-search"
            onClick={() => {
              setShowContractDropdown(prev => !prev);
              setShowSectorDropdown(false);
            }}
          >
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
              {contractOptions.map(contract => (
                <label key={contract.value} className="dropdown-item-search">
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={selectedContracts.includes(contract.value)}
                      onChange={() =>
                        toggleValue(selectedContracts, contract.value, setSelectedContracts)
                      }
                      style={{ marginRight: '12px' }}
                    />
                    <span style={{ flex: 1 }}>{contract.label}</span>
                  </div>
                  <span className="count-search">{contractCounts[contract.value] || 0}</span>
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

        {/* Secteurs */}
        <div className="dropdown-wrapper-search">
          <button
            className="dropdown-toggle-search"
            onClick={() => {
              setShowSectorDropdown(prev => !prev);
              setShowContractDropdown(false);
            }}
          >
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
              {sectorOptions.map(sector => (
                <label key={sector.value} className="dropdown-item-search">
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={selectedSectors.includes(sector.value)}
                      onChange={() =>
                        toggleValue(selectedSectors, sector.value, setSelectedSectors)
                      }
                      style={{ marginRight: '12px' }}
                    />
                    <span style={{ flex: 1 }}>{sector.label}</span>
                  </div>
                  <span className="count-search">{sectorCounts[sector.value] || 0}</span>
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

        <button className="search-btn-search" onClick={handleSearch}>
          <FaSearch />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;

import React, { useState, useEffect } from 'react';
import './SearchBar.css';
import { FaSearch, FaTimes, FaChevronDown } from 'react-icons/fa';

const FIXED_CONTRACTS = ['CDI', 'CDD', 'Stage', 'Alternance'];
const FIXED_SECTORS = ['IT', 'Finance', 'Marketing', 'RH', 'Autre'];

const SearchBar = ({ forums, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContracts, setSelectedContracts] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [showContractDropdown, setShowContractDropdown] = useState(false);
  const [showSectorDropdown, setShowSectorDropdown] = useState(false);
  const [contractCounts, setContractCounts] = useState({});
  const [sectorCounts, setSectorCounts] = useState({});

  useEffect(() => {
    const contracts = {};
    const sectors = {};

    // Initialiser à 0 toutes les options fixées
    FIXED_CONTRACTS.forEach(c => contracts[c] = 0);
    FIXED_SECTORS.forEach(s => sectors[s] = 0);

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
  }, [forums]);

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
              <span className="counter-badge-search">{selectedContracts.length}</span>
            )}
          </button>
          {showContractDropdown && (
            <div className="dropdown-menu-search">
              {FIXED_CONTRACTS.map(contract => (
                <label key={contract} className="dropdown-item-search">
                  <input
                    type="checkbox"
                    checked={selectedContracts.includes(contract)}
                    onChange={() =>
                      toggleValue(selectedContracts, contract, setSelectedContracts)
                    }
                  />
                  {contract}
                  <span className="count-search">{contractCounts[contract] || 0}</span>
                </label>
              ))}
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
              <span className="counter-badge-search">{selectedSectors.length}</span>
            )}
          </button>
          {showSectorDropdown && (
            <div className="dropdown-menu-search">
              {FIXED_SECTORS.map(sector => (
                <label key={sector} className="dropdown-item-search">
                  <input
                    type="checkbox"
                    checked={selectedSectors.includes(sector)}
                    onChange={() =>
                      toggleValue(selectedSectors, sector, setSelectedSectors)
                    }
                  />
                  {sector}
                  <span className="count-search">{sectorCounts[sector] || 0}</span>
                </label>
              ))}
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

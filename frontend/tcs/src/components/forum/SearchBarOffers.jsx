import React, { useState, useEffect } from 'react';
import './SearchBar.css';
import { FaSearch, FaTimes, FaChevronDown } from 'react-icons/fa';

const SearchBarOffers = ({ offers, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContracts, setSelectedContracts] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [showContractDropdown, setShowContractDropdown] = useState(false);
  const [showSectorDropdown, setShowSectorDropdown] = useState(false);
  const [contractOptions, setContractOptions] = useState([]);
  const [sectorOptions, setSectorOptions] = useState([]);

  useEffect(() => {
    const contracts = {};
    const sectors = {};

    offers.forEach(offer => {
      const contract = offer.contract_type?.trim();
      const sector = offer.sector?.trim();

      if (contract) contracts[contract] = (contracts[contract] || 0) + 1;
      if (sector) sectors[sector] = (sectors[sector] || 0) + 1;
    });

    setContractOptions(Object.entries(contracts));
    setSectorOptions(Object.entries(sectors));
  }, [offers]);

  const toggleValue = (value, list, setList) => {
    setList(
      list.includes(value)
        ? list.filter(v => v !== value)
        : [...list, value]
    );
  };

  const handleFilter = () => {
    const filtered = offers.filter(offer => {
      const titleMatch = !searchTerm || offer.title.toLowerCase().includes(searchTerm.toLowerCase());
      const contractMatch = selectedContracts.length === 0 || selectedContracts.includes(offer.contract_type);
      const sectorMatch = selectedSectors.length === 0 || selectedSectors.includes(offer.sector);
      return titleMatch && contractMatch && sectorMatch;
    });

    onFilter(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [searchTerm, selectedContracts, selectedSectors]);

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
          <button className="dropdown-toggle-search" onClick={() => {
            setShowContractDropdown(!showContractDropdown);
            setShowSectorDropdown(false);
          }}>
            Contrat <FaChevronDown />
            {selectedContracts.length > 0 && (
              <span className="counter-badge-search">{selectedContracts.length}</span>
            )}
          </button>
          {showContractDropdown && (
            <div className="dropdown-menu-search">
              {contractOptions.map(([contract, count]) => (
                <label key={contract} className="dropdown-item-search">
                  <input
                    type="checkbox"
                    checked={selectedContracts.includes(contract)}
                    onChange={() => toggleValue(contract, selectedContracts, setSelectedContracts)}
                  />
                  {contract} <span className="count-search">{count}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown secteur */}
        <div className="dropdown-wrapper-search">
          <button className="dropdown-toggle-search" onClick={() => {
            setShowSectorDropdown(!showSectorDropdown);
            setShowContractDropdown(false);
          }}>
            Secteur <FaChevronDown />
            {selectedSectors.length > 0 && (
              <span className="counter-badge-search">{selectedSectors.length}</span>
            )}
          </button>
          {showSectorDropdown && (
            <div className="dropdown-menu-search">
              {sectorOptions.map(([sector, count]) => (
                <label key={sector} className="dropdown-item-search">
                  <input
                    type="checkbox"
                    checked={selectedSectors.includes(sector)}
                    onChange={() => toggleValue(sector, selectedSectors, setSelectedSectors)}
                  />
                  {sector} <span className="count-search">{count}</span>
                </label>
              ))}
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

export default SearchBarOffers;

import React, { useState, useEffect } from 'react';
import './SearchBar.css';
import { FaSearch, FaTimes, FaChevronDown } from 'react-icons/fa';
import { Badge, Button, Card, Input } from '../../common';
import { getSectorsForSelect, getContractsForSelect } from '../../../constants/choices';

const SearchBarOffers = ({ offers, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContracts, setSelectedContracts] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [showContractDropdown, setShowContractDropdown] = useState(false);
  const [showSectorDropdown, setShowSectorDropdown] = useState(false);
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

    offers.forEach(offer => {
      const contract = offer.contract_type?.trim();
      const sector = offer.sector?.trim();

      if (contract) contracts[contract] = (contracts[contract] || 0) + 1;
      if (sector) sectors[sector] = (sectors[sector] || 0) + 1;
    });

    // Mettre à jour les compteurs pour les options standardisées
    setContractOptions(prev => prev.map(opt => ({
      ...opt,
      count: contracts[opt.value] || 0
    })));
    setSectorOptions(prev => prev.map(opt => ({
      ...opt,
      count: sectors[opt.value] || 0
    })));
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
          <button className="dropdown-toggle-search" onClick={() => {
            setShowSectorDropdown(!showSectorDropdown);
            setShowContractDropdown(false);
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

        <button className="search-btn-search" onClick={handleFilter}>
          <FaSearch />
        </button>
      </div>
    </div>
  );
};

export default SearchBarOffers;

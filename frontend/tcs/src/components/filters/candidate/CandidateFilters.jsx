import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import './CandidatesFilters.css';
import { getSectorsForSelect, getContractsForSelect, getRegionsForSelect, getLanguagesForSelect } from '../../../constants/choices';
import { Button, Input, Card, Badge } from '../../common';

export default function CandidateFilters({ filters, onChange, options }) {
  const [expandedSections, setExpandedSections] = useState({});
  const [contractTypeOptions, setContractTypeOptions] = useState([]);
  const [sectorOptions, setSectorOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helpers pour react-select
  const mapOptions = arr => arr?.map(opt => ({ value: opt, label: opt })) || [];
  const getValue = (arr, opts) => opts.filter(o => arr?.includes(o.value));

  // Charger les choix depuis l'API
  useEffect(() => {
    const loadChoices = async () => {
      try {
        setLoading(true);
        const [contractsData, sectorsData, regionsData, languagesData] = await Promise.all([
          getContractsForSelect(),
          getSectorsForSelect(),
          getRegionsForSelect(),
          getLanguagesForSelect()
        ]);
        setContractTypeOptions(contractsData);
        setSectorOptions(sectorsData);
        setRegionOptions(regionsData);
        setLanguageOptions(languagesData);
      } catch (error) {
        console.error('Erreur lors du chargement des choix:', error);
        // Fallback vers les options locales
        setContractTypeOptions(mapOptions(options.contract_type));
        setSectorOptions(mapOptions(options.sector));
        setRegionOptions(mapOptions(options.region));
        setLanguageOptions(mapOptions(options.languages));
      } finally {
        setLoading(false);
      }
    };

    loadChoices();
  }, [options.contract_type, options.sector, options.region, options.languages]);

  // Toggle section expansion
  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Reset
  const handleReset = () => {
    onChange({});
    setExpandedSections({});
  };


  const filterSections = [
    {
      name: 'RECHERCHE',
      key: 'search',
      content: (
        <input
          type="text"
          placeholder="Nom, prénom ou email..."
          value={filters.text || ''}
          onChange={e => onChange({ ...filters, text: e.target.value })}
          className="filter-input"
        />
      )
    },
    {
      name: 'TYPE DE CONTRAT',
      key: 'contract',
      content: (
        <Select
          isMulti
          options={contractTypeOptions}
          value={getValue(filters.contract_type, contractTypeOptions)}
          onChange={selected => onChange({ ...filters, contract_type: selected ? selected.map(o => o.value) : [] })}
          placeholder="Sélectionner..."
          classNamePrefix="react-select"
        />
      )
    },
    {
      name: 'SECTEUR D\'ACTIVITÉ',
      key: 'sector',
      content: (
        <Select
          isMulti
          options={sectorOptions}
          value={getValue(filters.sector, sectorOptions)}
          onChange={selected => onChange({ ...filters, sector: selected ? selected.map(o => o.value) : [] })}
          placeholder="Sélectionner..."
          classNamePrefix="react-select"
        />
      )
    },
    {
      name: 'EXPÉRIENCE',
      key: 'experience',
      content: (
        <select
          value={filters.experience || ''}
          onChange={e => onChange({ ...filters, experience: e.target.value })}
          className="filter-select"
        >
          <option value="">Toutes</option>
          {options.experience?.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )
    },
     {
       name: 'RÉGION',
       key: 'region',
       content: (
         <Select
           isMulti
           options={regionOptions}
           value={getValue(filters.region, regionOptions)}
           onChange={selected => onChange({ ...filters, region: selected ? selected.map(o => o.value) : [] })}
           placeholder="Sélectionner..."
           classNamePrefix="react-select"
         />
       )
     },
     {
       name: 'LANGUES',
       key: 'languages',
       content: (
         <Select
           isMulti
           options={languageOptions}
           value={getValue(filters.languages, languageOptions)}
           onChange={selected => onChange({ ...filters, languages: selected ? selected.map(o => o.value) : [] })}
           placeholder="Sélectionner..."
           classNamePrefix="react-select"
         />
       )
     },
    {
      name: 'COMPÉTENCES',
      key: 'skills',
      content: (
        <input
          type="text"
          placeholder="Compétence (ex: Python, Marketing...)"
          value={filters.skills || ''}
          onChange={e => onChange({ ...filters, skills: e.target.value })}
          className="filter-input"
        />
      )
    },
    {
      name: 'RQTH',
      key: 'rqth',
      content: (
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={!!filters.rqth}
              onChange={e => onChange({ ...filters, rqth: e.target.checked })}
            />
            <span>RQTH uniquement</span>
          </label>
        </div>
      )
    },
    {
      name: 'CV DISPONIBLE',
      key: 'cv',
      content: (
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={!!filters.cv_only}
              onChange={e => onChange({ ...filters, cv_only: e.target.checked })}
            />
            <span>Avec CV uniquement</span>
          </label>
        </div>
      )
    }
  ];

  return (
    <div className="candidate-filters-dropdown">
      {/* Header */}
      <div className="filters-header">
        <button className="organizer-btn-clear-filters" onClick={handleReset}>
          Réinitialiser
        </button>
      </div>

      {/* Filter Sections */}
      <div className="filters-sections">
        {filterSections.map((section) => (
          <div key={section.key} className="filter-section">
            <div 
              className="filter-section-header"
              onClick={() => toggleSection(section.key)}
            >
              <span className="section-label">{section.name}</span>
              <FontAwesomeIcon 
                icon={expandedSections[section.key] ? faChevronUp : faChevronDown} 
                className="section-icon"
              />
            </div>
            
            {expandedSections[section.key] && (
              <div className="filter-section-content">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 
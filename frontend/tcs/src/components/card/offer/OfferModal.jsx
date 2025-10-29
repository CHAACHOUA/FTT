import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import { getSectorsForSelect, getContractsForSelect, getRegionsForSelect } from '../../../constants/choices';
import { FaBriefcase, FaIndustry, FaMapMarkerAlt, FaFileAlt, FaUser, FaCalendarAlt, FaClock, FaFlag } from 'react-icons/fa';
import Loading from '../../loyout/Loading';
import { Button, Input, Card, Badge } from '../../common';
const OfferModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    contract_type: '',
    sector: '',
    region: '',
    description: '',
    profile_recherche: '',
    status: 'draft',
    start_date: '',
    experience_required: '1-3',
  });
  const [sectors, setSectors] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChoices = async () => {
      try {
        setLoading(true);
        const [sectorsData, contractsData, regionsData] = await Promise.all([
          getSectorsForSelect(),
          getContractsForSelect(),
          getRegionsForSelect()
        ]);
        setSectors(sectorsData);
        setContracts(contractsData);
        setRegions(regionsData);
      } catch (error) {
        console.error('Erreur lors du chargement des choix:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChoices();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        contract_type: initialData.contract_type || '',
        sector: initialData.sector || '',
        region: initialData.location || initialData.region || '', // Mapper location du backend vers region du frontend
        description: initialData.description || '',
        profile_recherche: initialData.profile_recherche || '',
        status: initialData.status || 'draft',
        start_date: initialData.start_date || '',
        experience_required: initialData.experience_required || '1-3',
      });
    } else {
      setFormData({
        title: '',
        contract_type: '',
        sector: '',
        region: '',
        description: '',
        profile_recherche: '',
        status: 'draft',
        start_date: '',
        experience_required: '1-3',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mapper region vers location pour le backend
    const dataToSubmit = {
      ...formData,
      location: formData.region
    };
    delete dataToSubmit.region;
    console.log('Data soumise:', dataToSubmit);
    console.log('Location (région) dans les données:', dataToSubmit.location);
    onSubmit(dataToSubmit);
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Chargement...">
        <Loading />
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Modifier l'offre" : 'Ajouter une offre'}
      size="large"
    >
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-form-group">
          <label className="modal-form-label">
            <FaBriefcase />
            Titre du poste
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="modal-form-input"
            placeholder="Ex: Développeur Full Stack"
            required
          />
        </div>

        <div className="modal-form-row">
          <div className="modal-form-group">
            <label className="modal-form-label">
              <FaBriefcase />
              Type de contrat
            </label>
            <select
              name="contract_type"
              value={formData.contract_type}
              onChange={handleChange}
              className="modal-form-select"
              required
            >
              <option value="">Sélectionner</option>
              {contracts.map((contract) => (
                <option key={contract.value} value={contract.value}>
                  {contract.label}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">
              <FaIndustry />
              Secteur
            </label>
            <select
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              className="modal-form-select"
              required
            >
              <option value="">Sélectionner</option>
              {sectors.map((sector) => (
                <option key={sector.value} value={sector.value}>
                  {sector.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-form-group">
          <label className="modal-form-label">
            <FaMapMarkerAlt />
            Région *
          </label>
          <select
            name="region"
            value={formData.region}
            onChange={handleChange}
            className="modal-form-select"
            required
          >
            <option value="">Sélectionner</option>
            {regions.map((region) => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-form-row">
          <div className="modal-form-group">
            <label className="modal-form-label">
              <FaFlag />
              Statut
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="modal-form-select"
              required
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publiée</option>
              <option value="expired">Expirée</option>
            </select>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">
              <FaCalendarAlt />
              Date de début
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="modal-form-input"
              required
            />
          </div>
        </div>

        <div className="modal-form-group">
          <label className="modal-form-label">
            <FaClock />
            Expérience requise
          </label>
          <select
            name="experience_required"
            value={formData.experience_required}
            onChange={handleChange}
            className="modal-form-select"
            required
          >
            <option value="0-1">0-1 an</option>
            <option value="1-3">1-3 ans</option>
            <option value="3-5">3-5 ans</option>
            <option value="5+">5+ ans</option>
          </select>
        </div>

        <div className="modal-form-group">
          <label className="modal-form-label">
            <FaFileAlt />
            Description du poste
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="modal-form-textarea"
            placeholder="Décrivez les missions et responsabilités du poste..."
            rows={4}
          />
        </div>

        <div className="modal-form-group">
          <label className="modal-form-label">
            <FaUser />
            Profil recherché
          </label>
          <textarea
            name="profile_recherche"
            value={formData.profile_recherche}
            onChange={handleChange}
            className="modal-form-textarea"
            placeholder="Décrivez le profil recherché (expérience, compétences, formation...)"
            rows={3}
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="modal-btn modal-btn-secondary" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="modal-btn modal-btn-primary">
            {initialData ? 'Modifier l\'offre' : 'Ajouter l\'offre'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default OfferModal;

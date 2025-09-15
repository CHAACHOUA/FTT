import React, { useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal';
import { getSectorsForSelect, getContractsForSelect } from '../../../constants/choices';
import { FaBriefcase, FaIndustry, FaMapMarkerAlt, FaFileAlt, FaUser } from 'react-icons/fa';
const OfferModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    contract_type: '',
    sector: '',
    location: '',
    description: '',
    profile_recherche: '',
  });
  const [sectors, setSectors] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChoices = async () => {
      try {
        setLoading(true);
        const [sectorsData, contractsData] = await Promise.all([
          getSectorsForSelect(),
          getContractsForSelect()
        ]);
        setSectors(sectorsData);
        setContracts(contractsData);
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
        location: initialData.location || '',
        description: initialData.description || '',
        profile_recherche: initialData.profile_recherche || '',
      });
    } else {
      setFormData({
        title: '',
        contract_type: '',
        sector: '',
        location: '',
        description: '',
        profile_recherche: '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Chargement...">
        <div className="modal-loading">
          <div className="modal-loading-spinner"></div>
          Chargement des options...
        </div>
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
            Localisation
          </label>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="modal-form-select"
            required
          >
            <option value="">Sélectionner</option>
            <option value="Toulouse">Toulouse</option>
            <option value="Paris">Paris</option>
            <option value="Lyon">Lyon</option>
            <option value="Bordeaux">Bordeaux</option>
            <option value="Marseille">Marseille</option>
            <option value="Lille">Lille</option>
            <option value="Nantes">Nantes</option>
            <option value="Strasbourg">Strasbourg</option>
            <option value="Montpellier">Montpellier</option>
            <option value="Rennes">Rennes</option>
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

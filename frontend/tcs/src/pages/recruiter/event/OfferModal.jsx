import React, { useEffect, useState } from 'react';
import '../../styles/recruiter/OfferModal.css';
import { getSectorsForSelect, getContractsForSelect } from '../../../constants/choices';
const OfferModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    contract_type: '',
    sector: '',
    location: '',
    description: '',
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
      });
    } else {
      setFormData({
        title: '',
        contract_type: '',
        sector: '',
        location: '',
        description: '',
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
      <div className="modal-backdrop">
        <div className="modal-content">
          <div>Chargement des options...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>{initialData ? "Modifier l'offre" : 'Ajouter une offre'}</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Titre
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </label>

          <div className="modal-row">
            <label>
              Type de contrat
              <select
                name="contract_type"
                value={formData.contract_type}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner</option>
                {contracts.map((contract) => (
                  <option key={contract.value} value={contract.value}>
                    {contract.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Secteur
              <select
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner</option>
                {sectors.map((sector) => (
                  <option key={sector.value} value={sector.value}>
                    {sector.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Localisation
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner</option>
                <option value="Toulouse">Toulouse</option>
                <option value="Paris">Paris</option>
                <option value="Lyon">Lyon</option>
                <option value="Bordeaux">Bordeaux</option>
              </select>
            </label>
          </div>

          <label>
            Description
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </label>

          <div className="modal-actions">
            <button type="submit" className="btn-save">
              {initialData ? 'Modifier' : 'Ajouter'}
            </button>
            <button type="button" className="btn-cancel" onClick={onClose}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfferModal;

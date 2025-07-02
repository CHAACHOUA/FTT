import React, { useEffect, useState } from 'react';

const OfferModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    contract_type: '',
    sector: '',
    location: '',
    description: '',
  });

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

          <label>
            Type de contrat
            <input
              type="text"
              name="contract_type"
              value={formData.contract_type}
              onChange={handleChange}
            />
          </label>

          <label>
            Secteur
            <input
              type="text"
              name="sector"
              value={formData.sector}
              onChange={handleChange}
            />
          </label>

          <label>
            Localisation
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </label>

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

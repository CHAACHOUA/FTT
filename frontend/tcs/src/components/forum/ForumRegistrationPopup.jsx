import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';
import Modal from '../card/common/Modal';
import { getSectorsForSelect, getContractsForSelect } from '../../constants/choices';
import { FaBriefcase, FaIndustry, FaClock, FaMapMarkerAlt, FaUniversalAccess } from 'react-icons/fa';

// Les options seront chargées dynamiquement depuis l'API

const ForumRegistrationPopup = ({ isOpen, onClose, onSubmit, forumId }) => {
  // Debug: Log props
  console.log('🔍 [FRONTEND] ForumRegistrationPopup - Props:', { isOpen, forumId });
  
  const [step, setStep] = useState(1);
  const [sectors, setSectors] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [form, setForm] = useState({
    contract_type: [],
    sector: [],
    experience: '',
    region: '',
    rqth: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [choicesLoading, setChoicesLoading] = useState(true);
  const API = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchChoices = async () => {
      try {
        setChoicesLoading(true);
        const [sectorsData, contractsData] = await Promise.all([
          getSectorsForSelect(),
          getContractsForSelect()
        ]);
        setSectors(sectorsData);
        setContracts(contractsData);
      } catch (err) {
        console.error('Erreur chargement choix :', err);
      } finally {
        setChoicesLoading(false);
      }
    };

    if (isOpen) fetchChoices();
  }, [isOpen]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (form.contract_type.length === 0) newErrors.contract_type = 'Champ obligatoire';
      if (form.sector.length === 0) newErrors.sector = 'Champ obligatoire';
    } else if (step === 2) {
      if (!form.experience) newErrors.experience = 'Champ obligatoire';
      if (!form.region.trim()) newErrors.region = 'Champ obligatoire';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const prev = () => setStep(s => s - 1);

  const finish = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
    
      const url = `${API}/forums/${forumId}/register/`;
 
      const response = await axios.post(url, form, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });
      console.log('🔍 [FRONTEND] ForumRegistrationPopup - finish - Réponse reçue');
      toast.success('Inscription réussie !');
      onSubmit?.(response.data);
      onClose();
    } catch (err) {
      console.error('🔍 [FRONTEND] ForumRegistrationPopup - finish - Erreur:', err);
      toast.error(err.response?.data?.detail || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <>
          {choicesLoading ? (
            <div className="modal-loading">
              <div className="modal-loading-spinner"></div>
              Chargement des options...
            </div>
          ) : (
            <>
              <div className="modal-form-group">
                <label className="modal-form-label">
                  <FaBriefcase />
                  Quel(s) contrat(s) recherchez-vous ?
                </label>
                <Select
                  options={contracts}
                  isMulti
                  value={contracts.filter(opt => form.contract_type.includes(opt.value))}
                  onChange={(selected) =>
                    setForm(prev => ({
                      ...prev,
                      contract_type: selected.map(opt => opt.value)
                    }))
                  }
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
                {errors.contract_type && <p className="modal-form-error">{errors.contract_type}</p>}
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">
                  <FaIndustry />
                  Secteur(s) visé(s)
                </label>
                <Select
                  options={sectors}
                  isMulti
                  value={sectors.filter(opt => form.sector.includes(opt.value))}
                  onChange={(selected) =>
                    setForm(prev => ({
                      ...prev,
                      sector: selected.map(opt => opt.value)
                    }))
                  }
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
                {errors.sector && <p className="modal-form-error">{errors.sector}</p>}
              </div>
            </>
          )}
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <div className="modal-form-group">
            <label className="modal-form-label">
              <FaClock />
              Expérience (en années)
            </label>
            <input
              type="number"
              name="experience"
              value={form.experience}
              onChange={handleChange}
              min={0}
              className="modal-form-input"
              placeholder="0"
            />
            {errors.experience && <p className="modal-form-error">{errors.experience}</p>}
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">
              <FaMapMarkerAlt />
              Région préférée
            </label>
            <input
              name="region"
              value={form.region}
              onChange={handleChange}
              className="modal-form-input"
              placeholder="Ex: Toulouse, Paris, Lyon..."
            />
            {errors.region && <p className="modal-form-error">{errors.region}</p>}
          </div>
        </>
      );
    }

    if (step === 3) {
      return (
        <div className="modal-form-group">
          <label className="modal-form-label">
            <FaUniversalAccess />
            Statut RQTH
          </label>
          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              name="rqth"
              checked={form.rqth}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Je suis bénéficiaire de la Reconnaissance de la Qualité de Travailleur Handicapé (RQTH)
            </span>
          </div>
        </div>
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Inscription au forum"
      subtitle={`Étape ${step}/3`}
      size="medium"
    >
      <div className="modal-steps">
        <div className={`modal-step ${step >= 1 ? (step === 1 ? 'modal-step-active' : 'modal-step-completed') : 'modal-step-pending'}`}>
          <div className="modal-step-number">1</div>
          <span>Préférences</span>
        </div>
        <div className={`modal-step ${step >= 2 ? (step === 2 ? 'modal-step-active' : 'modal-step-completed') : 'modal-step-pending'}`}>
          <div className="modal-step-number">2</div>
          <span>Profil</span>
        </div>
        <div className={`modal-step ${step >= 3 ? (step === 3 ? 'modal-step-active' : 'modal-step-completed') : 'modal-step-pending'}`}>
          <div className="modal-step-number">3</div>
          <span>Finalisation</span>
        </div>
      </div>

      <form className="modal-form">
        {renderStepContent()}
      </form>

      <div className="modal-actions">
        {step > 1 && (
          <button 
            type="button"
            onClick={prev} 
            disabled={loading} 
            className="modal-btn modal-btn-secondary"
          >
            Précédent
          </button>
        )}
        {step < 3 ? (
          <button
            type="button"
            onClick={next}
            disabled={loading}
            className="modal-btn modal-btn-primary"
          >
            Suivant
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            disabled={loading}
            className="modal-btn modal-btn-success"
          >
            {loading ? 'Envoi...' : 'Terminer l\'inscription'}
          </button>
        )}
      </div>
    </Modal>
  );
};

export default ForumRegistrationPopup;

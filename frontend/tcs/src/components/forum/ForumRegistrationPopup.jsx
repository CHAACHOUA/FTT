import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';
import '../../pages/styles/forum/ForumRegistrationPopup.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBriefcase,
  faIndustry,
  faClock,
  faMapMarkerAlt,
  faUniversalAccess,
} from '@fortawesome/free-solid-svg-icons';

const contractOptions = [
  { label: 'CDI', value: 'CDI' },
  { label: 'CDD / Temporaire', value: 'CDD' },
  { label: "Contrat d'apprentissage", value: "Contrat d'apprentissage" },
  { label: 'Contrat de professionnalisation', value: 'Contrat de professionnalisation' },
];

const staticSectorOptions = [
  { label: 'Technologie / IT', value: 'Technologie / IT' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Santé', value: 'Santé' },
  { label: 'Éducation', value: 'Éducation' },
  { label: 'BTP / Construction', value: 'BTP / Construction' },
  { label: 'Commerce / Vente', value: 'Commerce / Vente' },
  { label: 'Logistique / Transport', value: 'Logistique / Transport' },
  { label: 'Autre', value: 'Autre' },
];

const ForumRegistrationPopup = ({ isOpen, onClose, onSubmit, forumId }) => {
  const [step, setStep] = useState(1);
  const [sectors, setSectors] = useState([]);
  const [form, setForm] = useState({
    contract_type: [],
    sector: [],
    experience: '',
    region: '',
    rqth: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const API = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const res = await axios.get(`${API}/api/forums/${forumId}/`);
        const apiSectors = Array.from(new Set(
          res.data.companies.flatMap(c => c.sectors || [])
        ));
        const apiOptions = apiSectors.map(s => ({ label: s, value: s }));

        const combined = [...staticSectorOptions];
        apiOptions.forEach(opt => {
          if (!combined.find(s => s.value === opt.value)) {
            combined.push(opt);
          }
        });

        setSectors(combined);
      } catch (err) {
        console.error('Erreur chargement secteurs :', err);
      }
    };

    if (isOpen) fetchSectors();
  }, [isOpen, forumId, API]);

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
      const response = await axios.post(`${API}/api/forums/${forumId}/register/`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
          'Content-Type': 'application/json',
        },
      });
      toast.success('Inscription réussie !');
      onSubmit?.(response.data);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="popup-wrapper fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Dialog.Panel className="popup-content bg-white p-6 rounded-lg w-full max-w-lg shadow-xl">
        <Dialog.Title className="text-xl font-semibold mb-4">
          Inscription – Étape {step}/3
        </Dialog.Title>

        {step === 1 && (
          <>
            <label className="block font-medium mb-1">
              <FontAwesomeIcon icon={faBriefcase} className="mr-2 text-blue-600" />
             Quel(s) contrat(s) recherchez-vous ? 
            </label>
            <Select
              options={contractOptions}
              isMulti
              value={contractOptions.filter(opt => form.contract_type.includes(opt.value))}
              onChange={(selected) =>
                setForm(prev => ({
                  ...prev,
                  contract_type: selected.map(opt => opt.value)
                }))
              }
              className="mb-2"
            />
            {errors.contract_type && <p className="text-red-500 text-sm">{errors.contract_type}</p>}

            <label className="block font-medium mt-4 mb-1">
              <FontAwesomeIcon icon={faIndustry} className="mr-2 text-blue-600" />
              Secteur(s) visé(s) :
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
            />
            {errors.sector && <p className="text-red-500 text-sm">{errors.sector}</p>}
          </>
        )}

        {step === 2 && (
          <>
            <label className="block font-medium mb-1 mt-4">
              <FontAwesomeIcon icon={faClock} className="mr-2 text-blue-600" />
              Expérience (en années) :
            </label>
            <input
              type="number"
              name="experience"
              value={form.experience}
              onChange={handleChange}
              min={0}
              className="input mb-2 w-full border rounded px-3 py-2"
            />
            {errors.experience && <p className="text-red-500 text-sm">{errors.experience}</p>}

            <label className="block font-medium mb-1 mt-4">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-blue-600" />
              Région préférée :
            </label>
            <input
              name="region"
              value={form.region}
              onChange={handleChange}
              className="input w-full border rounded px-3 py-2"
            />
            {errors.region && <p className="text-red-500 text-sm">{errors.region}</p>}
          </>
        )}

        {step === 3 && (
          <label className="flex items-center gap-2 mt-4">
            <FontAwesomeIcon icon={faUniversalAccess} className="text-blue-600" />
            <input
              type="checkbox"
              name="rqth"
              checked={form.rqth}
              onChange={handleChange}
            />
            Je suis bénéficiaire de la RQTH
          </label>
        )}

        <div className="popup-buttons mt-6 flex justify-between">
          {step > 1 && (
            <button onClick={prev} disabled={loading} className="text-gray-600">
              Précédent
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={next}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {loading ? 'Envoi...' : 'Terminer'}
            </button>
          )}
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default ForumRegistrationPopup;

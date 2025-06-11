// ForumRegistrationPopup.jsx
import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ForumRegistrationPopup = ({ isOpen, onClose, onSubmit, forumId }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    contract_type: '',
    sector: '',
    experience: '',
    region: '',
    rqth: false,
  });
  const [loading, setLoading] = useState(false);
  const API = process.env.REACT_APP_API_BASE_URL;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const next = () => setStep((prev) => prev + 1);
  const prev = () => setStep((prev) => prev - 1);

  const finish = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/api/forums/${forumId}/register/`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
          'Content-Type': 'application/json',
        },
      });
      toast.success('Inscription réussie !');
      onSubmit?.(response.data); // ✅ transmet les données au parent
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="popup-wrapper">
      <Dialog.Panel className="popup-content">
        <Dialog.Title>Inscription – Étape {step}/3</Dialog.Title>

        {step === 1 && (
          <>
            <label>Type de contrat :</label>
            <select name="contract_type" value={form.contract_type} onChange={handleChange}>
              <option value="">-- Sélectionner --</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="Alternance">Alternance</option>
              <option value="Stage">Stage</option>
            </select>

            <label>Secteur :</label>
            <input name="sector" value={form.sector} onChange={handleChange} />
          </>
        )}

        {step === 2 && (
          <>
            <label>Expérience (en années) :</label>
            <input type="number" name="experience" value={form.experience} onChange={handleChange} min={0} />

            <label>Région préférée :</label>
            <input name="region" value={form.region} onChange={handleChange} />
          </>
        )}

        {step === 3 && (
          <label>
            <input type="checkbox" name="rqth" checked={form.rqth} onChange={handleChange} />
            Je suis bénéficiaire de la RQTH
          </label>
        )}

        <div className="popup-buttons">
          {step > 1 && <button onClick={prev} disabled={loading}>Précédent</button>}
          {step < 3 ? (
            <button onClick={next} disabled={loading}>Suivant</button>
          ) : (
            <button onClick={finish} disabled={loading}>{loading ? 'Envoi...' : 'Terminer'}</button>
          )}
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default ForumRegistrationPopup;

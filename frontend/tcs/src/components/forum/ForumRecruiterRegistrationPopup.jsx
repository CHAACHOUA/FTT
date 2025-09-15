import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../../pages/styles/forum/ForumRegistrationPopup.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBuilding } from '@fortawesome/free-solid-svg-icons';

const ForumRecruiterRegistrationPopup = ({ isOpen, onClose, onSubmit, forumId }) => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    company_name: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const API = process.env.REACT_APP_API_BASE_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.first_name.trim()) newErrors.first_name = 'Champ obligatoire';
    if (!form.last_name.trim()) newErrors.last_name = 'Champ obligatoire';
    if (!form.company_name.trim()) newErrors.company_name = 'Champ obligatoire';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await axios.post(
        `${API}/api/forums/${forumId}/register-recruiter/`,
        form,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
      );
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
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="popup-wrapper fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <Dialog.Panel className="popup-content bg-white p-6 rounded-lg w-full max-w-lg shadow-xl">
        <Dialog.Title className="text-xl font-semibold mb-4">
          Inscription Recruteur
        </Dialog.Title>

        <label className="block font-medium mb-1">
          <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-600" />
          Prénom
        </label>
        <input
          type="text"
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          className="input w-full border rounded px-3 py-2 mb-2"
        />
        {errors.first_name && (
          <p className="text-red-500 text-sm">{errors.first_name}</p>
        )}

        <label className="block font-medium mt-4 mb-1">
          <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-600" />
          Nom
        </label>
        <input
          type="text"
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          className="input w-full border rounded px-3 py-2 mb-2"
        />
        {errors.last_name && (
          <p className="text-red-500 text-sm">{errors.last_name}</p>
        )}

        <label className="block font-medium mt-4 mb-1">
          <FontAwesomeIcon icon={faBuilding} className="mr-2 text-blue-600" />
          Nom de l'entreprise
        </label>
        <input
          type="text"
          name="company_name"
          value={form.company_name}
          onChange={handleChange}
          className="input w-full border rounded px-3 py-2 mb-2"
        />
        {errors.company_name && (
          <p className="text-red-500 text-sm">{errors.company_name}</p>
        )}

        <div className="popup-buttons mt-6 flex justify-between">
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-600 border border-gray-400 px-4 py-2 rounded"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {loading ? '...' : 'Valider l’inscription'}
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default ForumRecruiterRegistrationPopup;

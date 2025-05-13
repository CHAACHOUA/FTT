// src/features/candidate/section/Language.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaGlobe, FaTrash, FaPlusCircle } from 'react-icons/fa';
import { MdLeaderboard } from 'react-icons/md';

const Language = ({ formData, onUpdate }) => {
  const [allLanguages, setAllLanguages] = useState([]);

  // 📌 Récupération des langues depuis l'API
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/candidates/languages/`);
        setAllLanguages(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des langues :", error.message);
      }
    };

    fetchLanguages();
  }, []);

  // 📌 Mise à jour de la liste des langues dans le formulaire
  const handleListChange = (index, field, value) => {
    const updatedList = [...(formData.candidate_languages || [])];

    if (field === 'language') {
      const selectedLanguage = allLanguages.find((lang) => lang.id === parseInt(value));
      if (selectedLanguage) {
        updatedList[index] = { ...updatedList[index], language: selectedLanguage.name };
      }
    } else {
      updatedList[index] = { ...updatedList[index], [field]: value };
    }

    onUpdate({ candidate_languages: updatedList });
  };

  // 📌 Ajouter une nouvelle langue
  const addLanguage = () => {
    onUpdate({
      candidate_languages: [
        ...(formData.candidate_languages || []),
        { language: '', level: '' }
      ],
    });
  };

  // 📌 Supprimer une langue
  const removeLanguage = (index) => {
    const updatedList = formData.candidate_languages.filter((_, i) => i !== index);
    onUpdate({ candidate_languages: updatedList });
  };

  // Toujours au moins un bloc vide
  const candidate_languages = (formData.candidate_languages && formData.candidate_languages.length > 0)
    ? formData.candidate_languages
    : [{ language: '', level: '' }];

  return (
    <div className="section education-section">
      <h3 className="language-title">Langues</h3>
      {candidate_languages.map((lang, index) => (
        <div key={index} className="language-item-modern">
          <div className="input-modern">
            <span className="input-icon"><FaGlobe /></span>
            <div className="input-wrapper-modern">
              <label className={`floating-label ${lang.language ? 'filled' : ''}`}>Langue</label>
              <select
                value={allLanguages.find(l => l.name === lang.language)?.id || ""}
                onChange={(e) => handleListChange(index, 'language', e.target.value)}
                className="modern-select"
              >
                <option value="">-- Sélectionner une langue --</option>
                {allLanguages.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="input-modern">
            <span className="input-icon"><MdLeaderboard /></span>
            <select
  className="modern-select"
  value={lang.level || ''}
  onChange={(e) => handleListChange(index, 'level', e.target.value)}
>
  <option value="">-- Sélectionner un niveau --</option>
  <option value="Beginner">Beginner</option>
  <option value="Intermediate">Intermediate</option>
  <option value="Advanced">Advanced</option>
  <option value="Fluent">Fluent</option>
</select>
          </div>
          {formData.candidate_languages && formData.candidate_languages.length > 0 && (
            <div className="remove-btn-modern-wrapper">
              <button className="remove-btn-modern" onClick={() => removeLanguage(index)}>
                <FaTrash style={{ marginRight: 6 }} /> Supprimer
              </button>
            </div>
          )}
        </div>
      ))}
      <button className="add-btn-modern" onClick={addLanguage} style={{ marginTop: '10px' }}>
        <FaPlusCircle className="add-btn-icon" /> Ajouter
      </button>
    </div>
  );
};

export default Language;

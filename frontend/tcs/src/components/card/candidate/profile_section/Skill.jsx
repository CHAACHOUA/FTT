// src/pages/candidate/section/Skill.jsx
import React from 'react';
import { FaStar, FaTrash, FaPlusCircle } from 'react-icons/fa';
import { Input, Button, Badge } from '../../../common';

const Skill = ({ formData, onUpdate, children }) => {
  const handleListChange = (index, value) => {
    const updatedList = [...(formData.skills || [])];
    updatedList[index] = value;
    onUpdate({ skills: updatedList });
  };

  const addSkill = () => {
    // Vérification pour éviter un champ vide
    if (!formData.skills.includes('')) {
      onUpdate({ skills: [...(formData.skills || []), ''] });
    }
  };

  const removeSkill = (index) => {
    const updatedList = formData.skills.filter((_, i) => i !== index);
    onUpdate({ skills: updatedList });
  };

  // Toujours au moins un champ vide
  const skills = (formData.skills && formData.skills.length > 0)
    ? formData.skills
    : [''];

  return (
    <div className="section education-section">
      <div className="skill-header">
        <h3 className="skill-title">Compétences</h3>
        <button className="add-btn-modern" onClick={addSkill}>
          <FaPlusCircle className="add-btn-icon" /> Ajouter
        </button>
      </div>
      {skills.map((skill, index) => (
        <div key={index} className="skill-item-modern">
          <div className="input-modern">
            <span className="input-icon"><FaStar /></span>
            <div className="input-wrapper-modern">
              <label className={`floating-label ${skill ? 'filled' : ''}`}>Compétence</label>
              <input
                type="text"
                value={typeof skill === 'object' ? skill.name : skill}
                onChange={(e) => handleListChange(index, e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>
          {formData.skills && formData.skills.length > 0 && (
            <div className="remove-btn-modern-wrapper">
              <button className="remove-btn-modern" onClick={() => removeSkill(index)}>
                <FaTrash style={{ marginRight: 6 }} /> Supprimer
              </button>
            </div>
          )}
        </div>
      ))}
      {children}
    </div>
  );
};

export default Skill;

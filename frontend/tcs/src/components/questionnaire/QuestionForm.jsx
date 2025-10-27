import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faPlus,
  faTrash,
  faQuestion,
  faList,
  faCheckSquare,
  faFile,
  faCalendar,
  faPhone,
  faEnvelope,
  faHashtag
} from '@fortawesome/free-solid-svg-icons';

const QUESTION_TYPES = [
  { value: 'text', label: 'Texte libre', icon: faQuestion },
  { value: 'textarea', label: 'Texte long', icon: faQuestion },
  { value: 'select', label: 'Liste déroulante', icon: faList },
  { value: 'radio', label: 'Choix unique', icon: faCheckSquare },
  { value: 'checkbox', label: 'Choix multiples', icon: faCheckSquare },
  { value: 'number', label: 'Nombre', icon: faHashtag },
  { value: 'email', label: 'Email', icon: faEnvelope },
  { value: 'phone', label: 'Téléphone', icon: faPhone },
  { value: 'date', label: 'Date', icon: faCalendar },
  { value: 'file', label: 'Fichier', icon: faFile },
];

const QuestionForm = ({ question, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'text',
    is_required: true,
    options: [],
    min_length: null,
    max_length: null,
    min_value: null,
    max_value: null,
    allowed_file_types: null,
    max_file_size: null
  });

  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    if (question) {
      setFormData({
        question_text: question.question_text || '',
        question_type: question.question_type || 'text',
        is_required: question.is_required !== false,
        options: question.options || [],
        min_length: question.min_length || null,
        max_length: question.max_length || null,
        min_value: question.min_value || null,
        max_value: question.max_value || null,
        allowed_file_types: question.allowed_file_types || null,
        max_file_size: question.max_file_size || null
      });
    }
  }, [question]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addOption = () => {
    if (newOption.trim()) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, { value: newOption.trim(), label: newOption.trim() }]
      }));
      setNewOption('');
    }
  };

  const removeOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('=== QUESTION FORM SUBMIT ===');
    console.log('formData:', formData);
    console.log('question prop:', question);
    console.log('onSave function:', onSave);
    
    if (!formData.question_text.trim()) {
      alert('Le texte de la question est obligatoire');
      return;
    }

    if (isChoiceQuestion() && formData.options.length === 0) {
      alert('Les questions à choix doivent avoir au moins une option');
      return;
    }

    console.log('Appel de onSave avec:', formData);
    onSave(formData);
    console.log('=== FIN QUESTION FORM SUBMIT ===');
  };

  const isChoiceQuestion = () => {
    return ['select', 'radio', 'checkbox'].includes(formData.question_type);
  };

  const isTextQuestion = () => {
    return ['text', 'textarea', 'email', 'phone'].includes(formData.question_type);
  };

  const isNumericQuestion = () => {
    return formData.question_type === 'number';
  };

  const isFileQuestion = () => {
    return formData.question_type === 'file';
  };

  const getQuestionIcon = (type) => {
    const questionType = QUESTION_TYPES.find(t => t.value === type);
    return questionType ? questionType.icon : faQuestion;
  };

  return (
    <div className="question-form-overlay">
      <div className="question-form-modal">
        <div className="question-form-header">
          <h3>
            <FontAwesomeIcon icon={getQuestionIcon(formData.question_type)} />
            {question?.id ? 'Modifier la question' : 'Nouvelle question'}
          </h3>
          <button
            type="button"
            className="btn-close"
            onClick={onCancel}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="question-form">
          <div className="form-group">
            <label>Texte de la question *</label>
            <textarea
              value={formData.question_text}
              onChange={(e) => handleInputChange('question_text', e.target.value)}
              placeholder="Posez votre question ici..."
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label>Type de question *</label>
            <div className="question-types-grid">
              {QUESTION_TYPES.map(type => (
                <label key={type.value} className="question-type-option">
                  <input
                    type="radio"
                    name="question_type"
                    value={type.value}
                    checked={formData.question_type === type.value}
                    onChange={(e) => handleInputChange('question_type', e.target.value)}
                  />
                  <div className="type-content">
                    <FontAwesomeIcon icon={type.icon} />
                    <span>{type.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.is_required}
                onChange={(e) => handleInputChange('is_required', e.target.checked)}
              />
              <span>Question obligatoire</span>
            </label>
          </div>

          {/* Options pour les questions à choix */}
          {isChoiceQuestion() && (
            <div className="form-group">
              <label>Options de réponse *</label>
              <div className="options-list">
                {formData.options.map((option, index) => (
                  <div key={index} className="option-item">
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => updateOption(index, 'label', e.target.value)}
                      placeholder="Libellé de l'option"
                    />
                    <input
                      type="text"
                      value={option.value}
                      onChange={(e) => updateOption(index, 'value', e.target.value)}
                      placeholder="Valeur de l'option"
                    />
                    <button
                      type="button"
                      className="btn-icon btn-danger"
                      onClick={() => removeOption(index)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="add-option">
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Nouvelle option"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                />
                <button
                  type="button"
                  className="btn-primary"
                  onClick={addOption}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Ajouter
                </button>
              </div>
            </div>
          )}

          {/* Validation pour les questions texte */}
          {isTextQuestion() && (
            <div className="form-group-row">
              <div className="form-group">
                <label>Longueur minimale</label>
                <input
                  type="number"
                  value={formData.min_length || ''}
                  onChange={(e) => handleInputChange('min_length', e.target.value ? parseInt(e.target.value) : null)}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Longueur maximale</label>
                <input
                  type="number"
                  value={formData.max_length || ''}
                  onChange={(e) => handleInputChange('max_length', e.target.value ? parseInt(e.target.value) : null)}
                  min="0"
                />
              </div>
            </div>
          )}

          {/* Validation pour les questions numériques */}
          {isNumericQuestion() && (
            <div className="form-group-row">
              <div className="form-group">
                <label>Valeur minimale</label>
                <input
                  type="number"
                  value={formData.min_value || ''}
                  onChange={(e) => handleInputChange('min_value', e.target.value ? parseFloat(e.target.value) : null)}
                  step="any"
                />
              </div>
              <div className="form-group">
                <label>Valeur maximale</label>
                <input
                  type="number"
                  value={formData.max_value || ''}
                  onChange={(e) => handleInputChange('max_value', e.target.value ? parseFloat(e.target.value) : null)}
                  step="any"
                />
              </div>
            </div>
          )}

          {/* Options pour les questions de fichier */}
          {isFileQuestion() && (
            <div className="form-group-row">
              <div className="form-group">
                <label>Types de fichiers autorisés</label>
                <input
                  type="text"
                  value={formData.allowed_file_types ? formData.allowed_file_types.join(', ') : ''}
                  onChange={(e) => handleInputChange('allowed_file_types', e.target.value ? e.target.value.split(',').map(t => t.trim()) : null)}
                  placeholder="Ex: pdf, doc, docx, jpg, png"
                />
              </div>
              <div className="form-group">
                <label>Taille maximale (MB)</label>
                <input
                  type="number"
                  value={formData.max_file_size || ''}
                  onChange={(e) => handleInputChange('max_file_size', e.target.value ? parseInt(e.target.value) : null)}
                  min="1"
                />
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              <FontAwesomeIcon icon={faPlus} />
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionForm;

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQuestion,
  faList,
  faCheckSquare,
  faFile,
  faCalendar,
  faPhone,
  faEnvelope,
  faHashtag,
  faSave,
  faArrowLeft,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import './QuestionnaireForm.css';

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

const QuestionnaireForm = ({ questionnaire, offer, onSubmit, onCancel }) => {
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (questionnaire) {
      // Initialiser les réponses vides
      const initialAnswers = {};
      questionnaire.questions.forEach(question => {
        if (question.question_type === 'checkbox') {
          initialAnswers[question.id] = [];
        } else {
          initialAnswers[question.id] = '';
        }
      });
      setAnswers(initialAnswers);
    }
  }, [questionnaire]);

  const handleInputChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Effacer l'erreur pour cette question
    if (errors[questionId]) {
      setErrors(prev => ({
        ...prev,
        [questionId]: null
      }));
    }
  };

  const handleCheckboxChange = (questionId, optionValue, checked) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentAnswers, optionValue]
        };
      } else {
        return {
          ...prev,
          [questionId]: currentAnswers.filter(val => val !== optionValue)
        };
      }
    });
  };

  const handleFileChange = (questionId, file) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: file
    }));
  };

  const validateAnswers = () => {
    const newErrors = {};
    let isValid = true;

    questionnaire.questions.forEach(question => {
      const answer = answers[question.id];
      
      if (question.is_required) {
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          newErrors[question.id] = 'Cette question est obligatoire';
          isValid = false;
        }
      }

      // Validation spécifique selon le type
      if (answer && question.question_type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(answer)) {
          newErrors[question.id] = 'Veuillez entrer une adresse email valide';
          isValid = false;
        }
      }

      if (answer && question.question_type === 'phone') {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(answer)) {
          newErrors[question.id] = 'Veuillez entrer un numéro de téléphone valide';
          isValid = false;
        }
      }

      if (answer && question.question_type === 'number') {
        const numValue = parseFloat(answer);
        if (isNaN(numValue)) {
          newErrors[question.id] = 'Veuillez entrer un nombre valide';
          isValid = false;
        } else {
          if (question.min_value !== null && numValue < question.min_value) {
            newErrors[question.id] = `La valeur minimale est ${question.min_value}`;
            isValid = false;
          }
          if (question.max_value !== null && numValue > question.max_value) {
            newErrors[question.id] = `La valeur maximale est ${question.max_value}`;
            isValid = false;
          }
        }
      }

      if (answer && question.question_type === 'text' && typeof answer === 'string') {
        if (question.min_length && answer.length < question.min_length) {
          newErrors[question.id] = `Minimum ${question.min_length} caractères requis`;
          isValid = false;
        }
        if (question.max_length && answer.length > question.max_length) {
          newErrors[question.id] = `Maximum ${question.max_length} caractères autorisés`;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAnswers()) {
      toast.error('Veuillez corriger les erreurs avant de soumettre');
      return;
    }

    try {
      setLoading(true);
      
      // Préparer les réponses pour l'API
      const answersData = questionnaire.questions.map(question => {
        const answer = answers[question.id];
        let answerData = {
          question: question.id,
          answer_text: null,
          answer_number: null,
          answer_choices: null,
          answer_file: null
        };

        if (question.question_type === 'number') {
          answerData.answer_number = parseFloat(answer);
        } else if (question.question_type === 'checkbox') {
          answerData.answer_choices = answer;
        } else if (question.question_type === 'file') {
          answerData.answer_file = answer;
        } else {
          answerData.answer_text = answer;
        }

        return answerData;
      });

      const responseData = {
        questionnaire: questionnaire.id,
        candidate: null, // Sera rempli côté serveur
        offer: offer.id,
        answers: answersData
      };

      await axios.post(`/api/virtual/questionnaires/${questionnaire.id}/submit/`, responseData, {
        withCredentials: true
      });

      toast.success('Questionnaire soumis avec succès !');
      onSubmit && onSubmit();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      toast.error('Erreur lors de la soumission du questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const getQuestionIcon = (type) => {
    const questionType = QUESTION_TYPES.find(t => t.value === type);
    return questionType ? questionType.icon : faQuestion;
  };

  const renderQuestion = (question) => {
    const answer = answers[question.id] || '';
    const error = errors[question.id];

    return (
      <div key={question.id} className={`question-field ${error ? 'error' : ''}`}>
        <label className="question-label">
          {question.question_text}
          {question.is_required && <span className="required"> *</span>}
        </label>

        {question.question_type === 'text' && (
          <input
            type="text"
            value={answer}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder="Votre réponse..."
            className="form-input"
          />
        )}

        {question.question_type === 'textarea' && (
          <textarea
            value={answer}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder="Votre réponse..."
            rows="4"
            className="form-textarea"
          />
        )}

        {question.question_type === 'select' && (
          <select
            value={answer}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="form-select"
          >
            <option value="">Sélectionnez une option</option>
            {question.options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {question.question_type === 'radio' && (
          <div className="radio-group">
            {question.options.map((option, index) => (
              <label key={index} className="radio-option">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={option.value}
                  checked={answer === option.value}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                />
                <span className="radio-label">{option.label}</span>
              </label>
            ))}
          </div>
        )}

        {question.question_type === 'checkbox' && (
          <div className="checkbox-group">
            {question.options.map((option, index) => (
              <label key={index} className="checkbox-option">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={answer.includes(option.value)}
                  onChange={(e) => handleCheckboxChange(question.id, option.value, e.target.checked)}
                />
                <span className="checkbox-label">{option.label}</span>
              </label>
            ))}
          </div>
        )}

        {question.question_type === 'number' && (
          <input
            type="number"
            value={answer}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder="Votre nombre..."
            className="form-input"
            min={question.min_value || undefined}
            max={question.max_value || undefined}
            step="any"
          />
        )}

        {question.question_type === 'email' && (
          <input
            type="email"
            value={answer}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder="votre@email.com"
            className="form-input"
          />
        )}

        {question.question_type === 'phone' && (
          <input
            type="tel"
            value={answer}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder="+33 1 23 45 67 89"
            className="form-input"
          />
        )}

        {question.question_type === 'date' && (
          <input
            type="date"
            value={answer}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="form-input"
          />
        )}

        {question.question_type === 'file' && (
          <div className="file-upload">
            <input
              type="file"
              onChange={(e) => handleFileChange(question.id, e.target.files[0])}
              accept={question.allowed_file_types ? question.allowed_file_types.join(',') : undefined}
              className="form-file"
            />
            {question.allowed_file_types && (
              <p className="file-info">
                Types autorisés: {question.allowed_file_types.join(', ')}
              </p>
            )}
            {question.max_file_size && (
              <p className="file-info">
                Taille maximale: {question.max_file_size} MB
              </p>
            )}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>
    );
  };

  if (!questionnaire) {
    return (
      <div className="questionnaire-form-container">
        <div className="empty-state">
          <FontAwesomeIcon icon={faQuestion} />
          <h3>Aucun questionnaire</h3>
          <p>Cette offre ne contient pas de questionnaire.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="questionnaire-form-container">
      <div className="questionnaire-form-header">
        <button
          type="button"
          className="btn-back"
          onClick={onCancel}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Retour
        </button>
        <div className="questionnaire-info">
          <h2>{questionnaire.title}</h2>
          {questionnaire.description && (
            <p className="questionnaire-description">{questionnaire.description}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="questionnaire-form">
        <div className="questions-container">
          {questionnaire.questions.map((question, index) => (
            <div key={question.id} className="question-container">
              <div className="question-header">
                <div className="question-number">{index + 1}</div>
                <div className="question-type">
                  <FontAwesomeIcon icon={getQuestionIcon(question.question_type)} />
                  {QUESTION_TYPES.find(t => t.value === question.question_type)?.label}
                </div>
              </div>
              {renderQuestion(question)}
            </div>
          ))}
        </div>

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
            disabled={loading}
          >
            <FontAwesomeIcon icon={loading ? faCheck : faSave} />
            {loading ? 'Soumission...' : 'Soumettre le questionnaire'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionnaireForm;

import React, { useState, useEffect } from 'react';
import { FaQuestion, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import './VirtualQuestionnaireForm.css';

const VirtualQuestionnaireForm = ({ 
  questionnaire, 
  onSubmit, 
  onSkip 
}) => {
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (questionnaire?.questions) {
      const initialAnswers = {};
      questionnaire.questions.forEach(question => {
        initialAnswers[question.id] = getDefaultAnswer(question);
      });
      setAnswers(initialAnswers);
    }
  }, [questionnaire]);

  const getDefaultAnswer = (question) => {
    switch (question.question_type) {
      case 'checkbox':
        return [];
      case 'radio':
      case 'select':
        return '';
      case 'number':
        return null;
      case 'file':
        return null;
      default:
        return '';
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleFileUpload = (questionId, file) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: file
    }));
  };

  const validateAnswers = () => {
    if (!questionnaire?.questions) return true;

    for (const question of questionnaire.questions) {
      if (question.is_required) {
        const answer = answers[question.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          toast.error(`La question "${question.question_text}" est obligatoire`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateAnswers()) return;

    try {
      setLoading(true);
      
      if (questionnaire) {
        // Sauvegarder les réponses au questionnaire
        await axios.post(
          `/api/virtual/questionnaires/${questionnaire.id}/submit/`,
          {
            answers: Object.entries(answers).map(([questionId, answer]) => ({
              question: questionId,
              answer_text: typeof answer === 'string' ? answer : null,
              answer_choices: Array.isArray(answer) ? answer : null,
              answer_file: answer instanceof File ? answer : null
            }))
          },
          { withCredentials: true }
        );
      }

      onSubmit(answers);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des réponses:', error);
      toast.error('Erreur lors de la sauvegarde des réponses');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = (question) => {
    const answer = answers[question.id] || getDefaultAnswer(question);

    switch (question.question_type) {
      case 'text':
        return (
          <textarea
            value={answer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Votre réponse..."
            rows="4"
            required={question.is_required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={answer || ''}
            onChange={(e) => handleAnswerChange(question.id, parseFloat(e.target.value))}
            min={question.min_value}
            max={question.max_value}
            required={question.is_required}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={answer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            required={question.is_required}
          />
        );

      case 'phone':
        return (
          <input
            type="tel"
            value={answer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            required={question.is_required}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={answer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            required={question.is_required}
          />
        );

      case 'select':
        return (
          <select
            value={answer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            required={question.is_required}
          >
            <option value="">Sélectionnez une option...</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="radio-group">
            {question.options?.map((option, index) => (
              <label key={index} className="radio-option">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={option}
                  checked={answer === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  required={question.is_required}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="checkbox-group">
            {question.options?.map((option, index) => (
              <label key={index} className="checkbox-option">
                <input
                  type="checkbox"
                  value={option}
                  checked={answer.includes(option)}
                  onChange={(e) => {
                    const newAnswer = e.target.checked
                      ? [...answer, option]
                      : answer.filter(item => item !== option);
                    handleAnswerChange(question.id, newAnswer);
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'file':
        return (
          <div className="file-upload">
            <input
              type="file"
              accept={question.allowed_file_types?.join(',')}
              onChange={(e) => handleFileUpload(question.id, e.target.files[0])}
              required={question.is_required}
            />
            {answer && (
              <div className="file-info">
                <FaCheck className="file-icon" />
                <span>{answer.name}</span>
              </div>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={answer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            required={question.is_required}
          />
        );
    }
  };

  if (!questionnaire) {
    return (
      <div className="questionnaire-step">
        <div className="no-questionnaire">
          <FaQuestion className="no-questionnaire-icon" />
          <h3>Aucun questionnaire</h3>
          <p>Cette offre ne contient pas de questionnaire personnalisé.</p>
          <button className="btn-primary" onClick={onSkip}>
            Continuer sans questionnaire
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="questionnaire-step">
      <div className="questionnaire-header">
        <h3>Questionnaire de candidature</h3>
        <p>Répondez aux questions pour compléter votre candidature</p>
      </div>

      <div className="questions-list">
        {questionnaire.questions?.map((question, index) => (
          <div key={question.id} className="question-item">
            <div className="question-header">
              <h4>
                {index + 1}. {question.question_text}
                {question.is_required && <span className="required"> *</span>}
              </h4>
            </div>
            
            <div className="question-input">
              {renderQuestion(question)}
            </div>
          </div>
        ))}
      </div>

      <div className="questionnaire-actions">
        <button className="btn-secondary" onClick={onSkip}>
          <FaTimes /> Passer le questionnaire
        </button>
        <button 
          className="btn-primary" 
          onClick={handleSubmit}
          disabled={loading}
        >
          <FaCheck /> {loading ? 'Sauvegarde...' : 'Continuer'}
        </button>
      </div>
    </div>
  );
};

export default VirtualQuestionnaireForm;

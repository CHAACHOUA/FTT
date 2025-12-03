import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { Button, Input, Card, Badge } from '../common';
import { FaQuestion, FaCheck, FaTimes, FaChevronDown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import './VirtualQuestionnaireForm.css';

const VirtualQuestionnaireForm = forwardRef(({ 
  questionnaire, 
  onSubmit, 
  onSkip,
  hideActions = false
}, ref) => {
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  // Exposer la méthode getAnswers via ref
  useImperativeHandle(ref, () => ({
    getAnswers: () => answers
  }));

  // Debug logs
  console.log('🔍 VirtualQuestionnaireForm - questionnaire:', questionnaire);
  console.log('🔍 VirtualQuestionnaireForm - questionnaire type:', typeof questionnaire);
  console.log('🔍 VirtualQuestionnaireForm - questionnaire === null:', questionnaire === null);
  console.log('🔍 VirtualQuestionnaireForm - questionnaire === undefined:', questionnaire === undefined);
  console.log('🔍 VirtualQuestionnaireForm - questionnaire.questions:', questionnaire?.questions);
  console.log('🔍 VirtualQuestionnaireForm - questions length:', questionnaire?.questions?.length);
  console.log('🔍 VirtualQuestionnaireForm - questionnaire keys:', questionnaire ? Object.keys(questionnaire) : 'null/undefined');

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
      
      console.log('🔍 [QUESTIONNAIRE] Current answers state:', answers);
      console.log('🔍 [QUESTIONNAIRE] Questionnaire questions:', questionnaire?.questions);
      
      // Préparer les données pour la candidature
      const questionnaireData = {
        questionnaire_id: questionnaire?.id,
        answers: await Promise.all(Object.entries(answers).filter(([questionId, answer]) => {
          // Ne garder que les réponses non vides
          return answer !== null && answer !== undefined && answer !== '' && 
                 !(Array.isArray(answer) && answer.length === 0);
        }).map(async ([questionId, answer]) => {
          const question = questionnaire.questions.find(q => q.id == questionId);
          console.log(`🔍 [QUESTIONNAIRE] Processing question ${questionId}:`, {
            question,
            answer,
            answerType: typeof answer
          });
          
          let answerFile = null;
          if (answer instanceof File) {
            // Convertir le fichier en base64
            try {
              const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(answer);
              });
              answerFile = {
                name: answer.name,
                size: answer.size,
                type: answer.type,
                data: base64
              };
              console.log(`🔍 [QUESTIONNAIRE] File converted to base64:`, answerFile);
            } catch (error) {
              console.error('Erreur lors de la conversion du fichier:', error);
            }
          }
          
          return {
            question: questionId,
            question_text: question?.question_text || '',
            question_type: question?.question_type || '',
            answer_text: typeof answer === 'string' ? answer : null,
            answer_number: typeof answer === 'number' ? answer : null,
            answer_choices: Array.isArray(answer) ? answer : null,
            answer_file: answerFile
          };
        }))
      };

      console.log('🔍 [QUESTIONNAIRE] Sending data:', questionnaireData);
      
      // Appeler directement la fonction de callback du parent avec les données
      console.log('🔍 [QUESTIONNAIRE] Calling onSubmit with:', questionnaireData);
      onSubmit(questionnaireData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des réponses:', error);
      toast.error('Erreur lors de la sauvegarde des réponses');
    } finally {
      setLoading(false);
    }
  };

  // Composant dropdown personnalisé avec checkboxes
  const CustomCheckboxDropdown = ({ question, answer, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    const getSelectedLabels = () => {
      if (!answer || answer.length === 0) return 'Sélectionnez...';
      if (answer.length === 1) {
        const option = question.options?.find(opt => {
          const optValue = typeof opt === 'object' ? opt.value : opt;
          return optValue === answer[0];
        });
        return typeof option === 'object' ? option.label : option;
      }
      return `${answer.length} sélectionné(s)`;
    };

    const handleToggle = (optionValue) => {
      const newAnswer = answer.includes(optionValue)
        ? answer.filter(item => item !== optionValue)
        : [...answer, optionValue];
      onChange(newAnswer);
    };

    return (
      <div className="custom-dropdown" ref={dropdownRef}>
        <button
          type="button"
          className="custom-dropdown-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={!answer || answer.length === 0 ? 'placeholder' : ''}>
            {getSelectedLabels()}
          </span>
          <FaChevronDown className={`chevron ${isOpen ? 'open' : ''}`} />
        </button>
        {isOpen && (
          <div className="custom-dropdown-menu">
            {question.options?.map((option, index) => {
              const optionValue = typeof option === 'object' ? option.value : option;
              const optionLabel = typeof option === 'object' ? option.label : option;
              const isChecked = answer.includes(optionValue);
              return (
                <label key={index} className="custom-dropdown-item">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle(optionValue)}
                  />
                  <span>{optionLabel}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Composant dropdown personnalisé avec radio (sélection unique)
  const CustomRadioDropdown = ({ question, answer, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    const getSelectedLabel = () => {
      if (!answer) return 'Sélectionnez...';
      const option = question.options?.find(opt => {
        const optValue = typeof opt === 'object' ? opt.value : opt;
        return optValue === answer;
      });
      return typeof option === 'object' ? option.label : option || 'Sélectionnez...';
    };

    const handleSelect = (optionValue) => {
      onChange(optionValue);
      setIsOpen(false);
    };

    return (
      <div className="custom-dropdown" ref={dropdownRef}>
        <button
          type="button"
          className="custom-dropdown-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={!answer ? 'placeholder' : ''}>
            {getSelectedLabel()}
          </span>
          <FaChevronDown className={`chevron ${isOpen ? 'open' : ''}`} />
        </button>
        {isOpen && (
          <div className="custom-dropdown-menu">
            {question.options?.map((option, index) => {
              const optionValue = typeof option === 'object' ? option.value : option;
              const optionLabel = typeof option === 'object' ? option.label : option;
              const isSelected = answer === optionValue;
              return (
                <label key={index} className="custom-dropdown-item">
                  <input
                    type="radio"
                    name={`question_${question.id}`}
                    checked={isSelected}
                    onChange={() => handleSelect(optionValue)}
                  />
                  <span>{optionLabel}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
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
            {question.options?.map((option, index) => {
              const optionValue = typeof option === 'object' ? option.value : option;
              const optionLabel = typeof option === 'object' ? option.label : option;
              return (
                <option key={index} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>
        );

      case 'radio':
        return (
          <CustomRadioDropdown
            question={question}
            answer={answer}
            onChange={(value) => handleAnswerChange(question.id, value)}
          />
        );

      case 'checkbox':
        return (
          <CustomCheckboxDropdown
            question={question}
            answer={answer}
            onChange={(value) => handleAnswerChange(question.id, value)}
          />
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

  if (!questionnaire || questionnaire === null || questionnaire === undefined) {
    return (
      <div className="questionnaire-step">
        <div className="no-questionnaire">
          <FaQuestion className="no-questionnaire-icon" />
          <h3>Aucun questionnaire</h3>
          <p>Cette offre ne contient pas de questionnaire personnalisé.</p>
          {!hideActions && (
            <button className="btn-primary" onClick={onSkip}>
              Continuer sans questionnaire
            </button>
          )}
        </div>
      </div>
    );
  }

  // Vérifier si le questionnaire a des questions
  if (!questionnaire.questions || questionnaire.questions.length === 0) {
    return (
      <div className="questionnaire-step">
        <div className="no-questionnaire">
          <FaQuestion className="no-questionnaire-icon" />
          <h3>Aucune question</h3>
          <p>Ce questionnaire ne contient pas de questions.</p>
          {!hideActions && (
            <button className="btn-primary" onClick={onSkip}>
              Continuer sans questionnaire
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="questionnaire-step">
  

      <div className="form-grid">
        {questionnaire.questions?.map((question, index) => (
          <div key={question.id} className="form-group">
            <label>
              {question.question_text}
              {question.is_required && <span className="required"> *</span>}
            </label>
            {renderQuestion(question)}
          </div>
        ))}
      </div>

      {!hideActions && (
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
      )}
    </div>
  );
});

export default VirtualQuestionnaireForm;

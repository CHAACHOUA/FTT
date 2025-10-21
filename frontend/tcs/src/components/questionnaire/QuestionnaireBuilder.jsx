import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faTrash,
  faEdit,
  faSave,
  faEye,
  faQuestion,
  faList,
  faCheckSquare,
  faFile,
  faCalendar,
  faPhone,
  faEnvelope,
  faHashtag,
  faGripVertical,
  faCopy
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import QuestionForm from './QuestionForm';
import './QuestionnaireBuilder.css';

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

const QuestionnaireBuilder = ({ offer, onSave, onCancel, apiBaseUrl }) => {
  const [questionnaire, setQuestionnaire] = useState({
    title: 'Questionnaire de candidature',
    description: '',
    is_active: true,
    is_required: true,
    questions: []
  });

  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (offer?.questionnaire) {
      setQuestionnaire(offer.questionnaire);
    }
  }, [offer]);

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question_text: '',
      question_type: 'text',
      is_required: true,
      order: questionnaire.questions.length,
      options: [],
      min_length: null,
      max_length: null,
      min_value: null,
      max_value: null,
      allowed_file_types: null,
      max_file_size: null
    };
    
    setEditingQuestion(newQuestion);
    setShowQuestionForm(true);
  };

  const editQuestion = (question) => {
    setEditingQuestion({ ...question });
    setShowQuestionForm(true);
  };

  const saveQuestion = (questionData) => {
    if (editingQuestion.id && editingQuestion.id !== Date.now()) {
      // Modifier une question existante
      setQuestionnaire(prev => ({
        ...prev,
        questions: prev.questions.map(q => 
          q.id === editingQuestion.id ? { ...questionData, id: editingQuestion.id } : q
        )
      }));
    } else {
      // Ajouter une nouvelle question
      setQuestionnaire(prev => ({
        ...prev,
        questions: [...prev.questions, { ...questionData, id: Date.now() }]
      }));
    }
    
    setShowQuestionForm(false);
    setEditingQuestion(null);
  };

  const deleteQuestion = (questionId) => {
    setQuestionnaire(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const duplicateQuestion = (question) => {
    const newQuestion = {
      ...question,
      id: Date.now(),
      question_text: question.question_text + ' (copie)',
      order: questionnaire.questions.length
    };
    
    setQuestionnaire(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const moveQuestion = (questionId, direction) => {
    const questions = [...questionnaire.questions];
    const index = questions.findIndex(q => q.id === questionId);
    
    if (direction === 'up' && index > 0) {
      [questions[index], questions[index - 1]] = [questions[index - 1], questions[index]];
    } else if (direction === 'down' && index < questions.length - 1) {
      [questions[index], questions[index + 1]] = [questions[index + 1], questions[index]];
    }
    
    // Mettre à jour les ordres
    questions.forEach((q, i) => {
      q.order = i;
    });
    
    setQuestionnaire(prev => ({
      ...prev,
      questions
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const questionnaireData = {
        ...questionnaire,
        offer: offer.id,
        questions: questionnaire.questions.map((q, index) => ({
          ...q,
          order: index
        }))
      };

      if (offer.questionnaire) {
        // Mettre à jour un questionnaire existant
        await axios.put(`${apiBaseUrl}/virtual/questionnaires/${offer.questionnaire.id}/`, questionnaireData, {
          withCredentials: true
        });
        toast.success('Questionnaire mis à jour avec succès');
      } else {
        // Créer un nouveau questionnaire
        await axios.post(`${apiBaseUrl}/virtual/questionnaires/`, questionnaireData, {
          withCredentials: true
        });
        toast.success('Questionnaire créé avec succès');
      }
      
      onSave && onSave();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde du questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const getQuestionIcon = (type) => {
    const questionType = QUESTION_TYPES.find(t => t.value === type);
    return questionType ? questionType.icon : faQuestion;
  };

  return (
    <div className="questionnaire-builder">
      <div className="questionnaire-header">
        <h2>Questions du questionnaire</h2>
        <div className="questionnaire-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
          >
            Annuler
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faSave} />
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div className="questionnaire-form">

        <div className="form-section">
          <div className="section-header">
            <h3>Questions ({questionnaire.questions.length})</h3>
            <button
              type="button"
              className="btn-primary"
              onClick={addQuestion}
            >
              <FontAwesomeIcon icon={faPlus} />
              Ajouter une question
            </button>
          </div>

          {questionnaire.questions.length === 0 ? (
            <div className="empty-state">
              <FontAwesomeIcon icon={faQuestion} />
              <p>Aucune question ajoutée</p>
              <p>Cliquez sur "Ajouter une question" pour commencer</p>
            </div>
          ) : (
            <div className="questions-list">
              {questionnaire.questions.map((question, index) => (
                <div key={question.id} className="question-item">
                  <div className="question-header">
                    <div className="question-info">
                      <div className="question-number">{index + 1}</div>
                      <div className="question-content">
                        <div className="question-text">
                          {question.question_text || 'Question sans titre'}
                        </div>
                        <div className="question-meta">
                          <span className="question-type">
                            <FontAwesomeIcon icon={getQuestionIcon(question.question_type)} />
                            {QUESTION_TYPES.find(t => t.value === question.question_type)?.label}
                          </span>
                          {question.is_required && (
                            <span className="required-badge">Obligatoire</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="question-actions">
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => moveQuestion(question.id, 'up')}
                        disabled={index === 0}
                        title="Déplacer vers le haut"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => moveQuestion(question.id, 'down')}
                        disabled={index === questionnaire.questions.length - 1}
                        title="Déplacer vers le bas"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => duplicateQuestion(question)}
                        title="Dupliquer"
                      >
                        <FontAwesomeIcon icon={faCopy} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => editQuestion(question)}
                        title="Modifier"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon btn-danger"
                        onClick={() => deleteQuestion(question.id)}
                        title="Supprimer"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de création/édition de question */}
      {showQuestionForm && (
        <QuestionForm
          question={editingQuestion}
          onSave={saveQuestion}
          onCancel={() => {
            setShowQuestionForm(false);
            setEditingQuestion(null);
          }}
        />
      )}
    </div>
  );
};

export default QuestionnaireBuilder;

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faTrash,
  faEdit,
  faQuestion,
  faList,
  faCheckSquare,
  faFile,
  faCalendar,
  faPhone,
  faEnvelope,
  faHashtag,
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

  useEffect(() => {
    if (offer?.questionnaire) {
      setQuestionnaire(offer.questionnaire);
    }
  }, [offer]);

  const addQuestion = () => {
    console.log('=== AJOUT DE QUESTION ===');
    console.log('addQuestion appelée');
    console.log('État actuel du questionnaire:', questionnaire);
    console.log('Nombre de questions actuel:', questionnaire.questions.length);
    setEditingQuestion(null); // Pas de question existante = mode création
    setShowQuestionForm(true);
    console.log('Modal ouvert en mode création');
  };

  const editQuestion = (question) => {
    setEditingQuestion({ ...question });
    setShowQuestionForm(true);
  };

  const saveQuestion = async (questionData) => {
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
    
    // Ne plus sauvegarder automatiquement - sera sauvegardé lors de la validation de l'offre
    toast.success('Question modifiée localement');
  };

  const deleteQuestion = async (questionId) => {
    console.log('=== SUPPRESSION DE QUESTION ===');
    console.log('Question ID à supprimer:', questionId);
    console.log('Questionnaire actuel:', questionnaire);
    
    // Trouver la question à supprimer
    const questionToDelete = questionnaire.questions.find(q => q.id === questionId);
    console.log('Question à supprimer:', questionToDelete);
    
    // Supprimer localement
    setQuestionnaire(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
    
    // Si la question a un ID réel (pas temporaire) et qu'on a un questionnaire existant, supprimer du backend
    if (questionToDelete && questionToDelete.id && questionToDelete.id !== Date.now() && offer && offer.questionnaire && offer.questionnaire.id) {
      try {
        console.log('Suppression de la question du backend...');
        await axios.delete(
          `${apiBaseUrl}/virtual/questionnaires/${offer.questionnaire.id}/questions/${questionToDelete.id}/`,
          { withCredentials: true }
        );
        console.log('Question supprimée du backend avec succès');
        toast.success('Question supprimée');
      } catch (error) {
        console.error('Erreur lors de la suppression de la question:', error);
        toast.error('Erreur lors de la suppression de la question');
        
        // Restaurer la question en cas d'erreur
        setQuestionnaire(prev => ({
          ...prev,
          questions: [...prev.questions, questionToDelete]
        }));
      }
    } else {
      console.log('Question supprimée localement seulement (nouvelle question)');
      toast.success('Question supprimée localement');
    }
    
    console.log('=== FIN SUPPRESSION DE QUESTION ===');
  };

  const duplicateQuestion = async (question) => {
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
    
    // Ne plus sauvegarder automatiquement - sera sauvegardé lors de la validation de l'offre
    toast.success('Question supprimée localement');
  };

  const moveQuestion = async (questionId, direction) => {
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
    
    // Ne plus sauvegarder automatiquement - sera sauvegardé lors de la validation de l'offre
    toast.success('Question supprimée localement');
  };

  const handleAddQuestion = (questionData) => {
    console.log('=== HANDLE ADD QUESTION ===');
    console.log('handleAddQuestion appelée avec:', questionData);
    console.log('État actuel du questionnaire:', questionnaire);
    console.log('Nombre de questions avant ajout:', questionnaire.questions.length);
    
    // Ajouter la question localement sans sauvegarder au backend
    if (!questionData.question_text.trim()) {
      toast.error('Le texte de la question est obligatoire');
      return;
    }

    const newQuestion = {
      ...questionData,
      id: Date.now(), // ID temporaire pour l'affichage
      order: questionnaire.questions.length
    };

    const updatedQuestionnaire = {
      ...questionnaire,
      questions: [...questionnaire.questions, newQuestion]
    };

    console.log('Nouvelle question créée:', newQuestion);
    console.log('Questionnaire mis à jour:', updatedQuestionnaire);
    console.log('Nombre de questions après:', updatedQuestionnaire.questions.length);

    setQuestionnaire(updatedQuestionnaire);
    setShowQuestionForm(false);
    
    toast.success('Question ajoutée localement');
    console.log('Question ajoutée localement:', newQuestion);
    console.log('Total des questions après setState:', updatedQuestionnaire.questions.length);
    console.log('=== FIN HANDLE ADD QUESTION ===');
    
    // Vérifier l'état après un délai pour voir si setState a fonctionné
    setTimeout(() => {
      console.log('=== VÉRIFICATION ÉTAT APRÈS 100ms ===');
      console.log('État questionnaire après setState:', questionnaire);
      console.log('Questions dans l\'état:', questionnaire.questions);
      console.log('Nombre de questions dans l\'état:', questionnaire.questions?.length || 0);
      console.log('=== FIN VÉRIFICATION ===');
    }, 100);
  };

  // Fonction pour sauvegarder le questionnaire au backend
  const saveQuestionnaireToBackend = async () => {
    if (!offer || !offer.id || !apiBaseUrl) {
      console.error('Données manquantes pour sauvegarder le questionnaire');
      return;
    }

    try {
      const questionnaireData = {
        title: questionnaire.title,
        description: questionnaire.description,
        is_active: questionnaire.is_active,
        is_required: questionnaire.is_required,
        offer: offer.id,
        questions: questionnaire.questions.map((q, index) => ({
          question_text: q.question_text,
          question_type: q.question_type,
          is_required: q.is_required,
          order: index,
          options: q.options || [],
          min_length: q.min_length,
          max_length: q.max_length,
          min_value: q.min_value,
          max_value: q.max_value,
          allowed_file_types: q.allowed_file_types,
          max_file_size: q.max_file_size
        }))
      };

      console.log('Sauvegarde du questionnaire au backend:', questionnaireData);

      let savedQuestionnaire;
      if (offer.questionnaire && offer.questionnaire.id) {
        // Mettre à jour un questionnaire existant
        const response = await axios.put(
          `${apiBaseUrl}/virtual/questionnaires/${offer.questionnaire.id}/`,
          questionnaireData,
          { withCredentials: true }
        );
        savedQuestionnaire = response.data;
        console.log('Questionnaire mis à jour:', savedQuestionnaire);
      } else {
        // Créer un nouveau questionnaire
        const response = await axios.post(
          `${apiBaseUrl}/virtual/questionnaires/`,
          questionnaireData,
          { withCredentials: true }
        );
        savedQuestionnaire = response.data;
        console.log('Questionnaire créé:', savedQuestionnaire);
      }

      // Mettre à jour l'offre avec le questionnaire sauvegardé
      const updatedOffer = {
        ...offer,
        questionnaire: savedQuestionnaire
      };
      
      console.log('Offre mise à jour avec le questionnaire:', updatedOffer);
      onSave && onSave(updatedOffer);
      
      return savedQuestionnaire;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du questionnaire:', error);
      toast.error('Erreur lors de la sauvegarde du questionnaire');
      throw error;
    }
  };


  const getQuestionIcon = (type) => {
    const questionType = QUESTION_TYPES.find(t => t.value === type);
    return questionType ? questionType.icon : faQuestion;
  };

  // Exposer la fonction de sauvegarde et les données via useEffect pour le parent
  useEffect(() => {
    if (onSave) {
      // Exposer la fonction de sauvegarde au composant parent
      window.saveQuestionnaire = saveQuestionnaireToBackend;
    }
    
    // Exposer les données du questionnaire
    window.questionnaireBuilderData = questionnaire;
    console.log('=== EXPOSITION DES DONNÉES ===');
    console.log('Données du QuestionnaireBuilder exposées:', questionnaire);
    console.log('Questions exposées:', questionnaire.questions);
    console.log('Nombre de questions exposées:', questionnaire.questions?.length || 0);
    console.log('=== FIN EXPOSITION ===');
  }, [questionnaire, offer, apiBaseUrl]);

  return (
    <div className="questionnaire-builder">

      <div className="questionnaire-form">

        <div className="form-section">
          <div className="section-header">
            <h3>Questions ({questionnaire.questions.length})</h3>
            {console.log('Render - questionnaire.questions:', questionnaire.questions)}
            {console.log('Render - questionnaire.questions.length:', questionnaire.questions.length)}
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
              {console.log('=== AFFICHAGE DES QUESTIONS ===')}
              {console.log('Nombre de questions:', questionnaire.questions.length)}
              {console.log('Questions:', questionnaire.questions)}
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
                        onClick={() => {
                          console.log('=== CLIC BOUTON SUPPRESSION ===');
                          console.log('Question ID:', question.id);
                          console.log('Question:', question);
                          deleteQuestion(question.id);
                        }}
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
          onSave={(questionData) => {
            console.log('QuestionForm onSave appelé avec:', questionData);
            console.log('editingQuestion:', editingQuestion);
            if (editingQuestion) {
              console.log('Mode édition - appel de saveQuestion');
              saveQuestion(questionData);
            } else {
              console.log('Mode création - appel de handleAddQuestion');
              handleAddQuestion(questionData);
            }
          }}
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

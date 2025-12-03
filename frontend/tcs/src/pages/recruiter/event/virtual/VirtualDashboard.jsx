import React, { useMemo, useEffect, useState } from 'react';
import { 
  FaCheckCircle, 
  FaClock, 
  FaCalendarAlt, 
  FaBriefcase, 
  FaBuilding, 
  FaRegCalendarPlus, 
  FaUserTie, 
  FaTimes,
  FaExternalLinkAlt,
  FaLightbulb
} from 'react-icons/fa';
import '../../../styles/recruiter/VirtualDashboard.css';
import axios from 'axios';

// Format de date court (ex: "1 nov.")
const formatShortDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

// Format de date complet (ex: "jeudi 20 novembre 2025")
const formatFullDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

// Format période (ex: "1 nov. - 25 nov.")
const formatPeriod = (start, end) => {
  const startStr = formatShortDate(start);
  const endStr = formatShortDate(end);
  if (!startStr || !endStr) return '';
  return `${startStr} - ${endStr}`;
};

// Vérifier si une phase est active
const isPhaseActive = (start, end) => {
  const now = new Date();
  const s = start ? new Date(start) : null;
  const e = end ? new Date(end) : null;
  return (s && now >= s) && (e ? now <= e : true);
};

// Calculer le pourcentage de progression d'une phase
const calculatePhaseProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  return Math.round(((completed + 0.5 * inProgress) / tasks.length) * 100);
};

// Modal de détails de tâche
const TaskDetailModal = ({ task, onClose, onContinue }) => {
  if (!task) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'done':
        return { text: 'Terminé', class: 'status-done' };
      case 'in_progress':
        return { text: 'En cours', class: 'status-in-progress' };
      default:
        return { text: 'À faire', class: 'status-todo' };
    }
  };

  const statusBadge = getStatusBadge(task.status);
  const deadlineDate = task.deadline ? formatFullDate(task.deadline) : '';

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div className="task-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="task-modal-close" onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className="task-modal-header">
          <div className="task-modal-title-row">
            <h3>{task.label}</h3>
            <span className={`task-modal-status-badge ${statusBadge.class}`}>
              {task.status === 'in_progress' && <FaClock />}
              {statusBadge.text}
            </span>
          </div>
          <p className="task-modal-phase">Phase: {task.phase}</p>
        </div>

        <div className="task-modal-body">
          <div className="task-modal-section">
            <h4>Description</h4>
            <p>{task.description}</p>
          </div>

          {deadlineDate && (
            <div className="task-modal-section">
              <div className="task-modal-deadline">
                <FaCalendarAlt />
                <span>Date d'échéance: {deadlineDate}</span>
              </div>
            </div>
          )}

          {task.advice && (
            <div className="task-modal-section task-modal-advice">
              <div className="task-modal-advice-header">
                <FaLightbulb />
                <h4>Conseil</h4>
              </div>
              <p>{task.advice}</p>
            </div>
          )}
        </div>

        <div className="task-modal-footer">
          <button className="task-modal-continue-btn" onClick={onContinue}>
            <span>Continuer la tâche</span>
            <FaExternalLinkAlt />
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant de phase
const PhaseBlock = ({ title, period, active, progress, tasks, onTaskClick }) => {
  const getPhaseStatus = () => {
    if (active) return { text: 'En cours', class: 'phase-status-active' };
    const now = new Date();
    const endDate = tasks?.[0]?.phaseEnd ? new Date(tasks[0].phaseEnd) : null;
    if (endDate && now > endDate) return { text: 'Terminé', class: 'phase-status-completed' };
    return { text: 'À venir', class: 'phase-status-upcoming' };
  };

  const phaseStatus = getPhaseStatus();

  return (
    <div className={`vd-phase ${active ? 'active' : ''}`}>
      <div className="vd-phase-header">
        <div className="vd-phase-title-row">
          <h3 className="vd-phase-title">{title}</h3>
          <span className={`vd-phase-status ${phaseStatus.class}`}>
            {phaseStatus.text}
          </span>
        </div>
        <div className="vd-phase-period">
          <FaCalendarAlt />
          <span>{period}</span>
        </div>
      </div>

      <div className="vd-phase-progress">
        <span className="vd-phase-progress-label">Progression</span>
        <div className="vd-phase-progress-bar">
          <div 
            className="vd-phase-progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="vd-phase-progress-value">{progress}%</span>
      </div>

      <div className="vd-phase-tasks">
        {tasks.map((task, index) => (
          <TaskItem 
            key={task.id || index} 
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </div>
    </div>
  );
};

// Composant de tâche
const TaskItem = ({ task, onClick }) => {
  const getTaskIcon = () => {
    switch (task.status) {
      case 'done':
        return <FaCheckCircle className="task-icon-done" />;
      case 'in_progress':
        return <FaClock className="task-icon-in-progress" />;
      default:
        return <div className="task-icon-todo" />;
    }
  };

  const getStatusBadge = () => {
    switch (task.status) {
      case 'done':
        return { text: 'Terminé', class: 'task-badge-done' };
      case 'in_progress':
        return { text: 'En cours', class: 'task-badge-in-progress' };
      default:
        return { text: 'À faire', class: 'task-badge-todo' };
    }
  };

  const statusBadge = getStatusBadge();
  const deadlineDate = task.deadline ? new Date(task.deadline).toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  }) : '';

  return (
    <div className={`vd-task-item ${task.status}`} onClick={onClick}>
      <div className="vd-task-icon-wrapper">
        {getTaskIcon()}
      </div>
      <div className="vd-task-content">
        <div className="vd-task-label">{task.label}</div>
        <div className="vd-task-meta">
          <span className={`vd-task-badge ${statusBadge.class}`}>
            {statusBadge.text}
          </span>
          {deadlineDate && (
            <span className="vd-task-deadline">
              Échéance: {deadlineDate}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const VirtualDashboard = ({ forum }) => {
  const API = process.env.REACT_APP_API_BASE_URL;

  const [offersStatus, setOffersStatus] = useState('todo');
  const [slotsStatus, setSlotsStatus] = useState('todo');
  const [companyStatus, setCompanyStatus] = useState('todo');
  const [applicationsStatus, setApplicationsStatus] = useState('todo');
  const [interviewsStatus, setInterviewsStatus] = useState('todo');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!forum?.id) return;
      try {
        // Offres
        const offersRes = await axios.get(`${API}/recruiters/company-offers/`, { 
          withCredentials: true, 
          params: { forum_id: forum.id } 
        });
        const offers = Array.isArray(offersRes.data) ? offersRes.data : [];
        setOffersStatus(offers.length > 0 ? 'done' : 'todo');

        // Créneaux
        const slotsRes = await axios.get(`${API}/virtual/forums/${forum.id}/agenda/stats/`, { 
          withCredentials: true 
        });
        const s = slotsRes.data || {};
        const totals = [s.total_slots, s.available_slots, s.booked_slots, s.completed_slots, s.cancelled_slots]
          .map(v => (typeof v === 'number' ? v : 0));
        const anySlots = totals.some(v => v > 0);
        setSlotsStatus(anySlots ? 'done' : 'todo');

        // Entreprise
        let companyData = null;
        try {
          const companyRes = await axios.get(`${API}/companies/profile/`, { withCredentials: true });
          companyData = companyRes.data || null;
        } catch (e) {
          const rec = await axios.get(`${API}/recruiters/profile/me/`, { withCredentials: true });
          companyData = rec.data?.company || null;
        }

        const c = companyData || {};
        const hasLogo = !!c.logo || !!c.banner;
        const description = typeof c.description === 'string' ? c.description.trim() : '';
        const website = typeof c.website === 'string' ? c.website.trim() : '';
        const sectors = Array.isArray(c.sectors) ? c.sectors.filter(v => (typeof v === 'string' ? v.trim() : v)).filter(Boolean) : [];
        const hasStrongDetails = (!!website) || (description && description.length >= 10) || sectors.length > 0;
        const hasSomeDetails = hasLogo || (description && description.length > 0);
        setCompanyStatus(hasStrongDetails ? 'done' : (hasSomeDetails ? 'in_progress' : 'todo'));

        // Candidatures (Jobdating)
        try {
          const appsRes = await axios.get(`${API}/virtual/forums/${forum.id}/applications/recruiter/`, { 
            withCredentials: true 
          });
          const applications = Array.isArray(appsRes.data) ? appsRes.data : [];
          const hasApplications = applications.length > 0;
          const hasProcessed = applications.some(app => 
            app.status === 'accepted' || app.status === 'rejected' || app.status === 'reviewed'
          );
          setApplicationsStatus(hasProcessed ? 'done' : (hasApplications ? 'in_progress' : 'todo'));
        } catch (e) {
          console.error('Erreur chargement candidatures', e);
          setApplicationsStatus('todo');
        }

        // Entretiens
        try {
          const interviewsRes = await axios.get(`${API}/virtual/forums/${forum.id}/applications/recruiter/`, { 
            withCredentials: true 
          });
          const interviews = Array.isArray(interviewsRes.data) ? interviewsRes.data : [];
          const acceptedInterviews = interviews.filter(app => app.status === 'accepted' && app.selected_slot_info);
          const hasInterviews = acceptedInterviews.length > 0;
          const hasCompleted = acceptedInterviews.some(app => 
            app.selected_slot_info?.status === 'completed'
          );
          setInterviewsStatus(hasCompleted ? 'done' : (hasInterviews ? 'in_progress' : 'todo'));
        } catch (e) {
          console.error('Erreur chargement entretiens', e);
          setInterviewsStatus('todo');
        }
      } catch (e) {
        console.error('Erreur chargement stats', e);
      }
    };
    loadData();
  }, [API, forum]);

  const phases = useMemo(() => {
    const prepPeriod = formatPeriod(forum?.preparation_start, forum?.preparation_end);
    const jobdatingPeriod = formatPeriod(forum?.jobdating_start, forum?.interview_start);
    const interviewPeriod = formatPeriod(forum?.interview_start, forum?.interview_end);

    // Tâches de préparation
    const preparationTasks = [
      {
        id: 'company',
        label: "Compléter le profil de l'entreprise",
        status: companyStatus,
        deadline: forum?.preparation_end,
        phase: 'Préparation',
        phaseEnd: forum?.preparation_end,
        description: "Remplissez les informations complètes de votre entreprise : logo, description, secteur d'activité, site web, etc. Un profil complet améliore votre visibilité auprès des candidats.",
        advice: "Complétez cette tâche avant la date d'échéance pour assurer le bon déroulement du forum et maximiser vos opportunités de recrutement.",
        action: () => {
          if (forum) {
            sessionStorage.setItem('recruiter_dashboard_forum', JSON.stringify(forum));
            sessionStorage.setItem('recruiter_dashboard_active', 'entreprise');
          }
          window.location.href = `/event/recruiter/dashboard`;
        }
      },
      {
        id: 'offers',
        label: 'Ajouter des offres',
        status: offersStatus,
        deadline: forum?.preparation_end,
        phase: 'Préparation',
        phaseEnd: forum?.preparation_end,
        description: "Créez et publiez vos offres d'emploi pour le forum. Précisez les postes, compétences requises, et conditions.",
        advice: "Complétez cette tâche avant la date d'échéance pour assurer le bon déroulement du forum et maximiser vos opportunités de recrutement.",
        action: () => {
          if (forum) {
            sessionStorage.setItem('recruiter_dashboard_forum', JSON.stringify(forum));
            sessionStorage.setItem('recruiter_dashboard_active', 'offres');
          }
          window.location.href = `/event/recruiter/dashboard`;
        }
      },
      {
        id: 'slots',
        label: 'Planifier vos créneaux',
        status: slotsStatus,
        deadline: forum?.preparation_end,
        phase: 'Préparation',
        phaseEnd: forum?.preparation_end,
        description: "Définissez vos disponibilités pour les entretiens virtuels. Créez des créneaux horaires pour permettre aux candidats de réserver un rendez-vous.",
        advice: "Complétez cette tâche avant la date d'échéance pour assurer le bon déroulement du forum et maximiser vos opportunités de recrutement.",
        action: () => {
          if (forum) {
            sessionStorage.setItem('recruiter_dashboard_forum', JSON.stringify(forum));
            sessionStorage.setItem('recruiter_dashboard_active', 'virtual-agenda');
          }
          window.location.href = `/event/recruiter/dashboard`;
        }
      }
    ];

    // Tâches de jobdating
    const jobdatingTasks = [
      {
        id: 'access-applications',
        label: 'Accéder aux candidatures',
        status: applicationsStatus === 'todo' ? 'todo' : 'in_progress',
        deadline: forum?.interview_start,
        phase: 'Jobdating',
        phaseEnd: forum?.interview_start,
        description: "Consultez les candidatures reçues pour vos offres d'emploi. Explorez les profils des candidats et leurs CV.",
        advice: "Accédez régulièrement aux candidatures pour ne pas manquer de talents prometteurs.",
        action: () => {
          if (forum) {
            sessionStorage.setItem('recruiter_dashboard_forum', JSON.stringify(forum));
            sessionStorage.setItem('recruiter_dashboard_active', 'virtual-candidates');
          }
          window.location.href = `/event/recruiter/dashboard`;
        }
      },
      {
        id: 'process-applications',
        label: 'Traiter les candidatures',
        status: applicationsStatus,
        deadline: forum?.interview_start,
        phase: 'Jobdating',
        phaseEnd: forum?.interview_start,
        description: "Examinez et évaluez les candidatures. Acceptez celles qui correspondent à vos critères et programmez les entretiens.",
        advice: "Traitez les candidatures rapidement pour maintenir l'engagement des candidats et optimiser votre processus de recrutement.",
        action: () => {
          if (forum) {
            sessionStorage.setItem('recruiter_dashboard_forum', JSON.stringify(forum));
            sessionStorage.setItem('recruiter_dashboard_active', 'virtual-candidates');
          }
          window.location.href = `/event/recruiter/dashboard`;
        }
      }
    ];

    // Tâches d'entretiens
    const interviewTasks = [
      {
        id: 'manage-interviews',
        label: 'Gérer mes entretiens',
        status: interviewsStatus,
        deadline: forum?.interview_end,
        phase: 'Entretiens',
        phaseEnd: forum?.interview_end,
        description: "Organisez et suivez vos entretiens virtuels. Rejoignez les réunions, évaluez les candidats et prenez vos décisions de recrutement.",
        advice: "Gérez efficacement vos entretiens pour identifier les meilleurs candidats et finaliser vos recrutements.",
        action: () => {
          if (forum) {
            sessionStorage.setItem('recruiter_dashboard_forum', JSON.stringify(forum));
            sessionStorage.setItem('recruiter_dashboard_active', 'virtual-interviews');
          }
          window.location.href = `/event/recruiter/dashboard`;
        }
      }
    ];

    return {
      preparation: {
        active: isPhaseActive(forum?.preparation_start, forum?.preparation_end),
        period: prepPeriod,
        progress: calculatePhaseProgress(preparationTasks),
        tasks: preparationTasks
      },
      jobdating: {
        active: isPhaseActive(forum?.jobdating_start, forum?.interview_start),
        period: jobdatingPeriod,
        progress: calculatePhaseProgress(jobdatingTasks),
        tasks: jobdatingTasks
      },
      interview: {
        active: isPhaseActive(forum?.interview_start, forum?.interview_end),
        period: interviewPeriod,
        progress: calculatePhaseProgress(interviewTasks),
        tasks: interviewTasks
      }
    };
  }, [forum, companyStatus, offersStatus, slotsStatus, applicationsStatus, interviewsStatus]);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleContinueTask = () => {
    if (selectedTask?.action) {
      selectedTask.action();
    }
    setShowTaskModal(false);
  };

  return (
    <div className="vd-container">
      <div className="vd-inner">
        <div className="vd-header">
          <h1 className="vd-main-title">Tableau de bord</h1>
          <p className="vd-subtitle">Suivez l'avancement de vos tâches pour chaque phase du forum.</p>
        </div>

        <div className="vd-grid">
          <PhaseBlock
            title="Préparation"
            period={phases.preparation.period}
            active={phases.preparation.active}
            progress={phases.preparation.progress}
            tasks={phases.preparation.tasks}
            onTaskClick={handleTaskClick}
          />

          <PhaseBlock
            title="Jobdating"
            period={phases.jobdating.period}
            active={phases.jobdating.active}
            progress={phases.jobdating.progress}
            tasks={phases.jobdating.tasks}
            onTaskClick={handleTaskClick}
          />

          <PhaseBlock
            title="Entretiens"
            period={phases.interview.period}
            active={phases.interview.active}
            progress={phases.interview.progress}
            tasks={phases.interview.tasks}
            onTaskClick={handleTaskClick}
          />
        </div>
      </div>

      {showTaskModal && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setShowTaskModal(false)}
          onContinue={handleContinueTask}
        />
      )}
    </div>
  );
};

export default VirtualDashboard;

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../../../components/loyout/NavBar';
import Loading from '../../../../components/loyout/Loading';
import { 
  FaHome,
  FaBuilding,
  FaChartBar,
  FaClock,
  FaTrophy,
  FaCalendarAlt,
  FaClock as FaClockIcon,
  FaCheckCircle,
  FaTimesCircle,
  FaUsers,
  FaBriefcase,
  FaUserCheck,
  FaVideo,
  FaArrowUp,
  FaArrowDown,
  FaPercent
} from 'react-icons/fa';
import './VirtualStatistics.css';

const VirtualStatistics = () => {
  const location = useLocation();
  const forum = location.state?.forum;
  const forumId = location.state?.forumId || forum?.id;
  const API = location.state?.apiBaseUrl || process.env.REACT_APP_API_BASE_URL;

  const [activeView, setActiveView] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    general: {
      companies: 0,
      candidates: 0,
      offers: 0,
      recruiters: 0,
      companiesChange: 0,
      candidatesChange: 0,
      offersChange: 0,
      recruitersChange: 0
    },
    agenda: {
      total: 0,
      available: 0,
      booked: 0,
      completed: 0,
      cancelled: 0,
      fillRate: 0
    },
    applications: {
      total: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
      acceptanceRate: 0
    },
    interviews: {
      scheduled: 0,
      inProgress: 0,
      completed: 0,
      participationRate: 0
    },
    byCompany: [],
    hourlyPeaks: [],
    conversionFunnel: {
      applications: 0,
      reviewed: 0,
      accepted: 0,
      interviews: 0,
      completed: 0
    },
    cancellationRate: {
      total: 0,
      candidateCancellations: 0,
      recruiterCancellations: 0,
      rate: 0
    },
    attendanceRate: {
      present: 0,
      planned: 0,
      rate: 0,
      absences: 0
    }
  });

  useEffect(() => {
    if (forumId) {
      loadStatistics();
    }
  }, [forumId, API]);

  const loadStatistics = async () => {
    try {
      setLoading(true);

      // KPIs généraux
      const kpisRes = await axios.get(`${API}/forums/${forumId}/kpis/`, {
        withCredentials: true
      });
      const kpisData = kpisRes.data || {};

      // Statistiques d'agenda
      const agendaRes = await axios.get(`${API}/virtual/forums/${forumId}/agenda/stats/`, {
        withCredentials: true
      });
      const agendaData = agendaRes.data || {};
      const totalSlots = agendaData.total_slots || 0;
      const bookedSlots = agendaData.booked_slots || 0;
      const fillRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

      // Statistiques de candidatures
      let applicationsData = { total: 0, pending: 0, accepted: 0, rejected: 0 };
      try {
        const appsRes = await axios.get(`${API}/virtual/applications/`, {
          withCredentials: true,
          params: { forum_id: forumId }
        });
        const applications = Array.isArray(appsRes.data) ? appsRes.data : [];
        applicationsData = {
          total: applications.length,
          pending: applications.filter(app => app.status === 'pending' || app.status === 'reviewed').length,
          accepted: applications.filter(app => app.status === 'accepted').length,
          rejected: applications.filter(app => app.status === 'rejected').length
        };
      } catch (err) {
        console.error('Erreur chargement candidatures:', err);
      }

      const acceptanceRate = applicationsData.total > 0 
        ? Math.round((applicationsData.accepted / applicationsData.total) * 100 * 10) / 10
        : 0;

      // Statistiques d'entretiens
      const interviewsData = {
        scheduled: bookedSlots,
        inProgress: 0, // À calculer selon la logique métier
        completed: agendaData.completed_slots || 0,
        participationRate: fillRate
      };

      // Calculer les entretiens en cours (aujourd'hui)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // Cette logique devrait être calculée côté backend
      const inProgressToday = 0; // Placeholder

      // Statistiques par entreprise (à calculer)
      const byCompanyData = [];
      if (agendaData.recruiter_stats) {
        // Grouper par entreprise
        const companyMap = {};
        agendaData.recruiter_stats.forEach(recruiterStat => {
          // Cette logique nécessite de récupérer les entreprises
          // Pour l'instant, on utilise les stats par recruteur
        });
      }

      // Pics horaires (à calculer)
      const hourlyPeaks = Array.from({ length: 11 }, (_, i) => ({
        hour: `${8 + i}:00`,
        reservations: Math.floor(Math.random() * 30) // Placeholder
      }));

      // Tunnel de conversion
      const conversionFunnel = {
        applications: applicationsData.total,
        reviewed: applicationsData.pending + applicationsData.accepted + applicationsData.rejected,
        accepted: applicationsData.accepted,
        interviews: bookedSlots,
        completed: agendaData.completed_slots || 0
      };

      // Taux d'annulation
      const cancellationRate = {
        total: agendaData.cancelled_slots || 0,
        candidateCancellations: Math.floor((agendaData.cancelled_slots || 0) * 0.67), // Placeholder
        recruiterCancellations: Math.floor((agendaData.cancelled_slots || 0) * 0.33), // Placeholder
        rate: totalSlots > 0 ? Math.round(((agendaData.cancelled_slots || 0) / totalSlots) * 100 * 10) / 10 : 0
      };

      // Taux de présence
      const attendanceRate = {
        present: agendaData.completed_slots || 0,
        planned: bookedSlots,
        rate: bookedSlots > 0 ? Math.round(((agendaData.completed_slots || 0) / bookedSlots) * 100 * 10) / 10 : 0,
        absences: bookedSlots - (agendaData.completed_slots || 0)
      };

      setStats({
        general: {
          companies: kpisData.companies || 0,
          candidates: kpisData.candidates || 0,
          offers: kpisData.offers || 0,
          recruiters: agendaData.recruiter_stats?.length || 0,
          companiesChange: 12, // Placeholder - devrait venir de l'API
          candidatesChange: 23,
          offersChange: 8,
          recruitersChange: 15
        },
        agenda: {
          total: totalSlots,
          available: agendaData.available_slots || 0,
          booked: bookedSlots,
          completed: agendaData.completed_slots || 0,
          cancelled: agendaData.cancelled_slots || 0,
          fillRate: Math.round(fillRate * 10) / 10
        },
        applications: {
          ...applicationsData,
          acceptanceRate
        },
        interviews: {
          ...interviewsData,
          inProgress: inProgressToday
        },
        byCompany: byCompanyData,
        hourlyPeaks,
        conversionFunnel,
        cancellationRate,
        attendanceRate
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="statistics-overview">
      {/* KPI Cards */}
      <div className="kpi-cards-grid">
        <div className="kpi-card kpi-card-blue">
          <div className="kpi-icon-wrapper blue">
            <FaBuilding />
          </div>
          <div className="kpi-change positive">
            <FaArrowUp /> +{stats.general.companiesChange}%
          </div>
          <div className="kpi-value">{stats.general.companies}</div>
          <div className="kpi-label">ENTREPRISES PARTICIPANTES</div>
          <div className="kpi-comparison">vs mois dernier</div>
        </div>

        <div className="kpi-card kpi-card-green">
          <div className="kpi-icon-wrapper green">
            <FaUsers />
          </div>
          <div className="kpi-change positive">
            <FaArrowUp /> +{stats.general.candidatesChange}%
          </div>
          <div className="kpi-value">{stats.general.candidates}</div>
          <div className="kpi-label">CANDIDATS INSCRITS</div>
          <div className="kpi-comparison">vs mois dernier</div>
        </div>

        <div className="kpi-card kpi-card-purple">
          <div className="kpi-icon-wrapper purple">
            <FaBriefcase />
          </div>
          <div className="kpi-change positive">
            <FaArrowUp /> +{stats.general.offersChange}%
          </div>
          <div className="kpi-value">{stats.general.offers}</div>
          <div className="kpi-label">OFFRES PUBLIÉES</div>
          <div className="kpi-comparison">vs mois dernier</div>
        </div>

        <div className="kpi-card kpi-card-orange">
          <div className="kpi-icon-wrapper orange">
            <FaUserCheck />
          </div>
          <div className="kpi-change positive">
            <FaArrowUp /> +{stats.general.recruitersChange}%
          </div>
          <div className="kpi-value">{stats.general.recruiters}</div>
          <div className="kpi-label">RECRUTEURS ACTIFS</div>
          <div className="kpi-comparison">vs mois dernier</div>
        </div>
      </div>

      {/* Agenda Section */}
      <div className="section-title">
        <FaCalendarAlt className="section-icon" />
        Agenda (Créneaux d'entretien)
      </div>
      <div className="agenda-cards-grid">
        <div className="agenda-card">
          <FaCalendarAlt className="agenda-icon" />
          <div className="agenda-value">{stats.agenda.total}</div>
          <div className="agenda-label">Total créneaux</div>
        </div>
        <div className="agenda-card blue">
          <FaClockIcon className="agenda-icon" />
          <div className="agenda-value">{stats.agenda.available}</div>
          <div className="agenda-label">Disponibles</div>
        </div>
        <div className="agenda-card green">
          <FaCheckCircle className="agenda-icon" />
          <div className="agenda-value">{stats.agenda.booked}</div>
          <div className="agenda-label">Réservés</div>
        </div>
        <div className="agenda-card purple">
          <FaCheckCircle className="agenda-icon" />
          <div className="agenda-value">{stats.agenda.completed}</div>
          <div className="agenda-label">Terminés</div>
        </div>
        <div className="agenda-card red">
          <FaTimesCircle className="agenda-icon" />
          <div className="agenda-value">{stats.agenda.cancelled}</div>
          <div className="agenda-label">Annulés</div>
        </div>
        <div className="agenda-card orange">
          <FaPercent className="agenda-icon" />
          <div className="agenda-value">{stats.agenda.fillRate}%</div>
          <div className="agenda-label">Taux de remplissage</div>
        </div>
      </div>

      {/* Candidatures and Entretiens Section */}
      <div className="applications-interviews-grid">
        <div className="applications-card">
          <div className="card-header">
            <div className="card-icon orange">
              <FaUserCheck />
            </div>
            <h3>Candidatures</h3>
          </div>
          <div className="applications-content">
            <div className="applications-summary">
              <div className="summary-item">
                <span className="summary-label">Total candidatures</span>
                <span className="summary-value">{stats.applications.total}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Taux d'acceptation</span>
                <span className="summary-value green">{stats.applications.acceptanceRate}%</span>
              </div>
            </div>
            <div className="donut-chart-container">
              {stats.applications.total > 0 ? (
                <div className="donut-chart">
                  <svg viewBox="0 0 120 120" className="donut-svg">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="20"
                    />
                    {stats.applications.accepted > 0 && (
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="20"
                        strokeDasharray={`${(stats.applications.accepted / stats.applications.total) * 314} 314`}
                        strokeDashoffset="78.5"
                        transform="rotate(-90 60 60)"
                      />
                    )}
                    {stats.applications.pending > 0 && (
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="20"
                        strokeDasharray={`${(stats.applications.pending / stats.applications.total) * 314} 314`}
                        strokeDashoffset={`${78.5 - (stats.applications.accepted / stats.applications.total) * 314}`}
                        transform="rotate(-90 60 60)"
                      />
                    )}
                    {stats.applications.rejected > 0 && (
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="20"
                        strokeDasharray={`${(stats.applications.rejected / stats.applications.total) * 314} 314`}
                        strokeDashoffset={`${78.5 - ((stats.applications.accepted + stats.applications.pending) / stats.applications.total) * 314}`}
                        transform="rotate(-90 60 60)"
                      />
                    )}
                  </svg>
                  <div className="donut-center">
                    <div className="donut-percentage">{stats.applications.acceptanceRate}%</div>
                  </div>
                </div>
              ) : (
                <div className="donut-chart-empty">Aucune donnée</div>
              )}
            </div>
            <div className="applications-legend">
              <div className="legend-item">
                <div className="legend-color orange"></div>
                <span>{stats.applications.pending} En attente</span>
              </div>
              <div className="legend-item">
                <div className="legend-color green"></div>
                <span>{stats.applications.accepted} Acceptées</span>
              </div>
              <div className="legend-item">
                <div className="legend-color red"></div>
                <span>{stats.applications.rejected} Refusées</span>
              </div>
            </div>
          </div>
        </div>

        <div className="interviews-card">
          <div className="card-header">
            <div className="card-icon purple">
              <FaVideo />
            </div>
            <h3>Entretiens</h3>
          </div>
          <div className="interviews-content">
            <div className="interview-stat-card blue">
              <FaVideo className="interview-icon" />
              <div className="interview-info">
                <div className="interview-label">Entretiens programmés</div>
                <div className="interview-sublabel">Créneaux réservés</div>
              </div>
              <div className="interview-value">{stats.interviews.scheduled}</div>
            </div>
            <div className="interview-stat-card green">
              <FaCheckCircle className="interview-icon" />
              <div className="interview-info">
                <div className="interview-label">En cours</div>
                <div className="interview-sublabel">Aujourd'hui</div>
              </div>
              <div className="interview-value">{stats.interviews.inProgress}</div>
            </div>
            <div className="interview-stat-card purple">
              <FaCheckCircle className="interview-icon" />
              <div className="interview-info">
                <div className="interview-label">Terminés</div>
                <div className="interview-sublabel">Total réalisés</div>
              </div>
              <div className="interview-value">{stats.interviews.completed}</div>
            </div>
            <div className="interview-stat-card orange">
              <FaPercent className="interview-icon" />
              <div className="interview-info">
                <div className="interview-label">Taux de participation</div>
                <div className="interview-sublabel">Présence confirmée</div>
              </div>
              <div className="interview-value">{stats.interviews.participationRate}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderByCompany = () => (
    <div className="by-company-view">
      <div className="chart-card">
        <h3>Candidatures et offres par entreprise</h3>
        <div className="bar-chart-container">
          {/* Placeholder pour graphique en barres */}
          <div className="bar-chart-placeholder">
            Graphique en barres à implémenter
          </div>
        </div>
      </div>
      <div className="company-table-card">
        <h3>Détails par entreprise</h3>
        <table className="company-table">
          <thead>
            <tr>
              <th>Entreprise</th>
              <th>Offres</th>
              <th>Candidatures</th>
              <th>Créneaux</th>
              <th>Taux d'acceptation</th>
            </tr>
          </thead>
          <tbody>
            {/* Données à charger depuis l'API */}
            <tr>
              <td colSpan="5" className="no-data">Aucune donnée disponible</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTemporalAnalysis = () => (
    <div className="temporal-analysis-view">
      <div className="chart-card">
        <div className="chart-header">
          <FaCalendarAlt className="chart-icon" />
          <div>
            <h3>Pics horaires</h3>
            <p className="chart-subtitle">Réservations de créneaux par tranche horaire</p>
          </div>
        </div>
        <div className="bar-chart-container">
          {/* Placeholder pour graphique de pics horaires */}
          <div className="bar-chart-placeholder">
            Graphique de pics horaires à implémenter
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="performance-view">
      <div className="chart-card">
        <h3>Tunnel de conversion</h3>
        <div className="funnel-chart-container">
          {/* Placeholder pour tunnel de conversion */}
          <div className="funnel-chart-placeholder">
            Tunnel de conversion à implémenter
          </div>
        </div>
      </div>
      <div className="performance-kpi-grid">
        <div className="performance-kpi-card">
          <div className="performance-kpi-header">
            <div className="performance-icon red">
              <FaTimesCircle />
            </div>
            <h4>Taux d'annulation</h4>
          </div>
          <div className="performance-kpi-value red">{stats.cancellationRate.rate}%</div>
          <div className="performance-kpi-details">
            {stats.cancellationRate.total} annulations / {stats.agenda.total} créneaux
          </div>
          <div className="performance-kpi-breakdown">
            <div className="breakdown-item">
              <span>Annulations candidat</span>
              <span>{stats.cancellationRate.candidateCancellations}</span>
            </div>
            <div className="breakdown-item">
              <span>Annulations recruteur</span>
              <span>{stats.cancellationRate.recruiterCancellations}</span>
            </div>
          </div>
        </div>

        <div className="performance-kpi-card">
          <div className="performance-kpi-header">
            <div className="performance-icon green">
              <FaCheckCircle />
            </div>
            <h4>Taux de présence</h4>
          </div>
          <div className="performance-kpi-value green">{stats.attendanceRate.rate}%</div>
          <div className="performance-kpi-details">
            {stats.attendanceRate.present} présents / {stats.attendanceRate.planned} prévus
          </div>
          <div className="performance-kpi-breakdown">
            <div className="breakdown-item">
              <span>Présence confirmée</span>
              <span>{stats.attendanceRate.present}</span>
            </div>
            <div className="breakdown-item">
              <span>Absences</span>
              <span>{stats.attendanceRate.absences}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="virtual-statistics-container">
      <Navbar />
      <div className="statistics-layout">
        {/* Top Navigation Bar */}
        <div className="statistics-top-nav">
          <nav className="top-nav-menu">
            <button
              className={`top-nav-item ${activeView === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveView('overview')}
            >
              <FaHome className="nav-icon" />
              Vue d'ensemble
            </button>
            <button
              className={`top-nav-item ${activeView === 'byCompany' ? 'active' : ''}`}
              onClick={() => setActiveView('byCompany')}
            >
              <FaBuilding className="nav-icon" />
              Par entreprise
            </button>
            <button
              className={`top-nav-item ${activeView === 'bySector' ? 'active' : ''}`}
              onClick={() => setActiveView('bySector')}
            >
              <FaChartBar className="nav-icon" />
              Par secteur
            </button>
            <button
              className={`top-nav-item ${activeView === 'temporal' ? 'active' : ''}`}
              onClick={() => setActiveView('temporal')}
            >
              <FaClock className="nav-icon" />
              Analyses temporelles
            </button>
            <button
              className={`top-nav-item ${activeView === 'performance' ? 'active' : ''}`}
              onClick={() => setActiveView('performance')}
            >
              <FaTrophy className="nav-icon" />
              Performance globale
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="statistics-main">
          <div className="statistics-header">
            <h1>Statistiques du Forum</h1>
            <p>Vue d'ensemble et analyses détaillées</p>
          </div>
          <div className="statistics-content">
            {activeView === 'overview' && renderOverview()}
            {activeView === 'byCompany' && renderByCompany()}
            {activeView === 'bySector' && <div>Par secteur - À implémenter</div>}
            {activeView === 'temporal' && renderTemporalAnalysis()}
            {activeView === 'performance' && renderPerformance()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualStatistics;

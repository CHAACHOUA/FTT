// OrganizerDashboard.js
import React, { useState, useEffect } from "react";
import { FaBuilding, FaUserFriends, FaBriefcase } from "react-icons/fa";
import Navbar from "../../common/NavBar";
import SubMenu from "./SubMenu";
import { useAuth } from '../../../context/AuthContext';
import { useLocation } from "react-router-dom";
import axios from 'axios';
import "./Dashboard.css";

export default function OrganizerDashboard() {
  const { name, accessToken } = useAuth();
  const location = useLocation();
  const forum = location.state?.forum;
  const forumId = forum?.id || location.state?.forumId;
  const API = process.env.REACT_APP_API_BASE_URL;
  
  // Debug: Log location state
  console.log('🔍 [FRONTEND] OrganizerDashboard - location.state:', location.state);
  console.log('🔍 [FRONTEND] OrganizerDashboard - forum:', forum);
  console.log('🔍 [FRONTEND] OrganizerDashboard - forumId:', forumId);
  
  // Fallback pour récupérer les données du forum si elles ne sont pas disponibles
  const [forumData, setForumData] = useState(forum);
  
  const [kpis, setKpis] = useState([
    {
      label: "Entreprises",
      value: 0,
      icon: <FaBuilding />,
      bg: "linear-gradient(135deg, #4f8cff 0%, #3358d1 100%)"
    },
    {
      label: "Candidats",
      value: 0,
      icon: <FaUserFriends />,
      bg: "linear-gradient(135deg, #f857a6 0%, #ff5858 100%)"
    },
    {
      label: "Offres",
      value: 0,
      icon: <FaBriefcase />,
      bg: "linear-gradient(135deg, #34d399 0%, #059669 100%)"
    }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      if (!forumId || !accessToken) {
        console.log('Données manquantes pour les KPIs:', { forumId, accessToken });
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API}/api/forums/${forumId}/kpis/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        const data = response.data;
        setKpis([
          {
            label: "Entreprises",
            value: data.companies || 0,
            icon: <FaBuilding />,
            bg: "linear-gradient(135deg, #4f8cff 0%, #3358d1 100%)"
          },
          {
            label: "Candidats",
            value: data.candidates || 0,
            icon: <FaUserFriends />,
            bg: "linear-gradient(135deg, #f857a6 0%, #ff5858 100%)"
          },
          {
            label: "Offres",
            value: data.offers || 0,
            icon: <FaBriefcase />,
            bg: "linear-gradient(135deg, #34d399 0%, #059669 100%)"
          }
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement des KPIs:', error);
        // En cas d'erreur, on garde les valeurs par défaut (0)
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, [forumId, accessToken, API]);

  // Récupérer les données du forum si elles ne sont pas disponibles
  useEffect(() => {
    const fetchForumData = async () => {
      if (!forumId || !accessToken || forum) {
        return;
      }

      try {
        const response = await axios.get(`${API}/api/forums/${forumId}/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setForumData(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données du forum:', error);
      }
    };

    fetchForumData();
  }, [forumId, accessToken, API, forum]);

  return (
    <div className="dashboard-bg" style={{ paddingTop: '70px' }}>
      <Navbar />
      <div className="dashboard-header">
        <h1>Bonjour {name || 'Organisateur'} ! <span role="img" aria-label="wave">👋</span></h1>
        <p>Découvrez de nouvelles opportunités qui vous correspondent parfaitement.</p>
      </div>
      <div className="dashboard-kpis">
        {kpis.map((kpi) => (
          <div 
            className="dashboard-kpi-card" 
            key={kpi.label}
          >
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">
              {loading ? (
                <div className="loading-text">Chargement...</div>
              ) : (
                kpi.value
              )}
            </div>
            <div className="kpi-icon">{kpi.icon}</div>
          </div>
        ))}
      </div>
      <SubMenu forum={forumData || forum} forumId={forumId} accessToken={accessToken} API={API} />
    </div>
  );
}

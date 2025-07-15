// OrganizerDashboard.js
import React from "react";
import { FaBuilding, FaUserFriends, FaBriefcase } from "react-icons/fa";
import Navbar from "../../common/NavBar";
import SubMenu from "./SubMenu";
import { useAuth } from '../../../context/AuthContext';
import { useLocation } from "react-router-dom";
import "./Dashboard.css";

const kpis = [
  {
    label: "Entreprises",
    value: 24, // à remplacer par tes données
    icon: <FaBuilding />,
    bg: "linear-gradient(135deg, #4f8cff 0%, #3358d1 100%)"
  },
  {
    label: "Candidats",
    value: 120,
    icon: <FaUserFriends />,
    bg: "linear-gradient(135deg, #f857a6 0%, #ff5858 100%)"
  },
  {
    label: "Offres",
    value: 42,
    icon: <FaBriefcase />,
    bg: "linear-gradient(135deg, #34d399 0%, #059669 100%)"
  }
];

export default function OrganizerDashboard() {
  const { name, accessToken } = useAuth();
  const location = useLocation();
  const forum = location.state?.forum;
  const forumId = forum?.id;
  const API = process.env.REACT_APP_API_BASE_URL;

  return (
    <div className="dashboard-bg" style={{ paddingTop: '70px' }}>
      <Navbar />
      <div className="dashboard-header">
        <h1>Bonjour {name || 'Organisateur'} ! <span role="img" aria-label="wave">👋</span></h1>
        <p>Découvrez de nouvelles opportunités qui vous correspondent parfaitement.</p>
      </div>
      <div className="dashboard-kpis">
        {kpis.map((kpi) => (
          <div className="dashboard-kpi-card" key={kpi.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #5a5a8e" }}>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-icon" style={{ background: kpi.bg, color: "#fff" }}>{kpi.icon}</div>
          </div>
        ))}
      </div>
      <SubMenu forum={forum} forumId={forumId} accessToken={accessToken} API={API} />
    </div>
  );
}

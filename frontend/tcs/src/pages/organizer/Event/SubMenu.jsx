// SubMenuOrganizer.js
import React from "react";
import { FaBolt, FaCalendarAlt, FaEdit, FaBriefcase, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./SubMenu.css";

const actions = [
  {
    label: "Toutes les offres",
    desc: "Consultez toutes les offres postées par les recruteurs",
    icon: <FaBriefcase size={48} />,
    cardClass: "offers-card",
    key: "offers",
    route: "/organizer/offers"
  },
  {
    label: "Candidats inscrits",
    desc: "Gérez les candidats participant à votre forum",
    icon: <FaCalendarAlt size={48} />,
    cardClass: "candidat-card",
    key: "candidats",
    route: "/organizer/candidates"
  },
  {
    label: "Gérer infos du forum",
    desc: "Modifiez les informations de votre forum",
    icon: <FaEdit size={48} />,
    cardClass: "forum-info-card",
    key: "forum-info",
    route: "/organizer/forum-info"
  },
  {
    label: "Entreprises participantes",
    desc: "Pilotez les entreprises rattachées à vos forums",
    icon: <FaBolt size={48} />,
    cardClass: "entreprise-card",
    key: "entreprises",
    route: "/organizer/companies"
  },
  {
    label: "Programmes & Speakers",
    desc: "Gérez les programmes et speakers de votre forum",
    icon: <FaUsers size={48} />,
    cardClass: "programmes-card",
    key: "programmes",
    route: "/organizer/forum"
  }
];

export default function SubMenu({ forum, forumId, accessToken, API }) {
  const navigate = useNavigate();
  return (
    <div className="dashboard-submenu">
      {actions.map((action) => (
        <div
          key={action.label}
          className={`dashboard-action-card ${action.cardClass}`}
          onClick={() => {
            if (action.key === "offers") {
              navigate(action.route, { state: { forum, forumId, accessToken, apiBaseUrl: API } });
            } else if (action.key === "forum-info") {
              navigate(action.route, { state: { forum, accessToken, apiBaseUrl: API } });
            } else if (action.key === "entreprises") {
              navigate(action.route, { state: { companies: forum?.companies, forum, accessToken, apiBaseUrl: API } });
            } else if (action.key === "candidats") {
              navigate(action.route, { state: { forumId, accessToken, apiBaseUrl: API } });
            } else if (action.key === "programmes") {
              navigate(`/organizer/forum/${forumId}/programmes`, { state: { forum, forumId, accessToken, apiBaseUrl: API } });
            }
          }}
          style={{ cursor: "pointer" }}
        >
          <div className="action-icon">{action.icon}</div>
          <div className="action-title">{action.label}</div>
          <div className="action-desc">{action.desc}</div>
        </div>
      ))}
    </div>
  );
}

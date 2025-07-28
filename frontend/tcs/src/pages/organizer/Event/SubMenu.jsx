// SubMenuOrganizer.js
import React from "react";
import { FaBolt, FaCalendarAlt, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./SubMenu.css";

const actions = [
  
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
            if (action.key === "forum-info") {
              navigate(action.route, { state: { forum, accessToken, apiBaseUrl: API } });
            } else if (action.key === "entreprises") {
              navigate(action.route, { state: { companies: forum?.companies, forum, accessToken, apiBaseUrl: API } });
            } else if (action.key === "candidats") {
              navigate(action.route, { state: { forumId, accessToken, apiBaseUrl: API } });
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

// SubMenuOrganizer.js
import React from "react";
import { FaBolt, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./SubMenu.css";

const actions = [
  {
    label: "Entreprises participantes",
    desc: "Pilotez les entreprises rattachées à vos forums",
    icon: <FaBolt size={48} />,
    cardClass: "entreprise-card",
    key: "entreprises",
    route: "/organizer/companies"
  },
  {
    label: "Candidats inscrits",
    desc: "Gérez les candidats participant à votre forum",
    icon: <FaCalendarAlt size={48} />,
    cardClass: "candidat-card",
    key: "candidats",
    route: "/organizer/candidates"
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
            if (action.key === "entreprises") {
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

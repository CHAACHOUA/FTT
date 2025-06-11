import React from 'react';

const ForumCompanies = ({ companies }) => {
  return (
    <div className="forum-detail-companies-list">
      {companies.map((company, index) => (
        <div key={index} className="forum-detail-company-card">
          {company.logo && (
            <img src={company.logo} alt={company.name} className="forum-detail-company-logo" />
          )}
          <h3 className="forum-detail-company-name">{company.name}</h3>
          <p className="forum-detail-company-recruiters">
            Recruteurs : {company.recruiters.length}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ForumCompanies;

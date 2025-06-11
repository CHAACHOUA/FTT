import React from 'react';
import { FaMapMarkerAlt, FaBriefcase, FaLocationArrow, FaWifi } from 'react-icons/fa';
import '../../pages/styles/forum/ForumOffer.css';
import LogoComany from '../../assets/Logo-FTT.png';

const ForumOffers = ({ companies }) => {

  const allOffers = companies.flatMap(company =>
    company.offers.map(offer => ({
      ...offer,
      companyName: company.name,
      logo: company.logo,
    }))
  );

  if (allOffers.length === 0) {
    return <p className="text-gray-500">Aucune offre n'est disponible pour le moment.</p>;
  }

  return (
    <div className="forum-offers-container">
      {allOffers.map((offer) => (
        <div key={offer.id} className="forum-offer-card">
          {/* Logo entreprise */}
          <img
            src={offer.logo || LogoComany}
            alt={offer.companyName}
            className="forum-offer-logo"
          />

          {/* Contenu principal */}
          <div className="forum-offer-content">
            <p className="forum-offer-recruiter">
              {offer.recruiter_name} @{offer.companyName}
            </p>
            <h3 className="forum-offer-title">{offer.title}</h3>

            <div className="forum-offer-meta">
              <div className="forum-offer-meta-icon">
                <FaBriefcase /> {offer.contract_type}
              </div>
              <div className="forum-offer-meta-icon">
                <FaMapMarkerAlt /> {offer.location || 'Non précisé'}
              </div>
            </div>
          </div>

          {/* Actions (icônes à droite) */}
          <div className="forum-offer-actions">
            <button className="forum-offer-action-button">
              <FaLocationArrow />
            </button>
            <button className="forum-offer-action-button">
              <FaWifi />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ForumOffers;

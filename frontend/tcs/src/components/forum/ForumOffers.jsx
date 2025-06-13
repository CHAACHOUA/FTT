import React, { useState, useEffect } from 'react';
import {
  FaMapMarkerAlt,
  FaBriefcase,
  FaLocationArrow,
  FaHeart,
  FaRegHeart,
} from 'react-icons/fa';
import '../../pages/styles/forum/ForumOffer.css';
import LogoCompany from '../../assets/Logo-FTT.png';
import SearchBarOffers from './SearchBarOffers';
import axios from 'axios';

const ForumOffers = ({ companies }) => {
  const allOffers = companies.flatMap(company =>
    company.offers.map(offer => ({
      ...offer,
      companyName: company.name,
      logo: company.logo,
    }))
  );

  const [filteredOffers, setFilteredOffers] = useState(allOffers);
  const [favoriteOfferIds, setFavoriteOfferIds] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  useEffect(() => {
    setFilteredOffers(allOffers);
  }, [companies]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/recruiters/favorites/list/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ids = response.data.map(offer => offer.id);
        setFavoriteOfferIds(ids);
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
      }
    };

    fetchFavorites();
  }, []);

  const toggleFavorite = async (offerId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/recruiters/favorites/toggle/${offerId}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'liked') {
        setFavoriteOfferIds(prev => [...prev, offerId]);
      } else {
        setFavoriteOfferIds(prev => prev.filter(id => id !== offerId));
      }
    } catch (error) {
      console.error('Erreur lors du toggle like:', error);
    }
  };

  const getVisibleOffers = () => {
    return showOnlyFavorites
      ? filteredOffers.filter(offer => favoriteOfferIds.includes(offer.id))
      : filteredOffers;
  };

  return (
    <div className="forum-offers-wrapper">
      <div className="forum-offers-header">
        <SearchBarOffers offers={allOffers} onFilter={setFilteredOffers} />
        <div
          className="favorites-label"
          onClick={() => setShowOnlyFavorites(prev => !prev)}
        >
          <span className="favorites-icon">❤️</span>
          <span className="favorites-text">
            {showOnlyFavorites
              ? 'Voir toutes les offres'
              : `Mes favoris (${favoriteOfferIds.length})`}
          </span>
        </div>
      </div>

      {getVisibleOffers().length === 0 ? (
        <p className="text-gray-500">Aucune offre ne correspond à votre recherche.</p>
      ) : (
        <div className="forum-offers-container">
          {getVisibleOffers().map(offer => (
            <div key={offer.id} className="forum-offer-card">
              <img
                src={offer.logo || LogoCompany}
                alt={offer.companyName}
                className="forum-offer-logo"
              />
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
              <div className="forum-offer-actions">
                <button
                  className="forum-offer-action-button"
                  onClick={() => toggleFavorite(offer.id)}
                  title="Ajouter aux favoris"
                >
                  {favoriteOfferIds.includes(offer.id) ? <FaHeart /> : <FaRegHeart />}
                </button>
                <button className="forum-offer-action-button">
                  <FaLocationArrow />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ForumOffers;

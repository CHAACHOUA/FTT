import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../pages/styles/recruiter/CompanyProfile.css';
import { FaBuilding, FaImage, FaGlobe, FaFileAlt, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Sectors from './Sectors';
import Loading from '../../../components/loyout/Loading';
import { Button, Card, Badge, Input } from '../../../components/common';

const CompanyProfile = ({ accessToken, readOnly = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    logo: null,
    banner: null,
    sectors: [''],  // Toujours au moins un secteur vide
    website: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const API = process.env.REACT_APP_API_BASE_URL;

  const getLogoURL = (logo) => {
    if (!logo) return null;
    if (typeof logo === 'string') {
      if (logo.startsWith('http')) return logo;
      const mediaBaseUrl = process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000';
      return `${mediaBaseUrl}${logo}`;
    }
    return URL.createObjectURL(logo);
  };

  const getBannerURL = (banner) => {
    if (!banner) return null;
    if (typeof banner === 'string') {
      if (banner.startsWith('http')) return banner;
      const mediaBaseUrl = process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000';
      return `${mediaBaseUrl}${banner}`;
    }
    return URL.createObjectURL(banner);
  };

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const res = await axios.get(`${API}/companies/profile/`, {
          withCredentials: true
        });

        const data = res.data;

        let sectors = [];
        if (Array.isArray(data.sectors)) {
          sectors = data.sectors.flatMap((sec) => {
            if (typeof sec === 'string') {
              try {
                const parsed = JSON.parse(sec);
                if (Array.isArray(parsed)) return parsed;
                if (typeof parsed === 'string') return [parsed];
                return [JSON.stringify(parsed)];
              } catch {
                return [sec];
              }
            } else if (typeof sec === 'object' && sec !== null) {
              return [sec.name || JSON.stringify(sec)];
            } else {
              return [String(sec)];
            }
          });
        }

        setFormData({
          name: data.name || '',
          logo: data.logo || null,
          banner: data.banner || null,
          sectors: sectors.length > 0 ? sectors : [''],
          website: data.website || '',
          description: data.description || '',
        });
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, [accessToken, API]);

  const handleFieldChange = (e) => {
    if (readOnly) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    if (readOnly) return;
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, logo: file }));
    }
  };

  const handleBannerChange = (e) => {
    if (readOnly) return;
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, banner: file }));
    }
  };

const handleSectorsChange = (newSectors) => {
  setFormData((prev) => ({ ...prev, sectors: newSectors }));
};

 const handleSubmit = async () => {
  setLoading(true);

  try {
    const formPayload = new FormData();
    formPayload.append('name', formData.name);
    formPayload.append('website', formData.website);
    formPayload.append('description', formData.description);

    // Déduplique et filtre les secteurs vides
    const uniqueSectors = [...new Set(formData.sectors.map(s => s.trim()))].filter(s => s !== '');
    formPayload.append('sectors', JSON.stringify(uniqueSectors));

    if (formData.logo instanceof File) {
      formPayload.append('logo', formData.logo);
    }

    if (formData.banner instanceof File) {
      formPayload.append('banner', formData.banner);
    }

    const res = await axios.put(
      `${API}/companies/profile/update/`,
      formPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    toast.success(res.data?.message || 'Profil mis à jour avec succès.');
  } catch (err) {
    toast.error(err.response?.data?.message || err.message);
  } finally {
    setLoading(false);
  }
};


  if (loading) return <Loading />;

  return (
    <div className="offers-list-wrapper">
      <div className="offers-list-content">
        <h3 className="company-profile-title">Profil de l'entreprise</h3>

      {/* Logo */}
      <div className="company-logo-container">
        {formData.logo ? (
          <img
            src={getLogoURL(formData.logo)}
            alt="Logo"
            className="company-logo"
            style={{ borderRadius: '50%' }}
          />
        ) : (
          <div className="company-initials-circle" style={{ fontSize: 24 }}>
            {formData.name ? formData.name.charAt(0).toUpperCase() : '??'}
          </div>
        )}
        {!readOnly && (
          <label htmlFor="logo" className="upload-logo-btn">
            <FaImage /> Importer un logo
            <input
              type="file"
              id="logo"
              name="logo"
              accept="image/png, image/jpeg"
              onChange={handleLogoChange}
              style={{ display: 'none' }}
            />
          </label>
        )}
      </div>

      {/* Photo de couverture */}
      <div className="company-banner-container">
        <h4 style={{ marginBottom: '10px', color: '#374151' }}>Photo de couverture</h4>
        <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '15px' }}>
          Ajoutez une photo de couverture pour votre entreprise
        </p>
        {formData.banner ? (
          <div className="banner-preview">
            <img
              src={getBannerURL(formData.banner)}
              alt="Bannière"
              className="company-banner"
            />
            {!readOnly && (
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, banner: null }))}
                className="remove-banner-btn"
                title="Supprimer la photo de couverture"
              >
                <FaTrash />
              </button>
            )}
          </div>
        ) : (
          <div className="banner-placeholder">
            <FaImage style={{ fontSize: '2rem', color: '#9ca3af', marginBottom: '10px' }} />
            <p style={{ color: '#6b7280', marginBottom: '15px' }}>Aucune photo de couverture</p>
          </div>
        )}
        {!readOnly && (
          <label htmlFor="banner" className="upload-banner-btn">
            <FaImage /> {formData.banner ? 'Changer la photo de couverture' : 'Ajouter une photo de couverture'}
            <input
              type="file"
              id="banner"
              name="banner"
              accept="image/png, image/jpeg"
              onChange={handleBannerChange}
              style={{ display: 'none' }}
            />
          </label>
        )}
      </div>

      {/* Nom */}
      <div className="company-input-modern">
        <span className="company-input-icon"><FaBuilding /></span>
        <div className="company-input-wrapper-modern">
          <label className={`floating-label ${formData.name ? 'filled' : ''}`}>
            Nom de l'entreprise <span className="required">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleFieldChange}
            disabled={readOnly}
          />
        </div>
      </div>

      {/* Site web */}
      <div className="company-input-modern">
        <span className="company-input-icon"><FaGlobe /></span>
        <div className="company-input-wrapper-modern">
          <label className={`floating-label ${formData.website ? 'filled' : ''}`}>
            Site web
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleFieldChange}
            disabled={readOnly}
          />
        </div>
      </div>

      {/* Description */}
      <div className="company-input-modern">
        <span className="company-input-icon"><FaFileAlt /></span>
        <div className="company-input-wrapper-modern">
          <label className={`floating-label ${formData.description ? 'filled' : ''}`}>
            Description de l'entreprise
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleFieldChange}
            disabled={readOnly}
            rows={4}
            style={{
              resize: 'vertical',
              minHeight: '100px',
              fontFamily: 'inherit',
              fontSize: 'inherit'
            }}
          />
        </div>
      </div>

      {/* Secteurs */}
      <Sectors
        sectors={formData.sectors}
        onUpdate={handleSectorsChange}
        readOnly={readOnly}
      />

      {!readOnly && (
        <div style={{ textAlign: 'right', marginTop: 20 }}>
          <button
            onClick={handleSubmit}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              padding: 'var(--space-sm) 16px',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.75rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
          >
            Enregistrer
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

export default CompanyProfile;

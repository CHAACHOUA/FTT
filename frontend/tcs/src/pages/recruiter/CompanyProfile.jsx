import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/recruiter/CompanyProfile.css';
import { FaBuilding, FaImage, FaGlobe, FaFileAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Sectors from './Sectors';

const CompanyProfile = ({ accessToken, readOnly = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    logo: null,
    sectors: [''],  // Toujours au moins un secteur vide
    website: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const API = process.env.REACT_APP_API_BASE_URL;

  const getLogoURL = (logo) => {
    if (!logo) return null;
    if (typeof logo === 'string') {
      return logo.startsWith('http') ? logo : `${API}${logo}`;
    }
    return URL.createObjectURL(logo);
  };

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const res = await axios.get(`${API}/api/companies/profile/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
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
    if (file && file.size <= 2 * 1024 * 1024) {
      setFormData((prev) => ({ ...prev, logo: file }));
    } else {
      alert('Fichier trop volumineux (max 2Mo)');
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

    const res = await axios.put(
      `${API}/api/companies/profile/update/`,
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


  if (loading) return <div>Chargement...</div>;

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
              background: 'linear-gradient(135deg, #18386c 0%, #06b6d4 100%)',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: 16,
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(24, 56, 108, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #06b6d4 0%, #18386c 100%)';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(24, 56, 108, 0.18)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #18386c 0%, #06b6d4 100%)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(24, 56, 108, 0.1)';
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

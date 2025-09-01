import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ChangePassword from '../candidate/ChangePassword';
import DeleteAccount from '../candidate/DeleteAccount';
import { toast } from 'react-toastify';
import Loading from '../common/Loading';
import { useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import '../candidate/ProfileView.css';
import '../styles/candidate/Presentation.css';
import Navbar from '../common/NavBar';
import { FaUser, FaImage, FaPhone, FaEnvelope } from 'react-icons/fa';

const OrganizerProfileView = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    logo: null,
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuth();
  const location = useLocation();
  const API = process.env.REACT_APP_API_BASE_URL;

  const isSettingsPage = location.pathname === '/settings-organizer';

  const getLogoURL = (logo) => {
    if (!logo) return null;
    if (typeof logo === 'string') {
      return logo.startsWith('http') ? logo : `${API}${logo}`;
    }
    return URL.createObjectURL(logo);
  };

  useEffect(() => {
    const fetchOrganizerProfile = async () => {
      try {
        const res = await axios.get(`${API}/api/organizers/profile/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const data = res.data;
        setFormData({
          name: data.name || '',
          phone_number: data.phone_number || '',
          logo: data.logo || null,
          email: data.email || '',
        });
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken && !isSettingsPage) {
      fetchOrganizerProfile();
    } else {
      setLoading(false);
    }
  }, [accessToken, API, isSettingsPage]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      setFormData((prev) => ({ ...prev, logo: file }));
    } else {
      alert('Fichier trop volumineux (max 2Mo)');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('phone_number', formData.phone_number);

      if (formData.logo instanceof File) {
        formPayload.append('logo', formData.logo);
      }

      const res = await axios.put(
        `${API}/api/organizers/profile/update/`,
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
    <div style={{ paddingTop: '80px' }}>
      <Navbar />
      <div className="profile-container">
        <div className="profile-content">
          {!isSettingsPage ? (
            <>
              <section id="profile">
                <div className="presentation-section">
                  <h3 className="presentation-title">Profil de l'organisateur</h3>

                  {/* Logo */}
                  <div className="profile-photo-container">
                    {formData.logo ? (
                      <img
                        src={getLogoURL(formData.logo)}
                        alt="Logo"
                        className="profile-photo"
                        style={{ borderRadius: '50%' }}
                      />
                    ) : (
                      <div className="profile-initials-circle" style={{ fontSize: 24 }}>
                        {formData.name ? formData.name.charAt(0).toUpperCase() : '??'}
                      </div>
                    )}
                    <label htmlFor="logo" className="upload-photo-btn">
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
                  </div>

                  {/* Nom */}
                  <div className="input-modern">
                    <span className="input-icon"><FaUser /></span>
                    <div className="input-wrapper-modern">
                      <label className={`floating-label ${formData.name ? 'filled' : ''}`}>
                        Nom de l'organisateur <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleFieldChange}
                      />
                    </div>
                  </div>

                  {/* Téléphone */}
                  <div className="input-modern">
                    <span className="input-icon"><FaPhone /></span>
                    <div className="input-wrapper-modern">
                      <label className={`floating-label ${formData.phone_number ? 'filled' : ''}`}>
                        Numéro de téléphone
                      </label>
                      <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleFieldChange}
                      />
                    </div>
                  </div>

                  {/* Email (lecture seule) */}
                  <div className="input-modern">
                    <span className="input-icon"><FaEnvelope /></span>
                    <div className="input-wrapper-modern">
                      <label className="floating-label filled">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled={true}
                        style={{ backgroundColor: '#f5f5f5' }}
                      />
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', marginTop: 20 }}>
                    <button
                      onClick={handleSubmit}
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: 16,
                      }}
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <>
              <section id="changepassword">
                <ChangePassword />
              </section>
              <section id="deleteaccount">
                <DeleteAccount />
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerProfileView; 
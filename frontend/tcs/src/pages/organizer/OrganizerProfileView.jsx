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
  const { isAuthenticated, name, role, updateName } = useAuth();
  const location = useLocation();
  const API = process.env.REACT_APP_API_BASE_URL;

  // Debug: Vérifier l'état de l'authentification
  console.log("🔍 OrganizerProfileView - État auth:", {
    isAuthenticated,
    name,
    role
  });

  const isSettingsPage = location.pathname === '/settings-organizer';

  const getLogoURL = (logo) => {
    if (!logo) return null;
    if (typeof logo === 'string') {
      if (logo.startsWith('http')) return logo;
      const mediaBaseUrl = process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000';
      return `${mediaBaseUrl}${logo}`;
    }
    return URL.createObjectURL(logo);
  };

  useEffect(() => {
    const fetchOrganizerProfile = async () => {
      try {
        console.log("🔄 Tentative de récupération du profil organisateur...");
        
        // Utiliser les cookies HttpOnly pour l'authentification
        const res = await axios.get(`${API}/organizers/profile/`, {
          withCredentials: true, // Important pour les cookies HttpOnly
        });

        console.log("✅ Profil organisateur récupéré:", res.data);
        const data = res.data;
        setFormData({
          name: data.name || '',
          phone_number: data.phone_number || '',
          logo: data.logo || null,
          email: data.email || '',
        });
      } catch (err) {
        console.error("❌ Erreur lors de la récupération du profil:", err);
        toast.error(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    // Vérifier que l'utilisateur est authentifié et a le bon rôle
    if (isAuthenticated && role === 'organizer' && !isSettingsPage) {
      fetchOrganizerProfile();
    } else if (!isAuthenticated) {
      console.log("❌ Utilisateur non authentifié");
      setLoading(false);
    } else if (role !== 'organizer') {
      console.log("❌ Rôle incorrect:", role);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [API, isSettingsPage, isAuthenticated, role]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, logo: file }));
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
        `${API}/organizers/profile/update/`,
        formPayload,
        {
          withCredentials: true, // Utiliser les cookies HttpOnly
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success(res.data?.message || 'Profil mis à jour avec succès.');

      // Mettre à jour le nom dans la navbar si le nom a changé
      if (formData.name) {
        updateName(formData.name);
      }
    } catch (err) {
      console.error("❌ Erreur lors de la mise à jour du profil:", err);
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  // Vérifier l'authentification et le rôle
  if (!isAuthenticated) {
    return (
      <div style={{ paddingTop: '80px' }}>
        <Navbar />
        <div className="profile-container">
          <div className="profile-content">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h2>Accès non autorisé</h2>
              <p>Vous devez être connecté pour accéder à cette page.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (role !== 'organizer') {
    return (
      <div style={{ paddingTop: '80px' }}>
        <Navbar />
        <div className="profile-container">
          <div className="profile-content">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h2>Accès non autorisé</h2>
              <p>Cette page est réservée aux organisateurs.</p>
              <p>Votre rôle actuel: {role}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                      className="save-button-modern"
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: 7,
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 16,
                        transition: 'background 0.18s',
                        boxShadow: '0 2px 8px rgba(40, 167, 69, 0.07)',
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
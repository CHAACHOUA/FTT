import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import SidebarMenu from './SideBarMenu';
import ChangePassword from '../../candidate/auth/account/ChangePassword';
import Presentation from '../../../components/card/candidate/profile_section/Presentation';
import Contact from '../../../components/card/candidate/profile_section/Contact';
import { toast } from 'react-toastify';
import Loading from '../../../components/loyout/Loading';
import { useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import '../../candidate/profile/ProfileView.css';
import DeleteAccount from '../../candidate/auth/account/DeleteAccount';
import Navbar from '../../../components/loyout/NavBar';

const RecruiterProfileView = () => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, updateName } = useAuth();
  const location = useLocation();
  const API = process.env.REACT_APP_API_BASE_URL;

  const isSettingsPage = location.pathname.startsWith('/settings');

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await axios.get(`${API}/recruiters/profile/me/`, {
          withCredentials: true,
        });
        if (isMounted) {
          setFormData(response.data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          const message =
            err.response?.data?.error ||
            err.response?.data?.message ||
            err.message ||
            'Erreur lors du chargement du profil.';
          toast.error(message);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [API, isAuthenticated]);

  const handleUpdate = (updatedData) => {
    setFormData((prev) => ({ ...prev, ...updatedData }));
  };


  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();

      for (const key in formData) {
        if (formData[key] !== undefined && formData[key] !== null) {
          if (key === 'profile_picture' && formData[key] instanceof File) {
            formDataToSend.append(key, formData[key]);
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      }

      const res = await axios.put(`${API}/recruiters/profile/`, formDataToSend, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(res.data?.message || 'Profil mis à jour avec succès.');

      // Mettre à jour le nom dans la navbar si le nom a changé
      if (formData.first_name && formData.last_name) {
        const fullName = `${formData.first_name} ${formData.last_name}`;
        updateName(fullName);
      }

      setLoading(true);
      const response = await axios.get(`${API}/recruiters/profile/me/`, {
        withCredentials: true,
      });
      setFormData(response.data);
      setLoading(false);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Erreur lors de l'enregistrement.";
      toast.error(msg);
    }
  };

  if (loading) return <Loading />;

  return (
    <div style={{ paddingTop: '80px' }}>
      <Navbar />
      <div className="profile-container">
        <SidebarMenu />
        <div className="profile-content">
        {!isSettingsPage ? (
          <>
            <section id="profile">
              <Presentation formData={formData} onUpdate={handleUpdate} />
            </section>
            <section id="contact">
              <Contact formData={formData} onUpdate={handleUpdate} />
            </section>
            
         
           
            <button className="validate-button" onClick={handleSubmit}>
              Enregistrer les modifications
            </button>
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

export default RecruiterProfileView;

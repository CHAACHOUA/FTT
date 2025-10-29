import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import UploadCV from '../../../components/card/candidate/profile_section/UploadCV';
import Presentation from '../../../components/card/candidate/profile_section/Presentation';
import Contact from '../../../components/card/candidate/profile_section/Contact';
import Education from '../../../components/card/candidate/profile_section/Education';
import Experience from '../../../components/card/candidate/profile_section/Experience';
import Language from '../../../components/card/candidate/profile_section/Language';
import Skill from '../../../components/card/candidate/profile_section/Skill';
import SaveButton from '../../../components/common/SaveButton';
import { Button, Card } from '../../../components/common';
import SidebarMenu from './SidebarMenu';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import './ProfileView.css';
import DeleteAccount from '../auth/account/DeleteAccount';
import ChangePassword from '../auth/account/ChangePassword';
import TimezoneSettings from '../../../components/settings/TimezoneSettings';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../../../components/loyout/Loading';
import Navbar from '../../../components/loyout/NavBar';
import { validateEducationDates } from '../../../utils/dateValidation';

const ProfileView = () => {



  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user, updateName } = useAuth();
  const location = useLocation();
  const API = process.env.REACT_APP_API_BASE_URL;

  const isSettingsPage = location.pathname.startsWith('/settings');

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API}/candidates/profile/me/`, {
        withCredentials: true,
      });
      setFormData(response.data);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Erreur inconnue lors du chargement du profil.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [API, isAuthenticated]);

  const handleUpdate = (updatedData) => {
    setFormData((prevData) => ({ ...prevData, ...updatedData }));
  };

  const handleCVUpload = (parsedData) => {
    setFormData((prevData) => ({ ...prevData, ...parsedData }));
  };

  const handleSubmit = async () => {
    // Validation des dates avant soumission
    let hasErrors = false;
    const allErrors = [];
    
    // Validation des éducations
    if (Array.isArray(formData.educations)) {
      formData.educations.forEach((education, index) => {
        const validation = validateEducationDates(education);
        if (!validation.isValid) {
          hasErrors = true;
          allErrors.push(`Éducation ${index + 1}: ${validation.errors.join(', ')}`);
        }
      });
    }
    
    // Validation des expériences
    if (Array.isArray(formData.experiences)) {
      formData.experiences.forEach((experience, index) => {
        const validation = validateEducationDates(experience);
        if (!validation.isValid) {
          hasErrors = true;
          allErrors.push(`Expérience ${index + 1}: ${validation.errors.join(', ')}`);
        }
      });
    }
    
    // Si il y a des erreurs, afficher et arrêter
    if (hasErrors) {
      const errorMessage = allErrors.join('\n');
      toast.error(errorMessage);
      alert('Erreurs de validation des dates :\n' + errorMessage);
      return;
    }
    
    try {
      const form = new FormData();

      if (formData.profile_picture instanceof File) {
        form.append('profile_picture', formData.profile_picture);
      }

      if (formData.cv_file instanceof File) {
        form.append('cv_file', formData.cv_file);
      }

      const appendIfExists = (key, value) => {
        if (value) form.append(key, value);
      };

      appendIfExists('first_name', formData.first_name);
      appendIfExists('last_name', formData.last_name);
      appendIfExists('title', formData.title);
      appendIfExists('phone', formData.phone);
      appendIfExists('linkedin', formData.linkedin);
      appendIfExists('email', formData.email);
      appendIfExists('education_level', formData.education_level);
      appendIfExists('preferred_contract_type', formData.preferred_contract_type);
      appendIfExists('bio', formData.bio);

      if (Array.isArray(formData.educations)) {
        form.append('educations', JSON.stringify(formData.educations));
      }

      if (Array.isArray(formData.experiences)) {
        form.append('experiences', JSON.stringify(formData.experiences));
      }

      if (Array.isArray(formData.candidate_languages)) {
        form.append('candidate_languages', JSON.stringify(formData.candidate_languages));
      }

      if (Array.isArray(formData.skills)) {
        const skillsFormatted = formData.skills.map((s) =>
          typeof s === 'string' ? { name: s } : s
        );
        form.append('skills', JSON.stringify(skillsFormatted));
      }

      const res = await axios.post(`${API}/candidates/profile/`, form, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(
        typeof res.data === 'string'
          ? res.data
          : res.data.detail || res.data.message || "Profil mis à jour avec succès !"
      );

      // Mettre à jour le nom dans la navbar si le nom a changé
      if (formData.first_name && formData.last_name) {
        const fullName = `${formData.first_name} ${formData.last_name}`;
        updateName(fullName);
      }

      setLoading(true);
      await fetchData();
    } catch (err) {
      const resData = err.response?.data || {};
      const msg =
        resData.error ||
        resData.message ||
        err.message ||
        "Une erreur s'est produite lors de l'enregistrement.";

      toast.error(msg);
    }
  };

  // ✅ Affichage du loader si le profil est en chargement
  if (loading) return <Loading />;

  return (
    <div style={{ paddingTop: '80px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />
      <div className="profile-container">
        <SidebarMenu />
        <div className="profile-content">
        {!isSettingsPage ? (
          <>
            <section>
              <UploadCV onUpload={handleCVUpload} formData={formData} />
            </section>
            <section id="presentation">
              <Presentation formData={formData} onUpdate={handleUpdate}>
                <Button variant="save" type="button" onClick={handleSubmit}>Enregistrer</Button>
              </Presentation>
            </section>
            <section id="contact">
              <Contact formData={formData} onUpdate={handleUpdate}>
                <Button variant="save" type="button" onClick={handleSubmit}>Enregistrer</Button>
              </Contact>
            </section>
            <section id="education">
              <Education formData={formData} onUpdate={handleUpdate}>
                <Button variant="save" type="button" onClick={handleSubmit}>Enregistrer</Button>
              </Education>
            </section>
            <section id="experience">
              <Experience formData={formData} onUpdate={handleUpdate}>
                <Button variant="save" type="button" onClick={handleSubmit}>Enregistrer</Button>
              </Experience>
            </section>
            <section id="language">
              <Language formData={formData} onUpdate={handleUpdate}>
                <Button variant="save" type="button" onClick={handleSubmit}>Enregistrer</Button>
              </Language>
            </section>
            <section id="skill">
              <Skill formData={formData} onUpdate={handleUpdate}>
                <Button variant="save" type="button" onClick={handleSubmit}>Enregistrer</Button>
              </Skill>
            </section>
          </>
        ) : (
          <>
            <section id="changepassword">
              <ChangePassword />
            </section>
            <section id="timezone">
              <TimezoneSettings user={user} onUpdate={updateName} />
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

export default ProfileView;

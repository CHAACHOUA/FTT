import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../../../components/loyout/NavBar';
import SubMenu from './SubMenu';
import ForumInfos from '../../../../components/forum/ForumInfos';
import ForumCompanies from '../../../../components/forum/ForumCompanies';
import ForumOffers from '../../../../components/forum/ForumOffers';
import Plan from '../hybrid/Plan';
import Loading from '../../../../components/loyout/Loading';
import PopupQRCode from '../hybrid/PopupQRCode';
import '../../../../pages/styles/candidate/Dashboard.css';

const Dashboard = () => {
  const { state } = useLocation();
  const forum = state?.forum;
  const [activeTab, setActiveTab] = useState(state?.activeTab || 'info');
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);

  // Simule un chargement initial
  useEffect(() => {
    if (forum) {
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [forum]);

  // Récupération du token public du candidat
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const axios = (await import('axios')).default;
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/candidates/public-token/`, {
          withCredentials: true
        });
        setToken(res.data.public_token);
      } catch (err) {
        console.error('Erreur récupération token public', err);
      }
    };
    fetchToken();
  }, []);

  // Ouvre automatiquement le QR Code si l'onglet "partager" est sélectionné
  useEffect(() => {
    if (activeTab === 'partager') {
      setIsQRCodeOpen(true);
    }
  }, [activeTab]);

  if (loading) return <Loading />;
  if (!forum) return <p className="px-6">Forum introuvable.</p>;

  return (
    <div className="dashboard-container" style={{ paddingTop: '120px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />
      <div className="candidate-dashboard-layout">
        <div className="candidate-sidebar">
          <SubMenu active={activeTab} setActive={setActiveTab} forumType={forum.type} />
        </div>
        <div className="candidate-main-content">
       
            {activeTab === 'info' && <ForumInfos forum={forum} />}
            {activeTab === 'entreprises' && <ForumCompanies companies={forum.companies} forum={forum} usePage={true} />}
            {activeTab === 'offres' && <ForumOffers companies={forum.companies} forum={forum} />}
            {activeTab === 'plan' && <Plan companies={forum.companies} forumId={forum.id} />}
            {activeTab === 'partager' && (
              <PopupQRCode
                isOpen={isQRCodeOpen}
                onClose={() => {
                  setIsQRCodeOpen(false);
                  setActiveTab('info'); // Redirection automatique vers l'onglet info
                }}
                token={token}
                forum={forum}
              />
            )}
            {activeTab === 'cv' && (
              <>
                <p className="dashboard-title">Clique pour imprimer ton CV :</p>
                <button onClick={() => window.print()} className="dashboard-button">
                  Imprimer mon CV
                </button>
              </>
            )}
       
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

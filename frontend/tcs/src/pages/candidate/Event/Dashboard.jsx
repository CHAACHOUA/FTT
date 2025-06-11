import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../common/NavBar';
import SubMenu from './SubMenu';
import ForumInfos from '../../../components/forum/ForumInfos';
import ForumCompanies from '../../../components/forum/ForumCompanies';
import ForumOffers from '../../../components/forum/ForumOffers';
import Plan from './Plan';

const Dashboard = () => {
  const { id } = useParams();
  const [forum, setForum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const API = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    axios
      .get(`${API}/api/forums/${id}/`)
      .then((res) => {
        setForum(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erreur lors de la récupération du forum:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="px-6">Chargement...</p>;
  if (!forum) return <p className="px-6">Forum introuvable.</p>;

  return (
    <div>
      <Navbar />
      <SubMenu active={activeTab} setActive={setActiveTab} />
      <div className="px-6 py-4">
        <div className="mt-6">
          {activeTab === 'info' && <ForumInfos forum={forum} />}
          {activeTab === 'entreprises' && <ForumCompanies companies={forum.companies} />}
          {activeTab === 'offres' && <ForumOffers companies={forum.companies} />}
        {activeTab === 'plan' && <Plan companies={forum.companies} forumId={forum.id} />}
          {activeTab === 'partager' && (
            <div>
              <p className="mb-2">Voici ton lien personnel de participation :</p>
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/dashboard/forums/${forum.id}`}
                className="w-full border px-3 py-2 rounded bg-gray-100"
              />
            </div>
          )}
          {activeTab === 'cv' && (
            <div>
              <p className="mb-4">Clique pour imprimer ton CV :</p>
              <button
                onClick={() => window.print()}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Imprimer mon CV
              </button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

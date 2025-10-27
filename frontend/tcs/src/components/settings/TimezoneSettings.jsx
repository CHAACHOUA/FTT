import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './TimezoneSettings.css';

const TimezoneSettings = ({ user, onUpdate }) => {
  const [timezones, setTimezones] = useState([]);
  const [selectedTimezone, setSelectedTimezone] = useState(user?.timezone || 'Europe/Paris');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTimezones();
  }, []);

  // Synchroniser l'état local avec le timezone de l'utilisateur
  useEffect(() => {
    if (user?.timezone) {
      console.log('🔄 Synchronisation du timezone depuis user:', user.timezone);
      setSelectedTimezone(user.timezone);
    }
  }, [user?.timezone]);

  const loadTimezones = async () => {
    try {
      setLoading(true);
      
      // Charger la liste des fuseaux horaires
      const timezonesResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/auth/timezones/`, {
        withCredentials: true
      });
      setTimezones(timezonesResponse.data.timezones);
      
      // Charger le fuseau horaire actuel de l'utilisateur
      console.log('🔄 Chargement du fuseau horaire actuel de l\'utilisateur...');
      const userResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/auth/me/`, {
        withCredentials: true
      });
      
      if (userResponse.status === 200 && userResponse.data.timezone) {
        console.log('🔄 Fuseau horaire actuel reçu:', userResponse.data.timezone);
        setSelectedTimezone(userResponse.data.timezone);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des fuseaux horaires:', error);
      toast.error('Erreur lors du chargement des fuseaux horaires');
    } finally {
      setLoading(false);
    }
  };

  const handleTimezoneChange = (event) => {
    setSelectedTimezone(event.target.value);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/users/auth/timezone/`,
        { timezone: selectedTimezone },
        { withCredentials: true }
      );
      
      toast.success('Fuseau horaire mis à jour avec succès');
      
      // Recharger les données utilisateur depuis le serveur
      console.log('🔄 ===== DÉBUT RECHARGEMENT DONNÉES UTILISATEUR =====');
      console.log('🔄 Tentative de rechargement des données utilisateur...');
      try {
        const userResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/auth/me/`, {
          withCredentials: true
        });
        
        console.log('🔄 ===== RÉPONSE SERVEUR REÇUE =====');
        console.log('🔄 Status:', userResponse.status);
        console.log('🔄 Data:', userResponse.data);
        console.log('🔄 Timezone reçu:', userResponse.data.timezone);
        
        if (userResponse.status === 200) {
          console.log('🔄 ===== MISE À JOUR ÉTAT LOCAL =====');
          // Mettre à jour l'état local du composant
          setSelectedTimezone(userResponse.data.timezone);
          console.log('🔄 selectedTimezone mis à jour vers:', userResponse.data.timezone);
          
          // Mettre à jour le contexte avec les données fraîches du serveur
          if (onUpdate) {
            console.log('🔄 ===== MISE À JOUR CONTEXTE =====');
            console.log('🔄 Mise à jour du contexte avec:', { 
              ...user, 
              timezone: userResponse.data.timezone,
              name: userResponse.data.name 
            });
            onUpdate({ 
              ...user, 
              timezone: userResponse.data.timezone,
              name: userResponse.data.name 
            });
          }
          console.log('🔄 ===== FIN RECHARGEMENT DONNÉES UTILISATEUR =====');
        }
      } catch (error) {
        console.error('❌ ===== ERREUR RECHARGEMENT =====');
        console.error('❌ Erreur lors du rechargement des données utilisateur:', error);
        // Fallback: mettre à jour le contexte local
        if (onUpdate) {
          console.log('🔄 Fallback: mise à jour locale avec:', { ...user, timezone: selectedTimezone });
          onUpdate({ ...user, timezone: selectedTimezone });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du fuseau horaire:', error);
      toast.error('Erreur lors de la mise à jour du fuseau horaire');
    } finally {
      setSaving(false);
    }
  };

  const getCurrentTime = () => {
    try {
      const now = new Date();
      return now.toLocaleString('fr-FR', {
        timeZone: selectedTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return 'Impossible d\'afficher l\'heure';
    }
  };

  if (loading) {
    return (
      <div className="timezone-settings">
        <div className="loading">Chargement des fuseaux horaires...</div>
      </div>
    );
  }

  return (
    <div className="timezone-settings">
      <div className="timezone-header">
        <h3>Fuseau horaire</h3>
        <p>Configurez votre fuseau horaire pour afficher les heures correctement dans l'agenda.</p>
      </div>

      <div className="timezone-content">
        <div className="timezone-selector">
          <label htmlFor="timezone-select">Fuseau horaire actuel :</label>
          <select
            id="timezone-select"
            value={selectedTimezone}
            onChange={handleTimezoneChange}
            disabled={saving}
          >
            {timezones.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="timezone-preview">
          <div className="preview-label">Aperçu de l'heure actuelle :</div>
          <div className="preview-time">{getCurrentTime()}</div>
        </div>

        <div className="timezone-actions">
          <button
            onClick={handleSave}
            disabled={saving || selectedTimezone === user?.timezone}
            className="save-button"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div className="timezone-info">
        <h4>Comment ça fonctionne ?</h4>
        <ul>
          <li>Les créneaux de l'agenda seront affichés dans votre fuseau horaire</li>
          <li>Les autres utilisateurs verront les heures dans leur propre fuseau horaire</li>
          <li>Vous pouvez changer votre fuseau horaire à tout moment</li>
        </ul>
      </div>
    </div>
  );
};

export default TimezoneSettings;

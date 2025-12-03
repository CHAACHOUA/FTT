import React, { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import NotificationService from '../../services/NotificationService';
import NotificationDropdown from './NotificationDropdown';
import useNotificationWebSocket from '../../hooks/useNotificationWebSocket';
import './NotificationIcon.css';

const NotificationIcon = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  
  // Utiliser WebSocket pour les notifications en temps réel
  const { 
    isConnected, 
    unreadCount, 
    newNotification, 
    clearNewNotification 
  } = useNotificationWebSocket();

  // Récupérer les notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await NotificationService.getNotifications({ page: 1 });
      // Si pagination
      if (data.results) {
        setNotifications(data.results);
      } else {
        setNotifications(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ajouter la nouvelle notification reçue via WebSocket
  useEffect(() => {
    if (newNotification) {
      // Ajouter en haut de la liste
      setNotifications(prev => [newNotification, ...prev]);
      // Optionnel : jouer un son ou afficher une notification toast
      clearNewNotification();
    }
  }, [newNotification, clearNewNotification]);

  // Charger les notifications quand on ouvre le dropdown
  useEffect(() => {
    if (showDropdown) {
      fetchNotifications();
    }
  }, [showDropdown]);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await NotificationService.markAsRead(notification.id);
        // Mettre à jour localement (le WebSocket mettra à jour le compteur automatiquement)
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
      } catch (error) {
        console.error('Erreur lors du marquage de la notification:', error);
      }
    }
    
    // Rediriger si action_url existe
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      // Le WebSocket mettra à jour le compteur automatiquement
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
    }
  };

  // Formater le nombre pour l'affichage
  const getDisplayCount = () => {
    if (unreadCount === 0) return null;
    if (unreadCount <= 5) return unreadCount.toString();
    return '+5';
  };

  // Debug: afficher le compteur
  const displayCount = getDisplayCount();
  const shouldShowBadge = unreadCount > 0 && displayCount !== null;
  
  console.log('🔔 NotificationIcon - unreadCount:', unreadCount, 'display:', displayCount, 'shouldShow:', shouldShowBadge);
  console.log('🔔 NotificationIcon - Type unreadCount:', typeof unreadCount, 'Value:', unreadCount);

  return (
    <div className="notification-icon-container" ref={dropdownRef}>
      <button
        className="notification-icon-button"
        onClick={handleToggleDropdown}
        aria-label="Notifications"
        title={isConnected ? `Notifications connectées (${unreadCount} non lues)` : 'Connexion en cours...'}
      >
        <FaBell className={`notification-icon ${!isConnected ? 'disconnected' : ''}`} />
        {shouldShowBadge && (
          <span 
            className="notification-badge"
            data-testid="notification-badge"
          >
            {displayCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <NotificationDropdown
          notifications={notifications}
          loading={loading}
          onNotificationClick={handleNotificationClick}
          onMarkAllAsRead={handleMarkAllAsRead}
          onClose={() => setShowDropdown(false)}
          onRefresh={fetchNotifications}
        />
      )}
    </div>
  );
};

export default NotificationIcon;


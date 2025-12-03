import React from 'react';
import { FaCheck, FaCheckDouble, FaTrash, FaSpinner } from 'react-icons/fa';
import './NotificationDropdown.css';

const NotificationDropdown = ({
  notifications,
  loading,
  onNotificationClick,
  onMarkAllAsRead,
  onClose,
  onRefresh
}) => {
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'notification-priority-high';
      case 'medium':
        return 'notification-priority-medium';
      case 'low':
        return 'notification-priority-low';
      default:
        return '';
    }
  };

  const getIcon = (type) => {
    // Vous pouvez personnaliser les icônes selon le type
    return '🔔';
  };

  return (
    <div className="notification-dropdown">
      <div className="notification-dropdown-header">
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <button
            className="notification-mark-all-read"
            onClick={onMarkAllAsRead}
            title="Tout marquer comme lu"
          >
            <FaCheckDouble />
            Tout lire
          </button>
        )}
      </div>

      <div className="notification-dropdown-content">
        {loading ? (
          <div className="notification-loading">
            <FaSpinner className="spinner" />
            <span>Chargement...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notification-empty">
            <p>Aucune notification</p>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.is_read ? 'unread' : ''} ${getPriorityClass(notification.priority)}`}
                onClick={() => onNotificationClick(notification)}
              >
                <div className="notification-item-content">
                  <div className="notification-item-header">
                    <span className="notification-icon-emoji">{getIcon(notification.type)}</span>
                    <h4 className="notification-title">{notification.title}</h4>
                    {!notification.is_read && (
                      <span className="notification-unread-dot"></span>
                    )}
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  <div className="notification-item-footer">
                    <span className="notification-time">{notification.time_ago}</span>
                    {notification.priority === 'high' && (
                      <span className="notification-priority-badge">Important</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="notification-dropdown-footer">
          <button onClick={onRefresh} className="notification-refresh">
            Actualiser
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;


import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, 
  faCheck, 
  faTimes, 
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faUser,
  faBuilding,
  faCalendar,
  faTag
} from '@fortawesome/free-solid-svg-icons';
import { SIZE_CONSTANTS, getComponentSize } from '../../constants/sizeConstants';
import './Badge.css';

const Badge = ({ 
  type = 'default',
  variant = 'primary',
  size = 'medium',
  icon = null,
  children,
  className = '',
  onClick = null,
  disabled = false,
  ...props
}) => {
  // Définir les icônes par défaut selon le type
  const getDefaultIcon = () => {
    switch (type) {
      case 'status':
        switch (variant) {
          case 'pending': return faClock;
          case 'accepted': case 'approved': case 'success': return faCheck;
          case 'rejected': case 'error': return faTimes;
          case 'confirmed': return faCheckCircle;
          case 'warning': return faExclamationTriangle;
          case 'info': return faInfoCircle;
          default: return null;
        }
      case 'user':
        return faUser;
      case 'company':
        return faBuilding;
      case 'date':
        return faCalendar;
      case 'sector':
        return faTag;
      default:
        return null;
    }
  };

  // Définir les classes CSS
  const getClasses = () => {
    const baseClasses = ['badge'];
    const typeClasses = [`badge--${type}`];
    const variantClasses = [`badge--${variant}`];
    const sizeClasses = [`badge--${size}`];
    
    if (disabled) baseClasses.push('badge--disabled');
    if (onClick) baseClasses.push('badge--clickable');
    if (className) baseClasses.push(className);
    
    return [...baseClasses, ...typeClasses, ...variantClasses, ...sizeClasses].join(' ');
  };

  // Définir le texte par défaut selon le type et variant
  const getDefaultText = () => {
    switch (type) {
      case 'status':
        switch (variant) {
          case 'pending': return 'En attente';
          case 'accepted': return 'Accepté';
          case 'rejected': return 'Rejeté';
          case 'confirmed': return 'Confirmé';
          case 'approved': return 'Approuvé';
          case 'available': return 'Disponible';
          case 'booked': return 'Réservé';
          case 'completed': return 'Terminé';
          case 'cancelled': return 'Annulé';
          case 'success': return 'Succès';
          case 'error': return 'Erreur';
          case 'warning': return 'Attention';
          case 'info': return 'Information';
          default: return 'Statut';
        }
      case 'counter':
        return children || '0';
      case 'sector':
        return children || 'Secteur';
      case 'company':
        return children || 'Entreprise';
      case 'user':
        return children || 'Utilisateur';
      case 'date':
        return children || 'Date';
      default:
        return children || 'Badge';
    }
  };

  // Si icon est explicitement null, ne pas utiliser l'icône par défaut
  const iconToUse = icon === null ? null : (icon || getDefaultIcon());
  const text = children || getDefaultText();

  const handleClick = (e) => {
    if (disabled) return;
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <span 
      className={getClasses()}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      {...props}
    >
      {iconToUse && (
        <FontAwesomeIcon 
          icon={iconToUse} 
          className="badge__icon" 
        />
      )}
      <span className="badge__text">{text}</span>
    </span>
  );
};

export default Badge;

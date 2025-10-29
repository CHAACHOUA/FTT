// Constantes pour les styles de boutons
export const BUTTON_STYLES = {
  // Couleurs principales
  colors: {
    primary: '#3b82f6',
    primaryDark: '#1d4ed8',
    primaryHover: '#2563eb',
    primaryHoverDark: '#1e40af',
    secondary: '#6b7280',
    secondaryDark: '#4b5563',
    success: '#10b981',
    successDark: '#059669',
    danger: '#ef4444',
    dangerDark: '#dc2626',
    warning: '#f59e0b',
    warningDark: '#d97706',
    disabled: '#9ca3af',
    white: '#ffffff',
    black: '#000000'
  },

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    primaryHover: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    danger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    secondary: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    // Gradient spécial pour SpeakerManager
    speaker: 'linear-gradient(135deg, #18386c 0%, #06b6d4 100%)'
  },

  // Tailles de boutons
  sizes: {
    small: {
      padding: '6px 12px',
      fontSize: '12px',
      borderRadius: '4px'
    },
    medium: {
      padding: '10px 20px',
      fontSize: '14px',
      borderRadius: '6px'
    },
    large: {
      padding: '16px 32px',
      fontSize: '16px',
      borderRadius: '8px'
    },
    xlarge: {
      padding: '20px 40px',
      fontSize: '18px',
      borderRadius: '12px'
    }
  },

  // Types de boutons
  types: {
    primary: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      color: '#ffffff',
      hoverBackground: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
      hoverTransform: 'translateY(-1px)',
      hoverShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
    },
    secondary: {
      background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      color: '#ffffff',
      hoverBackground: 'linear-gradient(135deg, #4b5563 0%, #374151 100%)',
      hoverTransform: 'translateY(-1px)',
      hoverShadow: '0 4px 12px rgba(107, 114, 128, 0.3)'
    },
    success: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#ffffff',
      hoverBackground: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      hoverTransform: 'translateY(-1px)',
      hoverShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: '#ffffff',
      hoverBackground: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      hoverTransform: 'translateY(-1px)',
      hoverShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
    },
    warning: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: '#ffffff',
      hoverBackground: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
      hoverTransform: 'translateY(-1px)',
      hoverShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
    },
    outline: {
      background: 'transparent',
      color: '#3b82f6',
      border: '2px solid #3b82f6',
      hoverBackground: '#3b82f6',
      hoverColor: '#ffffff',
      hoverTransform: 'translateY(-1px)',
      hoverShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
    },
    ghost: {
      background: 'transparent',
      color: '#6b7280',
      border: 'none',
      hoverBackground: '#f3f4f6',
      hoverColor: '#374151',
      hoverTransform: 'none',
      hoverShadow: 'none'
    },
    // Type spécial pour les boutons de sauvegarde
    save: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      color: '#ffffff',
      hoverBackground: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
      hoverTransform: 'translateY(-1px)',
      hoverShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      disabledBackground: '#9ca3af',
      disabledCursor: 'not-allowed'
    },
    // Type spécial pour SpeakerManager
    speaker: {
      background: 'linear-gradient(135deg, #18386c 0%, #06b6d4 100%)',
      color: '#ffffff',
      hoverBackground: 'linear-gradient(135deg, #0f172a 0%, #0891b2 100%)',
      hoverTransform: 'translateY(-1px)',
      hoverShadow: '0 4px 12px rgba(24, 56, 108, 0.4)'
    }
  },

  // États des boutons
  states: {
    disabled: {
      background: '#9ca3af',
      color: '#ffffff',
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none',
      opacity: '0.7'
    },
    loading: {
      cursor: 'not-allowed',
      opacity: '0.8'
    }
  },

  // Transitions communes
  transitions: {
    default: 'all 0.3s ease',
    fast: 'all 0.2s ease',
    slow: 'all 0.5s ease'
  },

  // Ombres
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 12px rgba(0, 0, 0, 0.15)',
    large: '0 8px 24px rgba(0, 0, 0, 0.2)',
    primary: '0 4px 12px rgba(59, 130, 246, 0.3)',
    success: '0 4px 12px rgba(16, 185, 129, 0.3)',
    danger: '0 4px 12px rgba(239, 68, 68, 0.3)',
    warning: '0 4px 12px rgba(245, 158, 11, 0.3)'
  },

  // Fonts
  fonts: {
    family: "'Poppins', sans-serif",
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  }
};

// Fonction utilitaire pour générer les styles CSS d'un bouton
export const getButtonStyles = (type = 'primary', size = 'medium', disabled = false) => {
  const buttonType = BUTTON_STYLES.types[type] || BUTTON_STYLES.types.primary;
  const buttonSize = BUTTON_STYLES.sizes[size] || BUTTON_STYLES.sizes.medium;
  
  const baseStyles = {
    padding: buttonSize.padding,
    fontSize: buttonSize.fontSize,
    borderRadius: buttonSize.borderRadius,
    fontFamily: BUTTON_STYLES.fonts.family,
    fontWeight: BUTTON_STYLES.fonts.weights.semibold,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: BUTTON_STYLES.transitions.default,
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    textDecoration: 'none',
    outline: 'none'
  };

  if (disabled) {
    return {
      ...baseStyles,
      background: BUTTON_STYLES.states.disabled.background,
      color: BUTTON_STYLES.states.disabled.color,
      cursor: BUTTON_STYLES.states.disabled.cursor,
      transform: BUTTON_STYLES.states.disabled.transform,
      boxShadow: BUTTON_STYLES.states.disabled.boxShadow,
      opacity: BUTTON_STYLES.states.disabled.opacity
    };
  }

  return {
    ...baseStyles,
    background: buttonType.background,
    color: buttonType.color,
    border: buttonType.border || 'none'
  };
};

// Fonction pour générer les styles hover
export const getButtonHoverStyles = (type = 'primary') => {
  const buttonType = BUTTON_STYLES.types[type] || BUTTON_STYLES.types.primary;
  
  return {
    background: buttonType.hoverBackground,
    color: buttonType.hoverColor || buttonType.color,
    transform: buttonType.hoverTransform,
    boxShadow: buttonType.hoverShadow
  };
};

// Fonction pour générer les styles actifs
export const getButtonActiveStyles = () => {
  return {
    transform: 'translateY(0)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  };
};

// Constantes pour les classes CSS communes
export const BUTTON_CLASSES = {
  // Classes principales
  base: 'btn',
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  success: 'btn-success',
  danger: 'btn-danger',
  warning: 'btn-warning',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  save: 'btn-save',
  speaker: 'btn-speaker',
  
  // Tailles
  small: 'btn-small',
  medium: 'btn-medium',
  large: 'btn-large',
  xlarge: 'btn-xlarge',
  
  // États
  disabled: 'btn-disabled',
  loading: 'btn-loading',
  
  // Variantes spéciales
  modern: 'btn-modern',
  note: 'btn-note'
};

export default BUTTON_STYLES;

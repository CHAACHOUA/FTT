// Constantes pour les tailles et dimensions unifiées
export const SIZE_CONSTANTS = {
  // Tailles de texte
  text: {
    xs: '10px',
    sm: '12px',
    base: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '28px',
    '5xl': '32px',
    '6xl': '36px',
    '7xl': '42px',
    '8xl': '48px',
    '9xl': '56px'
  },

  // Tailles de composants
  components: {
    // Boutons
    button: {
      xs: {
        padding: '4px 8px',
        fontSize: '10px',
        borderRadius: '4px',
        height: '24px'
      },
      sm: {
        padding: '6px 12px',
        fontSize: '12px',
        borderRadius: '4px',
        height: '28px'
      },
      md: {
        padding: '8px 16px',
        fontSize: '14px',
        borderRadius: '6px',
        height: '32px'
      },
      lg: {
        padding: '12px 24px',
        fontSize: '16px',
        borderRadius: '8px',
        height: '40px'
      },
      xl: {
        padding: '16px 32px',
        fontSize: '18px',
        borderRadius: '10px',
        height: '48px'
      }
    },

    // Inputs
    input: {
      xs: {
        padding: '4px 8px',
        fontSize: '12px',
        borderRadius: '4px',
        height: '24px'
      },
      sm: {
        padding: '6px 12px',
        fontSize: '14px',
        borderRadius: '6px',
        height: '32px'
      },
      md: {
        padding: '8px 16px',
        fontSize: '16px',
        borderRadius: '8px',
        height: '40px'
      },
      lg: {
        padding: '12px 20px',
        fontSize: '18px',
        borderRadius: '10px',
        height: '48px'
      }
    },

    // Cards
    card: {
      sm: {
        padding: '12px',
        borderRadius: '8px',
        margin: '8px'
      },
      md: {
        padding: '16px',
        borderRadius: '12px',
        margin: '12px'
      },
      lg: {
        padding: '24px',
        borderRadius: '16px',
        margin: '16px'
      },
      xl: {
        padding: '32px',
        borderRadius: '20px',
        margin: '20px'
      }
    },

    // Badges
    badge: {
      xs: {
        padding: '2px 6px',
        fontSize: '10px',
        borderRadius: '4px',
        height: '18px'
      },
      sm: {
        padding: '4px 8px',
        fontSize: '12px',
        borderRadius: '6px',
        height: '22px'
      },
      md: {
        padding: '6px 12px',
        fontSize: '14px',
        borderRadius: '8px',
        height: '26px'
      },
      lg: {
        padding: '8px 16px',
        fontSize: '16px',
        borderRadius: '10px',
        height: '30px'
      }
    },

    // Modals
    modal: {
      sm: {
        width: '400px',
        maxWidth: '90vw',
        padding: '20px'
      },
      md: {
        width: '600px',
        maxWidth: '90vw',
        padding: '24px'
      },
      lg: {
        width: '800px',
        maxWidth: '90vw',
        padding: '32px'
      },
      xl: {
        width: '1000px',
        maxWidth: '95vw',
        padding: '40px'
      }
    },

    // Tables
    table: {
      sm: {
        fontSize: '12px',
        padding: '8px',
        height: '32px'
      },
      md: {
        fontSize: '14px',
        padding: '12px',
        height: '40px'
      },
      lg: {
        fontSize: '16px',
        padding: '16px',
        height: '48px'
      }
    }
  },

  // Espacements
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
    '5xl': '48px',
    '6xl': '64px',
    '7xl': '80px',
    '8xl': '96px'
  },

  // Bordures
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '20px',
    full: '9999px'
  },

  // Ombres
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)'
  },

  // Z-index
  zIndex: {
    hide: '-1',
    auto: 'auto',
    base: '0',
    docked: '10',
    dropdown: '1000',
    sticky: '1100',
    banner: '1200',
    overlay: '1300',
    modal: '1400',
    popover: '1500',
    skipLink: '1600',
    toast: '1700',
    tooltip: '1800'
  },

  // Breakpoints responsive
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // Hauteurs de ligne
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  },

  // Poids de police
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  }
};

// Fonctions utilitaires pour appliquer les tailles
export const getTextSize = (size = 'base') => {
  return SIZE_CONSTANTS.text[size] || SIZE_CONSTANTS.text.base;
};

export const getComponentSize = (component, size = 'md') => {
  return SIZE_CONSTANTS.components[component]?.[size] || SIZE_CONSTANTS.components[component]?.md || {};
};

export const getSpacing = (size = 'md') => {
  return SIZE_CONSTANTS.spacing[size] || SIZE_CONSTANTS.spacing.md;
};

export const getBorderRadius = (size = 'md') => {
  return SIZE_CONSTANTS.borderRadius[size] || SIZE_CONSTANTS.borderRadius.md;
};

export const getShadow = (size = 'md') => {
  return SIZE_CONSTANTS.shadows[size] || SIZE_CONSTANTS.shadows.md;
};

export const getZIndex = (level = 'base') => {
  return SIZE_CONSTANTS.zIndex[level] || SIZE_CONSTANTS.zIndex.base;
};

// Classes CSS communes pour les tailles
export const SIZE_CLASSES = {
  // Text sizes
  text: {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl'
  },

  // Component sizes
  button: {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
    xl: 'btn-xl'
  },

  input: {
    xs: 'input-xs',
    sm: 'input-sm',
    md: 'input-md',
    lg: 'input-lg'
  },

  card: {
    sm: 'card-sm',
    md: 'card-md',
    lg: 'card-lg',
    xl: 'card-xl'
  },

  badge: {
    xs: 'badge-xs',
    sm: 'badge-sm',
    md: 'badge-md',
    lg: 'badge-lg'
  },

  modal: {
    sm: 'modal-sm',
    md: 'modal-md',
    lg: 'modal-lg',
    xl: 'modal-xl'
  },

  // Spacing
  spacing: {
    xs: 'space-xs',
    sm: 'space-sm',
    md: 'space-md',
    lg: 'space-lg',
    xl: 'space-xl',
    '2xl': 'space-2xl',
    '3xl': 'space-3xl'
  }
};

// Fonction pour générer les styles CSS d'un composant avec taille
export const getComponentStyles = (component, size = 'md', customStyles = {}) => {
  const baseStyles = getComponentSize(component, size);
  return { ...baseStyles, ...customStyles };
};

// Fonction pour générer les classes CSS d'un composant avec taille
export const getComponentClasses = (component, size = 'md', additionalClasses = '') => {
  const baseClass = SIZE_CLASSES[component]?.[size] || '';
  return `${baseClass} ${additionalClasses}`.trim();
};

export default SIZE_CONSTANTS;

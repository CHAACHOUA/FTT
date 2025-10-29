import React from 'react';
import { BUTTON_STYLES, getButtonStyles, getButtonHoverStyles, getButtonActiveStyles, BUTTON_CLASSES } from '../../constants/buttonStyles';
import { SIZE_CONSTANTS, getComponentSize } from '../../constants/sizeConstants';
import './Button.css';
import Loading from '../loyout/Loading';

const Button = ({
  children,
  type = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  style = {},
  variant = 'default', // default, modern, note, speaker
  icon = null,
  iconPosition = 'left', // left, right
  fullWidth = false,
  ...props
}) => {
  // Déterminer le type réel selon la variante
  const getActualType = () => {
    if (variant === 'speaker') return 'speaker';
    if (variant === 'save') return 'save';
    return type;
  };

  const actualType = getActualType();
  
  // Générer les classes CSS
  const getClasses = () => {
    const baseClasses = [BUTTON_CLASSES.base];
    
    // Type
    if (actualType === 'speaker') baseClasses.push(BUTTON_CLASSES.speaker);
    else if (actualType === 'save') baseClasses.push(BUTTON_CLASSES.save);
    else baseClasses.push(BUTTON_CLASSES[actualType]);
    
    // Taille
    baseClasses.push(BUTTON_CLASSES[size]);
    
    // Variante
    if (variant === 'modern') baseClasses.push(BUTTON_CLASSES.modern);
    if (variant === 'note') baseClasses.push(BUTTON_CLASSES.note);
    
    // États
    if (disabled) baseClasses.push(BUTTON_CLASSES.disabled);
    if (loading) baseClasses.push(BUTTON_CLASSES.loading);
    
    // Largeur complète
    if (fullWidth) baseClasses.push('btn-full-width');
    
    // Classes personnalisées
    if (className) baseClasses.push(className);
    
    return baseClasses.join(' ');
  };

  // Générer les styles inline
  const getInlineStyles = () => {
    const baseStyles = getButtonStyles(actualType, size, disabled || loading);
    const sizeStyles = getComponentSize('button', size);
    
    if (fullWidth) {
      baseStyles.width = '100%';
    }
    
    return { ...baseStyles, ...sizeStyles, ...style };
  };

  const handleClick = (e) => {
    if (disabled || loading) return;
    if (onClick) onClick(e);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <Loading/>
        </>
      );
    }

    const content = [];
    
    if (icon && iconPosition === 'left') {
      content.push(<span key="icon-left" className="btn-icon">{icon}</span>);
    }
    
    content.push(<span key="text">{children}</span>);
    
    if (icon && iconPosition === 'right') {
      content.push(<span key="icon-right" className="btn-icon">{icon}</span>);
    }
    
    return content;
  };

  return (
    <button
      className={getClasses()}
      style={getInlineStyles()}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default Button;

import React from 'react';
import { SIZE_CONSTANTS, getComponentSize, getComponentClasses } from '../../constants/sizeConstants';
import './Card.css';

const Card = ({
  children,
  size = 'md',
  variant = 'default', // default, elevated, outlined, filled
  padding = 'default', // none, sm, md, lg, xl
  margin = 'default', // none, sm, md, lg, xl
  borderRadius = 'default', // none, sm, md, lg, xl, full
  shadow = 'default', // none, sm, md, lg, xl, 2xl
  hover = false,
  clickable = false,
  onClick,
  className = '',
  style = {},
  header = null,
  footer = null,
  ...props
}) => {
  // Générer les classes CSS
  const getClasses = () => {
    const baseClasses = ['card'];
    
    // Taille
    baseClasses.push(`card-${size}`);
    
    // Variante
    if (variant !== 'default') {
      baseClasses.push(`card-${variant}`);
    }
    
    // Padding personnalisé
    if (padding !== 'default') {
      baseClasses.push(`card-p-${padding}`);
    }
    
    // Margin personnalisé
    if (margin !== 'default') {
      baseClasses.push(`card-m-${margin}`);
    }
    
    // Border radius personnalisé
    if (borderRadius !== 'default') {
      baseClasses.push(`card-rounded-${borderRadius}`);
    }
    
    // Ombre personnalisée
    if (shadow !== 'default') {
      baseClasses.push(`card-shadow-${shadow}`);
    }
    
    // États
    if (hover) baseClasses.push('card-hover');
    if (clickable) baseClasses.push('card-clickable');
    
    // Classes personnalisées
    if (className) baseClasses.push(className);
    
    return baseClasses.join(' ');
  };

  // Générer les styles inline
  const getInlineStyles = () => {
    const sizeStyles = getComponentSize('card', size);
    return { ...sizeStyles, ...style };
  };

  const handleClick = (e) => {
    if (clickable && onClick) {
      onClick(e);
    }
  };

  const handleKeyDown = (e) => {
    if (clickable && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <div
      className={getClasses()}
      style={getInlineStyles()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={clickable ? 0 : undefined}
      role={clickable ? 'button' : undefined}
      {...props}
    >
      {header && (
        <div className="card-header">
          {header}
        </div>
      )}
      
      <div className="card-content">
        {children}
      </div>
      
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

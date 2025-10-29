import React from 'react';
import { SIZE_CONSTANTS, getComponentSize, getComponentClasses } from '../../constants/sizeConstants';
import './Input.css';

const Input = ({
  type = 'text',
  size = 'md',
  variant = 'default', // default, filled, outlined, ghost
  placeholder = '',
  value = '',
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  error = false,
  success = false,
  label = '',
  helperText = '',
  errorText = '',
  successText = '',
  icon = null,
  iconPosition = 'left', // left, right
  fullWidth = false,
  className = '',
  style = {},
  ...props
}) => {
  // Générer les classes CSS
  const getClasses = () => {
    const baseClasses = ['input'];
    
    // Taille
    baseClasses.push(`input-${size}`);
    
    // Variante
    if (variant !== 'default') {
      baseClasses.push(`input-${variant}`);
    }
    
    // États
    if (error) baseClasses.push('input-error');
    if (success) baseClasses.push('input-success');
    if (disabled) baseClasses.push('input-disabled');
    
    // Largeur complète
    if (fullWidth) baseClasses.push('input-full-width');
    
    // Classes personnalisées
    if (className) baseClasses.push(className);
    
    return baseClasses.join(' ');
  };

  // Générer les styles inline
  const getInlineStyles = () => {
    const sizeStyles = getComponentSize('input', size);
    
    if (fullWidth) {
      sizeStyles.width = '100%';
    }
    
    return { ...sizeStyles, ...style };
  };

  const handleChange = (e) => {
    if (disabled) return;
    if (onChange) onChange(e);
  };

  const handleBlur = (e) => {
    if (disabled) return;
    if (onBlur) onBlur(e);
  };

  const handleFocus = (e) => {
    if (disabled) return;
    if (onFocus) onFocus(e);
  };

  const renderContent = () => {
    const content = [];
    
    if (icon && iconPosition === 'left') {
      content.push(<span key="icon-left" className="input-icon input-icon-left">{icon}</span>);
    }
    
    content.push(
      <input
        key="input"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        disabled={disabled}
        required={required}
        className="input-field"
        style={getInlineStyles()}
        {...props}
      />
    );
    
    if (icon && iconPosition === 'right') {
      content.push(<span key="icon-right" className="input-icon input-icon-right">{icon}</span>);
    }
    
    return content;
  };

  return (
    <div className="input-container">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      
      <div className={getClasses()}>
        {renderContent()}
      </div>
      
      {/* Messages d'aide */}
      {error && errorText && (
        <div className="input-message input-error-message">
          {errorText}
        </div>
      )}
      
      {success && successText && (
        <div className="input-message input-success-message">
          {successText}
        </div>
      )}
      
      {!error && !success && helperText && (
        <div className="input-message input-helper-message">
          {helperText}
        </div>
      )}
    </div>
  );
};

export default Input;

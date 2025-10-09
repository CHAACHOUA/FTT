import React from 'react';
import Loading from '../loyout/Loading';
import './SaveButton.css';

const SaveButton = ({ onClick, loading = false, disabled = false, text = "Enregistrer" }) => {
  return (
    <button 
      className="save-button" 
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? <Loading /> : text}
    </button>
  );
};

export default SaveButton;

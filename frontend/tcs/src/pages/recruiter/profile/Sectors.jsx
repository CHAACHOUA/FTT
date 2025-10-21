import React from 'react';
import { FaTrash, FaPlus } from 'react-icons/fa';

const Sectors = ({ sectors, onUpdate, readOnly }) => {
  const handleChange = (index, value) => {
    const updated = [...sectors];
    updated[index] = value;
    onUpdate(updated);
  };

  const handleRemove = (index) => {
    const updated = sectors.filter((_, i) => i !== index);
    onUpdate(updated);
  };

  const handleAdd = () => {
    onUpdate([...sectors, '']);
  };

  return (
    <div style={{ marginTop: 20 }}>
      <label style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8, display: 'block' }}>
        Secteurs
      </label>

      {sectors.length === 0 && (
        <p style={{ fontStyle: 'italic', color: '#666' }}>
          Aucun secteur n'est défini, veuillez en rajouter.
        </p>
      )}

      {sectors.map((sector, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 8,
            gap: 8
          }}
        >
          <input
            type="text"
            value={sector}
            onChange={(e) => handleChange(index, e.target.value)}
            disabled={readOnly}
            placeholder="Nom du secteur"
            style={{
              flex: 1,
              padding: 12,
              fontSize: 16,
              borderRadius: 9,
              border: '1.2px solid #b5c6d6',
              background: '#f9fbfd',
              transition: 'border-color 0.2s',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#18386c';
              e.target.style.background = '#fff';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#b5c6d6';
              e.target.style.background = '#f9fbfd';
            }}
          />
          {!readOnly && (
            <button
              type="button"
              onClick={() => handleRemove(index)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'red',
                fontSize: 18
              }}
              title="Supprimer ce secteur"
            >
              <FaTrash />
            </button>
          )}
        </div>
      ))}

      {!readOnly && (
        <button
          type="button"
          onClick={handleAdd}
          style={{
            marginTop: 10,
            background: '#ffffff',
            color: '#3b82f6',
            padding: '12px 20px',
            border: '2px solid #3b82f6',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            fontWeight: 600,
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            gap: 8
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <FaPlus style={{ marginRight: 6 }} /> Ajouter un secteur
        </button>
      )}
    </div>
  );
};

export default Sectors;

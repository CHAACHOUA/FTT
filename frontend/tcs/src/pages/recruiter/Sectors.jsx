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
              padding: 8,
              fontSize: 16,
              borderRadius: 4,
              border: '1px solid #ccc'
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
            backgroundColor: '#007bff',
            color: 'white',
            padding: '6px 12px',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            fontWeight: 'bold',
          }}
        >
          <FaPlus style={{ marginRight: 6 }} /> Ajouter un secteur
        </button>
      )}
    </div>
  );
};

export default Sectors;

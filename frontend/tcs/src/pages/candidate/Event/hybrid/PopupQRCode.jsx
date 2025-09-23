import React from 'react';
import QRCode from 'react-qr-code';
import { Dialog } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './Popup.css';

const PopupQRCode = ({ isOpen, onClose, token, forum }) => {
  const url = forum
    ? `${window.location.origin}/public/candidate/${token}?forum=${forum.id}`
    : `${window.location.origin}/public/candidate/${token}`;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="popup-wrapper"
    >
      <Dialog.Panel className="popup-content">
        <button
          onClick={onClose}
          className="popup-close-btn"
          aria-label="Fermer"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <h2>Scannez ce QR Code</h2>

        <QRCode value={url}  className='qrcode'/>

        {/* Affichage du forum */}
        {forum && (
          <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
            Forum : {forum.name}
          </p>
        )}

        {/* Lien cliquable */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="popup-link"
        >
          {url}
        </a>
      </Dialog.Panel>
    </Dialog>
  );
};

export default PopupQRCode;

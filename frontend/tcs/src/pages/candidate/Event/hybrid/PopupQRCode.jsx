import React from 'react';
import QRCode from 'react-qr-code';
import Modal from '../../../../components/card/common/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faShare } from '@fortawesome/free-solid-svg-icons';
import './QRShare.css';

const PopupQRCode = ({ isOpen, onClose, token, forum }) => {
  const url = forum
    ? `${window.location.origin}/public/candidate/${token}?forum=${forum.id}`
    : `${window.location.origin}/public/candidate/${token}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      // Vous pourriez ajouter une notification de succès ici
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const shareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mon profil candidat',
          text: `Découvrez mon profil candidat pour le forum ${forum?.name || ''}`,
          url: url
        });
      } catch (err) {
        console.error('Erreur lors du partage:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Partager mon profil"
      subtitle="Scannez le QR Code ou partagez le lien"
      size="medium"
      showCloseButton={true}
      closeOnOverlayClick={true}
    >
      <div className="qr-share-content">
        {/* QR Code Section */}
        <div className="qr-section">
          <div className="qr-container">
            <QRCode value={url} className="qrcode" />
          </div>
          <p className="qr-instruction">Scannez avec votre appareil photo</p>
        </div>


        {/* URL Section */}
        <div className="url-section">
          <label className="url-label">Lien de partage :</label>
          <div className="url-container">
            <input
              type="text"
              value={url}
              readOnly
              className="url-input"
            />
            <button
              onClick={copyToClipboard}
              className="copy-btn"
              title="Copier le lien"
            >
              <FontAwesomeIcon icon={faCopy} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="popup-actions">
          <button
            onClick={shareProfile}
            className="share-btn primary"
          >
            <FontAwesomeIcon icon={faShare} />
            Partager
          </button>
          <button
            onClick={copyToClipboard}
            className="copy-btn-secondary"
          >
            <FontAwesomeIcon icon={faCopy} />
            Copier le lien
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PopupQRCode;

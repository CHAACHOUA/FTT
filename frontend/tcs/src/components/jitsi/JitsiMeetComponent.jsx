import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';
import './JitsiMeetComponent.css';

const JitsiMeetComponent = ({ 
  meetingId, 
  config = {}, 
  onMeetingEnd,
  isFullscreen = false,
  onToggleFullscreen,
  className = ''
}) => {
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  useEffect(() => {
    // Charger le script Jitsi Meet
    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initializeJitsi = async () => {
      try {
        await loadJitsiScript();

        if (!jitsiContainerRef.current) {
          console.error('Container Jitsi non trouvé');
          return;
        }

        // Configuration par défaut
        const defaultConfig = {
          roomName: meetingId,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: false,
            enableWelcomePage: false,
            disableModeratorIndicator: false,
            startScreenSharing: false,
            enableEmailInStats: false,
            enableTalkWhileMuted: true,
            enableLayerSuspension: true,
            enableInsecureRoomNameWarning: false,
            enableAutomaticUrlCopy: true,
            defaultLanguage: 'fr',
            subject: 'Entretien TCS',
            userInfo: {
              displayName: 'Participant TCS'
            }
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
              'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
              'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
              'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
            ],
            SETTINGS_SECTIONS: [
              'devices', 'language', 'moderator', 'profile', 'calendar', 'sounds'
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_POWERED_BY: false,
            DEFAULT_LOGO_URL: null,
            DEFAULT_WELCOME_PAGE_LOGO_URL: null,
            PROVIDER_NAME: 'TCS Platform',
            LANG_DETECTION: true,
            SUPPORT_URL: null
          }
        };

        // Fusionner avec la configuration fournie
        const finalConfig = {
          ...defaultConfig,
          ...config,
          configOverwrite: {
            ...defaultConfig.configOverwrite,
            ...config.configOverwrite
          },
          interfaceConfigOverwrite: {
            ...defaultConfig.interfaceConfigOverwrite,
            ...config.interfaceConfigOverwrite
          }
        };

        // Créer l'instance Jitsi
        jitsiApiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', finalConfig);

        // Événements Jitsi
        jitsiApiRef.current.addEventListeners({
          readyToClose: () => {
            console.log('Réunion fermée');
            if (onMeetingEnd) {
              onMeetingEnd();
            }
          },
          participantLeft: (participant) => {
            console.log('Participant parti:', participant);
          },
          participantJoined: (participant) => {
            console.log('Participant rejoint:', participant);
          },
          videoConferenceJoined: () => {
            console.log('Connexion à la vidéoconférence réussie');
          },
          videoConferenceLeft: () => {
            console.log('Déconnexion de la vidéoconférence');
            if (onMeetingEnd) {
              onMeetingEnd();
            }
          },
          error: (error) => {
            console.error('Erreur Jitsi:', error);
          }
        });

      } catch (error) {
        console.error('Erreur lors de l\'initialisation de Jitsi:', error);
      }
    };

    initializeJitsi();

    // Cleanup
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [meetingId, config, onMeetingEnd]);

  const handleToggleFullscreen = () => {
    if (onToggleFullscreen) {
      onToggleFullscreen();
    }
  };

  const handleCloseMeeting = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('hangup');
    }
    if (onMeetingEnd) {
      onMeetingEnd();
    }
  };

  return (
    <div className={`jitsi-meet-container ${className} ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Contrôles de la réunion */}
      <div className="jitsi-controls">
        <div className="jitsi-controls-left">
          <span className="meeting-title">Entretien TCS - {meetingId}</span>
        </div>
        
        <div className="jitsi-controls-right">
          <button 
            className="control-btn"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Réduire' : 'Plein écran'}
          >
            <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
          </button>
          
          <button 
            className="control-btn close-btn"
            onClick={handleCloseMeeting}
            title="Quitter la réunion"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>

      {/* Container Jitsi */}
      <div 
        ref={jitsiContainerRef} 
        className="jitsi-container"
        style={{
          width: '100%',
          height: isFullscreen ? '100vh' : '600px',
          minHeight: '400px'
        }}
      />
    </div>
  );
};

export default JitsiMeetComponent;

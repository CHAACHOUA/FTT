import React from 'react';

const Loading = () => {
  return (
    <div style={styles.container}>
      <div className="spinner"></div>

      <style>
        {`
        .spinner {
          position: relative;
          width: 22.4px;
          height: 22.4px;
        }

        .spinner::before,
        .spinner::after {
          content: '';
          width: 100%;
          height: 100%;
          display: block;
          animation: spinner-b4c8mmmd 0.5s backwards, spinner-49opz7md 1.25s 0.5s infinite ease;
          border: 5.6px solid #9d2266;
          border-radius: 50%;
          box-shadow: 0 -33.6px 0 -5.6px #9d2266;
          position: absolute;
        }

        .spinner::after {
          animation-delay: 0s, 1.25s;
        }

        @keyframes spinner-b4c8mmmd {
          from {
            box-shadow: 0 0 0 -5.6px #9d2266;
          }
        }

        @keyframes spinner-49opz7md {
          to {
            transform: rotate(360deg);
          }
        }
        `}
      </style>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
};

export default Loading;

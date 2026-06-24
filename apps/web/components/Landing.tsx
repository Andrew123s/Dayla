import React from 'react';

const Landing: React.FC = () => {
  return (
    <iframe
      src="/landing.html"
      title="Dayla — Explore Together"
      style={{
        border: 'none',
        width: '100vw',
        height: 'var(--app-height, 100dvh)',
        display: 'block',
      }}
    />
  );
};

export default Landing;
